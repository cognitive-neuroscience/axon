import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-option-display',
    templateUrl: './option-display.component.html',
    styleUrls: ['./option-display.component.scss'],
})
export class OptionDisplayComponent implements OnInit {
    @Input()
    question: string;

    @Input()
    options: {
        label: string;
        value: number | boolean | string;
    }[] = [];

    @Output()
    onSelectValue: EventEmitter<string> = new EventEmitter();

    constructor() {}

    handleSelectOption(value: string) {
        this.onSelectValue.emit(value);
    }

    ngOnInit(): void {}
}
