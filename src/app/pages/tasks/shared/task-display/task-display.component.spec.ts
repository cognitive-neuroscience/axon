import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';

import { TaskDisplayComponent } from './task-display.component';

@Component({
    selector: 'app-navigation-buttons',
    template: '<p>mock navigation buttons</p>',
})
export class MockAppNavigationButtons {
    @Input() isStart: any;
    @Input() previousDisabled: any;
    @Input() nextDisabled: any;
}

describe('TaskDisplayComponent', () => {
    let component: TaskDisplayComponent;
    let fixture: ComponentFixture<TaskDisplayComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TaskDisplayComponent, MockAppNavigationButtons],
            providers: [{ provide: TranslateService, useValue: { currentLang: 'en' } }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskDisplayComponent);
        component = fixture.componentInstance;
        component.buttonConfig = {
            isStart: false,
            previousDisabled: false,
            nextDisabled: false,
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
