import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/modules/material/material.module';
import { ConsentReaderComponent } from './consent-component/consent-reader.component';
import { NavbarComponent } from './navbar/navbar.component';
import { InfoDisplayViewerComponent } from './info-display-viewer/info-display-viewer.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [NavbarComponent, ConsentReaderComponent, InfoDisplayViewerComponent],
    imports: [CommonModule, MaterialModule, RouterModule, TranslateModule],
    exports: [NavbarComponent, ConsentReaderComponent, InfoDisplayViewerComponent],
})
export class SharedModule {}
