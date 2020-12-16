import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService } from '../../../services/confirmation.service';
import { Router } from '@angular/router';
import { SessionStorageService } from '../../../services/sessionStorage.service';
import { QuestionnaireService } from '../../../services/questionnaire.service';
import { DemographicsQuestionnaireResponse } from '../../../models/Questionnaire';
import { TaskManagerService } from '../../../services/task-manager.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-demographics-questionnaire',
  templateUrl: './demographics-questionnaire.component.html',
  styleUrls: ['./demographics-questionnaire.component.scss']
})
export class DemographicsQuestionnaireComponent implements OnInit {

  numbersRegex = /^[0-9]+$/;

  demographicsQuestionnaire = this.fb.group({
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

    const response: DemographicsQuestionnaireResponse = {
      userID: userID,
      experimentCode: experimentCode,
      age: this.demographicsQuestionnaire.get("age").value,
      sex: this.demographicsQuestionnaire.get("sex").value,
      selfIdentification: this.demographicsQuestionnaire.get("selfIdentification").value,
      yearsOfEducation: this.demographicsQuestionnaire.get("yearsOfEducation").value,
      hasNeuroConditions: this.demographicsQuestionnaire.get("hasNeuroConditions").value,
      hasPsychConditions: this.demographicsQuestionnaire.get("hasPsychConditions").value
    }
    this.questionnaireService.saveDemographicsQuestionnaireResponse(response).subscribe(ok => {
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
