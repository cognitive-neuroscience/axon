import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SendResetPasswordComponent } from "./send-reset-password.component";

describe("ForgotPasswordComponent", () => {
    let component: SendResetPasswordComponent;
    let fixture: ComponentFixture<SendResetPasswordComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SendResetPasswordComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SendResetPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
