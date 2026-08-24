import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { LanguageDialogComponent } from './language-dialog.component';
import { LocalStorageService } from 'src/app/services/localStorageService.service';

describe('LanguageDialogComponent', () => {
    let component: LanguageDialogComponent;
    let fixture: ComponentFixture<LanguageDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LanguageDialogComponent],
            imports: [CommonModule],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {},
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: null,
                },
                {
                    provide: LocalStorageService,
                    useValue: {
                        setPreferredLangInLocalStorage: jest.fn(),
                    },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LanguageDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
