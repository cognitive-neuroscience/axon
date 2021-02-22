import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-help-questionnaire-dialog',
  templateUrl: './help-questionnaire-dialog.component.html',
  styleUrls: ['./help-questionnaire-dialog.component.scss']
})
export class HelpQuestionnaireDialogComponent implements OnInit {

  constructor(private dialog: MatDialogRef<HelpQuestionnaireDialogComponent>) { }

  ngOnInit(): void {
  }

  closeDialog() {
    this.dialog.close();
  }

}
