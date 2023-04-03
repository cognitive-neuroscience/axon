import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { DateTime } from 'luxon';
import { StudyService } from '../../../../services/study.service';
import { Study } from '../../../../models/Study';
import { catchError, map, mergeMap, take } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ParticipantDataService } from 'src/app/services/study-data.service';
import { DataTableFormat } from './data-table/data-table.component';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { ParticipantData } from 'src/app/models/ParticipantData';
import { TaskType } from 'src/app/models/enums';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { StudyUserService } from 'src/app/services/study-user.service';
import { FileService } from 'src/app/services/file.service';
import * as JSZip from 'jszip';
import * as FileSaver from 'file-saver';
import { CrowdsourcedUser } from 'src/app/models/User';
import { StudyUser } from 'src/app/models/StudyUser';
import { UserStateService } from 'src/app/services/user-state-service';
import { CrowdSourcedUserService } from 'src/app/services/crowdsourced-user.service';

@Component({
    selector: 'app-data',
    templateUrl: './data.component.html',
    styleUrls: ['./data.component.scss'],
})
export class DataComponent implements OnInit, OnDestroy {
    // golang sets this as its default value for null dates.
    private readonly NULL_DATE = '0001-01-01T00:00:00Z';

    private idFromURL: string;
    selectedTableName: string = '';
    studies: Observable<Study[]>;
    tableData: DataTableFormat[]; // json table to populate table component
    fileName: string = null;
    subscriptions: Subscription[] = [];

    constructor(
        private studyService: StudyService,
        private route: ActivatedRoute,
        private userStateService: UserStateService,
        private studyUserService: StudyUserService,
        private participantDataService: ParticipantDataService,
        private snackbarService: SnackbarService,
        private loaderService: LoaderService,
        private fileService: FileService,
        private crowdSourcedUserService: CrowdSourcedUserService
    ) {}

    ngOnInit(): void {
        const sub = this.studyService.getOrUpdateStudies().subscribe(() => {});
        this.idFromURL = this.route.snapshot.paramMap.get('id');
        this.subscriptions.push(sub);
    }

    get isGuest(): boolean {
        return this.userStateService.userIsGuest;
    }

    get studyExists(): boolean {
        return (
            !!this.idFromURL &&
            !!this.studyService.studiesValue &&
            !!this.studyService.studiesValue.find((study) => study.id.toString() === this.idFromURL)
        );
    }

    get study(): Study {
        return this.studyService.studiesValue.find((study) => study.id.toString() === this.idFromURL);
    }

    get isAdmin(): boolean {
        return this.userStateService.userIsAdmin;
    }

    getAndDisplayData(study: Study, indexSelected: number) {
        this.loaderService.showLoader();
        const studyTask = study.studyTasks[indexSelected];

        if (this.isGuest) {
            this.loaderService.hideLoader();
            return;
        }

        this.participantDataService
            .getParticipantData(study.id, studyTask.taskOrder)
            .pipe(
                catchError((x) => {
                    this.loaderService.hideLoader();
                    this.snackbarService.openErrorSnackbar('there was an error getting task data');
                    throw new Error('error getting data');
                })
            )
            .subscribe((participantData: ParticipantData[]) => {
                let dataTableFormat: DataTableFormat[] = [];

                if (studyTask.task.taskType === TaskType.QUESTIONNAIRE) {
                    dataTableFormat = participantData.map((data) => {
                        // if it's a questionnaire, only the first element in the array is populated
                        // so grab the keys
                        return {
                            fields: {
                                userId: data.userId,
                                studyId: data.studyId,
                                taskOrder: data.taskOrder,
                                submittedAt: data.submittedAt,
                                participantType: data.participantType,
                                ...data.data[0],
                            },
                            expandable: [],
                        };
                    });
                } else {
                    dataTableFormat = participantData.map((data) => {
                        return {
                            fields: {
                                userId: data.userId,
                                studyId: data.studyId,
                                taskOrder: data.taskOrder,
                                submittedAt: data.submittedAt,
                                participantType: data.participantType,
                                ...data.metadata,
                            },
                            expandable: [...data.data],
                        };
                    });
                }

                dataTableFormat = this.formatDates(dataTableFormat);
                this.tableData = dataTableFormat;
                this.fileName = `STUDY_${study.id}_INDEX_${indexSelected}_TASK_${
                    studyTask.task.name
                }_DATE_${new Date().toLocaleDateString()}`;
            })
            .add(() => {
                this.loaderService.hideLoader();
            });
    }

