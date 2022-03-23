import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/modules/material/material.module';

import { ConfirmDoneDialogComponent } from './confirm-done-dialog.component';

describe('ConfirmDoneDialogComponent', () => {
    let component: ConfirmDoneDialogComponent;
    let fixture: ComponentFixture<ConfirmDoneDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfirmDoneDialogComponent],
            imports: [MaterialModule, FormsModule, NoopAnimationsModule],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {},
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmDoneDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
