import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroDialogComponent } from './intro-dialog.component';

describe('IntroDialogComponent', () => {
  let component: IntroDialogComponent;
  let fixture: ComponentFixture<IntroDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntroDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntroDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
