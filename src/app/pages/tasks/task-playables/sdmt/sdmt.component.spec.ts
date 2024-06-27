import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdmtComponent } from './sdmt.component';

describe('SdmtComponent', () => {
  let component: SdmtComponent;
  let fixture: ComponentFixture<SdmtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SdmtComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SdmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
