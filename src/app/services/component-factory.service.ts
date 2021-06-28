import { ComponentFactoryResolver, ComponentRef, Injectable, Injector } from "@angular/core";
import { DisplayComponent } from "../pages/tasks/shared/display/display.component";
import { Playable } from "../pages/tasks/playables/playable";
import { RaterComponent } from "../pages/tasks/playables/rating-new/rater/rater.component";
import { ChoicerComponent } from "../pages/tasks/playables/rating-new/choicer/choicer.component";
import { OddballComponent } from "../pages/tasks/playables/oddball/oddball.component";
import { StroopComponent } from "../pages/tasks/playables/stroop/stroop.component";
import { SmileyFaceComponent } from "../pages/tasks/playables/smiley-face/smiley-face.component";
import { NBackComponent } from "../pages/tasks/playables/n-back/n-back.component";
import { DemandSelectionComponent } from "../pages/tasks/playables/demand-selection/demand-selection.component";
import { TaskSwitchingComponent } from "../pages/tasks/playables/task-switching/task-switching.component";
import { DigitSpanComponent } from "../pages/tasks/playables/digit-span/digit-span.component";
import { SelectOptionComponent } from "../pages/tasks/shared/select-option/select-option.component";
import { FingerTappingTaskComponent } from "../pages/tasks/playables/finger-tapping/finger-tapping-task.component";

export enum ComponentName {
    DISPLAY_COMPONENT = "DISPLAYCOMPONENT",
    RATING_COMPONMENT = "RATINGCOMPONENT",
    CHOICE_COMPONENT = "CHOICECOMPONENT",
    ODDBALL_COMPONENT = "ODDBALLCOMPONENT",
    STROOP_COMPONENT = "STROOPCOMPONENT",
    SMILEY_FACE_COMPONENT = "SMILEYFACECOMPONENT",
    NBACK_COMPONENT = "NBACKCOMPONENT",
    DEMAND_SELECTION_COMPONENT = "DEMANDSELECTIONCOMPONENT",
    TASK_SWITCHING_COMPONENT = "TASKSWITCHINGCOMPONENT",
    DIGIT_SPAN_COMPONENT = "DIGITSPANCOMPONENT",
    SELECT_OPTION_COMPONENT = "SELECTOPTIONCOMPONENT",
    FINGER_TAPPING_COMPONENT = "FINGERTAPPINGCOMPONENT",
}

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
                return this.buildComponent(DisplayComponent);
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
