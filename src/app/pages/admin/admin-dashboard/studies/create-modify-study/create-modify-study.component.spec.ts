import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/modules/material/material.module';

import { CreateModifyStudyComponent } from './create-modify-study.component';

describe('CreateStudyComponent', () => {
    let component: CreateModifyStudyComponent;
    let fixture: ComponentFixture<CreateModifyStudyComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreateModifyStudyComponent],
            imports: [
                MaterialModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientTestingModule,
                RouterTestingModule,
                NoopAnimationsModule,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateModifyStudyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
