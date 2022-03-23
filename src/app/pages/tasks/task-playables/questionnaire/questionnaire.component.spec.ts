import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateService } from '@ngx-translate/core';
import { MaterialModule } from 'src/app/modules/material/material.module';
import { QuestionnaireComponent } from './questionnaire.component';

@Component({
    selector: 'app-slider',
    template: '<p>mock slider</p>',
})
export class MockAppSlider {
    @Input() marks: any;
}
describe('QuestionnaireReaderComponent', () => {
    let component: QuestionnaireComponent;
    let fixture: ComponentFixture<QuestionnaireComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [QuestionnaireComponent, MockAppSlider],
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
        fixture = TestBed.createComponent(QuestionnaireComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
