import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/modules/material/material.module';
import { EmailService } from 'src/app/services/email.service';
import { SendResetPasswordComponent } from './send-reset-password.component';

describe('ForgotPasswordComponent', () => {
    let component: SendResetPasswordComponent;
    let fixture: ComponentFixture<SendResetPasswordComponent>;

    const mockEmailService = {
        sendForgotPasswordEmail: jest.fn(),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SendResetPasswordComponent],
            imports: [MaterialModule, ReactiveFormsModule, FormsModule, RouterTestingModule, NoopAnimationsModule],
            providers: [{ provide: EmailService, useValue: mockEmailService }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SendResetPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
