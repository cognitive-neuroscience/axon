import { Component, OnInit, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { ParticipantDataService } from "src/app/services/study-data.service";
declare function setFullScreen(): any;
@Component({
    selector: "app-shape-game",
    templateUrl: "./shape-game.component.html",
    styleUrls: ["./shape-game.component.scss"],
})
export class ShapeGameComponent implements OnInit {
    isScored: boolean | number = true;
    showFeedbackAfterEveryTrial: boolean | number = true;
    showScoreAfterEveryTrial: boolean | number = true;
    numberOfBreaks: number = 0;
    maxResponseTime: number = 800;
    durationOfFeedback: number = 500;
    interTrialDelay: number = 1000;
    practiceTrials: number = 5;
    actualTrials: number = 10;
    step: number = 1;
    color: string = "";
    feedback: string = "";
    scoreForSpecificTrial: number = 0;
    totalScore: number = 0;
    isPractice: boolean = false;
    isStimulus: boolean = false;
    isBreak: boolean = false;
    currentTrial: number = 0;
    isResponseAllowed: boolean = false;
    data: any[] = [];
    timer: {
        started: number;
        ended: number;
    } = {
        started: 0,
        ended: 0,
    };
    showFixation: boolean = false;
    sTimeout: any;
    feedbackShown: boolean = false;
    colors = [];

    c = {
        a: "",
        b: "",
        c: "",
        d: "",
        e: "",
        f: "",
    };

    a = {
        a: "s",
        b: "s",
        c: "s",
        d: "s",
        e: "s",
        f: "s",
    };

    s = {
        a: "",
        b: "",
        c: "",
        d: "",
        e: "",
        f: "",
    };

    colors_all = ["blue", "orange", "brown", "grey", "purple"];

    trial_reward_probs = [];
    trial_colors = [];

    @HostListener("window:keydown", ["$event"])
    onKeyPress(event: KeyboardEvent) {
        if (event.key === "z" || event.key === "m") {
            if (this.isResponseAllowed) {
                this.isResponseAllowed = false;
                try {
                    if (!!event.key) {
                        this.timer.ended = new Date().getTime();
                        this.data[this.data.length - 1].responseTime = Number(
                            ((this.timer.ended - this.timer.started) / 1000).toFixed(2)
                        );
                        switch (event.key) {
                            case "z":
                                this.data[this.data.length - 1].userAnswer = "Z";
                                break;
                            case "m":
                                this.data[this.data.length - 1].userAnswer = "M";
                                break;
                        }
                        try {
                            clearTimeout(this.sTimeout);
                            this.showFeedback();
                        } catch (error) {}
                    }
                } catch (error) {}
            }
        }
    }

    constructor(private router: Router, private uploadDataService: ParticipantDataService) {}

    ngOnInit() {}

    proceedtoPreviousStep() {
        this.step -= 1;
    }

    proceedtoNextStep() {
        this.step += 1;
    }

    async startPractice() {
        this.startGameInFullScreen();
        this.resetData();
        this.proceedtoNextStep();
        await this.wait(2000);
        this.proceedtoNextStep();
        this.isPractice = true;
        this.currentTrial = 0;
        this.calculateProbs();
        this.showStimulus();
    }

    async startActualGame() {
        this.resetData();
        this.proceedtoNextStep();
        await this.wait(2000);
        this.proceedtoNextStep();
        this.isPractice = false;
        this.currentTrial = 0;
        this.calculateProbs();
        this.showStimulus();
    }

    calculateProbs() {
        let trials_max = 30;
        if (this.isPractice) {
            trials_max = this.practiceTrials;
        } else {
            trials_max = this.actualTrials;
        }
        this.trial_reward_probs = [];
        this.trial_colors = [];
        for (let i = 0; i < trials_max; i++) {
            if (i < trials_max / 2) {
                this.trial_colors.push("red");
                this.trial_reward_probs.push(0.1);
            } else {
                this.trial_colors.push("teal");
                this.trial_reward_probs.push(0.9);
            }
        }
        this.trial_colors = this.shuffle(this.trial_colors);
        this.trial_reward_probs = this.shuffle(this.trial_reward_probs);
    }

    async showStimulus() {
        this.reset();
        this.showFixation = true;
        await this.wait(500);
        this.showFixation = false;
        await this.wait(200);

        this.currentTrial += 1;
        this.generateStimulus();
        this.isStimulus = true;
        this.isResponseAllowed = true;

        this.timer.started = new Date().getTime();
        this.timer.ended = 0;

        console.log(this.isPractice ? `Practice trial: ${this.currentTrial}` : `Actual trial: ${this.currentTrial}`);

        // This is the delay between showing the stimulus and showing the feedback
        this.sTimeout = setTimeout(() => {
            if (!this.feedbackShown) {
                this.showFeedback();
            }
        }, this.maxResponseTime);
    }

    generateStimulus() {
        this.a.a = "s";
        this.a.b = "s";
        this.a.c = "s";
        this.a.d = "s";
        this.a.e = "s";
        this.a.f = "s";

        this.s = {
            a: "",
            b: "",
            c: "",
            d: "",
            e: "",
            f: "",
        };

        const color = this.trial_colors[this.currentTrial];
        this.colors = this.colors_all.concat(color);
        this.colors = this.shuffle(this.colors);

        this.c.a = this.colors[0];
        this.c.b = this.colors[1];
        this.c.c = this.colors[2];
        this.c.d = this.colors[3];
        this.c.e = this.colors[4];
        this.c.f = this.colors[5];

        const align = Math.floor(Math.random() * 2) + 1 === 1 ? "m" : "z";
        const different = Math.floor(Math.random() * 2) + 1 === 1 ? "rect" : "circle";
        const pos = Math.floor(Math.random() * (5 - 0 + 1)) + 0;
        const props = ["a", "b", "c", "d", "e", "f"];
        this.a[props[pos]] = align;

        if (different === "rect") {
            this.s = {
                a: "circle",
                b: "circle",
                c: "circle",
                d: "circle",
                e: "circle",
                f: "circle",
            };
        } else {
            this.s = {
                a: "rect",
                b: "rect",
                c: "rect",
                d: "rect",
                e: "rect",
                f: "rect",
            };
        }
        this.s[props[pos]] = different;
        this.data.push({
            targetColor: color,
            targetLocation: this.colors.indexOf(color) + 1,
            targetAlignment: (align === "z" ? "horizantal" : "vertical").toUpperCase(),
            actualAnswer: align.toUpperCase(),
            userAnswer: "",
            probability: 0,
            random: 0,
            responseTime: 0,
            isCorrect: 0,
            score: 0,
        });
    }

    async showFeedback() {
        this.feedbackShown = true;
        this.isStimulus = false;
        this.isResponseAllowed = false;

        if (this.data[this.data.length - 1].responseTime === 0) {
            this.timer.ended = new Date().getTime();
            this.data[this.data.length - 1].responseTime = Number(
                ((this.timer.ended - this.timer.started) / 1000).toFixed(2)
            );
        }

        const rand = Math.random();
        const points = rand <= this.trial_reward_probs[this.currentTrial] ? 10 : 1;
        this.data[this.data.length - 1].probability = this.trial_reward_probs[this.currentTrial];
        this.data[this.data.length - 1].random = rand;

        if (this.data[this.data.length - 1].actualAnswer === this.data[this.data.length - 1].userAnswer) {
            this.feedback = "Correct";
            this.data[this.data.length - 1].isCorrect = 1;
            this.data[this.data.length - 1].score = points;
            this.scoreForSpecificTrial = points;
            this.totalScore += points;
        } else {
            if (this.data[this.data.length - 1].userAnswer === "") {
                this.feedback = "Too slow";
            } else {
                this.feedback = "Incorrect";
            }
            this.data[this.data.length - 1].isCorrect = 0;
            this.data[this.data.length - 1].score = 0;
            this.scoreForSpecificTrial = 0;
        }

        if (this.showFeedbackAfterEveryTrial || this.isPractice) {
            await this.wait(this.durationOfFeedback);
        }
        this.decideToContinue();
    }

    async decideToContinue() {
        if (this.isPractice) {
            if (this.currentTrial < this.practiceTrials) {
                this.continueGame();
            } else {
                this.proceedtoNextStep();
                await this.wait(2000);
                this.proceedtoNextStep();
            }
        } else {
            if (this.currentTrial < this.actualTrials) {
                if (this.numberOfBreaks === 0) {
                    this.continueGame();
                } else {
                    const breakAtTrailIndices = [];
                    const setSize = this.actualTrials / (this.numberOfBreaks + 1);
                    for (let i = 1; i < this.numberOfBreaks + 1; i++) {
                        breakAtTrailIndices.push(setSize * i);
                    }
                    if (breakAtTrailIndices.includes(this.currentTrial)) {
                        this.isBreak = true;
                    } else {
                        this.isBreak = false;
                        this.continueGame();
                    }
                }
            } else {
                this.proceedtoNextStep();
                await this.wait(2000);
                this.proceedtoNextStep();
                console.log(this.data);
            }
        }
    }

    resume() {
        this.reset();
        this.isBreak = false;
        this.continueGame();
    }

    async continueGame() {
        await this.wait(this.interTrialDelay);
        this.showStimulus();
    }

    uploadResults() {}

    continueAhead() {
        this.router.navigate(["/dashboard"]);
    }

    reset() {
        this.color = "";
        this.feedback = "";
        this.feedbackShown = false;
        this.scoreForSpecificTrial = 0;
    }

    resetData() {
        this.data = [];
        this.totalScore = 0;
    }

    startGameInFullScreen() {
        setFullScreen();
    }

    wait(time: number): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }

    shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
}
