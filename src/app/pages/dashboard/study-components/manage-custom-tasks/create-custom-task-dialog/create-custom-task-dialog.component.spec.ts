import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { CreateCustomTaskDialogComponent } from './create-custom-task-dialog.component';

describe('CreateCustomTaskDialogComponent', () => {
  let component: CreateCustomTaskDialogComponent;
  let fixture: ComponentFixture<CreateCustomTaskDialogComponent>;

  beforeEach(async(() => {
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
