import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "src/app/modules/material/material.module";
import { NavbarComponent } from "./navbar/navbar.component";

@NgModule({
    declarations: [NavbarComponent],
    imports: [CommonModule, MaterialModule, RouterModule],
    exports: [NavbarComponent],
})
export class SharedModule {}
