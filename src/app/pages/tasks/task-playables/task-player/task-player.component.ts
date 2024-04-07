import { Component, OnDestroy, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { getRandomNumber } from 'src/app/common/commonMethods';
import {
    ComponentFactoryService,
    ComponentName,
    GenericComponentsList,
} from 'src/app/services/component-factory.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';
import { ParticipantDataService } from 'src/app/services/study-data.service';
import { Navigation } from '../../shared/navigation-buttons/navigation-buttons.component';
import { IOnComplete } from '../playable';
import { BaseParticipantData } from 'src/app/models/ParticipantData';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SessionStorageService } from 'src/app/services/sessionStorage.service';
import { Location } from '@angular/common';
import { UserStateService } from 'src/app/services/user-state-service';

export interface CounterBalanceGroup {
    [key: number]: any;
}

export interface ComponentMetadata {
    componentName: ComponentName;
    componentConfig: any;
}

export interface SharplabTaskConfig {
    taskConfig: {
        [key: string]: any;
    };
    metadata: ComponentMetadata[];
}

export class TaskPlayerState {
    userID: string;
    studyID: number;
    mode: 'test' | 'actual' = 'actual';
    private data: {
        [key: string]: any;
    };
    counterBalanceGroups?: CounterBalanceGroup;
    counterbalanceNumber?: number;
    taskConfig: { [key: string]: any } = {};

    public setCacheValue(key: string, value: any) {
        this.data[key] = value;
    }

    public getCacheValue(key: string): any {
        return this.data[key];
    }

    constructor(
        userId: string,
        studyId: number,
        counterBalanceGroups?: CounterBalanceGroup,
        counterBalanceNumber?: number
    ) {
        this.userID = userId;
        this.studyID = studyId;
        this.counterBalanceGroups = counterBalanceGroups || null;
        this.counterbalanceNumber = counterBalanceNumber || null;
        this.data = {};
    }
}

export class TaskPlayerNavigationConfig {
    metadata: SharplabTaskConfig;
    mode: 'test' | 'actual';
}

@Component({
    selector: 'app-task-player',
    templateUrl: './task-player.component.html',
})
export class TaskPlayerComponent implements OnDestroy {
    constructor(
        private componentFactoryService: ComponentFactoryService,
        private viewContainer: ViewContainerRef,
        private taskManager: TaskManagerService,
        private uploadDataService: ParticipantDataService,
        private router: Router,
        private snackbarService: SnackbarService,
        private loaderService: LoaderService,
        private sessionStorageService: SessionStorageService,
        private location: Location,
        private userStateService: UserStateService
    ) {
        const navigationConfig = this.router.getCurrentNavigation()?.extras?.state as TaskPlayerNavigationConfig;
        if (navigationConfig) {
            this.handleTaskVariablesAndPlayTask(navigationConfig.metadata, navigationConfig.mode);
        } else {
            const currentlyRunningStudyId = this.sessionStorageService.getCurrentlyRunningStudyIdInSessionStorage();
            if (currentlyRunningStudyId !== null) {
                this.taskManager.initStudy(parseInt(currentlyRunningStudyId));
            } else {
                // handle case where page is refreshed and no study is in session storage
                this.location.back();
            }
        }
    }

    // task metadata variables
    index = 0;
    taskData: any[] = [];
    steps: ComponentMetadata[] = [];
    mode: 'test' | 'actual' = 'test';
    subscription: Subscription;

    // metadata config
    state = new TaskPlayerState(null, null, {}, null); // this state will be shared with each step in the task

    handleTaskVariablesAndPlayTask(taskMetadataConfig: SharplabTaskConfig, mode: 'test' | 'actual') {
        this.state.mode = mode;
        if (mode === 'test') {
            this.state.userID = 'TEST';
            this.state.studyID = 0;
        } else {
            this.state.userID = this.userStateService.isCrowdsourcedUser
                ? this.userStateService.userValue.email
                : this.userStateService.userValue.id.toString();
            this.state.studyID = this.taskManager.study.id;
        }

        const counterBalanceGroups = taskMetadataConfig.taskConfig?.counterBalanceGroups;
        if (counterBalanceGroups) {
            const groupKeys = Object.keys(counterBalanceGroups);
            if (groupKeys.length > 0) {
                this.state.counterbalanceNumber = getRandomNumber(1, groupKeys.length + 1); // generate rand num from 1 - groupKeys
                this.state.counterBalanceGroups = { ...counterBalanceGroups };
            }
        }
        if (Object.keys(taskMetadataConfig.taskConfig).length > 0) {
            this.state.taskConfig = { ...taskMetadataConfig.taskConfig };
        }

        this.steps = taskMetadataConfig.metadata;
        this.renderStep(this.steps[0]);
    }

