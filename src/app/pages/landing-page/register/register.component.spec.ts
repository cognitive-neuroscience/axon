import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/modules/material/material.module';
import { ClearanceService } from 'src/app/services/clearance.service';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UserService } from 'src/app/services/user.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;

    beforeEach(async () => {
        const mockSessionStorageService = {
            clearServices: jest.fn(),
        };

        const mockUserService = {
            registerUser: jest.fn(),
        };

        const mockLoaderService = {
            showLoader: jest.fn(),
            hideLoader: jest.fn(),
        };

        const mockSnackbarService = {
            openSuccessSnackbar: jest.fn(),
            openErrorSnackbar: jest.fn(),
        };

        await TestBed.configureTestingModule({
            declarations: [RegisterComponent],
            imports: [MaterialModule, ReactiveFormsModule, RouterTestingModule, NoopAnimationsModule],
            providers: [
                { provide: ClearanceService, useValue: mockSessionStorageService },
                { provide: UserService, useValue: mockUserService },
                { provide: LoaderService, useValue: mockLoaderService },
                { provide: SnackbarService, useValue: mockSnackbarService },
                FormBuilder,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
