import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpQuestionnaireDialogComponent } from './help-questionnaire-dialog.component';

describe('HelpQuestionnaireDialogComponent', () => {
  let component: HelpQuestionnaireDialogComponent;
  let fixture: ComponentFixture<HelpQuestionnaireDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelpQuestionnaireDialogComponent ]
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
