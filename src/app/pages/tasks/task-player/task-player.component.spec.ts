import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskPlayerComponent } from './task-player.component';

describe('TaskPlayerComponent', () => {
  let component: TaskPlayerComponent;
  let fixture: ComponentFixture<TaskPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskPlayerComponent ]
    })
    .compileComponents();
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
