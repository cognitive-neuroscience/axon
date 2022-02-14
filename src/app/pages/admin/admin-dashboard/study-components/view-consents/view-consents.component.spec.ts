import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ViewConsentsComponent } from './view-consents.component';

@Component({
    selector: 'app-view-components-table',
    template: '<p>mock components table</p>',
})
export class MockAppViewComponentsTable {
    @Input() data: any;
}

describe('ViewConsentsComponent', () => {
    let component: ViewConsentsComponent;
    let fixture: ComponentFixture<ViewConsentsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ViewConsentsComponent, MockAppViewComponentsTable],
            imports: [HttpClientTestingModule, RouterTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ViewConsentsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
