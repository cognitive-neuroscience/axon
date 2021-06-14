import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TempPlayerComponent } from './temp-player.component';

describe('TempPlayerComponent', () => {
  let component: TempPlayerComponent;
  let fixture: ComponentFixture<TempPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TempPlayerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TempPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
