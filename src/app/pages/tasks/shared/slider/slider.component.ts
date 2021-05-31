import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NzMarks } from "ng-zorro-antd/slider";

@Component({
    selector: "app-slider",
    templateUrl: "./slider.component.html",
    styleUrls: ["./slider.component.scss"],
})
export class SliderComponent implements OnInit {
    @Input()
    marks: NzMarks = {};

    @Input()
    shouldReverseLegend: boolean = false;

    @Input()
    startingValue: number = 50;

    @Output()
    sliderValueSelected: EventEmitter<number> = new EventEmitter();

    constructor() {}

    ngOnInit(): void {}

    onSelectSlideValue($event: number) {
        this.sliderValueSelected.next($event);
    }
}
