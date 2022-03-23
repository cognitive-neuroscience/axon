import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { InfoDisplayComponent } from './info-display.component';

@Component({
    selector: 'app-info-display-viewer',
    template: '<p>mock info display viewer</p>',
})
export class MockAppInfoDisplayViewer {
    @Input() readerMetadata: any;
}

describe('InfoDisplayComponent', () => {
    let component: InfoDisplayComponent;
    let fixture: ComponentFixture<InfoDisplayComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InfoDisplayComponent, MockAppInfoDisplayViewer],
            imports: [HttpClientTestingModule, MatSnackBarModule, RouterTestingModule, NoopAnimationsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InfoDisplayComponent);
        component = fixture.componentInstance;
        component.readerMetadata = {
            metadata: { shouldIncrementIndex: false },
            mode: 'test',
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
