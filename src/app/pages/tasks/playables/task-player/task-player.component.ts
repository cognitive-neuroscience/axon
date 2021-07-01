import { Component, OnDestroy, OnInit, ViewContainerRef } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { getRandomNumber, thisOrDefault } from "src/app/common/commonMethods";
import { ComponentFactoryService, ComponentName } from "src/app/services/component-factory.service";
import { SnackbarService } from "src/app/services/snackbar.service";
import { TaskManagerService } from "src/app/services/task-manager.service";
import { ParticipantDataService } from "src/app/services/study-data.service";
import { Navigation } from "../../shared/navigation-buttons/navigation-buttons.component";
import { IOnComplete } from "../playable";
import { LoaderService } from "src/app/services/loader/loader.service";
import { UserService } from "src/app/services/user.service";
import { AdminRouteNames, Role, RouteNames } from "src/app/models/enums";

export interface CounterBalanceGroup {
    [key: number]: any;
}

export interface TaskMetadata {
    config: {
        counterBalanceGroups?: CounterBalanceGroup;
    };
    metadata: ComponentMetadata[];
}

export interface ComponentMetadata {
    component: ComponentName;
    content?: any;
    config?: any;
}

export class TaskConfig {
    userID: string;
    studyID: number;
    private data: {
        [key: string]: any;
    };
    counterBalanceGroups?: CounterBalanceGroup;
    counterbalanceNumber?: number;

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
    metadata: TaskMetadata;
    mode: "test" | "actual";
}

@Component({
    selector: "app-task-player",
    templateUrl: "./task-player.component.html",
    styleUrls: ["./task-player.component.scss"],
})
export class TaskPlayerComponent implements OnDestroy {
    constructor(
        private componentFactoryService: ComponentFactoryService,
        private viewContainer: ViewContainerRef,
        private taskManager: TaskManagerService,
        private userService: UserService,
        private uploadDataService: ParticipantDataService,
        private router: Router,
        private snackbarService: SnackbarService,
        private loaderService: LoaderService
    ) {
        const navigationConfig = this.router.getCurrentNavigation().extras.state as TaskPlayerNavigationConfig;
        if (navigationConfig) {
            this.handleTaskVariablesAndPlayTask(navigationConfig.metadata, navigationConfig.mode);
        } else {
            this.taskManager.handleErr();
        }
    }

    // task metadata variables
    index = 0;
    taskData: any[] = [];
    steps: ComponentMetadata[] = [];
    subscription: Subscription;

    // metadata config
    state = new TaskConfig(null, null, {}, null); // this state will be shared with each step in the task

    handleTaskVariablesAndPlayTask(taskMetadataConfig: TaskMetadata, mode: "test" | "actual") {
        if (mode === "test") {
            this.state.userID = "TEST";
            this.state.studyID = 0;
        } else {
            this.state.userID = this.userService.isCrowdsourcedUser
                ? this.userService.user.email
                : this.userService.user.id.toString();
            this.state.studyID = this.taskManager.study.id;
        }

        const counterBalanceGroups = taskMetadataConfig.config.counterBalanceGroups;
        if (counterBalanceGroups) {
            const groupKeys = Object.keys(counterBalanceGroups);
            if (groupKeys.length > 0) {
                this.state.counterbalanceNumber = getRandomNumber(1, groupKeys.length + 1); // generate rand num from 1 - groupKeys
                this.state.counterBalanceGroups = { ...counterBalanceGroups };
            }
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
            const component = this.componentFactoryService.getComponent(step.component);
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

        if (onComplete.taskData) this.taskData = this.taskData.concat(onComplete.taskData);

        if (onComplete.navigation === Navigation.NEXT) {
            this.renderNextStep();
        } else {
            this.renderPreviousStep();
        }
    }

    handleUploadData(): Observable<boolean> {
        return this.uploadDataService
            .uploadTaskData(
                this.userService.isCrowdsourcedUser
                    ? this.userService.user.email
                    : this.userService.user?.id.toString(),
                this.taskManager.study?.id,
                this.taskManager.currentStudyTask.taskOrder,
                this.taskData
            )
            .pipe(map((ok) => ok.ok));
    }

    continueAhead() {
        if (this.userService.user.role === Role.ADMIN) {
            this.reset();
            this.router.navigate([`${AdminRouteNames.DASHBOARD_BASEROUTE}/${AdminRouteNames.COMPONENTS_SUBROUTE}`]);
            this.snackbarService.openInfoSnackbar("Task completed");
        } else {
            this.loaderService.showLoader();
            this.handleUploadData().subscribe(
                (ok) => {
                    this.reset();
                    this.loaderService.hideLoader();
                    this.taskManager.next();
                },
                (err) => {
                    this.reset();
                    this.loaderService.hideLoader();
                    this.taskManager.handleErr();
                }
            );
        }
    }

    reset() {
        this.index = 0;
        this.taskData = [];
        this.steps = [];
        this.state = new TaskConfig(null, null, {}, null);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
