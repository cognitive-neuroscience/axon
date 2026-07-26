import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from 'src/app/modules/material/material.module';

import { ChoicerDutchComponent } from './choicer-dutch.component';

@Component({
    selector: 'app-slider',
    template: '<p>mock slider</p>',
})
export class MockAppSlider {
    @Input() marks: any;
    @Input() shouldReverseLegend: any;
}

describe('ChoicerDutchComponent', () => {
    let component: ChoicerDutchComponent;
    let fixture: ComponentFixture<ChoicerDutchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChoicerDutchComponent, MockAppSlider],
            imports: [MaterialModule, HttpClientTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChoicerDutchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
