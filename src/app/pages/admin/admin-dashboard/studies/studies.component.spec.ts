import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { StudiesComponent } from './studies.component';

describe('StudiesComponent', () => {
    let component: StudiesComponent;
    let fixture: ComponentFixture<StudiesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StudiesComponent],
            imports: [RouterTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StudiesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
