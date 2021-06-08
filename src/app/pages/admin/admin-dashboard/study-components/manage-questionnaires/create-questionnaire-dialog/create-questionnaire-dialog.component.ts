import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Questionnaire } from 'src/app/models/Questionnaire';

@Component({
  selector: 'app-create-questionnaire-dialog',
  templateUrl: './create-questionnaire-dialog.component.html',
  styleUrls: ['./create-questionnaire-dialog.component.scss']
})
export class CreateQuestionnaireDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<CreateQuestionnaireDialogComponent>) { }

  URL: string = "";
  name: string = "";
  description: string = "";

  ngOnInit(): void {
  }

  isValid(): boolean {
    return this.URL.length > 0 && this.name.length > 0 && this.validURL(this.URL);
  }

  validURL(url: string): boolean {
    const regex = new RegExp(/(https?:\/\/)(www\.)(surveymonkey\.com)(\/.\/)(.*)(\?)(s\=\[s\_value\]\&e\=\[e_value\])/gm);
    return regex.test(url);
  }

  sendDataToParent() {
    const questionnaire: Questionnaire = {
      questionnaireID: null,
      url: this.URL,
      name: this.name,
      description: this.description
    }
    this.dialogRef.close(questionnaire)
  }
}