import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoDisplayViewerComponent } from './info-display-viewer.component';

describe('InfoDisplayViewerComponent', () => {
  let component: InfoDisplayViewerComponent;
  let fixture: ComponentFixture<InfoDisplayViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoDisplayViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoDisplayViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