    // takes json and checks if it is a valid date. If so, it will replace the given UTC date
    // with a human readable local date
    private formatDates(dataRows: DataTableFormat[]): DataTableFormat[] {
        dataRows.forEach((data) => {
            this.formatDateForDataRow(data.fields);
            data.expandable.forEach((expandableRow) => {
                this.formatDateForDataRow(expandableRow);
            });
        });
        return dataRows;
    }

    private formatDate(dateTime: string): string {
        if (this.isExpectedDateFormat(dateTime)) {
            const dt: DateTime = DateTime.fromISO(dateTime as string);
            return dt.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
        } else {
            return dateTime;
        }
    }

    // pass by reference, so the object will be updated - no need to return anything
    private formatDateForDataRow(row: { [key: string]: any }) {
        for (let [key, value] of Object.entries(row)) {
            if (key === 'dueDate') {
                // TODO: make a more extensible check in the future rather than just
                // hard coding the value. If we change dueDate to due_date for example, we will
                // have to change this hard coded string
                row[key] = row[key].time;
            }

            if (value === this.NULL_DATE) {
                // for null date values, golang maps it as 0001-01-01T00:00:00Z from the backend. We
                // want to translate this to NONE so it's more user friendly
                row[key] = 'NONE';
            } else if (this.isExpectedDateFormat(value)) {
                const dt: DateTime = DateTime.fromISO(value as string);
                row[key] = dt.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
            }
        }
    }

    getCrowdsourceUsersForStudy(study: Study) {
        this.loaderService.showLoader();

        this.crowdSourcedUserService.getCrowdsourcedUsersByStudyId(study.id).subscribe(
            (crowdsourcedUsers) => {
                let crowdsourcedUsersDataTable: DataTableFormat[] = crowdsourcedUsers.map((data) => {
                    return {
                        fields: {
                            ...data,
                        },
                        expandable: [],
                    };
                });
                crowdsourcedUsersDataTable = this.formatDates(crowdsourcedUsersDataTable);

                this.tableData = crowdsourcedUsersDataTable;
                this.fileName = `TASKDATA_${study.internalName}_CROWDSOURCED_USERS`;
                this.loaderService.hideLoader();
            },
            (err) => {
                this.loaderService.hideLoader();
                this.snackbarService.openErrorSnackbar(err.message);
            }
        );
    }

    private _getStudyUserDataAsDataTableFormat(studyUsers: StudyUser[]): DataTableFormat[] {
        return studyUsers.map((studyUser) => {
            const consentInputs = { ...(studyUser.data || {}) };

            return {
                fields: {
                    userId: studyUser.user.id,
                    studyId: studyUser.study.id,
                    completionCode: studyUser.completionCode,
                    registerDate: this.formatDate(studyUser.registerDate),
                    dueDate: studyUser.dueDate.Valid ? this.formatDate(studyUser.dueDate.Time) : 'NONE',
                    currentTaskIndex: studyUser.currentTaskIndex,
                    hasAcceptedConsent: studyUser.hasAcceptedConsent,
                    lang: studyUser.lang,
                    ...consentInputs,
                },
                expandable: [],
            };
        });
    }

