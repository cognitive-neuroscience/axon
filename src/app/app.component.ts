import { Component, HostListener } from "@angular/core";
import { Role } from "./models/enums";
import { AuthService } from "./services/auth.service";
import { TaskManagerService } from "./services/task-manager.service";
@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styles: [],
})
export class AppComponent {
    @HostListener("window:popstate", ["$event"])
    onPopState(event) {
        const role = this.authService.getDecodedToken()?.Role;
        if (role && role === Role.PARTICIPANT) {
            this.taskManager.handleErr();
            return;
        }
    }

    constructor(private authService: AuthService, private taskManager: TaskManagerService) {}
}
