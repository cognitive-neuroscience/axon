import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { CustomTask } from 'src/app/models/TaskData';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { CustomTaskService } from 'src/app/services/custom-task.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { CreateCustomTaskDialogComponent } from './create-custom-task-dialog/create-custom-task-dialog.component';
import { CustomTaskHelpDialogComponent } from './custom-task-help-dialog/custom-task-help-dialog.component';
import { CustomTaskPreviewDialogComponent } from './custom-task-preview-dialog/custom-task-preview-dialog.component';

@Component({
  selector: 'app-manage-custom-tasks',
  templateUrl: './manage-custom-tasks.component.html',
  styleUrls: ['./manage-custom-tasks.component.scss']
})
export class ManageCustomTasksComponent implements OnInit {

  displayedCustomTaskColumns = [ "name", "description", "url", "actions" ];

  customTasks: Observable<CustomTask[]>;

  constructor(
    private customTaskService: CustomTaskService,
    private dialog: MatDialog,
    private confirmationService: ConfirmationService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.customTasks = this.customTaskService.customTasks;
    this.customTaskService.updateQuestionnaires();
  }

  openCreateCustomTaskModal() {
    this.dialog.open(CreateCustomTaskDialogComponent, { width: "30%" })
      .afterClosed().subscribe((customTask: CustomTask) => {
        if(customTask) this._createCustomTask(customTask)
      })
  }

  private _createCustomTask(customTask: CustomTask) {
    this.customTaskService.createQuestionnaire(customTask).subscribe((data) => {
      this.customTaskService.updateQuestionnaires();
      this.snackbarService.openSuccessSnackbar("Successfully created new custom task");
    }, (err: HttpErrorResponse) => {
      let errMsg = err.error?.message;
      if(!errMsg) {
        errMsg = "Could not create custom task"
      }
      this.snackbarService.openErrorSnackbar(err.error?.message);
    })
  }

  previewCustomTask(customTask: CustomTask) {
    this.dialog.open(CustomTaskPreviewDialogComponent, {
      width: "80%",
      height: "90%",
      data: customTask
    })
  }

  openCustomTaskHelpModal() {
    this.dialog.open(CustomTaskHelpDialogComponent, { width: "70%" });
  }

  deleteCustomTask(customTask: CustomTask) {
    this.confirmationService.openConfirmationDialog("Are you sure you want to delete the task: " + customTask.name + "?").pipe(
      mergeMap(ok => {
        if(ok) {
          return this.customTaskService.deleteQuestionnaireByID(customTask.customTaskID);
        } else {
          return of(false)
        }
      })
    ).subscribe(data => {
      if(data) {
        this.customTaskService.updateQuestionnaires();
        this.snackbarService.openSuccessSnackbar("Successfully deleted " + customTask.name);
      }
    }, err => {
      console.error(err)
      this.snackbarService.openErrorSnackbar("There was an error deleting the task")
    })
  }

}
