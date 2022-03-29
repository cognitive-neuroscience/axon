import { Component, Inject, OnInit, Optional } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Task } from "src/app/models/Task";

@Component({
    selector: "app-intro-dialog",
    templateUrl: "./intro-dialog.component.html",
    styleUrls: ["./intro-dialog.component.scss"],
})
export class IntroDialogComponent implements OnInit {
    constructor(
        @Optional() private dialogRef: MatDialogRef<IntroDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public task: Task
    ) {}

    ngOnInit(): void {}

    onClose() {
        this.dialogRef.close();
    }
}
