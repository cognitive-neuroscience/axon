import { ComponentFactoryResolver, ComponentRef, Injectable, Injector } from '@angular/core';
import { TaskDisplayComponent } from '../pages/tasks/shared/task-display/task-display.component';
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
import { SelectOptionComponent } from '../pages/tasks/shared/select-option/select-option.component';
import { FingerTappingTaskComponent } from '../pages/tasks/task-playables/finger-tapping/finger-tapping-task.component';
import { TrailMakingComponent } from '../pages/tasks/task-playables/trail-making/trail-making.component';
import { SartComponent } from '../pages/tasks/task-playables/sart/sart.component';

export enum ComponentName {
    // Generic components
    DISPLAY_COMPONENT = 'DISPLAYCOMPONENT',
    SELECT_OPTION_COMPONENT = 'SELECTOPTIONCOMPONENT',

    // Task related components
    RATING_COMPONMENT = 'RATINGCOMPONENT',
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
}

export const GenericComponentsList = [ComponentName.DISPLAY_COMPONENT, ComponentName.SELECT_OPTION_COMPONENT];

const ComponentMap = {
    [ComponentName.DISPLAY_COMPONENT]: TaskDisplayComponent,
    [ComponentName.RATING_COMPONMENT]: RaterComponent,
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
