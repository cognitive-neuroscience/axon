import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageService } from '../../services/sessionStorage.service';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import { Role } from 'src/app/models/enums';
import { UserStateService } from 'src/app/services/user-state-service';

export interface IErrorNavigationState {
    studyId?: number;
    taskIndex?: number;
    stackTrace?: string;
    userId?: string;
}

@Component({
    selector: 'app-error-page',
    templateUrl: './error-page.component.html',
    styleUrls: ['./error-page.component.scss', '../participant/final-page/final-page.component.scss'],
})
export class ErrorPageComponent implements OnInit {
    constructor(private _router: Router, private _userStateService: UserStateService) {
        const params = this._router.getCurrentNavigation()?.extras?.state as IErrorNavigationState;
        this.copyableErrString = `User ID: ${params?.userId}\nStudy ID: ${params?.studyId}\nTask Index: ${params?.taskIndex}\n\n${params?.stackTrace}`;
        this.copyableErrString = this.copyableErrString.trim();
    }

    copyableErrString: string = '';

    ngOnInit(): void {}

    navigateToMain() {
        if (this._userStateService.isCrowdsourcedUser) {
            if (this._userStateService.currentlyRunningStudyId) {
                this._router.navigateByUrl(
                    `crowdsource-participant?studyid=${this._userStateService.currentlyRunningStudyId}`
                );
            } else {
                this._router.navigate([`crowdsource-participant`]);
            }
        } else if (this._userStateService.userIsAdmin) {
            this._router.navigate([`admin-dashboard`]);
        } else if (this._userStateService.userIsParticipant) {
            this._router.navigate([`participant-dashboard`]);
        } else if (this._userStateService.userIsGuest || this._userStateService.userIsOrgMember) {
            this._router.navigate([`organization-member-dashboard`]);
        } else {
            this._router.navigate([`login`]);
        }
    }
}
