import { Component, OnDestroy, ViewContainerRef } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { getRandomNumber } from "src/app/common/commonMethods";
import { TaskNames } from "src/app/models/TaskData";
import { AuthService } from "src/app/services/auth.service";
import { ComponentFactoryService, ComponentName } from "src/app/services/component-factory.service";
import { SnackbarService } from "src/app/services/snackbar.service";
import { TaskManagerService } from "src/app/services/task-manager.service";
import { UploadDataService } from "src/app/services/uploadData.service";
import { Navigation } from "../shared/navigation-buttons/navigation-buttons.component";
import { IOnComplete } from "../Playable";

export interface TaskMetadata {
    config: {
        counterbalanced?: boolean;
    };
    metadata: ComponentMetadata[];
}

export interface ComponentMetadata {
    component: ComponentName;
    content?: any;
    config?: any;
}

export interface TaskConfig {
    userID: string;
    experimentCode: string;
    data?: any;
    counterbalanceRandomNumber?: number;
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
        private authService: AuthService,
        private uploadDataService: UploadDataService,
        private router: Router,
        private snackbarService: SnackbarService
    ) {}

    // task metadata variables
    numBlocks = 0;
    index = 0;
    taskData: any[] = [];
    steps: ComponentMetadata[] = [];
    subscription: Subscription;

    // metadata config
    state: TaskConfig = {
        userID: "",
        experimentCode: "",
    }; // this state will be shared with each step in the task

    handleTaskVariablesAndPlayTask(taskMetadataConfig: TaskMetadata) {
        this.state.userID = this.authService.getDecodedToken().UserID;
        this.state.experimentCode = this.taskManager.getExperimentCode();
        if (taskMetadataConfig.config.counterbalanced) this.state.counterbalanceRandomNumber = getRandomNumber(0, 100); // generate rand num from 0 - 99

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
        const experimentCode = this.taskManager.getExperimentCode();
        return this.uploadDataService
            .uploadData(experimentCode, TaskNames.RATINGNEW, this.taskData)
            .pipe(map((ok) => ok.ok));
    }

    continueAhead() {
        if (this.authService.isAdmin()) {
            this.router.navigate(["/dashboard/components"]);
            this.snackbarService.openInfoSnackbar("Task completed");
        } else {
            this.handleUploadData().subscribe(
                (ok) => {
                    this.taskManager.next();
                },
                (err) => {
                    this.taskManager.handleErr();
                }
            );
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
