import { UseHand } from "../pages/tasks/playables/finger-tapping/finger-tapping-task.component";
import { RatingTaskCounterBalance } from "../pages/tasks/playables/everyday-choice/rater/rater.component";
import { SmileyFaceTaskCounterbalance } from "../pages/tasks/playables/smiley-face/smiley-face.component";
import { Key, UserResponse } from "./InternalDTOs";

export enum TaskNames {
    ODDBALL = "oddball",
    DIGITSPAN = "digitspan",
    FINGERTAPPING = "fingertapping",
    NBACK = "nback",
    STROOP = "stroop",
    TRAILMAKING = "trailmaking",
    TASKSWITCHING = "taskswitching",
    DEMANDSELECTION = "demandselection",
    SMILEYFACE = "smileyface",
    EVERYDAYCHOICE = "everydaychoice",
}

export abstract class TaskData {
    trial: number;
    userID: string;
    submitted: string; // ISO date string
    isPractice: boolean;
    studyId: number;
}

export class StroopTaskData extends TaskData {
    actualAnswer: UserResponse;
    userAnswer: UserResponse;
    isCongruent: boolean;
    responseTime: number;
    set: number;
    isCorrect: boolean;
    score: number;
}

export class NBackTaskData extends TaskData {
    actualAnswer: UserResponse;
    userAnswer: UserResponse;
    responseTime: number;
    set: number;
    isCorrect: boolean;
    score: number;
}

export class TaskSwitchingTaskData extends TaskData {
    color: string;
    digit: number;
    actualAnswer: UserResponse;
    userAnswer: UserResponse;
    responseTime: number;
    isCorrect: boolean;
    score: number;
}

export class DemandSelectionTaskData extends TaskData {
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
    isCorrect: boolean;
    score: number;
}

export class TrailMakingTaskData extends TaskData {
    trialType: string;
    actualAnswer: string;
    userAnswer: string;
    timeFromLastClick: number;
    isCorrect: boolean;
}

export class FingerTappingTaskData extends TaskData {
    block: number;
    dominantHand: UseHand;
    handUsed: string;
    timeFromLastKeyPress: number;
    keyPressed: Key;
    isCorrect: boolean;
}

export class DigitSpanTaskData extends TaskData {
    actualAnswer: string; // the actual sequence given
    userAnswer: string; // the sequence the user inputs
    responseTime: number; // time from when keypad entered screen to participant submitting their response
    numberOfDigits: number;
    isForwardMemoryMode: boolean;
    isCorrect: boolean;
    score: number;
}

export class OddballTaskData extends TaskData {
    stimulus: string;
    targetResponse: Key;
    responseTime: number;
    actualAnswer: Key;
    userAnswer: string;
    target: string;
    block: number;
    isCorrect: boolean;
    score: number;
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
    isCorrect: boolean;
    score: number;
}

export class EverydayChoiceTaskData extends TaskData {
    taskName: string;
    counterbalance: RatingTaskCounterBalance;
    activity: string;
    question: string;
    userAnswer: number;
    activityType: "DoNothing" | "DoSomething" | "";
    responseTime: number;
}

export class CustomTask {
    customTaskID: string;
    name: string;
    url: string;
    description: string;
}

export class ParticipantData {
    userId: string;
    studyId: number;
    taskOrder: number;
    submittedAt: string;
    data: TaskData[] | { [key: string]: any }[];
}
