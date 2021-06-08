import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { thisOrDefault } from "src/app/common/commonMethods";
import { ComponentName } from "src/app/services/component-factory.service";
import { Navigation } from "../navigation-buttons/navigation-buttons.component";
import { Playable } from "../../playables/playable";

export interface DisplaySection {
    sectionType: "text" | "image-horizontal" | "image-square";
    imagePath?: string;
    textContent?: string;
}

export interface ButtonConfig {
    isStart: boolean;
    previousDisabled: boolean;
    nextDisabled: boolean;
}

export interface DisplayComponentMetadata {
    component: ComponentName;
    content: {
        title?: string;
        subtitle?: string;
        sections?: DisplaySection[];
        buttons?: ButtonConfig;
    };
}

@Component({
    selector: "app-display",
    templateUrl: "./display.component.html",
    styleUrls: ["./display.component.scss"],
})
export class DisplayComponent implements OnInit, OnDestroy, Playable {
    @Input()
    title: string = "";

    @Input()
    subtitle: string = "";

    @Input()
    displaySections: DisplaySection[] = [];

    // default config
    @Input()
    buttonConfig: ButtonConfig = null;

    onComplete = new Subject<{ navigation: Navigation }>();

    constructor() {}

    ngOnInit(): void {}

    ngOnDestroy() {
        this.onComplete.complete();
    }

    handleComplete(nav: Navigation) {
        this.onComplete.next({ navigation: nav });
    }

    onButtonPress(nav: Navigation) {
        this.handleComplete(nav);
    }

    configure(metadata: DisplayComponentMetadata): void {
        this.title = thisOrDefault(metadata.content.title, "");
        this.subtitle = thisOrDefault(metadata.content.subtitle, "");
        this.displaySections = thisOrDefault(metadata.content.sections, []);
        this.buttonConfig = thisOrDefault(metadata.content.buttons, {
            isStart: false,
            previousDisabled: true,
            nextDisabled: false,
        });
    }
}
