import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-json-editor',
    templateUrl: './json-editor.component.html',
    styleUrls: ['./json-editor.component.scss'],
})
export class JsonEditorComponent {
    jsonTextValue = '';
    private _originalJSON: any;
    isError = false;

    @Input()
    set json(json: any) {
        this.jsonTextValue = JSON.stringify(json, null, 4);
        this._originalJSON = json;
    }

    get json() {
        return this._originalJSON;
    }

    @Output() onChange: EventEmitter<any> = new EventEmitter<{ json: any | null; isValid: boolean }>(); // emit json

    onTextChange(value: string) {
        this.isError = false;
        this.jsonTextValue = value;
        try {
            const parsed = JSON.parse(value);
            this.onChange.emit({ json: parsed, isValid: true });
        } catch (e) {
            this.onChange.emit({ json: null, isValid: false });
            this.isError = true;
            return;
        }
    }
}
