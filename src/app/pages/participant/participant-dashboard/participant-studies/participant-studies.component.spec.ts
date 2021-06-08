import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantStudiesComponent } from './participant-studies.component';

describe('ParticipantStudiesComponent', () => {
  let component: ParticipantStudiesComponent;
  let fixture: ComponentFixture<ParticipantStudiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParticipantStudiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParticipantStudiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
