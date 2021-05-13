import { Component, OnDestroy, OnInit, ViewContainerRef } from "@angular/core";
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
import { Navigation } from "../navigation-buttons/navigation-buttons.component";
import { IOnComplete } from "../Playable";
import { RatingLayoutMetadata } from "./rating-layout";

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
    counterbalanceRandomNumber?: number;
}

@Component({
    selector: "app-rating-task",
    templateUrl: "./rating-new.component.html",
    styleUrls: ["./rating-new.component.scss"],
})
export class RatingNewComponent implements OnInit, OnDestroy {
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
    }; // this state will be shared with each instance of the task component in order to communicate

    ngOnInit() {
        // read the json config file in the future
        this.handleTaskVariables(RatingLayoutMetadata);
        this.steps = RatingLayoutMetadata.metadata;
        this.renderStep(this.steps[this.index]);
    }

    handleTaskVariables(taskMetadataConfig: TaskMetadata) {
        this.state.userID = this.authService.getDecodedToken().UserID;
        this.state.experimentCode = this.taskManager.getExperimentCode();
        if (taskMetadataConfig.config.counterbalanced) this.state.counterbalanceRandomNumber = getRandomNumber(0, 100); // generate rand num from 0 - 99
    }

    renderNextStep() {
        this.index++;
        const currentStep = this.steps[this.index];
        if (this.index < this.steps.length) {
            this.renderStep(currentStep);
            return;
        } else {
            this.handleUploadData().subscribe(
                (ok) => {
                    this.continueAhead();
                },
                (err) => {
                    this.taskManager.handleErr();
                }
            );
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
            // handle more gracefully
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
            this.taskManager.next();
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
