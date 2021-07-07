import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "src/app/modules/material/material.module";
import { ConsentReaderComponent } from "./consent-component/consent-reader.component";
import { NavbarComponent } from "./navbar/navbar.component";

@NgModule({
    declarations: [NavbarComponent, ConsentReaderComponent],
    imports: [CommonModule, MaterialModule, RouterModule],
    exports: [NavbarComponent, ConsentReaderComponent],
})
export class SharedModule {}
