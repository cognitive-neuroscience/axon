import { Component, OnDestroy, OnInit } from '@angular/core';
import { TaskManagerService } from 'src/app/services/task-manager.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { AbstractBaseReaderComponent } from '../shared/base-reader';
import { ParticipantRouteNames } from 'src/app/models/enums';
import { InfoDisplayViewerMetadata } from '../../shared/info-display-viewer/info-display-viewer.component';

export interface InfoDisplayMetadata extends InfoDisplayViewerMetadata {
    shouldIncrementIndex: boolean;
    buttons?: InfoDisplayButtonConfig;
}

export interface InfoDisplaySection {
    header: string;
    textContent: string;
}

export interface InfoDisplayButtonConfig {
    displayContinueButton: boolean;
    displayHomeButton: boolean;
}

export interface InfoDisplayNavigationConfig {
    metadata: InfoDisplayMetadata;
    mode: 'test' | 'actual';
}

@Component({
    selector: 'app-info-display',
    templateUrl: './info-display.component.html',
    styleUrls: ['./info-display.component.scss'],
})
export class InfoDisplayComponent implements AbstractBaseReaderComponent {
    readerMetadata: InfoDisplayNavigationConfig;

    get shouldShowHomeButton(): boolean {
        return this.readerMetadata?.metadata?.buttons?.displayHomeButton;
    }

    get shouldShowContinueButton(): boolean {
        return this.readerMetadata?.metadata?.buttons?.displayContinueButton;
    }

    get title(): string {
        return this.readerMetadata?.metadata?.title || '';
    }

    get sections(): InfoDisplaySection[] {
        return this.readerMetadata?.metadata?.sections || [];
    }

    constructor(private taskManager: TaskManagerService, private router: Router, private userService: UserService) {
        const state = this.router.getCurrentNavigation().extras.state as InfoDisplayNavigationConfig;

        if (state) {
            this.readerMetadata = state;
            const incrementIndex = this.readerMetadata.metadata?.shouldIncrementIndex;

            // crowdsourced users cannot take breaks as they do not have accounts and so cannot sign back in.
            // this is a safety check: realistically, crowdsourced users will not be shown info display slides
            if (!this.userService.isCrowdsourcedUser && incrementIndex) {
                this.taskManager.setTaskAsComplete().subscribe((res) => {});
            }
        } else {
            this.taskManager.handleErr();
        }
    }

    onSubmit(arg: 'home' | 'continue') {
        if (arg === 'home') {
            this.router.navigate([ParticipantRouteNames.DASHBOARD_BASEROUTE]);
        } else {
            if (this.userService.isCrowdsourcedUser) {
                this.taskManager.next();
            } else {
                this.taskManager.setTaskAsComplete().subscribe(
                    (ok) => {
                        ok ? this.taskManager.next() : this.taskManager.handleErr();
                    },
                    (err) => {
                        this.taskManager.handleErr();
                    }
                );
            }
        }
    }
}
