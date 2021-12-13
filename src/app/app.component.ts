import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styles: [],
})
export class AppComponent implements OnInit {
    ngOnInit() {
        this.translateService.setDefaultLang('en');
    }

    constructor(private translateService: TranslateService) {}
}
