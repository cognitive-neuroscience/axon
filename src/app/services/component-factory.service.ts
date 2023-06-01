import { ComponentFactoryResolver, ComponentRef, Injectable, Injector, ViewContainerRef } from '@angular/core';
import { TaskDisplayComponent } from '../pages/tasks/task-playables/task-display/task-display.component';
import { Playable } from '../pages/tasks/task-playables/playable';
import { RaterComponent } from '../pages/tasks/task-playables/everyday-choice/rater/rater.component';
import { ChoicerComponent } from '../pages/tasks/task-playables/everyday-choice/choicer/choicer.component';
import { OddballComponent } from '../pages/tasks/task-playables/oddball/oddball.component';
import { StroopComponent } from '../pages/tasks/task-playables/stroop/stroop.component';
import { SmileyFaceComponent } from '../pages/tasks/task-playables/smiley-face/smiley-face.component';
import { NBackComponent } from '../pages/tasks/task-playables/n-back/n-back.component';
import { DemandSelectionComponent } from '../pages/tasks/task-playables/demand-selection/demand-selection.component';
import { TaskSwitchingComponent } from '../pages/tasks/task-playables/task-switching/task-switching.component';
import { DigitSpanComponent } from '../pages/tasks/task-playables/digit-span/digit-span.component';
import { SelectOptionComponent } from '../pages/tasks/task-playables/select-option/select-option.component';
import { FingerTappingTaskComponent } from '../pages/tasks/task-playables/finger-tapping/finger-tapping-task.component';
import { TrailMakingComponent } from '../pages/tasks/task-playables/trail-making/trail-making.component';
import { SartComponent } from '../pages/tasks/task-playables/sart/sart.component';
import { FaceNameAssociationComponent } from '../pages/tasks/task-playables/face-name-association/face-name-association.component';
import { QuestionnaireComponent } from '../pages/tasks/task-playables/questionnaire/questionnaire.component';
import { EmbeddedPageComponent } from '../pages/tasks/task-playables/embedded-page/embedded-page.component';
import { InfoDisplayComponent } from '../pages/tasks/task-playables/info-display/info-display.component';
import { ProbabilisticLearningTaskComponent } from '../pages/tasks/task-playables/probabilistic-learning-task/probabilistic-learning-task.component';
import { IowaGamblingTaskComponent } from '../pages/tasks/task-playables/iowa-gambling-task/iowa-gambling-task.component';
import { InformationTaskComponent } from '../pages/tasks/task-playables/information-task/information-task.component';

export enum ComponentName {
    // Generic components
    DISPLAY_COMPONENT = 'DISPLAYCOMPONENT',
    SELECT_OPTION_COMPONENT = 'SELECTOPTIONCOMPONENT',

    // Task related components
    RATING_COMPONENT = 'RATINGCOMPONENT',
    CHOICE_COMPONENT = 'CHOICECOMPONENT',
    ODDBALL_COMPONENT = 'ODDBALLCOMPONENT',
    STROOP_COMPONENT = 'STROOPCOMPONENT',
    SMILEY_FACE_COMPONENT = 'SMILEYFACECOMPONENT',
    NBACK_COMPONENT = 'NBACKCOMPONENT',
    DEMAND_SELECTION_COMPONENT = 'DEMANDSELECTIONCOMPONENT',
    TASK_SWITCHING_COMPONENT = 'TASKSWITCHINGCOMPONENT',
    DIGIT_SPAN_COMPONENT = 'DIGITSPANCOMPONENT',
    FINGER_TAPPING_COMPONENT = 'FINGERTAPPINGCOMPONENT',
    TRAIL_MAKING_COMPONENT = 'TRAILMAKINGCOMPONENT',
    SART_COMPONENT = 'SARTCOMPONENT',
    FACE_NAME_ASSOCIATION_COMPONENT = 'FACENAMEASSOCIATIONCOMPONENT',
    PLT_COMPONENT = 'PLTCOMPONENT',
    IOWA_GAMBLING_COMPONENT = 'IOWAGAMBLINGCOMPONENT',
    INFORMATION_TASK_COMPONENT = 'INFORMATIONTASKCOMPONENT',

    // Special Components
    EMBEDDED_PAGE_COMPONENT = 'EMBEDDEDPAGECOMPONENT',
    QUESTIONNAIRE_COMPONENT = 'QUESTIONNAIRECOMPONENT',
    INFO_DISPLAY_COMPONENT = 'INFODISPLAYCOMPONENT',
}

export const GenericComponentsList = [ComponentName.DISPLAY_COMPONENT, ComponentName.SELECT_OPTION_COMPONENT];

const ComponentMap = {
    [ComponentName.DISPLAY_COMPONENT]: TaskDisplayComponent,
    [ComponentName.RATING_COMPONENT]: RaterComponent,
    [ComponentName.CHOICE_COMPONENT]: ChoicerComponent,
    [ComponentName.ODDBALL_COMPONENT]: OddballComponent,
    [ComponentName.STROOP_COMPONENT]: StroopComponent,
    [ComponentName.SMILEY_FACE_COMPONENT]: SmileyFaceComponent,
    [ComponentName.NBACK_COMPONENT]: NBackComponent,
    [ComponentName.DEMAND_SELECTION_COMPONENT]: DemandSelectionComponent,
    [ComponentName.TASK_SWITCHING_COMPONENT]: TaskSwitchingComponent,
    [ComponentName.DIGIT_SPAN_COMPONENT]: DigitSpanComponent,
    [ComponentName.SELECT_OPTION_COMPONENT]: SelectOptionComponent,
    [ComponentName.FINGER_TAPPING_COMPONENT]: FingerTappingTaskComponent,
    [ComponentName.TRAIL_MAKING_COMPONENT]: TrailMakingComponent,
    [ComponentName.SART_COMPONENT]: SartComponent,
    [ComponentName.FACE_NAME_ASSOCIATION_COMPONENT]: FaceNameAssociationComponent,
    [ComponentName.QUESTIONNAIRE_COMPONENT]: QuestionnaireComponent,
    [ComponentName.EMBEDDED_PAGE_COMPONENT]: EmbeddedPageComponent,
    [ComponentName.INFO_DISPLAY_COMPONENT]: InfoDisplayComponent,
    [ComponentName.PLT_COMPONENT]: ProbabilisticLearningTaskComponent,
    [ComponentName.IOWA_GAMBLING_COMPONENT]: IowaGamblingTaskComponent,
    [ComponentName.INFORMATION_TASK_COMPONENT]: InformationTaskComponent,
};

@Injectable({
    providedIn: 'root',
})
export class ComponentFactoryService {
    constructor(private injector: Injector, private cfr: ComponentFactoryResolver) {}

    public getComponent(component: ComponentName): ComponentRef<Playable> {
        return this.getComponentByName(component);
    }

    private getComponentByName(componentMapping: ComponentName): ComponentRef<Playable> {
        const component = ComponentMap[componentMapping];
        if (component === undefined) throw new Error("Component doesn't exist: " + componentMapping);

        return this.buildComponent(component);
    }

    private buildComponent(component: any): ComponentRef<any> {
        const componentFactory = this.cfr.resolveComponentFactory(component);

        const componentRef = componentFactory.create(this.injector);
        return componentRef;
    }
}
