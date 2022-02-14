import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfirmationService } from 'src/app/services/confirmation/confirmation.service';

import { ConsentPageComponent } from './consent-page.component';

@Component({
    selector: 'app-consent',
    template: '<p>mock consent</p>',
})
export class MockAppConsent {
    @Input() readerMetadata: any;
}

describe('ConsentPageComponent', () => {
    let component: ConsentPageComponent;
    let fixture: ComponentFixture<ConsentPageComponent>;

    const mockConfirmationService = {
        openConfirmationDialog: jest.fn(),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConsentPageComponent, MockAppConsent],
            imports: [HttpClientTestingModule, MatSnackBarModule, RouterTestingModule],
            providers: [{ provide: ConfirmationService, useValue: mockConfirmationService }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConsentPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
