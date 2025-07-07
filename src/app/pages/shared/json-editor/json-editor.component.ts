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

    @Output() onChange: EventEmitter<any> = new EventEmitter<any>(); // emit json

    onTextChange(value: string) {
        this.isError = false;
        this.jsonTextValue = value;
        try {
            const parsed = JSON.parse(value);
            this.onChange.emit(parsed);
        } catch (e) {
            this.isError = true;
            return;
        }
    }
}
