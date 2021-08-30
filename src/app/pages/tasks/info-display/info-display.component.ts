import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { IOnComplete, Playable } from "../task-playables/playable";
import { Navigation } from "../shared/navigation-buttons/navigation-buttons.component";

export interface InfoDisplayMetadata {
    title?: string;
    subtitle?: string;
    sections?: InfoDisplaySection[];
    buttons?: InfoDisplayButtonConfig;
}

export interface InfoDisplaySection {
    header: string;
    textContent: string;
}

export interface InfoDisplayButtonConfig {
    buttonText: string;
    buttonStyleType: "primary" | "secondary" | "success" | "warning" | "danger";
    buttonRoute: string;
}

@Component({
    selector: "app-info-display",
    templateUrl: "./info-display.component.html",
    styleUrls: ["./info-display.component.scss"],
})
export class InfoDisplayComponent implements OnInit, OnDestroy, Playable {
    constructor() {}
    onComplete: Subject<IOnComplete>;
    handleComplete(nav: Navigation, data?: any[]): void {
        throw new Error("Method not implemented.");
    }
    configure(metadata: any, config?: any): void {
        throw new Error("Method not implemented.");
    }
    afterInit(): void {
        throw new Error("Method not implemented.");
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {}
}
