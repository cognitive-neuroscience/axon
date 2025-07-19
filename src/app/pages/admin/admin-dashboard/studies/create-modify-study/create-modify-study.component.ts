import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Platform, TaskType } from 'src/app/models/enums';
import { Study } from 'src/app/models/Study';
import { Task } from 'src/app/models/Task';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { StudyService } from 'src/app/services/study.service';
import { TaskService } from 'src/app/services/task.service';
import { UserStateService } from 'src/app/services/user-state-service';

@Component({
    selector: 'app-create-study',
    templateUrl: './create-modify-study.component.html',
    styleUrls: ['./create-modify-study.component.scss'],
})
export class CreateModifyStudyComponent implements OnInit, OnDestroy {
    mode: 'EDIT' | 'CREATE' = 'CREATE';
    studyForm: UntypedFormGroup;
    selectedTasks: Task[];
    studyConfig: {};
    jsonIsError: boolean;
    subscriptions: Subscription[] = [];

    get tasks(): Task[] {
        return this.taskService.tasksValue;
    }

    private originalSelectedTasks: Task[] = [];

    constructor(
        private userStateService: UserStateService,
        private fb: UntypedFormBuilder,
        private taskService: TaskService,
        private studyService: StudyService,
        private router: Router,
        private snackbarService: SnackbarService,
        private loaderService: LoaderService,
        @Optional() private dialogRef: MatDialogRef<CreateModifyStudyComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public study: Study
    ) {}

    get isAdmin(): boolean {
        return this.userStateService.userIsAdmin;
    }

    get NABPsharplabTasks(): Task[] {
        return this.tasks.filter((task) => task.taskType === TaskType.NAB && task.fromPlatform === Platform.PSHARPLAB);
    }

    get experimentalPsharplabTasks(): Task[] {
        return this.tasks.filter(
            (task) => task.taskType === TaskType.EXPERIMENTAL && task.fromPlatform === Platform.PSHARPLAB
        );
    }

    get questionnaires(): Task[] {
        return this.tasks.filter((task) => task.taskType === TaskType.QUESTIONNAIRE);
    }

    get experimentalPavloviaTasks(): Task[] {
        return this.tasks.filter(
            (task) => task.taskType === TaskType.EXPERIMENTAL && task.fromPlatform === Platform.PAVLOVIA
        );
    }

    get NABPavloviaTasks(): Task[] {
        return this.tasks.filter((task) => task.taskType === TaskType.NAB && task.fromPlatform === Platform.PAVLOVIA);
    }

    get InfoDisplays(): Task[] {
        return this.tasks.filter((task) => task.taskType === TaskType.INFO_DISPLAY);
    }

    get consentForms(): Task[] {
        return this.tasks.filter((task) => task.taskType === TaskType.CONSENT);
    }

    get canRemoveTask(): boolean {
        return this.mode === 'CREATE' || (this.mode === 'EDIT' && this.study.canEdit);
    }

    // angular needs this to know which text to display in the mat-select component
    compareConsentFn(consent1: Task, consent2: Task) {
        return consent1.id === consent2.id ? consent1.name : '';
    }

    getClass(task: Task): string {
        switch (task.taskType) {
            case TaskType.EXPERIMENTAL:
            case TaskType.NAB:
                return task.fromPlatform;
            default:
                return task.taskType;
        }
    }

    ngOnInit(): void {
        this.taskService.getOrUpdateTasks().subscribe(() => {});

        this.selectedTasks = [];
        this.studyConfig = {};
        this.studyForm = this.fb.group({
            externalName: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
            internalName: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
            description: ['', Validators.maxLength(500)],
            consent: ['', Validators.required],
        });

        if (!this.study) {
            this.mode = 'CREATE';
        } else {
            this.mode = 'EDIT';
            this.studyForm.controls['externalName'].setValue(this.study.externalName);
            this.studyForm.controls['internalName'].setValue(this.study.internalName);
            this.studyForm.controls['description'].setValue(this.study.description);
            this.studyForm.controls['consent'].setValue(this.study.consent);

            this.studyConfig = { ...this.study.config };

            this.study.studyTasks.forEach((studyTask) => {
                this.selectedTasks.push(studyTask.task);
                this.originalSelectedTasks.push(studyTask.task);
            });
        }
    }

