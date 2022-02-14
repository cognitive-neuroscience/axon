import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ViewInfoDisplaysComponent } from './view-info-displays.component';

@Component({
    selector: 'app-view-components-table',
    template: '<p>mock components table</p>',
})
export class MockAppViewComponentsTable {
    @Input() data: any;
}

describe('ViewInfoDisplaysComponent', () => {
    let component: ViewInfoDisplaysComponent;
    let fixture: ComponentFixture<ViewInfoDisplaysComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ViewInfoDisplaysComponent, MockAppViewComponentsTable],
            imports: [RouterTestingModule, HttpClientTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ViewInfoDisplaysComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
