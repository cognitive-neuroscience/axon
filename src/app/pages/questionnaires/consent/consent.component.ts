import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { ConsentForm } from '../../../models/InternalDTOs';
import { ConsentService } from '../../../services/consentService';
import { SessionStorageService } from '../../../services/sessionStorage.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { TaskManagerService } from '../../../services/task-manager.service';

@Component({
  selector: 'app-consent',
  templateUrl: './consent.component.html',
  styleUrls: ['./consent.component.scss']
})
export class ConsentComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];

  consentMetaData: ConsentForm;

  constructor(
    private taskManager: TaskManagerService,
    private _consentService: ConsentService,
    private _sessionStorageService: SessionStorageService,
    private _router: Router,
    private _snackbarService: SnackbarService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    if(!this.taskManager.hasExperiment()) {
      this.taskManager.handleErr();
    }

    this.subscriptions.push(
      this._consentService.loadConsentFormJSON().subscribe((formData: ConsentForm) => {
        this.consentMetaData = formData;
      })
    )
  }

  consent(answer: boolean) {
    if(answer) {
      this.taskManager.next();
    } else {
      this.subscriptions.push(
        this.confirmationService.openConfirmationDialog("Are you sure you want to cancel?").subscribe(ok => {
          if(ok) {
            this._sessionStorageService.clearSessionStorage()
            this._router.navigate(['/login/onlineparticipant'])
            this._snackbarService.openInfoSnackbar("Experiment was cancelled.")
          }
        })
      )
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(x => x.unsubscribe());
  }
}
