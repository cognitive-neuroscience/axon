import { SmileyFaceTaskCounterbalance } from "../pages/tasks/playables/smiley-face/smiley-face.component";
import { BEStrings, Key, UserResponse } from "./InternalDTOs";

export enum TaskNames {
    ODDBALL = "oddball",
    DIGITSPAN = "digitspan",
    FINGERTAPPING = "fingertapping",
    NBACK = "nback",
    STROOP = "stroop",
    TRAILMAKING = "trailmaking",
    COLORGAME = "colorgame",
    SHAPEGAME = "shapegame",
    TASKSWITCHING = "taskswitching",
    DEMANDSELECTION = "demandselection",
    SIMON = "simon",
    SMILEYFACE = "smileyface",
    RATING = "rating",
    CHOICE = "choice",
    POSTCHOICE = "postchoice",
    RATINGNEW = "ratingnew",
    CHOICENEW = "choicenew",
}

export abstract class TaskData {
    trial: number;
    userID: string;
    score: number;
    submitted: string; // ISO date string
    isPractice: boolean;
    isCorrect: boolean;
    studyCode: string;
}

export interface Stimuli {
    set: any[];
}

export class StroopTaskData extends TaskData {
    actualAnswer: UserResponse;
    userAnswer: UserResponse;
    isCongruent: boolean;
    responseTime: number;
    set: number;
}

export class NBackTaskData extends TaskData {
    actualAnswer: UserResponse;
    userAnswer: UserResponse;
    responseTime: number;
    set: number;
}

export class NBackStimuli implements Stimuli {
    set: {
        trial: number;
        currentLetter: string;
        nback: string;
    }[];
}

export class TaskSwitching extends TaskData {
    color: string;
    digit: number;
    actualAnswer: UserResponse;
    userAnswer: UserResponse;
    responseTime: number;
}

export class DemandSelection extends TaskData {
    firstPatch: string;
    secondPatch: string;
    selectedPatch: string;
    harderPatch: string;
    selectPatchResponseTime: number;
    respondToNumberResponseTime: number;
    taskGoal: string; // which counter balance for blocks 5 and 6
    color: string;
    digit: number;
    actualAnswer: UserResponse;
    userAnswer: UserResponse;
    block: number;
    rotation: number;
}

export class TrailMaking extends TaskData {
    trialType: string;
    actualAnswer: string;
    userAnswer: string;
    timeFromLastClick: number;
}

export class FingerTapping extends TaskData {
    block: number;
    dominantHand: UserResponse;
    handUsed: string;
    timeFromLastKeyPress: number;
    keyPressed: Key;
}

export class DigitSpan extends TaskData {
    actualAnswer: string; // the actual sequence given
    userAnswer: string; // the sequence the user inputs
    responseTime: number; // time from when keypad entered screen to participant submitting their response
    numberOfDigits: number;
    isForwardMemoryMode: boolean;
}

export class RatingTask extends TaskData {
    counterbalance: number;
    ratingType: string;
    activity: string;
    userAnswer: string;
    responseTime: number;
}

export class ChoiceTask extends TaskData {
    activityLeft: string;
    activityRight: string;
    userAnswer: string;
    responseTime: number;
}

export class PostChoiceTask extends TaskData {
    ratingType: string;
    activity: string;
    userAnswer: string;
    responseTime: number;
}

export class OddballTaskData extends TaskData {
    stimulus: string;
    targetResponse: Key;
    responseTime: number;
    actualAnswer: Key;
    userAnswer: string;
    target: string;
    block: number;
}

export class SmileyFaceTaskData extends TaskData {
    actualAnswer: string;
    userAnswer: string;
    responseTime: number;
    block: number;
    stimulus: string;
    keyPressed: string;
    rewarded: boolean;
    isRescheduledReward: boolean;
    rewardedMore: SmileyFaceTaskCounterbalance;
}

export function mapTaskIdToTitle(task: string) {
    switch (task) {
        case "demographicsquestionnaire":
            return "Demographics Questionnaire";
        case BEStrings.FEEDBACKQUESTIONNAIRE:
            return "Feedback Questionnaire";
        case BEStrings.EXPERIMENTUSERS:
            return "Registered Participants";
        default:
            return "";
    }
}

export class CustomTask {
    customTaskID: string;
    name: string;
    url: string;
    description: string;
}
