import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { PavloviaTasksComponent } from './pavlovia-tasks.component';

@Component({
    selector: 'app-view-components-table',
    template: '<p>mock components table</p>',
})
export class MockAppViewComponentsTable {
    @Input() data: any;
}

describe('ManageCustomTasksComponent', () => {
    let component: PavloviaTasksComponent;
    let fixture: ComponentFixture<PavloviaTasksComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule, OverlayModule, RouterTestingModule],
                declarations: [PavloviaTasksComponent, MockAppViewComponentsTable],
                providers: [
                    { provide: MatDialog, useValue: {} },
                    { provide: MatSnackBar, useVlaue: {} },
                    SnackbarService,
                ],
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(PavloviaTasksComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
