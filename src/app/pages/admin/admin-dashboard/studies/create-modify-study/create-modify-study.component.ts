import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, Inject, OnInit, Optional } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";
import { AdminRouteNames, Platform, TaskType } from "src/app/models/enums";
import { Study } from "src/app/models/Study";
import { Task } from "src/app/models/Task";
import { SnackbarService } from "src/app/services/snackbar.service";
import { StudyService } from "src/app/services/study.service";
import { TaskService } from "src/app/services/task.service";
import { UserService } from "src/app/services/user.service";

@Component({
    selector: "app-create-study",
    templateUrl: "./create-modify-study.component.html",
    styleUrls: ["./create-modify-study.component.scss"],
})
export class CreateModifyStudyComponent implements OnInit {
    mode: "EDIT" | "CREATE" = "CREATE";

    studyForm: FormGroup;

    selectedTasks: Task[];

    tasks: Observable<Task[]>;

    constructor(
        private userService: UserService,
        private fb: FormBuilder,
        private taskService: TaskService,
        private studyService: StudyService,
        private router: Router,
        private snackbarService: SnackbarService,
        @Optional() private dialogRef: MatDialogRef<CreateModifyStudyComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) public study: Study
    ) {
        this.selectedTasks = [];
        this.studyForm = this.fb.group({
            externalName: ["", Validators.compose([Validators.required, Validators.maxLength(255)])],
            internalName: ["", Validators.compose([Validators.maxLength(255)])],
            description: ["", Validators.maxLength(500)],
        });

        if (!this.study) {
            this.mode = "CREATE";
        } else {
            this.mode = "EDIT";
            this.studyForm.controls["externalName"].setValue(study.externalName);
            this.studyForm.controls["internalName"].setValue(study.internalName);
            this.studyForm.controls["description"].setValue(study.description);
            study.tasks.forEach((studyTask) => {
                this.selectedTasks.push(studyTask.task);
            });
        }
    }

    get isAdmin(): Observable<boolean> {
        return this.userService.userIsAdmin;
    }

    get NABPsharplabTasks(): Observable<Task[]> {
        return this.tasks.pipe(
            map((tasks) =>
                tasks
                    ? tasks.filter((task) => task.taskType === TaskType.NAB && task.fromPlatform === Platform.PSHARPLAB)
                    : []
            )
        );
    }

    get experimentalPsharplabTasks(): Observable<Task[]> {
        return this.tasks.pipe(
            map((tasks) =>
                tasks
                    ? tasks.filter(
                          (task) => task.taskType === TaskType.EXPERIMENTAL && task.fromPlatform === Platform.PSHARPLAB
                      )
                    : []
            )
        );
    }

    get questionnaires(): Observable<Task[]> {
        return this.tasks.pipe(
            map((tasks) => (tasks ? tasks.filter((task) => task.taskType === TaskType.QUESTIONNAIRE) : []))
        );
    }

    get experimentalPavloviaTasks(): Observable<Task[]> {
        return this.tasks.pipe(
            map((tasks) =>
                tasks
                    ? tasks.filter(
                          (task) => task.taskType === TaskType.EXPERIMENTAL && task.fromPlatform === Platform.PAVLOVIA
                      )
                    : []
            )
        );
    }

    get NABPavloviaTasks(): Observable<Task[]> {
        return this.tasks.pipe(
            map((tasks) =>
                tasks
                    ? tasks.filter((task) => task.taskType === TaskType.NAB && task.fromPlatform === Platform.PAVLOVIA)
                    : []
            )
        );
    }

    ngOnInit(): void {
        this.tasks = this.taskService.tasks;
        if (!this.taskService.hasTasks) this.taskService.update();
    }

    handleSelection(task: Task) {
        this.selectedTasks.push(task);
    }

    navigateToViewAllStudies() {
        this.router.navigate([
            `${AdminRouteNames.DASHBOARD_BASEROUTE}/${AdminRouteNames.STUDIES_SUBROUTE}/${AdminRouteNames.STUDIES_VIEW_SUBROUTE}`,
        ]);
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.selectedTasks, event.previousIndex, event.currentIndex);
    }

    removeElement(index: number) {
        this.selectedTasks.splice(index, 1);
    }

    onSubmit() {
        this.mode === "CREATE" ? this.handleCreateStudy() : this.handleEditStudy();
    }

    handleEditStudy(): void {
        const study: Study = {
            id: this.study.id,
            internalName: this.studyForm.controls["internalName"].value,
            externalName: this.studyForm.controls["externalName"].value,
            createdAt: this.study.createdAt,
            deletedAt: this.study.deletedAt,
            started: this.study.started,
            studyCode: this.study.studyCode,
            description: this.studyForm.controls["description"].value,
            canEdit: true,
            tasks: this.selectedTasks.map((task, index) => {
                return {
                    studyId: this.study.id,
                    taskId: task.id,
                    taskOrder: index,
                    config: {},
                    task: task,
                };
            }),
        };

        this.studyService
            .editStudy(study)
            .pipe(take(1))
            .subscribe(
                () => {
                    this.studyService.update();
                    this.snackbarService.openSuccessSnackbar("Successfully updated " + study.internalName);
                    this.dialogRef.close();
                },
                (err: HttpErrorResponse) => {
                    this.snackbarService.openErrorSnackbar(err.error?.message || err.message);
                }
            );
    }

    handleCreateStudy(): void {
        const study: Study = {
            id: null,
            internalName: this.studyForm.controls["internalName"].value,
            externalName: this.studyForm.controls["externalName"].value,
            createdAt: null,
            deletedAt: null,
            started: false,
            studyCode: "",
            description: this.studyForm.controls["description"].value,
            canEdit: true,
            tasks: this.selectedTasks.map((task, index) => {
                return {
                    studyId: null,
                    taskId: task.id,
                    taskOrder: index,
                    config: {},
                    task: task,
                };
            }),
        };

        this.studyService
            .createStudy(study)
            .pipe(take(1))
            .subscribe(
                () => {
                    this.studyService.update();
                    this.snackbarService.openSuccessSnackbar("Successfully created " + study.internalName);
                    this.router.navigate([
                        `${AdminRouteNames.DASHBOARD_BASEROUTE}/${AdminRouteNames.STUDIES_SUBROUTE}`,
                    ]);
                },
                (err: HttpErrorResponse) => {
                    this.snackbarService.openErrorSnackbar(err.error?.message);
                }
            );
    }
}