    renderNextStep() {
        this.index++;
        const currentStep = this.steps[this.index];
        if (this.index < this.steps.length) {
            this.renderStep(currentStep);
            return;
        } else {
            this.continueAhead();
        }
    }

    renderPreviousStep() {
        this.index--;
        const currentStep = this.steps[this.index];
        if (this.index >= 0) {
            this.renderStep(currentStep);
        } else {
            // trying to go to a step before the first step, do not allow
            return;
        }
    }

    renderStep(step: ComponentMetadata) {
        try {
            this.viewContainer.clear();
            // create component
            const component = this.componentFactoryService.getComponent(step.componentName);
            // init component and populate with relevant metadata
            component.instance.configure(step, this.state);
            // subscribe to on complete
            this.subscription = component.instance.onComplete.subscribe((onComplete: IOnComplete) =>
                this.handleOnComplete(onComplete)
            );
            // attach component to view container
            this.viewContainer.insert(component.hostView);

            // run the afterInit function for cleanup
            component.instance.afterInit();
        } catch (error) {
            // handle more gracefully in the future
            throw new Error(error);
        }
    }

    handleOnComplete(onComplete: IOnComplete) {
        this.subscription.unsubscribe();
        this.viewContainer.clear();
        const shouldSetTaskAsComplete =
            !this.userStateService.isCrowdsourcedUser && (this.hasCompletedAllBlocks() || onComplete.wasSkipped);

        if (!this.userStateService.userIsParticipant) console.log(onComplete);

        if (onComplete.taskData && this.state.mode === 'actual') {
            this.loaderService.showLoader();
            this.handleUploadData(onComplete.taskData, onComplete.wasSkipped)
                .pipe(mergeMap((ok) => (ok && shouldSetTaskAsComplete ? this.taskManager.setTaskAsComplete() : of(ok))))
                .subscribe(
                    (ok) => {
                        if (!ok) {
                            this.taskManager.handleErr();
                            return;
                        }

                        if (onComplete.wasSkipped) {
                            this.continueAhead();
                            return;
                        }

                        if (onComplete.navigation === Navigation.NEXT) {
                            this.renderNextStep();
                        } else {
                            this.renderPreviousStep();
                        }
                    },
                    (_err) => {
                        this.taskManager.handleErr();
                    }
                )
                .add(() => {
                    this.loaderService.hideLoader();
                });
        } else {
            onComplete.navigation === Navigation.NEXT ? this.renderNextStep() : this.renderPreviousStep();
        }
    }

    private hasCompletedAllBlocks(): boolean {
        for (let i = this.index + 1; i < this.steps.length; i++) {
            const componentName = this.steps[i].componentName;
            if (!GenericComponentsList.includes(componentName)) {
                // GenericComponentsList contains a list of components that are used to display generic info and
                // aren't related to implementation of a particular task.
                // We check that the next steps have component names that are not generic. If any exist,
                // that means that it is task specific and we still have other blocks to go. Otherwise we have finished
                // the last block.
                // TODO: add a test case for this
                return false;
            }
        }
        return true;
    }

    handleUploadData(taskData: BaseParticipantData[], wasSkipped: boolean): Observable<boolean> {
        return this.uploadDataService
            .createParticipantData(
                this.userStateService.isCrowdsourcedUser
                    ? this.userStateService.userValue.email
                    : this.userStateService.currentlyLoggedInUserId,
                this.taskManager.study?.id,
                this.taskManager.currentStudyTask.taskOrder,
                this.userStateService.isCrowdsourcedUser,
                taskData,
                wasSkipped ? { wasSkipped: true } : {}
            )
            .pipe(map((ok) => ok.ok));
    }

    continueAhead() {
        if (this.taskManager.isTestMode || this.userStateService.userIsParticipant) {
            this.taskManager.next();
        } else {
            this.reset();
            this.router.navigate([
                this.userStateService.userIsAdmin
                    ? `admin-dashboard/components`
                    : `organization-member-dashboard/components`,
            ]);
            this.snackbarService.openInfoSnackbar('Task completed');
        }
    }

    reset() {
        this.index = 0;
        this.taskData = [];
        this.steps = [];
        this.state = new TaskPlayerState(null, null, {}, null);
        this.subscription.unsubscribe();
        this.viewContainer.clear();
    }

    ngOnDestroy() {
        this.subscription?.unsubscribe();
    }
}
