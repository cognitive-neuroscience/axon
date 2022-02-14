import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { TaskPlayerComponent } from './task-player.component';

describe('TaskPlayerComponent', () => {
    let component: TaskPlayerComponent;
    let fixture: ComponentFixture<TaskPlayerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TaskPlayerComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule, RouterTestingModule, NoopAnimationsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskPlayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
