import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { StudyBackgroundComponent } from './study-background.component';

@Component({
    selector: 'app-info-display-viewer',
    template: '<p>mock</p>',
})
class MockAppInfoDisplayViewer {
    @Input() readerMetadata: any;
}

describe('StudyBackgroundComponent', () => {
    let component: StudyBackgroundComponent;
    let fixture: ComponentFixture<StudyBackgroundComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [StudyBackgroundComponent, MockAppInfoDisplayViewer],
            imports: [RouterTestingModule, HttpClientTestingModule],
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
