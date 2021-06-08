import { ComponentFactoryResolver, ComponentRef, Injectable, Injector } from "@angular/core";
import { DisplayComponent } from "../pages/tasks/shared/display/display.component";
import { Playable } from "../pages/tasks/playables/playable";
import { RaterComponent } from "../pages/tasks/playables/rating-new/rater/rater.component";
import { ChoicerComponent } from "../pages/tasks/playables/rating-new/choicer/choicer.component";

export enum ComponentName {
    DISPLAY_COMPONENT = "DISPLAYCOMPONENT",

    RATING_COMPONMENT = "RATINGCOMPONENT",

    CHOICE_COMPONENT = "CHOICECOMPONENT",
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
