import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Questionnaire } from 'src/app/models/Questionnaire';

@Component({
  selector: 'app-preview-questionnaire-dialog',
  templateUrl: './preview-questionnaire-dialog.component.html',
  styleUrls: ['./preview-questionnaire-dialog.component.scss']
})
export class PreviewQuestionnaireDialogComponent implements OnInit {

  link: string = "";

  constructor(@Inject(MAT_DIALOG_DATA) public questionnaireData: Questionnaire, private dialogRef: MatDialogRef<PreviewQuestionnaireDialogComponent>) { }

  ngOnInit(): void {
    this.link = this.questionnaireData.url;
  }

  closeDialog() {
    this.dialogRef.close();
  }

}