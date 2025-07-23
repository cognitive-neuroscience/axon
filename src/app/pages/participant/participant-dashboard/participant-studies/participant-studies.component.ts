import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { StudyUser } from 'src/app/models/StudyUser';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { StudyUserService } from 'src/app/services/study-user.service';
import { StudyService } from 'src/app/services/study.service';
import { UserStateService } from 'src/app/services/user-state-service';
declare function setFullScreen(): any;

@Component({
    selector: 'app-participant-studies',
    templateUrl: './participant-studies.component.html',
    styleUrls: ['./participant-studies.component.scss'],
})
export class ParticipantStudiesComponent implements OnInit, OnDestroy {
    subscriptions: Subscription[] = [];
    studyUsers: StudyUser[] = [];

    constructor(
        private studyUserService: StudyUserService,
        private loaderService: LoaderService,
        private userStateService: UserStateService,
        private studyService: StudyService
    ) {}

    ngOnInit(): void {
        this.loaderService.showLoader();
        const obs = this.studyUserService.studyUsersObservable
            .pipe(
                mergeMap((studyUsers: StudyUser[] | null) =>
                    forkJoin((studyUsers || []).map((studyUser) => this.studyService.getStudyById(studyUser.studyId)))
                ),
                map((studyUserResponses) => studyUserResponses.map((x) => x.body))
            )
            .subscribe(
                (studies) => {
                    // we need this initially in order to sort the study users. StudyUsers do not have
                    // nested Study objects, so we have to query the studies separately
                    this.studyUsers = this.studyUserService.studyUsers.sort((a, b) => {
                        const studyA = studies.find((study) => study.id === a.studyId);
                        const studyB = studies.find((study) => study);

                        const aIsDone = a.currentTaskIndex === (studyA.studyTasks || []).length;
                        const bIsDone = b.currentTaskIndex === (studyB.studyTasks || []).length;

                        const dateA = Date.parse(a.registerDate);
                        const dateB = Date.parse(b.registerDate);

                        if (aIsDone && bIsDone) {
                            return dateB - dateA;
                        } else if (aIsDone && !bIsDone) {
                            return 1;
                        } else if (!aIsDone && bIsDone) {
                            return -1;
                        } else {
                            return dateB - dateA;
                        }
                    });
                    this.loaderService.hideLoader();
                },
                (err) => {
                    this.loaderService.hideLoader();
                }
            )
            .add(() => {
                this.loaderService.hideLoader();
            });
        this.subscriptions.push(obs);
    }

    get userId(): number {
        return this.userStateService.userValue?.id || null;
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}
