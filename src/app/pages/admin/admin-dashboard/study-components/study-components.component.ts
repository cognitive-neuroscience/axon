import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Observable } from 'rxjs';
import { SessionStorageService } from 'src/app/services/sessionStorage.service';
import { TaskService } from 'src/app/services/task.service';
import { UserStateService } from 'src/app/services/user-state-service';

@Component({
    selector: 'app-study-components',
    templateUrl: './study-components.component.html',
    styleUrls: ['./study-components.component.scss'],
})
export class StudyComponentsComponent implements OnInit {
    private readonly rememberedTab = 'rememberedTabIndex';
    public selectedTabIndex = 0;

    constructor(private sSS: SessionStorageService, private taskService: TaskService) {}

    ngOnInit(): void {
        const retrievedTab = this.sSS.getKVPInSessionStorage(this.rememberedTab);
        if (retrievedTab !== null) {
            this.selectedTabIndex = parseInt(retrievedTab);
        }
        this.taskService.getOrUpdateTasks().subscribe((a) => {});
    }

    saveTabPref(matTabChange: MatTabChangeEvent) {
        this.sSS.setKVPInSessionStorage(this.rememberedTab, matTabChange.index.toString());
    }
}
