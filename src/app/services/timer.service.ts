import { Injectable } from '@angular/core';

@Injectable({
    providedIn: "root"
})
export class TimerService {

    private timer = null;

    constructor() {}

    startTimer() {
        this.timer = Date.now();
    }

    clearTimer() {
        this.timer = null;
    }

    // returns time in milliseconds since timer was started
    stopTimerAndGetTime(): number {
        if(!this.timer) {
            console.error("Error getting time")
            return 0;
        }
        const time = Date.now() - this.timer;
        this.timer = null;
        return time;
    }
}