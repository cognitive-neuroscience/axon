import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from 'src/app/modules/material/material.module';

import { RaterDutchComponent } from './rater-dutch.component';

@Component({
    selector: 'app-slider',
    template: '<p>mock slider</p>',
})
export class MockAppSlider {
    @Input() marks: any;
    @Input() shouldReverseLegend: any;
}

describe('RaterDutchComponent', () => {
    let component: RaterDutchComponent;
    let fixture: ComponentFixture<RaterDutchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RaterDutchComponent, MockAppSlider],
            imports: [MaterialModule, HttpClientTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RaterDutchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
