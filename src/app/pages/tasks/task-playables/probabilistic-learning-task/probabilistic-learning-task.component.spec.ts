import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbabilisticLearningTaskComponent } from './probabilistic-learning-task.component';

describe('ProbabilisticLearningTaskComponent', () => {
  let component: ProbabilisticLearningTaskComponent;
  let fixture: ComponentFixture<ProbabilisticLearningTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProbabilisticLearningTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProbabilisticLearningTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
