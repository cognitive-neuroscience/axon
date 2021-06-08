import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CreateModifyStudyComponent } from "./create-modify-study.component";

describe("CreateStudyComponent", () => {
    let component: CreateModifyStudyComponent;
    let fixture: ComponentFixture<CreateModifyStudyComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CreateModifyStudyComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateModifyStudyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