    handleSelection(task: Task) {
        this.selectedTasks.push(task);
    }

    navigateToViewAllStudies() {
        this.router.navigate([this.isAdmin ? `admin-dashboard/studies` : `organization-member-dashboard/studies`]);
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.selectedTasks, event.previousIndex, event.currentIndex);
    }

    removeElement(index: number) {
        this.selectedTasks.splice(index, 1);
    }

    handleUpdateJSON(event: { json: any; isValid: boolean }) {
        this.jsonIsError = !event.isValid;
        if (event.json && event.isValid) {
            this.studyConfig = event.json;
        }
    }

    onSubmit() {
        this.mode === 'CREATE' ? this.handleCreateStudy() : this.handleEditStudy();
    }

    handleEditStudy(): void {
        const study: Study = {
            id: this.study.id,
            internalName: this.studyForm.controls['internalName'].value,
            externalName: this.studyForm.controls['externalName'].value,
            createdAt: this.study.createdAt,
            deletedAt: this.study.deletedAt,
            started: this.study.started,
            description: this.studyForm.controls['description'].value,
            canEdit: this.study.canEdit,
            config: this.studyConfig,
            owner: this.study.owner,
            consent: this.studyForm.controls['consent'].value,
            studyTasks: this.selectedTasks.map((task, index) => {
                return {
                    studyId: this.study.id,
                    taskOrder: index,
                    config: {},
                    task: task,
                };
            }),
            snapshots: {}, // the BE does not touch snapshots as it should not be modifiable by the FE. It doesnt matter what we send here
        };

        this.loaderService.showLoader();
        const sub = this.studyService
            .updateStudy(
                study,
                !this.taskArraysAreTheSame(
                    this.originalSelectedTasks,
                    study.studyTasks.map((t) => t.task)
                )
            )
            .subscribe(
                () => {
                    this.snackbarService.openSuccessSnackbar('Successfully updated ' + study.internalName);
                    this.dialogRef.close();
                },
                (err: HttpErrorResponse) => {
                    this.snackbarService.openErrorSnackbar(err.error?.message || err.message);
                }
            )
            .add(() => {
                this.loaderService.hideLoader();
            });

        this.subscriptions.push(sub);
    }

    private taskArraysAreTheSame(tasks1: Task[], tasks2: Task[]): boolean {
        if (!tasks1 || !tasks2 || tasks1.length !== tasks2.length) return false;

        for (let i = 0; i < tasks1.length; i++) {
            if (tasks1[i].id !== tasks2[i].id) return false;
        }
        return true;
    }

    handleCreateStudy(): void {
        const study: Study = {
            id: null,
            internalName: this.studyForm.controls['internalName'].value,
            externalName: this.studyForm.controls['externalName'].value,
            createdAt: null,
            deletedAt: null,
            started: false,
            description: this.studyForm.controls['description'].value,
            canEdit: true,
            owner: {
                id: parseInt(this.userStateService.currentlyLoggedInUserId),
            },
            config: this.studyConfig,
            consent: this.studyForm.controls['consent'].value,
            studyTasks: this.selectedTasks.map((task, index) => {
                return {
                    studyId: null,
                    taskOrder: index,
                    config: {},
                    task: task,
                };
            }),
            snapshots: {}, // the BE does not touch snapshots as it should not be modifiable by the FE. It doesnt matter what we send here
        };

        this.loaderService.showLoader();
        const sub = this.studyService
            .createStudy(study)
            .subscribe(
                (_res) => {
                    this.snackbarService.openSuccessSnackbar('Successfully created ' + study.internalName);
                    this.router.navigate([
                        this.isAdmin ? `admin-dashboard/studies` : `organization-member-dashboard/studies`,
                    ]);
                },
                (err: HttpErrorResponse) => {
                    this.snackbarService.openErrorSnackbar(err.message);
                }
            )
            .add(() => {
                this.loaderService.hideLoader();
            });

        this.subscriptions.push(sub);
    }

    ngOnDestroy(): void {
        for (const sub of this.subscriptions) {
            sub.unsubscribe();
        }
    }
}
