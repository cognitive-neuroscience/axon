import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { RouterTestingModule } from '@angular/router/testing';

import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
    let component: NotFoundComponent;
    let fixture: ComponentFixture<NotFoundComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NotFoundComponent],
            imports: [MatCardModule, RouterTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NotFoundComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
