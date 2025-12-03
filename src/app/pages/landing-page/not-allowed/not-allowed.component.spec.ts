import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { RouterTestingModule } from '@angular/router/testing';

import { NotAllowedComponent } from './not-allowed.component';

describe('NotFoundComponent', () => {
    let component: NotAllowedComponent;
    let fixture: ComponentFixture<NotAllowedComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NotAllowedComponent],
            imports: [MatCardModule, RouterTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NotAllowedComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
