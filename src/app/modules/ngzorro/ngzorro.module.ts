import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NzSliderModule } from "ng-zorro-antd/slider";

const modules = [NzSliderModule];

@NgModule({
    declarations: [],
    imports: [CommonModule, modules],
    exports: [modules],
})
export class NgZorroModule {}
