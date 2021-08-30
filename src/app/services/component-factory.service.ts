import { ComponentFactoryResolver, ComponentRef, Injectable, Injector } from "@angular/core";
import { TaskDisplayComponent } from "../pages/tasks/shared/task-display/task-display.component";
import { Playable } from "../pages/tasks/task-playables/playable";
import { RaterComponent } from "../pages/tasks/task-playables/everyday-choice/rater/rater.component";
import { ChoicerComponent } from "../pages/tasks/task-playables/everyday-choice/choicer/choicer.component";
import { OddballComponent } from "../pages/tasks/task-playables/oddball/oddball.component";
import { StroopComponent } from "../pages/tasks/task-playables/stroop/stroop.component";
import { SmileyFaceComponent } from "../pages/tasks/task-playables/smiley-face/smiley-face.component";
import { NBackComponent } from "../pages/tasks/task-playables/n-back/n-back.component";
import { DemandSelectionComponent } from "../pages/tasks/task-playables/demand-selection/demand-selection.component";
import { TaskSwitchingComponent } from "../pages/tasks/task-playables/task-switching/task-switching.component";
import { DigitSpanComponent } from "../pages/tasks/task-playables/digit-span/digit-span.component";
import { SelectOptionComponent } from "../pages/tasks/shared/select-option/select-option.component";
import { FingerTappingTaskComponent } from "../pages/tasks/task-playables/finger-tapping/finger-tapping-task.component";
import { TrailMakingComponent } from "../pages/tasks/task-playables/trail-making/trail-making.component";

export enum ComponentName {
    // Generic components
    DISPLAY_COMPONENT = "DISPLAYCOMPONENT",
    SELECT_OPTION_COMPONENT = "SELECTOPTIONCOMPONENT",

    // Task related components
    RATING_COMPONMENT = "RATINGCOMPONENT",
    CHOICE_COMPONENT = "CHOICECOMPONENT",
    ODDBALL_COMPONENT = "ODDBALLCOMPONENT",
    STROOP_COMPONENT = "STROOPCOMPONENT",
    SMILEY_FACE_COMPONENT = "SMILEYFACECOMPONENT",
    NBACK_COMPONENT = "NBACKCOMPONENT",
    DEMAND_SELECTION_COMPONENT = "DEMANDSELECTIONCOMPONENT",
    TASK_SWITCHING_COMPONENT = "TASKSWITCHINGCOMPONENT",
    DIGIT_SPAN_COMPONENT = "DIGITSPANCOMPONENT",
    FINGER_TAPPING_COMPONENT = "FINGERTAPPINGCOMPONENT",
    TRAIL_MAKING_COMPONENT = "TRAILMAKINGCOMPONENT",
}

export const GenericComponentsList = [ComponentName.DISPLAY_COMPONENT, ComponentName.SELECT_OPTION_COMPONENT];

@Injectable({
    providedIn: "root",
})
export class ComponentFactoryService {
    constructor(private injector: Injector, private cfr: ComponentFactoryResolver) {}

    public getComponent(component: ComponentName): ComponentRef<Playable> {
        return this.getComponentByName(component);
    }

    private getComponentByName(componentMapping: ComponentName): ComponentRef<Playable> {
        switch (componentMapping) {
            case ComponentName.DISPLAY_COMPONENT:
                return this.buildComponent(TaskDisplayComponent);
            case ComponentName.RATING_COMPONMENT:
                return this.buildComponent(RaterComponent);
            case ComponentName.CHOICE_COMPONENT:
                return this.buildComponent(ChoicerComponent);
            case ComponentName.ODDBALL_COMPONENT:
                return this.buildComponent(OddballComponent);
            case ComponentName.STROOP_COMPONENT:
                return this.buildComponent(StroopComponent);
            case ComponentName.SMILEY_FACE_COMPONENT:
                return this.buildComponent(SmileyFaceComponent);
            case ComponentName.NBACK_COMPONENT:
                return this.buildComponent(NBackComponent);
            case ComponentName.DEMAND_SELECTION_COMPONENT:
                return this.buildComponent(DemandSelectionComponent);
            case ComponentName.TASK_SWITCHING_COMPONENT:
                return this.buildComponent(TaskSwitchingComponent);
            case ComponentName.DIGIT_SPAN_COMPONENT:
                return this.buildComponent(DigitSpanComponent);
            case ComponentName.SELECT_OPTION_COMPONENT:
                return this.buildComponent(SelectOptionComponent);
            case ComponentName.FINGER_TAPPING_COMPONENT:
                return this.buildComponent(FingerTappingTaskComponent);
            case ComponentName.TRAIL_MAKING_COMPONENT:
                return this.buildComponent(TrailMakingComponent);
            default:
                throw new Error("Component doesn't exist: " + componentMapping);
        }
    }

    private buildComponent(component: any): ComponentRef<any> {
        const componentFactory = this.cfr.resolveComponentFactory(component);
        const componentRef = componentFactory.create(this.injector);
        return componentRef;
    }
}
