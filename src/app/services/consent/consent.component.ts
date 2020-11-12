import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { ConsentService } from '../consentService';
import { Subscription } from 'rxjs';
import { ConsentForm } from 'src/app/models/InternalDTOs';
import { TaskManagerService } from '../task-manager.service';

@Component({
  selector: 'app-consent',
  templateUrl: './consent.component.html',
  styleUrls: ['./consent.component.scss']
})
export class ConsentComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];

  consentMetaData: ConsentForm;

  constructor(
    private _consentService: ConsentService,
    private taskManager: TaskManagerService
  ) { }

  ngOnInit() {
    if(!this.taskManager.hasExperiment()) {
      this.taskManager.handleErr()
    }

    this.subscriptions.push(
      this._consentService.loadConsentFormJSON().subscribe((formData: ConsentForm) => {
        this.consentMetaData = formData;
      })
    )
  }

  consent(answer: boolean) {
    this._consentService.emitResponse(answer)
  }

  ngOnDestroy() {
    this.subscriptions.forEach(x => x.unsubscribe());
  }
}
