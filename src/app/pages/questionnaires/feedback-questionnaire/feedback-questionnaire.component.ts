import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-feedback-questionnaire',
  templateUrl: './feedback-questionnaire.component.html',
  styleUrls: ['./feedback-questionnaire.component.scss'],
})
export class FeedbackQuestionnaireComponent implements OnInit {

  formSubmitted: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  submitForm() {
    this.formSubmitted = true;
  }

  

}
