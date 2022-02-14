import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ConsentDialogComponent } from './consent-dialog.component';

@Component({
    selector: 'app-consent',
    template: '<p>mock consent</p>',
})
export class MockAppConsent {
    @Input() readerMetadata: any;
}

describe('ConsentDialogComponent', () => {
    let component: ConsentDialogComponent;
    let fixture: ComponentFixture<ConsentDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConsentDialogComponent, MockAppConsent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialog, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConsentDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
