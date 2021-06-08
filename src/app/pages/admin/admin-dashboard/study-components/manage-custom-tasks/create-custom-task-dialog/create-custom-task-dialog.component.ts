import { Component, OnInit } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { CustomTask } from "src/app/models/TaskData";

@Component({
    selector: "app-create-custom-task-dialog",
    templateUrl: "./create-custom-task-dialog.component.html",
    styleUrls: ["./create-custom-task-dialog.component.scss"],
})
export class CreateCustomTaskDialogComponent implements OnInit {
    URL: string = "";
    name: string = "";
    description: string = "";

    isValid(): boolean {
        return this.URL.length > 0 && this.name.length > 0;
    }

    sendDataToParent() {
        const customTask: CustomTask = {
            customTaskID: null, // will be set in the backend
            url: this.setQueryParameters(this.URL),
            name: this.name,
            description: this.description,
        };
        this.dialogRef.close(customTask);
    }

    private setQueryParameters(url: string): string {
        return `${url}?participant=[s_value]&studycode=[e_value]`;
    }

    constructor(private dialogRef: MatDialogRef<CreateCustomTaskDialogComponent>) {}

    ngOnInit(): void {}
}
