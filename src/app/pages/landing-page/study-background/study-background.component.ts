import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { RouteNames } from 'src/app/models/enums';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { StudyService } from 'src/app/services/study.service';
import { InfoDisplayViewerMetadata } from '../../shared/info-display-viewer/info-display-viewer.component';

@Component({
    selector: 'app-study-background',
    templateUrl: './study-background.component.html',
    styleUrls: ['./study-background.component.scss'],
})
export class StudyBackgroundComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription[];
    studyBackground: InfoDisplayViewerMetadata = null;

    constructor(
        private route: ActivatedRoute,
        private studyService: StudyService,
        private router: Router,
        private loader: LoaderService
    ) {}

    ngOnInit(): void {
        this._getQueryParams();
    }

    // get studyId so that we can load up the relevant background information on the study
    private _getQueryParams() {
        this.loader.showLoader();
        this.subscriptions.push(
            this.route.queryParams.subscribe((params) => {
                const studyIdFromURL = params['studyid'] as number;
                if (studyIdFromURL) {
                    this.subscriptions.push(
                        this.studyService
                            .getStudyById(studyIdFromURL)
                            .pipe(take(1))
                            .subscribe(
                                (task) => {
                                    this.loader.hideLoader();
                                    this.studyBackground = task.config;
                                },
                                (err) => {
                                    this.loader.hideLoader();
                                }
                            )
                    );
                }
            })
        );
    }

    navigate(routeTo: 'login' | 'register') {
        if (routeTo === 'login') {
            this.router.navigate([`${RouteNames.LANDINGPAGE_LOGIN_BASEROUTE}`]);
        } else {
            this.router.navigate([`${RouteNames.LANDINGPAGE_REGISTER_BASEROUTE}`]);
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => {
            sub.unsubscribe();
        });
    }
}
