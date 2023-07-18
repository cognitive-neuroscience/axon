import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription, zip } from 'rxjs';
import { ComponentName } from 'src/app/services/component-factory.service';
import { Navigation } from '../../shared/navigation-buttons/navigation-buttons.component';
import { IOnComplete, Playable } from '../playable';
import { TaskPlayerState } from '../task-player/task-player.component';
import { ConfirmDoneDialogComponent } from './confirm-done-dialog/confirm-done-dialog.component';
import { IntroDialogComponent } from './intro-dialog/intro-dialog.component';
import { UserStateService } from 'src/app/services/user-state-service';

interface EmbeddedPageMetadata {
    componentName: ComponentName;
    componentConfig: {
        externalUrl: string;
    };
}

@Component({
    selector: 'app-embedded-page',
    templateUrl: './embedded-page.component.html',
    styleUrls: ['./embedded-page.component.scss'],
})
export class EmbeddedPageComponent implements Playable, OnDestroy, OnInit {
    @ViewChild('iframe') iframe: ElementRef;

    // Link sent in as an admin to preview the embedded survey
    embeddedSurveyLink: string = '';
    metadata: EmbeddedPageMetadata;
    subscriptions: Subscription[] = [];
    delay = 60;
    interval: number | undefined;
    nextDisabled: boolean = true;

    constructor(private matDialog: MatDialog, private userStateService: UserStateService) {}

    onComplete: Subject<IOnComplete> = new Subject<{ navigation: Navigation; taskData: any[] }>();

    ngOnInit(): void {
        if (this.userStateService.userIsAdmin || this.userStateService.userIsOrgMember) {
            this.delay = 0;
        } else {
            this.delay = 60;
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
        this.embeddedSurveyLink = this.parseURL(this.metadata.componentConfig.externalUrl, userId, studyId);
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
        // const dialogRef = this.matDialog.open(ConfirmDoneDialogComponent, { width: '70%' });
        // this.subscriptions.push(
        //     dialogRef.afterClosed().subscribe((ok: boolean) => {
        //         if (ok) {
        //             this.handleComplete(Navigation.NEXT, []);
        //         } else {
        //             this.refocusIframe();
        //         }
        //     })
        // );
    }

    // iframe loses focus if the user clicks outside of it, and clicking back in it does not help
    refocusIframe() {
        if (this.iframe && this.iframe.nativeElement) this.iframe.nativeElement.focus();
    }
}
