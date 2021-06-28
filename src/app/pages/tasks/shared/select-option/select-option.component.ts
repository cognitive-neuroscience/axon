import { Component } from "@angular/core";
import { Subject } from "rxjs";
import { ComponentName } from "src/app/services/component-factory.service";
import { Playable } from "../../playables/playable";
import { TaskConfig } from "../../playables/task-player/task-player.component";
import { Navigation } from "../navigation-buttons/navigation-buttons.component";

interface SelectOptionMetadata {
    component: ComponentName;
    content: {
        question: string;
        cacheKey: string;
        options: {
            label: string;
            value: any;
        }[];
    };
}

@Component({
    selector: "app-select-option",
    templateUrl: "./select-option.component.html",
    styleUrls: ["./select-option.component.scss"],
})
export class SelectOptionComponent implements Playable {
    config: TaskConfig;

    question: string = "";
    cacheKey: string = "";
    options: {
        label: string;
        value: any;
    }[] = [];

    constructor() {}

    handleSelectOption(selectedOption: string) {
        this.config.setCacheValue(this.cacheKey, selectedOption);
        this.handleComplete(Navigation.NEXT);
    }

    onComplete = new Subject<{ navigation: Navigation }>();

    handleComplete(nav: Navigation) {
        this.onComplete.next({ navigation: nav });
    }

    configure(metadata: SelectOptionMetadata, config: TaskConfig): void {
        this.config = config;

        this.question = metadata.content.question;
        this.cacheKey = metadata.content.cacheKey;
        this.options = metadata.content.options;
    }

    afterInit(): void {}
}
