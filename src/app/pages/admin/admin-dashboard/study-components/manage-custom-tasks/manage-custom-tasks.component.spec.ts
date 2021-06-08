import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarService } from 'src/app/services/snackbar.service';

import { ManageCustomTasksComponent } from './manage-custom-tasks.component';

describe('ManageCustomTasksComponent', () => {
  let component: ManageCustomTasksComponent;
  let fixture: ComponentFixture<ManageCustomTasksComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        OverlayModule
      ],
      declarations: [ 
        ManageCustomTasksComponent
      ],
      providers: [
        { provide: MatDialog, useValue: {} },
        { provide: MatSnackBar, useVlaue: {} },
        SnackbarService,
    ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCustomTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
