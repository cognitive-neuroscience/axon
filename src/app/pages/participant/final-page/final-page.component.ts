import { Component, OnInit } from "@angular/core";
import { SnackbarService } from "../../../services/snackbar.service";
import { UserService } from "../../../services/user.service";
import { TaskManagerService } from "../../../services/task-manager.service";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionStorageService } from "../../../services/sessionStorage.service";

@Component({
    selector: "app-final-page",
    templateUrl: "./final-page.component.html",
    styleUrls: ["./final-page.component.scss"],
})
export class FinalPageComponent implements OnInit {
    constructor(
        private _snackbar: SnackbarService,
        private _router: Router,
        private _sessionStorage: SessionStorageService
    ) {
        const params = this._router.getCurrentNavigation().extras.state as { completionCode: string };
        this.completionCode = params.completionCode;
    }

    shouldShowCopiedMessage: boolean = false;
    completionCode: string = "";

    ngOnInit(): void {}

    handleErr() {
        this._sessionStorage.clearSessionStorage();
        this._snackbar.openErrorSnackbar("Tasks not complete");
        this._router.navigate(["crowdsource-participant"]);
    }

    showCopiedMessage() {
        this._snackbar.openSuccessSnackbar("Copied to clipboard!");
    }
}
