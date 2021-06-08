import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CustomTaskHelpDialogComponent } from './custom-task-help-dialog.component';

describe('CustomTaskHelpDialogComponent', () => {
  let component: CustomTaskHelpDialogComponent;
  let fixture: ComponentFixture<CustomTaskHelpDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomTaskHelpDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTaskHelpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
