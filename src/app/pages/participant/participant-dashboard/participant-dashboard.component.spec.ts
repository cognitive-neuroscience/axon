import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateService } from '@ngx-translate/core';

import { ParticipantDashboardComponent } from './participant-dashboard.component';

@Component({
    selector: 'app-navbar',
    template: '<p>mock navbar</p>',
})
export class MockAppNavbar {}

describe('ParticipantDashboardComponent', () => {
    let component: ParticipantDashboardComponent;
    let fixture: ComponentFixture<ParticipantDashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParticipantDashboardComponent, MockAppNavbar],
            imports: [RouterTestingModule, HttpClientTestingModule],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {},
                },
                {
                    provide: MatDialog,
                    useValue: {},
                },
                {
                    provide: TranslateService,
                    useValue: { use: jest.fn() },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParticipantDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
