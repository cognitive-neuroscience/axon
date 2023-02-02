import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';
import { AdminRouteNames, ParticipantRouteNames, SupportedLangs } from 'src/app/models/enums';
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
        private location: Location,
        private translateService: TranslateService
    ) {
        const params = this.router.getCurrentNavigation()?.extras?.state as ConsentNavigationConfig;
        if (params) {
            this.data = params;
        } else {
            const currentlyRunningStudyId = this.sessionStorageService.getCurrentlyRunningStudyIdInSessionStorage();
            currentlyRunningStudyId !== null
                ? this.taskManager.initStudy(parseInt(currentlyRunningStudyId))
                : this.location.back();
        }
    }

    ngOnInit(): void {}

    onEmitConsent(consentData: Record<string, string>) {
        const message =
            this.translateService.currentLang === SupportedLangs.EN
                ? 'Are you sure you want to accept?'
                : 'Êtes-vous certain(e) de vouloir accepter?';

        if (this.data.mode === 'actual') {
            if (consentData) {
                this.confirmationService
                    .openConfirmationDialog(message)
                    .pipe(take(1))
                    .subscribe((ok) => {
                        if (ok) {
                            this.taskManager.runStudy();
                        }
                    });
            } else {
                const message =
                    this.translateService.currentLang === SupportedLangs.EN
                        ? 'Are you sure you want to decline?'
                        : 'Êtes-vous certain(e) de vouloir refuser?';

                this.confirmationService
                    .openConfirmationDialog(message)
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
