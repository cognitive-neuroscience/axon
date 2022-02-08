import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { SartComponent } from './sart.component';

describe('SartComponent', () => {
    let component: SartComponent;
    let fixture: ComponentFixture<SartComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SartComponent],
            imports: [MatSnackBarModule, HttpClientTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
