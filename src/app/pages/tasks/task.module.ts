import { NgModule } from "@angular/core";
import { MaterialModule } from "src/app/modules/material/material.module";
import { ChoiceComponent } from "./playables/choice/choice.component";
import { DemandSelectionComponent } from "./playables/demand-selection/demand-selection.component";
import { DigitSpanComponent } from "./playables/digit-span/digit-span.component";
import { NumpadComponent } from "./shared/numpad/numpad.component";
import { FingerTappingTaskComponent } from "./playables/finger-tapping/finger-tapping-task.component";
import { NBackComponent } from "./playables/n-back/n-back.component";
import { OddballComponent } from "./playables/oddball/oddball.component";
import { PostChoiceComponent } from "./playables/post-choice/post-choice.component";
import { ChoicerComponent } from "./playables/rating-new/choicer/choicer.component";
import { RatingNewComponent } from "./playables/rating-new/rating-new.component";
import { RatingComponent } from "./playables/rating/rating.component";
import { ShapeGameComponent } from "./playables/shape-game/shape-game.component";
import { DisplayComponent } from "./shared/display/display.component";
import { SliderComponent } from "./shared/slider/slider.component";
import { SmileyFaceComponent } from "./playables/smiley-face/smiley-face.component";
import { StroopComponent } from "./playables/stroop/stroop.component";
import { TaskPlayerComponent } from "./playables/task-player/task-player.component";
import { TaskSwitchingComponent } from "./playables/task-switching/task-switching.component";
import { TrailMakingComponent } from "./playables/trail-making/trail-making.component";
import { RaterComponent } from "./playables/rating-new/rater/rater.component";
import { NgZorroModule } from "src/app/modules/ngzorro/ngzorro.module";
import { NavigationButtonsComponent } from "./shared/navigation-buttons/navigation-buttons.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { RotateDirective } from "./shared/Rotate.directive";
import { ColorGameComponent } from "./playables/color-game/color-game.component";
import { EmbeddedPageComponent } from "./questionnaires/embedded-page/embedded-page.component";
import { DemographicsQuestionnaireComponent } from "./questionnaires/demographics-questionnaire/demographics-questionnaire.component";
import { SafeResoucePipe } from "src/app/pipes/safe.pipe";
import { PreviewQuestionnaireDialogComponent } from "../admin/admin-dashboard/study-components/manage-questionnaires/preview-questionnaire-dialog/preview-questionnaire-dialog.component";
import { TempPlayerComponent } from "./playables/temp-player/temp-player.component";
import { SelectOptionComponent } from "./shared/select-option/select-option.component";

@NgModule({
    declarations: [
        ChoiceComponent,
        ChoicerComponent,
        DemandSelectionComponent,
        DigitSpanComponent,
        FingerTappingTaskComponent,
        NBackComponent,
        OddballComponent,
        PostChoiceComponent,
        ColorGameComponent,
        RaterComponent,
        RatingComponent,
        RatingNewComponent,
        ShapeGameComponent,
        SmileyFaceComponent,
        StroopComponent,
        TaskPlayerComponent,
        TaskSwitchingComponent,
        TrailMakingComponent,

        EmbeddedPageComponent,
        PreviewQuestionnaireDialogComponent,
        DemographicsQuestionnaireComponent,

        NumpadComponent,
        SliderComponent,
        DisplayComponent,
        NavigationButtonsComponent,
        SelectOptionComponent,

        RotateDirective,

        SafeResoucePipe,
        TempPlayerComponent,
    ],
    imports: [CommonModule, MaterialModule, NgZorroModule, FormsModule, ReactiveFormsModule],
    exports: [EmbeddedPageComponent],
})
export class TaskModule {}
