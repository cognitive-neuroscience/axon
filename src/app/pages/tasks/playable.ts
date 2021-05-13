import { Subject } from "rxjs";
import { TaskData } from "src/app/models/TaskData";
import { Navigation } from "./navigation-buttons/navigation-buttons.component";

export interface IOnComplete {
    navigation: Navigation;
    taskData?: TaskData[];
}

export interface Playable {
    onComplete: Subject<IOnComplete>;

    handleComplete(nav: Navigation, data?: any[]): void;

    configure(metadata: any, config?: any): void;
}
