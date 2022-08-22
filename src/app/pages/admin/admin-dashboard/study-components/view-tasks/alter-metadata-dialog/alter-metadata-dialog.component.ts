import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Task } from 'src/app/models/Task';

@Component({
    selector: 'app-alter-metadata-dialog',
    templateUrl: './alter-metadata-dialog.component.html',
    styleUrls: ['./alter-metadata-dialog.component.scss'],
})
export class AlterMetadataDialogComponent implements OnInit {
    modifyMetadata = false;
    hasJsonError = false;

    private updatedMetadata = this.data.config;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: Task,
        private dialog: MatDialogRef<AlterMetadataDialogComponent>
    ) {
        console.log(this.data);
    }

    get taskTitle(): string {
        return this.data.name || '';
    }

    get taskDescription(): string {
        return this.data.description || '';
    }

    get taskConfig(): any {
        return JSON.stringify(this.updatedMetadata, undefined, 4) || '{}';
    }

    set taskConfig(config) {
        try {
            this.updatedMetadata = JSON.parse(config);
            this.hasJsonError = false;
        } catch (e) {
            this.hasJsonError = true;
        }
    }

    ngOnInit(): void {}

    runTask() {
        if (this.modifyMetadata && !this.hasJsonError) {
            this.dialog.close(this.updatedMetadata);
        } else {
            this.dialog.close(null);
        }
    }
}
