import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractBaseReaderComponent } from '../../tasks/shared/base-reader';

class ConsentForm {
    img: string;
    title: string;
    summary: {
        caption: string;
        words: string[];
    }[];
    secondTitle: string;
    body: {
        caption: string;
        words: string[];
    }[];
    endMessage: string;
    buttons: {
        reject: {
            show: boolean;
            text: string;
        };
        accept: {
            show: boolean;
            text: string;
        };
    };
}

export class ConsentNavigationConfig {
    metadata: ConsentForm;
    mode: 'test' | 'actual';
}

@Component({
    selector: 'app-consent',
    templateUrl: './consent-reader.component.html',
    styleUrls: ['./consent-reader.component.scss'],
})
export class ConsentReaderComponent implements AbstractBaseReaderComponent {
    @Input()
    readerMetadata: ConsentNavigationConfig;

    @Output()
    emitConsent: EventEmitter<boolean> = new EventEmitter();

    constructor(private router: Router) {
        const state = this.router.getCurrentNavigation()?.extras.state as ConsentNavigationConfig;

        if (state) {
            this.readerMetadata = state;
        }
    }

    onSubmit(response: boolean) {
        this.emitConsent.next(response);
    }
}
