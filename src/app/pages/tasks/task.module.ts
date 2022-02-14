import { NgModule } from '@angular/core';
import { MaterialModule } from 'src/app/modules/material/material.module';
import { ChoiceComponent } from './unused/choice/choice.component';
import { DemandSelectionComponent } from './task-playables/demand-selection/demand-selection.component';
import { DigitSpanComponent } from './task-playables/digit-span/digit-span.component';
import { NumpadComponent } from './shared/numpad/numpad.component';
import { FingerTappingTaskComponent } from './task-playables/finger-tapping/finger-tapping-task.component';
import { NBackComponent } from './task-playables/n-back/n-back.component';
import { OddballComponent } from './task-playables/oddball/oddball.component';
import { PostChoiceComponent } from './unused/post-choice/post-choice.component';
import { ChoicerComponent } from './task-playables/everyday-choice/choicer/choicer.component';
import { RatingComponent } from './unused/rating/rating.component';
import { ShapeGameComponent } from './unused/shape-game/shape-game.component';
import { TaskDisplayComponent } from './shared/task-display/task-display.component';
import { SliderComponent } from './shared/slider/slider.component';
import { SmileyFaceComponent } from './task-playables/smiley-face/smiley-face.component';
import { StroopComponent } from './task-playables/stroop/stroop.component';
import { TaskPlayerComponent } from './task-playables/task-player/task-player.component';
import { TaskSwitchingComponent } from './task-playables/task-switching/task-switching.component';
import { TrailMakingComponent } from './task-playables/trail-making/trail-making.component';
import { RaterComponent } from './task-playables/everyday-choice/rater/rater.component';
import { NgZorroModule } from 'src/app/modules/ngzorro/ngzorro.module';
import { NavigationButtonsComponent } from './shared/navigation-buttons/navigation-buttons.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RotateDirective } from './shared/Rotate.directive';
import { ColorGameComponent } from './unused/color-game/color-game.component';
import { EmbeddedPageComponent } from './embedded-page/embedded-page.component';
import { SafeResoucePipe } from 'src/app/pipes/safe.pipe';
import { SelectOptionComponent } from './shared/select-option/select-option.component';
import { QuestionnaireReaderComponent } from './questionnaire-reader/questionnaire-reader.component';
import { IntroDialogComponent } from './embedded-page/intro-dialog/intro-dialog.component';
import { ConfirmDoneDialogComponent } from './embedded-page/confirm-done-dialog/confirm-done-dialog.component';
import { ConsentPageComponent } from './consent/consent-page/consent-page.component';
import { SharedModule } from '../shared/shared.module';
import { InfoDisplayComponent } from './info-display/info-display.component';
import { SartComponent } from './task-playables/sart/sart.component';
import { TranslateModule } from '@ngx-translate/core';
import { FaceNameAssociationComponent } from './task-playables/face-name-association/face-name-association.component';

@NgModule({
    declarations: [
        // unused
        ChoiceComponent,
        ColorGameComponent,
        RatingComponent,
        ShapeGameComponent,

        // playables
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

        // shared
        NumpadComponent,
        SliderComponent,
        TaskDisplayComponent,
        NavigationButtonsComponent,
        SelectOptionComponent,
        InfoDisplayComponent,

        RotateDirective,

        SafeResoucePipe,
        QuestionnaireReaderComponent,
        IntroDialogComponent,
        ConfirmDoneDialogComponent,
        ConsentPageComponent,
        SartComponent,
        FaceNameAssociationComponent,
    ],
    imports: [
        CommonModule,
        MaterialModule,
        NgZorroModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        TranslateModule,
    ],
    exports: [EmbeddedPageComponent],
})
export class TaskModule {}
