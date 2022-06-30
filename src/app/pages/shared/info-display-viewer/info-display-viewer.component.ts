import { Component, Input, OnInit } from '@angular/core';

export interface InfoDisplayViewerMetadata {
    title?: string;
    sections?: InfoDisplayViewerSection[];
}

export interface InfoDisplayViewerSection {
    header?: string;
    indent?: boolean;
    hr?: boolean;
    textContent?: string;
}

@Component({
    selector: 'app-info-display-viewer',
    templateUrl: './info-display-viewer.component.html',
    styleUrls: ['./info-display-viewer.component.scss'],
})
export class InfoDisplayViewerComponent implements OnInit {
    @Input()
    readerMetadata: InfoDisplayViewerMetadata;

    constructor() {}

    get title(): string {
        return this.readerMetadata?.title || '';
    }

    get sections(): InfoDisplayViewerSection[] {
        return this.readerMetadata?.sections || [];
    }

    ngOnInit(): void {}
}
