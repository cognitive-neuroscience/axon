import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { ComponentName } from 'src/app/services/component-factory.service';
import { Navigation } from '../../shared/navigation-buttons/navigation-buttons.component';
import { IOnComplete, Playable } from '../playable';
import { TaskPlayerState } from '../task-player/task-player.component';
import { IntroDialogComponent } from './intro-dialog/intro-dialog.component';
import { UserStateService } from 'src/app/services/user-state-service';
import { getTextForLang, thisOrDefault } from 'src/app/common/commonMethods';
import { TranslateService } from '@ngx-translate/core';
import { SupportedLangs } from 'src/app/models/enums';
import { ITranslationText } from 'src/app/models/InternalDTOs';

interface EmbeddedPageMetadata {
    componentName: ComponentName;
    componentConfig: {
        externalUrl: string;
        disableNextButtonDurationInSeconds: number;
        buttons: {
            nextButtonText: ITranslationText;
            previousButtonText: ITranslationText;
        };
    };
}

@Component({
    selector: 'app-embedded-page',
    templateUrl: './embedded-page.component.html',
    styleUrls: ['./embedded-page.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class EmbeddedPageComponent implements Playable, OnDestroy, OnInit {
    @ViewChild('iframe') iframe: ElementRef;

    // Link sent in as an admin to preview the embedded survey
    embeddedSurveyLink: string = '';
    metadata: EmbeddedPageMetadata;
    subscriptions: Subscription[] = [];
    delay = 30;
    interval: number | undefined;
    nextDisabled: boolean = true;

    nextButtonText = '';
    previousButtonText = '';

    constructor(
        private matDialog: MatDialog,
        private userStateService: UserStateService,
        private translateService: TranslateService
    ) {}

    onComplete: Subject<IOnComplete> = new Subject<{ navigation: Navigation; taskData: any[] }>();

    ngOnInit(): void {
        // when the user is an admin or org member, this task is being run in the portal so we just want to show a short delay
        if (this.userStateService.userIsAdmin || this.userStateService.userIsOrgMember) {
            this.delay = 5;
        }

        this.nextDisabled = true;
        this.interval = window.setInterval(() => {
            if (this.delay <= 0) {
                this.nextDisabled = false;
                window.clearInterval(this.interval);
                return;
            }
            this.delay--;
        }, 1000);
    }

    handleComplete(nav: Navigation, data?: any[]): void {
        this.onComplete.next({ navigation: nav, taskData: data });
    }

    afterInit(): void {}

    configure(metadata: EmbeddedPageMetadata, config?: TaskPlayerState) {
        const userId = config.userID;
        const studyId = config.studyID;
        this.metadata = metadata;
        const externalURL = this.handleTranslate(this.metadata.componentConfig.externalUrl);
        this.embeddedSurveyLink = this.parseURL(externalURL, userId, studyId);
        this.delay = thisOrDefault(metadata.componentConfig.disableNextButtonDurationInSeconds, 30);

        const currentLang = this.translateService.currentLang ? this.translateService.currentLang : SupportedLangs.EN;

        this.nextButtonText = thisOrDefault(
            this.metadata.componentConfig.buttons?.nextButtonText?.[currentLang],
            'NEXT'
        );
        this.previousButtonText = thisOrDefault(
            this.metadata.componentConfig.buttons?.previousButtonText?.[currentLang],
            'PREVIOUS'
        );
    }

    handleTranslate(text: ITranslationText | string): string {
        return getTextForLang(this.translateService.currentLang as SupportedLangs, text);
    }

    beginRound() {
        this.matDialog.open(IntroDialogComponent, { width: '70%' });
    }

    private parseURL(url: string, subjectID: string, studyId: number): string {
        // we expect a url like https://run.pavlovia.org/Sharp_lab/corsi-test/html?subject=[s_value]&studyid=[e_value]
        return `${url}?subjectid=${subjectID}&studyid=${studyId}`;
    }

    ngOnDestroy() {
        this.onComplete.complete();
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    proceed() {
        this.handleComplete(Navigation.NEXT, []);
    }

    // iframe loses focus if the user clicks outside of it, and clicking back in it does not help
    refocusIframe() {
        if (this.iframe && this.iframe.nativeElement) this.iframe.nativeElement.focus();
    }
}
