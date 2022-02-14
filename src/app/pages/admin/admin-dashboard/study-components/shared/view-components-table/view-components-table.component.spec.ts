import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from 'src/app/modules/material/material.module';

import { ViewComponentsTableComponent } from './view-components-table.component';

describe('ViewComponentsTableComponent', () => {
    let component: ViewComponentsTableComponent<any>;
    let fixture: ComponentFixture<ViewComponentsTableComponent<any>>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ViewComponentsTableComponent],
            imports: [MaterialModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ViewComponentsTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
