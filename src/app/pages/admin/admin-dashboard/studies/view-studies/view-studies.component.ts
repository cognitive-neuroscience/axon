import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Router } from '@angular/router';
import { Subscription, of, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { User } from 'src/app/models/User';
import { FileService } from 'src/app/services/file.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { LocalStorageService } from 'src/app/services/localStorageService.service';
import { StudyUserService } from 'src/app/services/study-user.service';
import { UserStateService } from 'src/app/services/user-state-service';
import { environment } from '../../../../../../environments/environment';
import { Study } from '../../../../../models/Study';
import { ConfirmationService } from '../../../../../services/confirmation/confirmation.service';
import { SnackbarService } from '../../../../../services/snackbar/snackbar.service';
import { StudyService } from '../../../../../services/study.service';
import { CreateModifyStudyComponent } from '../create-modify-study/create-modify-study.component';
import { TaskManagerService } from 'src/app/services/task-manager.service';

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
        private fileService: FileService,
        private localStorageService: LocalStorageService,
        private taskManagerService: TaskManagerService
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

    get favoritedStudies(): Study[] {
        return this.studyService.studiesValue.filter((study) => this.isFavorite(study.id));
    }

    get isAdmin(): boolean {
        return this.userStateService.userIsAdmin;
    }

    get isGuest(): boolean {
        return this.userStateService.userIsGuest;
    }

    isFavorite(studyId: number): boolean {
        const favoritedIds = this.localStorageService.getFavoritesInLocalStorage();
        return favoritedIds.includes(studyId);
    }

    canEditStudy(owner: User): boolean {
        return this.isAdmin || owner.id === parseInt(this.userStateService.currentlyLoggedInUserId);
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
            this.isAdmin ? `admin-dashboard/studies/${study.id}` : `organization-member-dashboard/studies/${study.id}`,
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
                        ? 'This will allow participants to start your study. This will also take a snapshot of the study which will ensure that the tasks in your study will always remain the same. If you want to update the snapshot with the latest task versions, you can toggle the study on and off again. Once you activate the study, you will not be able to edit it in the future'
                        : ''
                }`
            )
            .pipe(
                mergeMap((ok) => {
                    if (ok) {
                        return active ? this.studyService.takeSnapshot(study.id) : of(ok);
                    } else {
                        return throwError('CANCELLED');
                    }
                }),
                mergeMap(() => {
                    return this.studyService.updateStudy(study, false);
                }),
                catchError((err) => {
                    this.snackbarService.openErrorSnackbar(
                        'There was an error toggling the study status. Please contact the developer'
                    );
                    return of(false);
                })
            )
            .subscribe((ok) => {
                // either httpresponse or null, so we can check truthiness
                if (ok) {
                    this.snackbarService.openSuccessSnackbar('Successfully updated study');
                    this.studyService.getOrUpdateStudies(true).subscribe(() => {});
                } else {
                    study.started = originalValue;
                }
            });
        this.subscriptions.push(sub);
    }

    onSelectFavorite($event: PointerEvent, studyId: number) {
        $event.stopPropagation();
        const favorites = this.localStorageService.getFavoritesInLocalStorage();
        if (this.isFavorite(studyId)) {
            this.localStorageService.setFavoritesInLocalStorage(favorites.filter((x) => x !== studyId));
        } else {
            this.localStorageService.setFavoritesInLocalStorage([studyId, ...favorites]);
        }
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

    handlePreviewStudy(studyId: number) {
        this.taskManagerService.initStudy(studyId, true);
    }

    showCopiedMessage(copyLinkFor: string) {
        this.snackbarService.openSuccessSnackbar(`Copied link for ${copyLinkFor}`);
    }

    ngOnDestroy() {
        this.subscriptions.forEach((x) => x.unsubscribe());
    }
}
