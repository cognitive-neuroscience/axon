import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChoicerComponent } from './choicer.component';

describe('ChoicerComponent', () => {
  let component: ChoicerComponent;
  let fixture: ComponentFixture<ChoicerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChoicerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChoicerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
