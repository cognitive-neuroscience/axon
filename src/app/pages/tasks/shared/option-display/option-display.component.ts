import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ITranslationText } from 'src/app/models/InternalDTOs';

@Component({
    selector: 'app-option-display',
    templateUrl: './option-display.component.html',
    styleUrls: ['./option-display.component.scss'],
})
export class OptionDisplayComponent implements OnInit {
    @Input()
    question: string | ITranslationText;

    @Input()
    options: {
        label: string;
        value: number | boolean | string;
    }[] = [];

    @Output()
    onSelectValue: EventEmitter<string> = new EventEmitter();

    handleSelectOption(value: string) {
        this.onSelectValue.emit(value);
    }

    ngOnInit(): void {}
}
