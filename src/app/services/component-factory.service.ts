import { ComponentFactoryResolver, ComponentRef, Injectable, Injector, ViewRef } from "@angular/core";
import { DisplayComponent } from "../pages/tasks/display/display.component";
import { Playable } from "../pages/tasks/Playable";
import { RaterComponent } from "../pages/tasks/rating-new/rater/rater.component";

export enum ComponentName {
    DISPLAY_COMPONENT = "DISPLAYCOMPONENT",

    RATING_COMPONMENT = "RATINGCOMPONENT",
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
