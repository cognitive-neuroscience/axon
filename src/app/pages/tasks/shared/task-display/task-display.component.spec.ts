import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TaskDisplayComponent } from "./task-display.component";

describe("TaskDisplayComponent", () => {
    let component: TaskDisplayComponent;
    let fixture: ComponentFixture<TaskDisplayComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TaskDisplayComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskDisplayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
