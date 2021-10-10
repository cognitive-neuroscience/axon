import { Component, EventEmitter, OnInit } from '@angular/core';

export interface InfoDisplayViewerMetadata {
    shouldIncrementIndex: boolean;
    title?: string;
    sections?: InfoDisplayViewerSection[];
    buttons?: InfoDisplayViewerButtonConfig;
}

export interface InfoDisplayViewerSection {
    header: string;
    textContent: string;
}

export interface InfoDisplayViewerButtonConfig {
    displayContinueButton: boolean;
    displayHomeButton: boolean;
}

@Component({
    selector: 'app-info-display-viewer',
    templateUrl: './info-display-viewer.component.html',
    styleUrls: ['./info-display-viewer.component.scss'],
})
export class InfoDisplayViewerComponent implements OnInit {
    readerMetadata: InfoDisplayViewerMetadata;

    onClick: EventEmitter<>;

    constructor() {}

    get shouldShowHomeButton(): boolean {
        return this.readerMetadata?.buttons?.displayHomeButton;
    }

    get shouldShowContinueButton(): boolean {
        return this.readerMetadata?.buttons?.displayHomeButton;
    }

    get title(): string {
        return this.readerMetadata?.title || '';
    }

    get sections(): InfoDisplayViewerSection[] {
        return this.readerMetadata?.sections || [];
    }

    ngOnInit(): void {}
}
