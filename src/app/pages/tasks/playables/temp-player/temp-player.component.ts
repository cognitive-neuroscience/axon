import { Component, OnInit } from "@angular/core";
import { DemandSelectionLayoutMetadata } from "../demand-selection/demand-selection-layout.metadata";
import { NBackLayoutMetadata } from "../n-back/nback-layout.metadata";
import { OddballLayoutMetadata } from "../oddball/oddball-task.layout.metadata";
import { SmileyFaceLayoutMetadata } from "../smiley-face/smiley-face-layout.metadata";
import { StroopLayoutMetadata } from "../stroop/stroop-layout.metadata";
import { TaskPlayerComponent } from "../task-player/task-player.component";

@Component({
    selector: "app-temp-player",
    templateUrl: "./temp-player.component.html",
    styleUrls: ["./temp-player.component.scss"],
})
export class TempPlayerComponent extends TaskPlayerComponent implements OnInit {
    ngOnInit(): void {
        this.handleTaskVariablesAndPlayTask(DemandSelectionLayoutMetadata);
    }
}
