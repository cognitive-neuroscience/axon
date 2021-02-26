import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestionnaireComponent } from './questionnaire.component';

describe('QuestionnaireComponent', () => {
  let component: QuestionnaireComponent;
  let fixture: ComponentFixture<QuestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
          RouterTestingModule,
          HttpClientTestingModule,
          MatSnackBarModule,
      ],
      declarations: [
        QuestionnaireComponent
      ],
      providers: [
          {
              provide: MAT_DIALOG_DATA,
              useValue: {}
          },
          {
              provide: MatDialogRef,
              useValue: {}
          },
          {
              provide: MatDialog,
              useValue: {}
          }
      ]
    }).compileComponents().then(() => {
        fixture = TestBed.createComponent(QuestionnaireComponent);
        component = fixture.componentInstance;
    })
  });

  it('should initialize the choice component', () => {
    expect(component).toBeTruthy();
  });
});
