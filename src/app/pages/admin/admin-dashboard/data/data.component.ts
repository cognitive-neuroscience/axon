import { Component, OnInit } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { DateTime } from 'luxon';
import { StudyService } from '../../../../services/study.service';
import { Study } from '../../../../models/Study';
import { catchError, mergeMap, take } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { ParticipantDataService } from 'src/app/services/study-data.service';
import { DataTableFormat } from './data-table/data-table.component';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { ParticipantData } from 'src/app/models/TaskData';
import { TaskType } from 'src/app/models/enums';
import { LoaderService } from 'src/app/services/loader/loader.service';

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
        private studyDataService: ParticipantDataService,
        private snackbarService: SnackbarService,
        private loaderService: LoaderService
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
                take(1),
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
                this.fileName = `TASKDATA_${study.internalName}_${studyTask.task.name}`;
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
                value = row[key].time;
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

        this.userService
            .getCrowdsourcedUsersByStudyId(study.id)
            .pipe(take(1))
            .subscribe(
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

        this.userService
            .getStudyUsersForStudy(study.id)
            .pipe(take(1))
            .subscribe(
                (studyUsers) => {
                    let studyUsersDataTable: DataTableFormat[] = studyUsers.map((data) => {
                        delete data.study;
                        return {
                            fields: {
                                ...data,
                            },
                            expandable: [],
                        };
                    });
                    studyUsersDataTable = this.formatDates(studyUsersDataTable);

                    this.tableData = studyUsersDataTable;
                    this.fileName = `TASKDATA_${study.internalName}_ACCOUNT_HOLDERS`;
                    this.loaderService.hideLoader();
                },
                (err) => {
                    this.loaderService.hideLoader();
                    this.snackbarService.openErrorSnackbar(err.message);
                }
            );
    }

    getFeedbackForStudy(study: Study) {
        this.loaderService.showLoader();

        this.userService.userIsAdmin
            .pipe(
                mergeMap((isAdmin) => {
                    return isAdmin ? this.studyDataService.getFeedbackForStudyId(study.id) : of(null);
                }),
                take(1),
                catchError((x) => {
                    this.loaderService.hideLoader();
                    this.snackbarService.openErrorSnackbar('there was an error getting task data');
                    throw new Error('error getting data');
                })
            )
            .subscribe(
                (feedbackData) => {
                    let dataTableFormat: DataTableFormat[] = feedbackData.map((data) => {
                        return {
                            fields: {
                                ...data,
                            },
                            expandable: [],
                        };
                    });

                    dataTableFormat = this.formatDates(dataTableFormat);

                    this.tableData = dataTableFormat;
                    this.fileName = `TASKDATA_${study.internalName}_FEEDBACK`;
                    this.loaderService.hideLoader();
                },
                (err) => {
                    this.loaderService.hideLoader();
                    this.snackbarService.openErrorSnackbar(err.message);
                }
            );
    }

    // returns the dateTime or null if invalid
    // checks regex, we expect dates of the form: 2020-12-30T03:13:235Z
    private isExpectedDateFormat(date: string): boolean {
        if (!date || typeof date !== 'string') return false;
        const regex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d/;
        return regex.test(date);
    }
}
