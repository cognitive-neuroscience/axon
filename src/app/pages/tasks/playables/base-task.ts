import { Component, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
import { wait } from "src/app/common/commonMethods";
import { TaskData } from "src/app/models/TaskData";
import { LoaderService } from "src/app/services/loader/loader.service";
import { Navigation } from "../shared/navigation-buttons/navigation-buttons.component";
import { Playable, IOnComplete } from "./playable";
import { TaskConfig } from "./task-player/task-player.component";
declare function setFullScreen(): any;

@Component({ template: "" })
export abstract class AbstractBaseTaskComponent implements Playable, OnDestroy {
    // shared state variables
    userID: string;
    studyId: number;
    config: TaskConfig;

    // base task local state variables
    taskData: TaskData[];
    onComplete: Subject<IOnComplete> = new Subject();
    isDestroyed = false;

    // task lifecycle part 0: show loader for 2 seconds (as fixation) and then move onto the task
    constructor(protected loaderService: LoaderService) {
        loaderService.showLoader();
        setTimeout(() => {
            if (this.isDestroyed) return;
            loaderService.hideLoader();
            this.start();
        }, 2000);
    }

    // task lifecycle part 1: configure metadata and any higher level task configs
    abstract configure(metadata: any, config?: any);

    // task lifecycle part 2: setup anything needed by the task and begin the round
    start() {
        this.beginRound();
    }

    // task lifecycle part 3: show the necessary stimulus and present something to the user
    abstract beginRound();

    // task lifecycle part 4: handle the user interaction or event that causes the round to move on
    handleRoundInteraction(any) {
        this.completeRound();
    }

    // task lifecycle part 5: clean up the stimulus and record any data if necessary once round is over
    completeRound() {
        this.decideToRepeat();
    }

    // task lifecycle part 6: decide whether to do another round of the task or complete
    async decideToRepeat() {
        this.loaderService.showLoader();
        await wait(2000);
        this.loaderService.hideLoader();
        this.handleComplete();
    }

    handleComplete() {
        this.onComplete.next({
            navigation: Navigation.NEXT,
            taskData: this.taskData,
        });
        return;
    }

    afterInit() {}

    ngOnDestroy() {
        this.isDestroyed = true;
        this.onComplete.complete();
        return;
    }

    async startGameInFullScreen() {
        setFullScreen();
        await wait(1000); // delay to allow screen to expand
        if (this.isDestroyed) return;
    }
}
