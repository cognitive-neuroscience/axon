import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformationTaskComponent } from './information-task.component';

describe('InformationTaskComponent', () => {
  let component: InformationTaskComponent;
  let fixture: ComponentFixture<InformationTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformationTaskComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InformationTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
