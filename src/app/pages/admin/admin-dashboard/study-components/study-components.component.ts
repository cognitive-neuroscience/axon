import { Component, OnInit } from "@angular/core";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { Observable } from "rxjs";
import { SessionStorageService } from "src/app/services/sessionStorage.service";
import { TaskService } from "src/app/services/task.service";
import { UserService } from "src/app/services/user.service";

@Component({
    selector: "app-study-components",
    templateUrl: "./study-components.component.html",
    styleUrls: ["./study-components.component.scss"],
})
export class StudyComponentsComponent implements OnInit {
    private readonly rememberedTab = "rememberedTabIndex";
    public selectedTabIndex = 0;

    constructor(
        private userService: UserService,
        private taskService: TaskService,
        private sSS: SessionStorageService
    ) {}

    ngOnInit(): void {
        const retrievedTab = this.sSS.getValueByKeyFromSessionStorage(this.rememberedTab);
        if (retrievedTab !== null) {
            this.selectedTabIndex = parseInt(retrievedTab);
        }
        if (!this.taskService.hasTasks) this.taskService.update();
    }

    get isAdmin(): Observable<boolean> {
        return this.userService.userIsAdmin;
    }

    saveTabPref(matTabChange: MatTabChangeEvent) {
        this.sSS.setKVPInSessionStorage(this.rememberedTab, matTabChange.index.toString());
    }
}