    getStudyUsersForStudy(study: Study) {
        this.loaderService.showLoader();

        this.studyUserService
            .getStudyUsersForStudy(study.id)
            .subscribe(
                (studyUsers) => {
                    const studyUsersDataTable = this._getStudyUserDataAsDataTableFormat(studyUsers);

                    this.tableData = studyUsersDataTable;
                    this.fileName = `TASKDATA_${study.internalName}_ACCOUNT_HOLDERS`;
                },
                (err) => {
                    this.snackbarService.openErrorSnackbar(err.message);
                }
            )
            .add(() => {
                this.loaderService.hideLoader();
            });
    }

    downloadAllCSVs(study: Study) {
        const getDataObservables: Observable<any>[] = [
            ...study.studyTasks.map((studyTask) =>
                this.participantDataService.getParticipantData(study.id, studyTask.taskOrder)
            ),
            this.crowdSourcedUserService.getCrowdsourcedUsersByStudyId(study.id),
            this.studyUserService.getStudyUsersForStudy(study.id),
        ];

        this.loaderService.showLoader();

        forkJoin(getDataObservables)
            .pipe(
                take(1),
                map((res) => {
                    const zip = new JSZip();

                    // add participant data to zip
                    for (let i = 0; i < study.studyTasks.length; i++) {
                        let dataTableFormat: DataTableFormat[] = [];
                        const participantData = res[i] as ParticipantData[];
                        const studyTask = study.studyTasks[i];

                        if (studyTask.task.taskType === TaskType.QUESTIONNAIRE) {
                            dataTableFormat = participantData.map((data) => {
                                // if it's a questionnaire, only the first element in the array is populated
                                // so grab the keys
                                return {
                                    fields: {
                                        userId: data.userId,
                                        studyId: data.studyId,
                                        taskOrder: data.taskOrder,
                                        submittedAt: data.submittedAt,
                                        participantType: data.participantType,
                                        ...data.data[0],
                                    },
                                    expandable: [],
                                };
                            });
                        } else {
                            dataTableFormat = participantData.map((data) => {
                                return {
                                    fields: {
                                        userId: data.userId,
                                        studyId: data.studyId,
                                        taskOrder: data.taskOrder,
                                        submittedAt: data.submittedAt,
                                        participantType: data.participantType,
                                    },
                                    expandable: [...data.data],
                                };
                            });
                        }

                        dataTableFormat = this.formatDates(dataTableFormat);
                        const fileName = `${i}_TASK_${studyTask.task.name}.csv`;
                        zip.file(fileName, this.fileService.getCSVString(dataTableFormat));
                    }

                    // add crowdsourced users to zip
                    const crowdsourcedUsers = res[study.studyTasks.length] as CrowdsourcedUser[];
                    let crowdsourcedUsersDataTable: DataTableFormat[] = crowdsourcedUsers.map((data) => {
                        return {
                            fields: {
                                ...data,
                            },
                            expandable: [],
                        };
                    });
                    crowdsourcedUsersDataTable = this.formatDates(crowdsourcedUsersDataTable);
                    zip.file(`CROWDSOURCED_USERS.csv`, this.fileService.getCSVString(crowdsourcedUsersDataTable));

                    // add study users to zip
                    const studyUsers = res[study.studyTasks.length + 1] as StudyUser[];
                    let studyUsersDataTable: DataTableFormat[] = this._getStudyUserDataAsDataTableFormat(studyUsers);
                    zip.file(`ACCOUNT_HOLDERS.csv`, this.fileService.getCSVString(studyUsersDataTable));
                    return zip;
                })
            )
            .subscribe((zippedFile) => {
                zippedFile.generateAsync({ type: 'blob' }).then((zipped) => {
                    FileSaver.saveAs(zipped, `STUDY_${study.id}_${new Date().toLocaleDateString()}.zip`);
                });
            })
            .add(() => {
                this.loaderService.hideLoader();
            });
    }

    // returns the dateTime or null if invalid
    // checks regex, we expect dates of the form: 2020-12-30T03:13:235Z
    private isExpectedDateFormat(date: string): boolean {
        if (!date || typeof date !== 'string') return false;
        const regex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/;
        return regex.test(date);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}
