import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

export enum Navigation {
    PREVIOUS = "previous",
    NEXT = "next",
}

@Component({
    selector: "app-navigation-buttons",
    templateUrl: "./navigation-buttons.component.html",
    styleUrls: ["./navigation-buttons.component.scss"],
})
export class NavigationButtonsComponent implements OnInit {
    @Input()
    previousDisabled: boolean = false;

    @Input()
    nextDisabled: boolean = false;

    @Input()
    isStart: boolean = false;

    @Output()
    onPrevious: EventEmitter<Navigation> = new EventEmitter();

    @Output()
    onNext: EventEmitter<Navigation> = new EventEmitter();

    handleNext() {
        this.onNext.next(Navigation.NEXT);
    }

    handlePrevious() {
        this.onPrevious.next(Navigation.PREVIOUS);
    }

    constructor() {}

    ngOnInit(): void {}
}
