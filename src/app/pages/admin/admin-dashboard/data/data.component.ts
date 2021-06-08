import { Component, OnInit } from "@angular/core";
import { DownloadDataService } from "../../../../services/downloadData.service";
import { Observable } from "rxjs";
import { SnackbarService } from "../../../../services/snackbar.service";
import { DateTime } from "luxon";
import { StudyService } from "../../../../services/study.service";
import { Study } from "../../../../models/Study";
import { filter, map, mergeAll } from "rxjs/operators";
import { mapTaskIdToTitle } from "../../../../models/TaskData";
import { LoaderService } from "../../../../services/loader.service";
import { AuthService } from "src/app/services/auth.service";
import { isConsent, isCustomTask, isSurveyMonkeyQuestionnaire } from "src/app/common/commonMethods";

@Component({
    selector: "app-data",
    templateUrl: "./data.component.html",
    styleUrls: ["./data.component.scss"],
})
export class DataComponent implements OnInit {
    // Gorm sets this as its default value for null dates.
    private readonly NULL_DATE = "0001-01-01T00:00:00Z";

    selectedTableName: string = "";
    studies: Observable<Study[]>;
    tableData: any = null; // json table to populate table component
    fileName: string = null;

    constructor(
        private _downloadDataService: DownloadDataService,
        private snackbarService: SnackbarService,
        private studyService: StudyService,
        private loaderService: LoaderService,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.studies = this.studyService.studies;
        this.studyService.update();
    }

    // optionsList(code: string): Observable<string[]> {
    // return this.studies.pipe(
    //     mergeAll(),
    //     filter((study) => study?.code === code),
    //     map((x: Study) => x?.tasks),
    //     map((taskList: string[]) =>
    //         taskList.filter(
    //             (taskName) =>
    //                 !isSurveyMonkeyQuestionnaire(taskName) && !isCustomTask(taskName) && !isConsent(taskName)
    //         )
    //     ),
    //     // return distinct items
    //     map((taskList: string[]) => [...new Set(taskList)])
    // );
    // }

    isAdmin(): boolean {
        return this.authService.isAdmin();
    }

    getAndDisplayData(code: string, option: string) {
        if (!this.isAdmin()) {
            this.snackbarService.openErrorSnackbar("You are not authorized to view the given data");
            return;
        }

        this.loaderService.showLoader();
        this._downloadDataService
            .getTableData(code, option)
            .pipe(map((jsonData) => this.formatDates(jsonData)))
            .subscribe(
                (data) => {
                    this.tableData = data;
                    this.fileName = `CODE-${code}-DATASET-${option}`;
                    this.loaderService.hideLoader();
                },
                (err) => {
                    this.loaderService.hideLoader();
                    console.error(err);
                    this.snackbarService.openErrorSnackbar("Could not get data");
                }
            );
    }

    // takes json and checks if it is a valid date. If so, it will replace the given UTC date
    // with a human readable local date
    private formatDates(json: any[]): any[] {
        const jsonCopy = JSON.parse(JSON.stringify(json));
        jsonCopy.forEach((obj) => {
            for (let [key, value] of Object.entries(obj)) {
                if (value === this.NULL_DATE) {
                    // for null date values, gorm maps it as 0001-01-01T00:00:00Z from the backend. We
                    // want to translate this to NONE so it's more user friendly
                    obj[key] = "NONE";
                } else if (this.isString(value) && this.isDate(value)) {
                    // we want to transform the stored UTC date to our local and make it user friendly
                    const dt: DateTime = DateTime.fromISO(value as string);
                    obj[key] = dt.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
                }
            }
        });
        return jsonCopy;
    }

    private isString(value: any): boolean {
        return typeof value === "string";
    }

    // returns the dateTime or null if invalid
    // checks regex, we expect dates of the form: 2020-12-30T03:13:23Z
    private isDate(date: any): boolean {
        if (!date) return false;
        const regex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\dZ/;
        return regex.test(date);
    }
}
