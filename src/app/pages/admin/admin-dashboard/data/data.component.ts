import { Component, OnInit } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { DateTime } from 'luxon';
import { StudyService } from '../../../../services/study.service';
import { Study } from '../../../../models/Study';
import { catchError, map, mergeMap, take } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { ParticipantDataService } from 'src/app/services/study-data.service';
import { DataTableFormat } from './data-table/data-table.component';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { ParticipantData } from 'src/app/models/TaskData';
import { TaskType } from 'src/app/models/enums';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { StudyUserService } from 'src/app/services/study-user.service';
import { FileService } from 'src/app/services/file.service';
import * as JSZip from 'jszip';
import { CrowdsourcedUser, StudyUser } from 'src/app/models/Login';
import * as FileSaver from 'file-saver';

@Component({
    selector: 'app-data',
    templateUrl: './data.component.html',
    styleUrls: ['./data.component.scss'],
})
export class DataComponent implements OnInit {
    // golang sets this as its default value for null dates.
    private readonly NULL_DATE = '0001-01-01T00:00:00Z';

    private idFromURL: string;
    selectedTableName: string = '';
    studies: Observable<Study[]>;
    tableData: DataTableFormat[]; // json table to populate table component
    fileName: string = null;

    constructor(
        private studyService: StudyService,
        private route: ActivatedRoute,
        private userService: UserService,
        private studyUserService: StudyUserService,
        private studyDataService: ParticipantDataService,
        private snackbarService: SnackbarService,
        private loaderService: LoaderService,
        private fileService: FileService
    ) {}

    ngOnInit(): void {
        this.idFromURL = this.route.snapshot.paramMap.get('id');
        if (!this.studyService.hasStudies) this.studyService.update();
    }

    get studyExists(): boolean {
        return (
            !!this.idFromURL &&
            !!this.studyService.studies &&
            !!this.studyService.studies.find((study) => study.id.toString() === this.idFromURL)
        );
    }

    get study(): Study {
        return this.studyService.studies.find((study) => study.id.toString() === this.idFromURL);
    }

    get isAdmin(): Observable<boolean> {
        return this.userService.userIsAdmin;
    }

    getAndDisplayData(study: Study, indexSelected: number) {
        this.loaderService.showLoader();
        const studyTask = study.tasks[indexSelected];
        this.userService.userIsAdmin
            .pipe(
                mergeMap((isAdmin) => {
                    return isAdmin ? this.studyDataService.getParticipantData(study.id, studyTask.taskOrder) : of(null);
                }),
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

        this.userService.getCrowdsourcedUsersByStudyId(study.id).subscribe(
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

    getStudyUsersForStudy(study: Study) {
        this.loaderService.showLoader();

        this.studyUserService
            .getStudyUsersForStudy(study.id)
            .subscribe(
                (studyUsers) => {
                    let studyUsersDataTable: DataTableFormat[] = studyUsers.map((studyUser) => {
                        const consentInputs = { ...(studyUser.data || {}) };
                        delete studyUser.study;
                        delete studyUser.data;
                        return {
                            fields: {
                                ...studyUser,
                                ...consentInputs,
                            },
                            expandable: [],
                        };
                    });
                    studyUsersDataTable = this.formatDates(studyUsersDataTable);

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
            ...study.tasks.map((studyTask) => this.studyDataService.getParticipantData(study.id, studyTask.taskOrder)),
            this.userService.getCrowdsourcedUsersByStudyId(study.id),
            this.studyUserService.getStudyUsersForStudy(study.id),
        ];

        this.loaderService.showLoader();

        forkJoin(getDataObservables)
            .pipe(
                take(1),
                map((res) => {
                    const zip = new JSZip();

                    // add participant data to zip
                    for (let i = 0; i < study.tasks.length; i++) {
                        let dataTableFormat: DataTableFormat[] = [];
                        const participantData = res[i] as ParticipantData[];
                        const studyTask = study.tasks[i];

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
                    const crowdsourcedUsers = res[study.tasks.length] as CrowdsourcedUser[];
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
                    const studyUsers = res[study.tasks.length + 1] as StudyUser[];
                    let studyUsersDataTable: DataTableFormat[] = studyUsers.map((studyUser) => {
                        const consentInputs = { ...(studyUser.data || {}) };
                        delete studyUser.study;
                        delete studyUser.data;
                        return {
                            fields: {
                                ...studyUser,
                                ...consentInputs,
                            },
                            expandable: [],
                        };
                    });
                    studyUsersDataTable = this.formatDates(studyUsersDataTable);
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
}
