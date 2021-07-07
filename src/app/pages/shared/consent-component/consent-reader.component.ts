import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";

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
    mode: "test" | "actual";
}

@Component({
    selector: "app-consent",
    templateUrl: "./consent-reader.component.html",
    styleUrls: ["./consent-reader.component.scss"],
})
export class ConsentReaderComponent {
    @Input()
    consentNavigationConfig: ConsentNavigationConfig;

    @Output()
    emitConsent: EventEmitter<boolean> = new EventEmitter();

    constructor(private router: Router) {
        const state = this.router.getCurrentNavigation()?.extras.state as ConsentNavigationConfig;

        if (state) {
            this.consentNavigationConfig = state;
        }
    }

    onConsentResponse(response: boolean) {
        if (this.consentNavigationConfig.mode !== "test") {
            this.emitConsent.next(response);
        }
    }
}
