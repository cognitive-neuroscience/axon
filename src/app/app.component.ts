import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styles: [],
})
export class AppComponent implements OnInit {
    ngOnInit() {
        this.translateService.setDefaultLang('en');

        // we need this initial call to get and set a CSRF token
        this.getAndSetCSRFToken();
    }

    constructor(private translateService: TranslateService, private authService: AuthService) {}

    private getAndSetCSRFToken() {
        this.authService.getCSRF().subscribe((res: HttpResponse<any>) => {
            // noop
        });
    }
}
