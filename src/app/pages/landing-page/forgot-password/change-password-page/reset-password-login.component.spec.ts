import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/modules/material/material.module';
import { ResetPasswordLoginComponent } from './reset-password-login.component';

describe('ResetPasswordLoginComponent', () => {
    let component: ResetPasswordLoginComponent;
    let fixture: ComponentFixture<ResetPasswordLoginComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ResetPasswordLoginComponent],
            imports: [
                MaterialModule,
                ReactiveFormsModule,
                RouterTestingModule,
                HttpClientTestingModule,
                NoopAnimationsModule,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ResetPasswordLoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
