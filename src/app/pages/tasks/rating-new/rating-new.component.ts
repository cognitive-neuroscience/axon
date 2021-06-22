import { Component } from "@angular/core";
import { UserResponse } from "src/app/models/InternalDTOs";
import { TaskData } from "src/app/models/TaskData";
import { RatingTaskCounterBalance } from "src/app/services/data-generation/raw-data/rating-task-data-list";
import { TaskPlayerComponent } from "../task-player/task-player.component";
import { EverydayChoiceLayoutMetadata } from "./everyday-choice-task-layout.metadata";

export class EverydayChoiceTaskData extends TaskData {
    taskName: string;
    counterbalance: RatingTaskCounterBalance;
    activityLeft: string;
    activityRight: string;
    question: string;
    userAnswer: string;
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
