import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { EmbeddedPageComponent } from './embedded-page.component';

describe('EmbeddedPageComponent', () => {
  let component: EmbeddedPageComponent;
  let fixture: ComponentFixture<EmbeddedPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
          RouterTestingModule,
          HttpClientTestingModule,
          MatSnackBarModule,
      ],
      declarations: [
        EmbeddedPageComponent
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
        fixture = TestBed.createComponent(EmbeddedPageComponent);
        component = fixture.componentInstance;
    })
  });

  it('should initialize the choice component', () => {
    expect(component).toBeTruthy();
  });
});
