import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-numpad',
  templateUrl: './numpad.component.html',
  styleUrls: ['./numpad.component.scss']
})
export class NumpadComponent implements OnInit {

  displayValue: string = "";

  @Output() submit: EventEmitter<string> = new EventEmitter();

  constructor() { }

  addNumber(number: string) {
    if(this.displayValue.length <= 9) {
      this.displayValue = `${this.displayValue}${number}`
    }
  }

  removeLastNumber() {
    if(this.displayValue.length > 0) {
      this.displayValue = this.displayValue.slice(0, this.displayValue.length - 1);
    }
  }

  onSubmit() {
    if(this.displayValue.length > 0) {
      this.submit.emit(this.displayValue);
    }
  }

  ngOnInit(): void {
  }

}
