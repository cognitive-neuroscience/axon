import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionDisplayComponent } from './option-display.component';

describe('OptionDisplayComponent', () => {
  let component: OptionDisplayComponent;
  let fixture: ComponentFixture<OptionDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OptionDisplayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
