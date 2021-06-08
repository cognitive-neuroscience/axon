import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomTask } from 'src/app/models/TaskData';

@Component({
  selector: 'app-custom-task-preview-dialog',
  templateUrl: './custom-task-preview-dialog.component.html',
  styleUrls: ['./custom-task-preview-dialog.component.scss']
})
export class CustomTaskPreviewDialogComponent implements OnInit {

  link: string = "";

  constructor(@Inject(MAT_DIALOG_DATA) public customTaskData: CustomTask, private dialogRef: MatDialogRef<CustomTaskPreviewDialogComponent>) { }

  ngOnInit(): void {
    this.link = this.customTaskData.url;
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
