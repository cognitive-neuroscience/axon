import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from 'src/app/modules/material/material.module';

import { ChoicerComponent } from './choicer.component';

@Component({
    selector: 'app-slider',
    template: '<p>mock slider</p>',
})
export class MockAppSlider {
    @Input() marks: any;
    @Input() shouldReverseLegend: any;
}

describe('ChoicerComponent', () => {
    let component: ChoicerComponent;
    let fixture: ComponentFixture<ChoicerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChoicerComponent, MockAppSlider],
            imports: [MaterialModule, HttpClientTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChoicerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
