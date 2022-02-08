import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceNameAssociationComponent } from './face-name-association.component';

describe('FaceNameAssociationComponent', () => {
  let component: FaceNameAssociationComponent;
  let fixture: ComponentFixture<FaceNameAssociationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaceNameAssociationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaceNameAssociationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
