import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ParticipantRoutingModule } from "./participant-routing.module";
import { SharedModule } from "../shared/shared.module";
import { ParticipantDashboardComponent } from "./participant-dashboard/participant-dashboard.component";
import { ParticipantStudiesComponent } from "./participant-dashboard/participant-studies/participant-studies.component";
import { RouterModule } from "@angular/router";
import { FeedbackQuestionnaireComponent } from "./final-page/feedback-questionnaire/feedback-questionnaire.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "src/app/modules/material/material.module";
import { FinalPageComponent } from "./final-page/final-page.component";

@NgModule({
    declarations: [
        ParticipantDashboardComponent,
        ParticipantStudiesComponent,
        FinalPageComponent,
        FeedbackQuestionnaireComponent,
    ],
    imports: [
        CommonModule,
        ParticipantRoutingModule,
        SharedModule,
        RouterModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
    ],
})
export class ParticipantModule {}
