import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ConsentService } from '../consentService';

@Component({
  selector: 'app-consent',
  templateUrl: './consent.component.html',
  styleUrls: ['./consent.component.scss']
})
export class ConsentComponent implements OnInit {

  constructor(private _consentService: ConsentService) { }

  ngOnInit() {
  }

  consent(answer: boolean) {
    this._consentService.emitResponse(answer)
  }
}
