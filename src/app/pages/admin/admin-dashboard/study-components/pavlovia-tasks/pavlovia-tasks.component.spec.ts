import { OverlayModule } from "@angular/cdk/overlay";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SnackbarService } from "src/app/services/snackbar.service";

import { PavloviaTasksComponent } from "./pavlovia-tasks.component";

describe("ManageCustomTasksComponent", () => {
    let component: PavloviaTasksComponent;
    let fixture: ComponentFixture<PavloviaTasksComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule, OverlayModule],
                declarations: [PavloviaTasksComponent],
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

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
