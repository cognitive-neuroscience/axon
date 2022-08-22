import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { getTextForLang } from 'src/app/common/commonMethods';
import { SupportedLangs } from 'src/app/models/enums';
import { ITranslationText } from 'src/app/models/InternalDTOs';

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

    constructor(private translateService: TranslateService) {}

    get title(): string {
        return this.readerMetadata?.title || '';
    }

    get sections(): InfoDisplayViewerSection[] {
        return this.readerMetadata?.sections || [];
    }

    getTranslation(textObj: ITranslationText | string): string {
        return getTextForLang(this.translateService.currentLang as SupportedLangs, textObj);
    }

    ngOnInit(): void {}
}
