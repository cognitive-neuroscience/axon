import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoDisplayComponent } from './info-display.component';

describe('InfoDisplayComponent', () => {
  let component: InfoDisplayComponent;
  let fixture: ComponentFixture<InfoDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoDisplayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
