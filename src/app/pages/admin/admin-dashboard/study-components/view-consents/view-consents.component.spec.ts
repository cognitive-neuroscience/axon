import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewConsentsComponent } from './view-consents.component';

describe('ViewConsentsComponent', () => {
  let component: ViewConsentsComponent;
  let fixture: ComponentFixture<ViewConsentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewConsentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewConsentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
