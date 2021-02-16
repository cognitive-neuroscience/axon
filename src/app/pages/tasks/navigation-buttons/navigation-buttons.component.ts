import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export enum NavigationButton {
  PREVIOUS = "previous",
  NEXT = "next",
}

@Component({
  selector: 'app-navigation-buttons',
  templateUrl: './navigation-buttons.component.html',
  styleUrls: ['./navigation-buttons.component.scss']
})
export class NavigationButtonsComponent implements OnInit {
  @Input()
  previousDisabled: boolean = false;

  @Input()
  nextDisabled: boolean = false;

  @Input()
  isStart: boolean = false;

  @Output()
  onPrevious: EventEmitter<NavigationButton> = new EventEmitter();

  @Output()
  onNext: EventEmitter<NavigationButton> = new EventEmitter();

  handleNext() {
    this.onNext.next(NavigationButton.NEXT)
  }

  handlePrevious() {
    this.onPrevious.next(NavigationButton.PREVIOUS);
  }

  constructor() { }

  ngOnInit(): void {
  }

}
