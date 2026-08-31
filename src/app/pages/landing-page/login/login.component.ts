import { Component, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { of, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { Role, SupportedLangs } from 'src/app/models/enums';
import { isOrganizationSupportedLang } from 'src/app/models/Organization';
import { catchError, finalize, mergeMap, tap } from 'rxjs/operators';
import { ClearanceService } from 'src/app/services/clearance.service';
import { HttpStatusCode } from '@angular/common/http';
import { HttpStatus } from 'src/app/models/Auth';
import { UserStateService } from 'src/app/services/user-state-service';
import { LocalStorageService } from 'src/app/services/localStorageService.service';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
    passwordIsVisible = false;
    subscriptions: Subscription[] = [];

    loginForm = this.fb.group({
        email: ['', Validators.compose([Validators.email, Validators.required])],
        password: ['', Validators.required],
        confirmPassword: [''],
    });

    navigateToRegister() {
        this.router.navigate(['/register']);
    }

    navigateToForgotPassword() {
        this.router.navigate(['/send-reset-email']);
    }

    togglePasswordVisibility() {
        this.passwordIsVisible = !this.passwordIsVisible;
    }

    onSubmit() {
        this.clearanceService.clearServices();
        const formControls = this.loginForm.controls;

        this.loginForm.markAllAsTouched();

        const hasErrors =
            formControls.email.errors || formControls.password.errors || formControls.confirmPassword.errors;

        if (hasErrors) return;

        const email = formControls.email.value;
        const password = formControls.password.value;

        this.loaderService.showLoader();
        this.authService
            .login(email, password)
            .pipe(
                mergeMap(() => this.userStateService.getOrUpdateUserState()),
                mergeMap((user) => {
                    if (!user) {
                        throw { status: HttpStatusCode.InternalServerError, message: 'There was an error' };
                    }

                    const preferredLang = this.localStorageService.getPreferredLangInLocalStorage();
                    if (
                        !preferredLang ||
                        !isOrganizationSupportedLang(preferredLang, user.organization) ||
                        preferredLang === user.lang
                    ) {
                        this.translateService.use(user.lang || SupportedLangs.EN);
                        return of(user);
                    }

                    return this.userService
                        .updateUser({ ...user, lang: preferredLang })
                        .pipe(tap(() => this.translateService.use(preferredLang)));
                }),
                catchError((err) => {
                    throw err;
                }),
                finalize(() => {
                    this.loaderService.hideLoader();
                })
            )
            .subscribe(
                (user) => {
                    let message = '';
                    switch (user.lang) {
                        case SupportedLangs.FR:
                            message = 'Connexion réussie!';
                            break;
                        case SupportedLangs.NL:
                            message = 'Successfully logged in!';
                            break;
                        case SupportedLangs.EN:
                        default:
                            message = 'Successfully logged in!';
                            break;
                    }
                    this.snackbarService.openSuccessSnackbar(message);
                    this.handleNavigate(user.role);
                },
                (err: HttpStatus) => {
                    switch (err.status) {
                        case HttpStatusCode.NotFound:
                            this.snackbarService.openErrorSnackbar([
                                'This email is not registered',
                                "Ce courriel n'est pas enregistré",
                            ]);
                            break;
                        case HttpStatusCode.BadRequest:
                            this.snackbarService.openErrorSnackbar([
                                'Username or password is either empty or in an unrecognized format',
                            ]);
                            break;
                        case HttpStatusCode.Unauthorized:
                            this.snackbarService.openErrorSnackbar('Username or password is incorrect');
                            break;
                        case HttpStatusCode.Forbidden:
                            this.snackbarService.openErrorSnackbar(
                                'Password must be changed before logging in. Please check your email for a temporary password, or click "Forgot your password?" to receive another one',
                                undefined,
                                20000
                            );
                            break;
                        default:
                            this.snackbarService.openErrorSnackbar(err.message || 'There was an error');
                            break;
                    }
                }
            );
    }

    constructor(
        private authService: AuthService,
        private router: Router,
        private snackbarService: SnackbarService,
        private fb: UntypedFormBuilder,
        private loaderService: LoaderService,
        private clearanceService: ClearanceService,
        private userStateService: UserStateService,
        private localStorageService: LocalStorageService,
        private userService: UserService,
        private translateService: TranslateService
    ) {}

    private handleNavigate(role: Role) {
        switch (role) {
            case Role.ADMIN:
                this.router.navigate([`admin-dashboard`]);
                break;
            case Role.PARTICIPANT:
                this.router.navigate([`participant-dashboard`]);
                break;
            case Role.GUEST:
            case Role.ORGANIZATION_MEMBER:
                this.router.navigate([`organization-member-dashboard`]);
                break;
            default:
                this.snackbarService.openErrorSnackbar('There was an error logging you in');
                break;
        }
    }

    ngOnDestroy() {
        this.loaderService.hideLoader();
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}
