import { Component, OnDestroy, OnInit } from '@angular/core';
import { Study } from '../../../../../models/Study';
import { StudyService } from '../../../../../services/study.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationService } from '../../../../../services/confirmation/confirmation.service';
import { SnackbarService } from '../../../../../services/snackbar/snackbar.service';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { AdminRouteNames, Role } from 'src/app/models/enums';
import { map, mergeMap, takeUntil } from 'rxjs/operators';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CreateModifyStudyComponent } from '../create-modify-study/create-modify-study.component';
import { StudyUserService } from 'src/app/services/study-user.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { FileService } from 'src/app/services/file.service';
import { UserStateService } from 'src/app/services/user-state-service';
import { User } from 'src/app/models/User';

@Component({
    selector: 'app-view-studies',
    templateUrl: './view-studies.component.html',
    styleUrls: ['./view-studies.component.scss'],
})
export class ViewStudiesComponent implements OnInit, OnDestroy {
    showHiddenStudies: boolean = false;
    CROWDSOURCE_LINK: string = environment.production
        ? 'https://psharplab.campus.mcgill.ca/#/crowdsource-participant?studyid='
        : 'https://localhost:4200/#/crowdsource-participant?studyid=';

    ACCOUNT_LINK: string = environment.production
        ? 'https://psharplab.campus.mcgill.ca/#/studies/'
        : 'https://localhost:4200/#/studies/';

    subscriptions: Subscription[] = [];

    constructor(
        private studyService: StudyService,
        private dialog: MatDialog,
        private confirmationService: ConfirmationService,
        private snackbarService: SnackbarService,
        private userStateService: UserStateService,
        private router: Router,
        private studyUserService: StudyUserService,
        private loaderService: LoaderService,
        private fileService: FileService
    ) {}

    get studies(): Study[] {
        return this.studyService.studiesValue.filter((study) => {
            if (this.userStateService.userIsAdmin || this.userStateService.userIsGuest) {
                return true;
            } else {
                return study.owner.id === this.userStateService.userValue.id;
            }
        });
    }

    get studiesHiddenByDefault(): Study[] {
        return this.studyService.studiesValue.filter((study) => {
            if (this.userStateService.userIsAdmin || this.userStateService.userIsGuest) {
                return false;
            } else {
                return study.owner.id !== this.userStateService.userValue.id;
            }
        });
    }

    get isAdmin(): boolean {
        return this.userStateService.userIsAdmin;
    }

    canEditStudy(owner: User): boolean {
        return this.isAdmin || owner.id === parseInt(this.userStateService.currentlyLoggedInUserId);
    }

    get isGuest(): boolean {
        return this.userStateService.userIsGuest;
    }

    ngOnInit(): void {
        const studiesSub = this.studyService.getOrUpdateStudies().subscribe((a) => {});
        this.subscriptions.push(studiesSub);
    }

    navigateToCreateStudy() {
        this.router.navigate([
            this.isAdmin ? `admin-dashboard/studies/create` : `organization-member-dashboard/studies/create`,
        ]);
    }

    handleEdit(study: Study) {
        this.dialog.open(CreateModifyStudyComponent, { width: '90%', height: '80%', data: study });
    }

    handleViewData(study: Study) {
        this.router.navigate([
            this.isAdmin ? `admin-dashboard/studies${study.id}` : `organization-member-dashboard/studies/${study.id}`,
        ]);
    }

    handleDelete(study: Study) {
        const sub = this.confirmationService
            .openConfirmationDialog(`Are you sure you want to archive this study?`)
            .pipe(
                mergeMap((ok) => {
                    this.loaderService.showLoader();
                    return ok ? this.studyService.archiveStudy(study.id) : of(null);
                })
            )
            .subscribe(
                (wasDeleted) => {
                    if (wasDeleted) {
                        this.snackbarService.openSuccessSnackbar('Successfully archived study');
                    }
                },
                (err) => {
                    this.snackbarService.openErrorSnackbar('There was a problem deleting the study');
                }
            )
            .add(() => {
                this.loaderService.hideLoader();
            });
        this.subscriptions.push(sub);
    }

    toggleStudyActiveStatus(study: Study, event: MatSlideToggleChange) {
        const active = event.checked;
        const originalValue = !study.started;

        const sub = this.confirmationService
            .openConfirmationDialog(
                `Are you sure you want to ${active ? 'activate' : 'deactivate'} the study?`,
                `${
                    active && study.canEdit
                        ? 'This will allow participants to start your study. Once you activate the study, you will not be able to edit it in the future'
                        : ''
                }`
            )
            .pipe(
                mergeMap((ok) => {
                    if (ok) {
                        return this.studyService.updateStudy(study, false);
                    } else {
                        return of(false);
                    }
                })
            )
            .subscribe((ok) => {
                // either httpresponse or null, so we can check truthiness
                if (ok) {
                    this.snackbarService.openSuccessSnackbar('Successfully updated study');
                } else {
                    study.started = originalValue;
                }
            });
        this.subscriptions.push(sub);
    }

    downloadStudyUsers() {
        this.loaderService.showLoader();
        this.studyUserService
            .getStudyUserSummary()
            .subscribe((res) => {
                this.fileService.exportAsJSONFile(res, 'userStudiesSummary');
            })
            .add(() => this.loaderService.hideLoader());
    }

    showCopiedMessage(copyLinkFor: string) {
        this.snackbarService.openSuccessSnackbar(`Copied link for ${copyLinkFor}`);
    }

    ngOnDestroy() {
        this.subscriptions.forEach((x) => x.unsubscribe());
    }
}
