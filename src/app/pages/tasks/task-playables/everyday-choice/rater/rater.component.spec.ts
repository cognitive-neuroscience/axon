import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from 'src/app/modules/material/material.module';

import { RaterComponent } from './rater.component';

@Component({
    selector: 'app-slider',
    template: '<p>mock slider</p>',
})
export class MockAppSlider {
    @Input() marks: any;
    @Input() shouldReverseLegend: any;
}

describe('RaterComponent', () => {
    let component: RaterComponent;
    let fixture: ComponentFixture<RaterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RaterComponent, MockAppSlider],
            imports: [MaterialModule, HttpClientTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RaterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
