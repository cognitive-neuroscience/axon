import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService } from '../../../services/confirmation.service';
import { Router } from '@angular/router';
import { SessionStorageService } from '../../../services/sessionStorage.service';
import { QuestionnaireService } from '../../../services/questionnaire.service';
import { MturkQuestionnaireResponse } from '../../../models/Questionnaire';
import { TaskManagerService } from '../../../services/task-manager.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-mturk-questionnaire',
  templateUrl: './mturk-questionnaire.component.html',
  styleUrls: ['./mturk-questionnaire.component.scss']
})
export class MturkQuestionnaireComponent implements OnInit {

  numbersRegex = /^[0-9]+$/;

  mturkQuestionnaire = this.fb.group({
    age: ['', [
      Validators.required,
      Validators.min(18),
      Validators.max(122),
      Validators.pattern(this.numbersRegex)
    ]],
    sex: ['', Validators.required],
    selfIdentification: [[], Validators.required],
    yearsOfEducation: ['', [
      Validators.required,
      Validators.min(0),
      Validators.max(30),
      Validators.pattern(this.numbersRegex)
    ]],
    hasNeuroConditions: ['', [
      Validators.required
    ]],
    hasPsychConditions: ['', [
      Validators.required
    ]]
  })

  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private router: Router,
    private sessionStorage: SessionStorageService,
    private questionnaireService: QuestionnaireService,
    private taskManager: TaskManagerService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    if(!this.taskManager.hasExperiment()) {
      this.taskManager.handleErr()
    }
  }

  cancel() {
    const msg = "Are you sure you want to quit? You will be unable to register for this experiment again";
    this.confirmationService.openConfirmationDialog(msg).subscribe(accept => {
      if(accept) {
        this.sessionStorage.clearSessionStorage()
        this.router.navigate(['/login/mturk'])
      }
    })
  }

  submit() {
    const userID = this.authService.getDecodedToken().UserID
    const experimentCode = this.taskManager.getExperimentCode()

    const response: MturkQuestionnaireResponse = {
      userID: userID,
      experimentCode: experimentCode,
      age: this.mturkQuestionnaire.get("age").value,
      sex: this.mturkQuestionnaire.get("sex").value,
      selfIdentification: this.mturkQuestionnaire.get("selfIdentification").value,
      yearsOfEducation: this.mturkQuestionnaire.get("yearsOfEducation").value,
      hasNeuroConditions: this.mturkQuestionnaire.get("hasNeuroConditions").value,
      hasPsychConditions: this.mturkQuestionnaire.get("hasPsychConditions").value
    }
    this.questionnaireService.saveQuestionnaireResponse(response).subscribe(ok => {
      if(ok) {
        this.taskManager.nextExperiment()
      } else {
        this.taskManager.handleErr()
      }
    }, err => {
      console.error(err)
      this.taskManager.handleErr()
    })

  }

}
