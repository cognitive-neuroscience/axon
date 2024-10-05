import { Component, ErrorHandler, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { wait } from 'src/app/common/commonMethods';
import { BaseParticipantData } from 'src/app/models/ParticipantData';
import { LoaderService } from 'src/app/services/loader/loader.service';
import { Navigation } from '../shared/navigation-buttons/navigation-buttons.component';
import { Playable, IOnComplete } from './playable';
import { ComponentMetadata, TaskPlayerState } from './task-player/task-player.component';
declare function setFullScreen(): any;

@Component({ template: '' })
export abstract class AbstractBaseTaskComponent implements OnInit, Playable, OnDestroy {
    // shared state variables
    userID: string;
    studyId: number;
    config: TaskPlayerState;

    // base task local state variables
    taskData: BaseParticipantData[];
    onComplete: Subject<IOnComplete> = new Subject();
    isDestroyed = false;
    showLoaderOnInitDuration = 2000;
    showLoaderOnEndDuration = 1000;
    subscriptions: Subscription[] = [];

    // constants
    TRANSLATION_PREFIX = `tasks.feedback.`;

    // task lifecycle part 0: show loader for 2 seconds (as fixation) and then move onto the task
    constructor(protected loaderService: LoaderService) {}

    ngOnInit(): void {
        this.loaderService.showLoader();
        setTimeout(() => {
            this.loaderService.hideLoader();
            if (this.isDestroyed) return;
            this.start();
        }, this.showLoaderOnInitDuration);
    }

    // task lifecycle part 1: configure metadata and any higher level task configs
    abstract configure(metadata: ComponentMetadata, config?: TaskPlayerState);

    // task lifecycle part 2: setup anything needed by the task and begin the round
    start() {
        this.beginRound();
    }

    // task lifecycle part 3: show the necessary stimulus and present something to the user
    abstract beginRound();

    // task lifecycle part 4: handle the user interaction or event that causes the round to move on
    handleRoundInteraction(_any: any) {
        this.completeRound();
    }

    // task lifecycle part 5: clean up the stimulus and record any data if necessary once round is over
    completeRound() {
        this.decideToRepeat();
    }

    // task lifecycle part 6: decide whether to do another round of the task or complete
    async decideToRepeat() {
        this.loaderService.showLoader();
        await wait(this.showLoaderOnEndDuration);
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

    handleSkip() {
        this.onComplete.next({
            navigation: Navigation.NEXT,
            taskData: this.taskData,
            wasSkipped: true,
        });
    }

    afterInit() {}

    ngOnDestroy() {
        this.isDestroyed = true;
        this.onComplete.complete();
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
}
