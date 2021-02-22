import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTaskPreviewDialogComponent } from './custom-task-preview-dialog.component';

describe('CustomTaskPreviewDialogComponent', () => {
  let component: CustomTaskPreviewDialogComponent;
  let fixture: ComponentFixture<CustomTaskPreviewDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomTaskPreviewDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTaskPreviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
