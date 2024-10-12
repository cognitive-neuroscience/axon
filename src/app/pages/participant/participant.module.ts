import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticipantRoutingModule } from './participant-routing.module';
import { SharedModule } from '../shared/shared.module';
import { ParticipantDashboardComponent } from './participant-dashboard/participant-dashboard.component';
import { ParticipantStudiesComponent } from './participant-dashboard/participant-studies/participant-studies.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/modules/material/material.module';
import { FinalPageComponent } from './final-page/final-page.component';
import { ConsentDialogComponent } from './participant-dashboard/participant-studies/consent-dialog/consent-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageDialogComponent } from './participant-dashboard/language-dialog/language-dialog.component';
import { ErrorPageComponent } from './error-page/error-page.component';

@NgModule({
    declarations: [
        ParticipantDashboardComponent,
        ParticipantStudiesComponent,
        FinalPageComponent,
        ErrorPageComponent,
        ConsentDialogComponent,
        LanguageDialogComponent,
    ],
    imports: [
        CommonModule,
        ParticipantRoutingModule,
        SharedModule,
        RouterModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        TranslateModule,
    ],
})
export class ParticipantModule {}
