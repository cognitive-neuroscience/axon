import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-consent',
  templateUrl: './consent.component.html',
  styleUrls: ['./consent.component.scss']
})
export class ConsentComponent implements OnInit {

  @Output()
  broadcastConsent: EventEmitter<boolean> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  consent(answer: boolean) {
    this.broadcastConsent.emit(answer);
  }

}
