import { Component, OnInit } from "@angular/core";
import { Observable, of } from "rxjs";
import { DateTime } from "luxon";
import { StudyService } from "../../../../services/study.service";
import { Study } from "../../../../models/Study";
import { catchError, mergeMap, take } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import { UserService } from "src/app/services/user.service";
import { ParticipantDataService } from "src/app/services/study-data.service";
import { DataTableFormat } from "./data-table/data-table.component";
import { SnackbarService } from "src/app/services/snackbar.service";
import { ParticipantData } from "src/app/models/TaskData";
import { TaskType } from "src/app/models/enums";
import { LoaderService } from "src/app/services/loader/loader.service";

@Component({
    selector: "app-data",
    templateUrl: "./data.component.html",
    styleUrls: ["./data.component.scss"],
})
export class DataComponent implements OnInit {
    // golang sets this as its default value for null dates.
    private readonly NULL_DATE = "0001-01-01T00:00:00Z";

    private idFromURL: string;
    selectedTableName: string = "";
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
        this.idFromURL = this.route.snapshot.paramMap.get("id");
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
                    this.snackbarService.openErrorSnackbar("there was an error getting task data");
                    throw new Error("error getting data");
                })
            )
            .subscribe((participantData: ParticipantData[]) => {
                participantData = this.formatDates(participantData);
                if (participantData === null) return;
                if (studyTask.task.taskType === TaskType.QUESTIONNAIRE) {
                    // if questionnaire flatten the data. There is only one row for each participant
                    // so there is not point in showing the full expanded data
                    this.tableData = participantData.map((data) => {
                        const tempTableDataFieldsObj = {};
                        for (const [key, value] of Object.entries(data.data[0])) {
                            tempTableDataFieldsObj[key] = value;
                        }

                        return {
                            fields: {
                                userId: data.userId,
                                studyId: data.studyId,
                                taskOrder: data.taskOrder,
                                submitted: data.submittedAt,
                                ...tempTableDataFieldsObj,
                            },
                            expandable: [],
                        };
                    });
                } else {
                    // for all others, we have multiple trials and multiple rows so it makes sense to expand
                    this.tableData = participantData.map((data) => {
                        return {
                            fields: {
                                userId: data.userId,
                                studyId: data.studyId,
                                taskOrder: data.taskOrder,
                                submitted: data.submittedAt,
                            },
                            expandable: data.data,
                        };
                    });
                }
                this.fileName = `TASKDATA_${study.internalName}_${studyTask.task.name}`;
                this.loaderService.hideLoader();
            });
    }

    // takes json and checks if it is a valid date. If so, it will replace the given UTC date
    // with a human readable local date
    private formatDates(json: ParticipantData[]): any[] {
        json.forEach((participant) => {
            const dt: DateTime = DateTime.fromISO(participant.submittedAt);
            participant.submittedAt = dt.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);

            participant.data.forEach((trial) => {
                for (let [key, value] of Object.entries(trial)) {
                    if (value === this.NULL_DATE) {
                        // for null date values, golang maps it as 0001-01-01T00:00:00Z from the backend. We
                        // want to translate this to NONE so it's more user friendly
                        trial[key] = "NONE";
                    } else if (this.isExpectedDateFormat(value)) {
                        const dt: DateTime = DateTime.fromISO(value as string);
                        trial[key] = dt.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
                    }
                }
            });
        });
        return json;
    }

    // returns the dateTime or null if invalid
    // checks regex, we expect dates of the form: 2020-12-30T03:13:235Z
    private isExpectedDateFormat(date: string): boolean {
        if (!date || typeof date !== "string") return false;
        const regex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d.\d{3}Z/;
        return regex.test(date);
    }
}
