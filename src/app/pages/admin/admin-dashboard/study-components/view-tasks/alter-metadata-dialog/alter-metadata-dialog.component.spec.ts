import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlterMetadataDialogComponent } from './alter-metadata-dialog.component';

describe('AlterMetadataDialogComponent', () => {
  let component: AlterMetadataDialogComponent;
  let fixture: ComponentFixture<AlterMetadataDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlterMetadataDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlterMetadataDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
