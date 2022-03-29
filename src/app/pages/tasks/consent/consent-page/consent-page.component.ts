import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { AdminRouteNames, ParticipantRouteNames } from 'src/app/models/enums';
import { ConsentNavigationConfig } from 'src/app/pages/shared/consent-component/consent-reader.component';
import { ConfirmationService } from 'src/app/services/confirmation/confirmation.service';
import { SessionStorageService } from 'src/app/services/sessionStorage.service';
import { TaskManagerService } from 'src/app/services/task-manager.service';

@Component({
    selector: 'app-consent-page',
    templateUrl: './consent-page.component.html',
    styleUrls: ['./consent-page.component.scss'],
})
export class ConsentPageComponent implements OnInit {
    data: ConsentNavigationConfig;
    constructor(
        private confirmationService: ConfirmationService,
        private taskManager: TaskManagerService,
        private router: Router,
        private sessionStorageService: SessionStorageService,
        private location: Location
    ) {
        const params = this.router.getCurrentNavigation()?.extras?.state as ConsentNavigationConfig;
        if (params) {
            this.data = params;
        } else {
            const currentlyRunningStudyId = this.sessionStorageService.getCurrentlyRunningStudyIdFromSessionStorage();
            currentlyRunningStudyId !== null
                ? this.taskManager.initStudy(parseInt(currentlyRunningStudyId))
                : this.location.back();
        }
    }

    ngOnInit(): void {}

    onEmitConsent(consent: boolean) {
        if (this.data.mode === 'actual') {
            if (consent) {
                this.confirmationService
                    .openConfirmationDialog('Are you sure you want to accept?')
                    .pipe(take(1))
                    .subscribe((ok) => {
                        if (ok) {
                            this.taskManager.runStudy();
                        }
                    });
            } else {
                this.confirmationService
                    .openConfirmationDialog(
                        'Are you sure you want to decline?',
                        'You will not be allowed to register again'
                    )
                    .pipe(take(1))
                    .subscribe((ok) => {
                        if (ok) {
                            this.router.navigate([
                                `${ParticipantRouteNames.CROWDSOURCEPARTICIPANT_REGISTER_BASEROUTE}`,
                            ]);
                        }
                    });
            }
        } else {
            this.router.navigate([`${AdminRouteNames.DASHBOARD_BASEROUTE}/${AdminRouteNames.COMPONENTS_SUBROUTE}`]);
        }
    }
}
