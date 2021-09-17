import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewInfoDisplaysComponent } from './view-info-displays.component';

describe('ViewInfoDisplaysComponent', () => {
  let component: ViewInfoDisplaysComponent;
  let fixture: ComponentFixture<ViewInfoDisplaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewInfoDisplaysComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewInfoDisplaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
