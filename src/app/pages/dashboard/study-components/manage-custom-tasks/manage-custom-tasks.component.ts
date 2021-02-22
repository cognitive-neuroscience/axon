import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { CustomTask } from 'src/app/models/TaskData';
import { ConfirmationService } from 'src/app/services/confirmation.service';
import { CustomTaskService } from 'src/app/services/custom-task.service';
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

  constructor(private customTaskService: CustomTaskService, private dialog: MatDialog, private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
    this.customTasks = this.customTaskService.customTasks;
    this.customTaskService.updateQuestionnaires();
  }

  openCreateCustomTaskModal() {
    this.dialog.open(CreateCustomTaskDialogComponent, { width: "70%" })
  }

  previewCustomTask(customTask: CustomTask) {
    this.dialog.open(CustomTaskPreviewDialogComponent, { width: "70%" })
  }

  openCustomTaskHelpModal() {
    this.dialog.open(CustomTaskHelpDialogComponent, { width: "70%" })    
  }

  deleteCustomTask(customTask: CustomTask) {
    this.confirmationService.openConfirmationDialog("Are you sure you want to delete " + customTask.name + "?")
  }

}
