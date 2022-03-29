import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export enum Navigation {
    PREVIOUS = 'previous',
    NEXT = 'next',
}

@Component({
    selector: 'app-navigation-buttons',
    templateUrl: './navigation-buttons.component.html',
    styleUrls: ['./navigation-buttons.component.scss'],
})
export class NavigationButtonsComponent implements OnInit {
    wasClicked: boolean = false;

    @Input()
    previousDisabled: boolean = false;

    @Input()
    warn: boolean = false;

    @Input()
    nextDisabled: boolean = false;

    private _isStart: boolean = false;

    @Input()
    set isStart(isStart: boolean) {
        if (isStart) this.forwardButtonText = 'START';
        this._isStart = isStart;
    }

    get isStart(): boolean {
        return this._isStart;
    }

    @Input()
    backButtonText: string = 'PREVIOUS';

    @Input()
    forwardButtonText: string = 'NEXT';

    @Output()
    onPrevious: EventEmitter<Navigation> = new EventEmitter();

    @Output()
    onNext: EventEmitter<Navigation> = new EventEmitter();

    handleNext() {
        if (!this.wasClicked) {
            this.onNext.next(Navigation.NEXT);
            this.wasClicked = true;
        }
    }

    handlePrevious() {
        this.onPrevious.next(Navigation.PREVIOUS);
    }

    constructor() {}

    ngOnInit(): void {
        this.wasClicked = false;
    }
}
