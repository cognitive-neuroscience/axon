import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';

import { HelpQuestionnaireDialogComponent } from './help-questionnaire-dialog.component';

describe('HelpQuestionnaireDialogComponent', () => {
  let component: HelpQuestionnaireDialogComponent;
  let fixture: ComponentFixture<HelpQuestionnaireDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HelpQuestionnaireDialogComponent ],
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
    fixture = TestBed.createComponent(HelpQuestionnaireDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
