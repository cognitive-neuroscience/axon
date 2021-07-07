import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { Task } from "src/app/models/Task";
import { ConfirmationService } from "src/app/services/confirmation/confirmation.service";
import { TaskManagerService } from "src/app/services/task-manager.service";
import { UserService } from "src/app/services/user.service";
import { ConfirmDoneDialogComponent } from "./confirm-done-dialog/confirm-done-dialog.component";
import { IntroDialogComponent } from "./intro-dialog/intro-dialog.component";

export class EmbeddedPageNavigationConfig {
    config: {
        externalURL: string;
        task: Task;
    };
    mode: "test" | "actual";
}

@Component({
    selector: "app-embedded-page",
    templateUrl: "./embedded-page.component.html",
    styleUrls: ["./embedded-page.component.scss"],
})
export class EmbeddedPageComponent implements OnInit, OnDestroy {
    @ViewChild("iframe") iframe: ElementRef;

    // Link sent in as an admin to preview the embedded survey
    embeddedSurveyLink: string = "";

    embeddedPageNavigation: EmbeddedPageNavigationConfig;

    subscriptions: Subscription[] = [];

    constructor(
        private confirmationService: ConfirmationService,
        private taskManager: TaskManagerService,
        private userService: UserService,
        private _router: Router,
        private matDialog: MatDialog
    ) {
        const embeddedPageNavigation = this._router.getCurrentNavigation()?.extras
            .state as EmbeddedPageNavigationConfig;
        if (embeddedPageNavigation) {
            this.embeddedPageNavigation = embeddedPageNavigation;
            const userId = embeddedPageNavigation.mode === "test" ? "PLACEHOLDERUSERID" : this.userService.user.id;
            const studyId = embeddedPageNavigation.mode === "test" ? 0 : this.taskManager.study.id;

            this.embeddedSurveyLink = this.parseURL(
                embeddedPageNavigation.config.externalURL,
                userId.toString(),
                studyId
            );
        }
    }

    ngOnInit(): void {
        this.matDialog.open(IntroDialogComponent, { width: "70%", data: this.embeddedPageNavigation?.config.task });
    }

    private parseURL(url: string, subjectID: string, studyId: number): string {
        // we expect a url like https://run.pavlovia.org/Sharp_lab/corsi-test/html?subject=[s_value]&studyid=[e_value]
        return `${url}?subjectid=${subjectID}&studyid=${studyId}`;
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    proceed() {
        const dialogRef = this.matDialog.open(ConfirmDoneDialogComponent, { width: "70%" });
        this.subscriptions.push(
            dialogRef.afterClosed().subscribe((ok: boolean) => {
                if (ok) {
                    this.taskManager.next();
                } else {
                    this.refocusIframe();
                }
            })
        );
    }

    // iframe loses focus if the user clicks outside of it, and clicking back in it does not help
    refocusIframe() {
        if (this.iframe && this.iframe.nativeElement) this.iframe.nativeElement.focus();
    }
}
