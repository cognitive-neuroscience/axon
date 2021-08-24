import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordLoginComponent } from './reset-password-login.component';

describe('ResetPasswordLoginComponent', () => {
  let component: ResetPasswordLoginComponent;
  let fixture: ComponentFixture<ResetPasswordLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResetPasswordLoginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
