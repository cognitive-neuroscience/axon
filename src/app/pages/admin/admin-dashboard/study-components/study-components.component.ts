import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { TaskService } from "src/app/services/task.service";
import { UserService } from "src/app/services/user.service";

@Component({
    selector: "app-study-components",
    templateUrl: "./study-components.component.html",
    styleUrls: ["./study-components.component.scss"],
})
export class StudyComponentsComponent implements OnInit {
    constructor(private userService: UserService, private taskService: TaskService) {}

    ngOnInit(): void {
        if (!this.taskService.hasTasks) this.taskService.update();
    }

    get isAdmin(): Observable<boolean> {
        return this.userService.userIsAdmin;
    }
}
