import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { CreateCustomTaskDialogComponent } from './create-custom-task-dialog.component';

describe('CreateCustomTaskDialogComponent', () => {
  let component: CreateCustomTaskDialogComponent;
  let fixture: ComponentFixture<CreateCustomTaskDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateCustomTaskDialogComponent ],
      providers: [
        {
            provide: MatDialogRef,
            useValue: {}
        }
    ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCustomTaskDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
