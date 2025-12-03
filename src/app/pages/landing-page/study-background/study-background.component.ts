import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RouteNames } from 'src/app/models/enums';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SessionStorageService } from 'src/app/services/sessionStorage.service';
import { StudyService } from 'src/app/services/study.service';
import { InfoDisplayViewerMetadata } from '../../shared/info-display-viewer/info-display-viewer.component';
import { TranslateService } from '@ngx-translate/core';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';

@Component({
    selector: 'app-study-background',
    templateUrl: './study-background.component.html',
    styleUrls: ['./study-background.component.scss'],
})
export class StudyBackgroundComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription[] = [];
    studyBackground: InfoDisplayViewerMetadata = null;

    constructor(
        private activatedRoute: ActivatedRoute,
        private studyService: StudyService,
        private router: Router,
        private loader: LoaderService,
        private sessionStorageService: SessionStorageService,
        private translateService: TranslateService,
        private snackbarService: SnackbarService
    ) {}

    ngOnInit(): void {
        this._getQueryParams();
    }

    // get studyId so that we can load up the relevant background information on the study
    private _getQueryParams() {
        this.loader.showLoader();
        const studyIdFromURL = this.activatedRoute.snapshot.paramMap.get('id');
        const parsedNum = parseInt(studyIdFromURL);

        if (isNaN(parsedNum)) {
            this.router.navigate([`not-found`]);
        }

        this.subscriptions.push(
            this.studyService
                .getStudyById(parsedNum)
                .subscribe(
                    (study) => {
                        if (study.status === 204 || study.body.deletedAt?.Valid) {
                            this.router.navigate([`${RouteNames.LANDINGPAGE_NOTFOUND}`]);
                            return;
                        } else if (!study.body.started) {
                            this.snackbarService.openErrorSnackbar([
                                'This study has not started yet. ',
                                "Cette étude n'a pas encore commencé.",
                            ]);
                            this.router.navigate([`${RouteNames.LANDINGPAGE_NOTALLOWED}`]);
                        } else {
                            // save the id in session storage so that the user can register for it later
                            this.sessionStorageService.setStudyIdToRegisterInSessionStorage(studyIdFromURL);
                            this.studyBackground =
                                Object.keys(study.body.config).length === 0 ? null : study.body.config;
                        }
                    },
                    (_err) => {
                        this.router.navigate([`${RouteNames.LANDINGPAGE_NOTFOUND}`]);
                    }
                )
                .add(() => {
                    this.loader.hideLoader();
                })
        );
    }

    navigate(routeTo: 'login' | 'register') {
        routeTo === 'login'
            ? this.router.navigate([`${RouteNames.LANDINGPAGE_LOGIN_BASEROUTE}`])
            : this.router.navigate([`${RouteNames.LANDINGPAGE_REGISTER_BASEROUTE}`]);
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => {
            sub.unsubscribe();
        });
    }
}
