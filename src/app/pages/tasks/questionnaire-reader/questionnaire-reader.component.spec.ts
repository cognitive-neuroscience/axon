import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateService } from '@ngx-translate/core';
import { MaterialModule } from 'src/app/modules/material/material.module';
import { QuestionnaireReaderComponent } from './questionnaire-reader.component';

@Component({
    selector: 'app-slider',
    template: '<p>mock slider</p>',
})
export class MockAppSlider {
    @Input() marks: any;
}
describe('QuestionnaireReaderComponent', () => {
    let component: QuestionnaireReaderComponent;
    let fixture: ComponentFixture<QuestionnaireReaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [QuestionnaireReaderComponent, MockAppSlider],
            imports: [
                MaterialModule,
                FormsModule,
                NoopAnimationsModule,
                ReactiveFormsModule,
                HttpClientTestingModule,
                RouterTestingModule,
            ],
            providers: [{ provide: TranslateService, useValue: { currentLang: 'en' } }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionnaireReaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
