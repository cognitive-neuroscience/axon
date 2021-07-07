import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDoneDialogComponent } from './confirm-done-dialog.component';

describe('ConfirmDoneDialogComponent', () => {
  let component: ConfirmDoneDialogComponent;
  let fixture: ComponentFixture<ConfirmDoneDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmDoneDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDoneDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
