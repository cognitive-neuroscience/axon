import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoaderComponent } from './services/loader/loader.component';
import { TranslateService } from '@ngx-translate/core';

describe('AppComponent', () => {
    beforeEach(async () => {
        const mockTranslateService = {
            setDefaultLang: jest.fn(),
        };

        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            declarations: [AppComponent, LoaderComponent],
            providers: [{ provide: TranslateService, useValue: mockTranslateService }],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });
});
