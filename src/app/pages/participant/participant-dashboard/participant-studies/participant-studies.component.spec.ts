import { HttpClientModule } from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/modules/material/material.module';

import { ParticipantStudiesComponent } from './participant-studies.component';

@Pipe({
    name: 'translate',
})
export class MockPipe implements PipeTransform {
    transform(value: any, ..._args: any[]) {
        return value;
    }
}

describe('ParticipantStudiesComponent', () => {
    let component: ParticipantStudiesComponent;
    let fixture: ComponentFixture<ParticipantStudiesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ParticipantStudiesComponent, MockPipe],
            imports: [MaterialModule, HttpClientModule, RouterTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ParticipantStudiesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
