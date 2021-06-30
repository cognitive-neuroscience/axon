import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireReaderComponent } from './questionnaire-reader.component';

describe('QuestionnaireReaderComponent', () => {
  let component: QuestionnaireReaderComponent;
  let fixture: ComponentFixture<QuestionnaireReaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionnaireReaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnaireReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
