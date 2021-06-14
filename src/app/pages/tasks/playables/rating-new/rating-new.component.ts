import { Component } from "@angular/core";
import { TaskData } from "src/app/models/TaskData";
import { TaskPlayerComponent } from "../task-player/task-player.component";
import { EverydayChoiceLayoutMetadata } from "./everyday-choice-task-layout.metadata";
import { RatingTaskCounterBalance } from "./rater/rater.component";

export class EverydayChoiceTaskData extends TaskData {
    taskName: string;
    counterbalance: RatingTaskCounterBalance;
    activity: string;
    question: string;
    userAnswer: number;
    activityType: "DoNothing" | "DoSomething" | "";
    responseTime: number;
}

@Component({
    selector: "app-rating-task",
    templateUrl: "./rating-new.component.html",
    styleUrls: ["./rating-new.component.scss"],
})
export class RatingNewComponent extends TaskPlayerComponent {
    ngOnInit() {
        // read the json config file in the future
        this.handleTaskVariablesAndPlayTask(EverydayChoiceLayoutMetadata);
    }
}
