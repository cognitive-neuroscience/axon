import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { EmbeddedPageComponent } from './embedded-page.component';

@Component({
    selector: 'app-navigation-buttons',
    template: '<p>mock navigation buttons</p>',
})
export class MockAppNavigationButtons {
    @Input() warn: any;
    @Input() nextDisabled: any;
}

@Pipe({
    name: 'safe_resource',
})
export class MockPipe implements PipeTransform {
    transform(_value: any, ..._args: any[]) {
        (value: any): any => {
            return value;
        };
    }
}
describe('EmbeddedPageComponent', () => {
    let component: EmbeddedPageComponent;
    let fixture: ComponentFixture<EmbeddedPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule],
            declarations: [EmbeddedPageComponent, MockAppNavigationButtons, MockPipe],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {},
                },
                {
                    provide: MatDialogRef,
                    useValue: {},
                },
                {
                    provide: MatDialog,
                    useValue: {},
                },
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(EmbeddedPageComponent);
                component = fixture.componentInstance;
            });
    });

    it('should initialize the embedded page component', () => {
        expect(component).toBeTruthy();
    });
});
