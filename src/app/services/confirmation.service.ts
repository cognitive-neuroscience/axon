import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { ConfirmationComponent } from "./confirmation/confirmation.component";
import { ConfirmationDialogMessage } from "../models/InternalDTOs";
import { map } from "rxjs/operators";
@Injectable({
    providedIn: "root",
})
export class ConfirmationService {
    constructor(private dialog: MatDialog) {}

    openConfirmationDialog(message: string): Observable<boolean> {
        const confirmationDialog = this.dialog.open(ConfirmationComponent, {
            width: "30%",
            data: new ConfirmationDialogMessage(message),
        });

        return confirmationDialog.afterClosed().pipe(map((ok) => !!ok));
    }
}
