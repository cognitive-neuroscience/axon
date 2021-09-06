import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { IOnComplete, Playable } from "../task-playables/playable";
import { Navigation } from "../shared/navigation-buttons/navigation-buttons.component";
import { TaskManagerService } from "src/app/services/task-manager.service";
import { Router } from "@angular/router";
import { UserService } from "src/app/services/user.service";

export interface InfoDisplayMetadata {
    shouldIncrementIndex: boolean;
    title?: string;
    subtitle?: string;
    sections?: InfoDisplaySection[];
    buttons?: InfoDisplayButtonConfig[];
}

export interface InfoDisplaySection {
    header: string;
    textContent: string;
}

export interface InfoDisplayButtonConfig {
    displayContinueButton: boolean;
    displayHomeButton: boolean;
}

export interface InfoDisplayNavigationConfig {
    metadata: InfoDisplayMetadata;
    mode: "test" | "actual";
}

@Component({
    selector: "app-info-display",
    templateUrl: "./info-display.component.html",
    styleUrls: ["./info-display.component.scss"],
})
export class InfoDisplayComponent implements OnInit, OnDestroy {
    infoDisplayMetadata: InfoDisplayMetadata;

    constructor(private taskManager: TaskManagerService, private router: Router, private userService: UserService) {
        const state = this.router.getCurrentNavigation().extras.state as InfoDisplayMetadata;

        if (state) {
            this.infoDisplayMetadata = state;

            if (!this.userService.isCrowdsourcedUser) {
                this.taskManager.setTaskAsComplete().subscribe((res) => {});
            }
        } else {
            this.taskManager.handleErr();
        }
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {}
}
