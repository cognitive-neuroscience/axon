import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/modules/material/material.module';
import { ConsentReaderComponent } from './consent-component/consent-reader.component';
import { NavbarComponent } from './navbar/navbar.component';
import { InfoDisplayViewerComponent } from './info-display-viewer/info-display-viewer.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile.component';
import { JsonEditorComponent } from './json-editor/json-editor.component';

@NgModule({
    declarations: [
        NavbarComponent,
        ConsentReaderComponent,
        InfoDisplayViewerComponent,
        ProfileComponent,
        JsonEditorComponent,
    ],
    imports: [CommonModule, MaterialModule, RouterModule, TranslateModule, FormsModule, ReactiveFormsModule],
    exports: [
        NavbarComponent,
        ConsentReaderComponent,
        InfoDisplayViewerComponent,
        ProfileComponent,
        JsonEditorComponent,
    ],
})
export class SharedModule {}
