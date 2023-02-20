import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationMemberDashboardComponent } from './organization-member-dashboard.component';

describe('OrganizationMemberDashboardComponent', () => {
  let component: OrganizationMemberDashboardComponent;
  let fixture: ComponentFixture<OrganizationMemberDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationMemberDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationMemberDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
