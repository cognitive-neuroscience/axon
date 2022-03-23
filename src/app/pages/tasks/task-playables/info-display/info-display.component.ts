import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ParticipantRouteNames } from 'src/app/models/enums';
import { InfoDisplayViewerMetadata } from '../../../shared/info-display-viewer/info-display-viewer.component';
import { ComponentMetadata, TaskPlayerState } from '../task-player/task-player.component';
import { ComponentName } from 'src/app/services/component-factory.service';
import { IOnComplete, Playable } from '../playable';
import { Subject } from 'rxjs';
import { Navigation } from '../../shared/navigation-buttons/navigation-buttons.component';

interface Display extends InfoDisplayViewerMetadata {
    shouldIncrementIndex: boolean;
    buttons?: InfoDisplayButtonConfig;
}

export interface InfoDisplayButtonConfig {
    displayContinueButton: boolean;
    displayHomeButton: boolean;
}

interface InfoDisplayMetadata {
    componentName: ComponentName;
    componentConfig: Display;
}

@Component({
    selector: 'app-info-display',
    templateUrl: './info-display.component.html',
    styleUrls: ['./info-display.component.scss'],
})
export class InfoDisplayComponent implements Playable, OnDestroy {
    metadata: InfoDisplayMetadata;
    isVisible = false;
    wasClicked = false;

    constructor(private router: Router) {}

    onComplete: Subject<IOnComplete> = new Subject<{ navigation: Navigation; taskData: any[] }>();

    handleComplete(nav: Navigation, data?: any[]): void {
        this.onComplete.next({ navigation: nav, taskData: data });
    }

    afterInit(): void {}

    get shouldShowHomeButton(): boolean {
        return this.metadata?.componentConfig?.buttons?.displayHomeButton;
    }

    get shouldShowContinueButton(): boolean {
        return this.metadata?.componentConfig?.buttons?.displayContinueButton;
    }

    get title(): string {
        return this.metadata?.componentConfig?.title || '';
    }

    configure(metadata: ComponentMetadata, config?: TaskPlayerState) {
        this.metadata = metadata;
        this.isVisible = true;
    }

    onButtonClick(arg: 'home' | 'continue') {
        if (!this.wasClicked) {
            this.wasClicked = true;

            if (arg === 'home') {
                this.router.navigate([ParticipantRouteNames.DASHBOARD_BASEROUTE]);
            } else {
                this.handleComplete(Navigation.NEXT, []);
            }
        }
    }

    ngOnDestroy(): void {
        this.onComplete.complete();
    }
}
