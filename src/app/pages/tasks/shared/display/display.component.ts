import { Component, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
import { thisOrDefault } from "src/app/common/commonMethods";
import { ComponentName } from "src/app/services/component-factory.service";
import { Navigation } from "../navigation-buttons/navigation-buttons.component";
import { Playable } from "../../playables/playable";
import { TaskConfig } from "../../playables/task-player/task-player.component";

export interface DisplaySection {
    sectionType: "text" | "image-horizontal" | "image-square" | "image-small";
    imagePath?: string;
    imageAlignment?: "left" | "center" | "right";
    textContent?: string;
    injection: "counterbalance" | "counterbalance-alternative" | "cached-string";
    cacheKey: string;
}

export interface ButtonConfig {
    isStart: boolean;
    previousDisabled: boolean;
    nextDisabled: boolean;
}

export interface DisplayComponentMetadata {
    component: ComponentName;
    skippable?: boolean;
    skippableCacheKey: string;
    content: {
        title?: string;
        timerConfig?: {
            timer: number;
            showTimer: boolean;
            canSkipTimer: boolean;
            countDown: boolean;
        };
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
export class DisplayComponent implements OnDestroy, Playable {
    // metadata variables
    title: string = "";
    subtitle: string = "";
    displaySections: DisplaySection[] = [];
    buttonConfig: ButtonConfig = null;
    private canSkipTimer: boolean;
    skippable: boolean = false;
    cacheKey: string = "";

    // config variables
    config: TaskConfig;
    counterbalanceStr: string;
    counterbalanceAltStr: string;

    // local state variables
    showTimer: boolean = false;
    timerMode: boolean = false;
    timerDisplayValue: number;
    timerCountDown: boolean = false;
    showNavigationButtons: boolean = true;

    // intervals/timers
    interval: number;

    // inherited
    onComplete = new Subject<{ navigation: Navigation }>();

    constructor() {}

    ngOnDestroy() {
        clearInterval(this.interval);
        this.onComplete.complete();
    }

    handleComplete(nav: Navigation) {
        clearInterval(this.interval);
        this.onComplete.next({ navigation: nav });
    }

    onButtonPress(nav: Navigation) {
        this.handleComplete(nav);
    }

    injectString(section: DisplaySection, text: string): string {
        switch (section.injection) {
            case "cached-string":
                const cachedVar = thisOrDefault(this.config.getCacheValue(section.cacheKey), "");
                return text.replace("???", cachedVar);
            case "counterbalance":
                return text.replace("???", this.counterbalanceStr);
            case "counterbalance-alternative":
                return text.replace("???", this.counterbalanceAltStr);
            default:
                return text;
        }
    }

    configure(metadata: DisplayComponentMetadata, config: TaskConfig): void {
        this.config = config;

        this.skippable = thisOrDefault(metadata.skippable, false);
        this.cacheKey = thisOrDefault(metadata.skippableCacheKey, "");

        this.title = thisOrDefault(metadata.content.title, "");
        this.subtitle = thisOrDefault(metadata.content.subtitle, "");
        this.displaySections = thisOrDefault(metadata.content.sections, []);
        this.timerMode = thisOrDefault(!!metadata.content.timerConfig, false);
        this.buttonConfig = thisOrDefault(metadata.content.buttons, {
            isStart: false,
            previousDisabled: true,
            nextDisabled: false,
        });

        // search the display sections to see if counterbalance needs to be injected
        if (!!metadata.content.sections.find((section) => section.injection === "counterbalance")) {
            this.counterbalanceStr = config.counterBalanceGroups[config.counterbalanceNumber];
        }

        // search the display sections to see if counterbalance alt needs to be injected
        if (!!metadata.content.sections.find((section) => section.injection === "counterbalance-alternative")) {
            // 3 - 1 == 2, and 3 - 2 == 1. This gives us the value that is not the counterbalance target value
            this.counterbalanceAltStr = config.counterBalanceGroups[3 - config.counterbalanceNumber];
        }

        if (this.timerMode) {
            this.buttonConfig = {
                isStart: false,
                previousDisabled: true,
                nextDisabled: false,
            };
            this.timerCountDown = thisOrDefault(metadata.content.timerConfig.countDown, false);
            this.showTimer = thisOrDefault(metadata.content.timerConfig.showTimer, false);
            this.canSkipTimer = thisOrDefault(metadata.content.timerConfig.canSkipTimer, false);
            this.showNavigationButtons = this.canSkipTimer;

            this.timerCountDown
                ? this.startTimerReverse(metadata.content.timerConfig.timer / 1000)
                : this.startTimer(metadata.content.timerConfig.timer / 1000);
        }
    }

    afterInit() {
        if (this.skippable && this.cacheKey) {
            const shouldSkip = this.config.getCacheValue(this.cacheKey);
            if (shouldSkip === undefined) return; // no cached value, do not skip
            else if(shouldSkip) this.handleComplete(Navigation.NEXT);
        }
    }

    startTimer(duration: number) {
        this.timerDisplayValue = 1;
        this.interval = window.setInterval(() => {
            this.timerDisplayValue++;
            if (this.timerDisplayValue > duration) {
                clearInterval(this.interval);
                this.handleComplete(Navigation.NEXT);
                return;
            }
            return;
        }, 1000);
    }

    startTimerReverse(duration: number) {
        this.timerDisplayValue = duration;
        this.interval = window.setInterval(() => {
            this.timerDisplayValue--;
            if (this.timerDisplayValue < 0) {
                clearInterval(this.interval);
                this.handleComplete(Navigation.NEXT);
                return;
            }
            return;
        }, 1000);
    }
}
