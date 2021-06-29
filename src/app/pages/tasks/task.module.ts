import { NgModule } from "@angular/core";
import { MaterialModule } from "src/app/modules/material/material.module";
import { ChoiceComponent } from "./unused/choice/choice.component";
import { DemandSelectionComponent } from "./playables/demand-selection/demand-selection.component";
import { DigitSpanComponent } from "./playables/digit-span/digit-span.component";
import { NumpadComponent } from "./shared/numpad/numpad.component";
import { FingerTappingTaskComponent } from "./playables/finger-tapping/finger-tapping-task.component";
import { NBackComponent } from "./playables/n-back/n-back.component";
import { OddballComponent } from "./playables/oddball/oddball.component";
import { PostChoiceComponent } from "./unused/post-choice/post-choice.component";
import { ChoicerComponent } from "./playables/everyday-choice/choicer/choicer.component";
import { RatingComponent } from "./unused/rating/rating.component";
import { ShapeGameComponent } from "./unused/shape-game/shape-game.component";
import { DisplayComponent } from "./shared/display/display.component";
import { SliderComponent } from "./shared/slider/slider.component";
import { SmileyFaceComponent } from "./playables/smiley-face/smiley-face.component";
import { StroopComponent } from "./playables/stroop/stroop.component";
import { TaskPlayerComponent } from "./playables/task-player/task-player.component";
import { TaskSwitchingComponent } from "./playables/task-switching/task-switching.component";
import { TrailMakingComponent } from "./playables/trail-making/trail-making.component";
import { RaterComponent } from "./playables/everyday-choice/rater/rater.component";
import { NgZorroModule } from "src/app/modules/ngzorro/ngzorro.module";
import { NavigationButtonsComponent } from "./shared/navigation-buttons/navigation-buttons.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { RotateDirective } from "./shared/Rotate.directive";
import { ColorGameComponent } from "./unused/color-game/color-game.component";
import { EmbeddedPageComponent } from "./questionnaires/embedded-page/embedded-page.component";
import { DemographicsQuestionnaireComponent } from "./questionnaires/demographics-questionnaire/demographics-questionnaire.component";
import { SafeResoucePipe } from "src/app/pipes/safe.pipe";
import { PreviewQuestionnaireDialogComponent } from "../admin/admin-dashboard/study-components/manage-questionnaires/preview-questionnaire-dialog/preview-questionnaire-dialog.component";
import { SelectOptionComponent } from "./shared/select-option/select-option.component";

@NgModule({
    declarations: [
        ChoiceComponent,
        ColorGameComponent,
        RatingComponent,
        ShapeGameComponent,

        ChoicerComponent,
        DemandSelectionComponent,
        DigitSpanComponent,
        FingerTappingTaskComponent,
        NBackComponent,
        OddballComponent,
        PostChoiceComponent,
        RaterComponent,
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
    ],
    imports: [CommonModule, MaterialModule, NgZorroModule, FormsModule, ReactiveFormsModule],
    exports: [EmbeddedPageComponent],
})
export class TaskModule {}
