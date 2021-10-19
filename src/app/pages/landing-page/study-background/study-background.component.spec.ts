import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyBackgroundComponent } from './study-background.component';

describe('StudyBackgroundComponent', () => {
    let component: StudyBackgroundComponent;
    let fixture: ComponentFixture<StudyBackgroundComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StudyBackgroundComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StudyBackgroundComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
