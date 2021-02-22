import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCustomTasksComponent } from './manage-custom-tasks.component';

describe('ManageCustomTasksComponent', () => {
  let component: ManageCustomTasksComponent;
  let fixture: ComponentFixture<ManageCustomTasksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageCustomTasksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCustomTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
