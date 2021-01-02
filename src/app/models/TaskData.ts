import { RouteMap } from "../routing/routes";

export enum TaskNames {
    GONOGO = "gonogo",
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
    SMILEYFACE = "smileyface"
}

export abstract class TaskData {
    trial: number;
    userID: string;
    score: number;
    submitted: string;  // ISO date string
    isPractice: boolean;
    isCorrect: boolean;
    experimentCode: string;
}

export interface Stimuli {
    set: any[]
}

export class StroopTask extends TaskData {
    actualAnswer:   string;
    userAnswer:     string;
    isCongruent:    boolean;
    responseTime:   number;
    set:            number;
}

export class StroopTaskStimuli implements Stimuli {
    set: {
        trial: number;
        color: string;
        congruent: number;
        word: string;
    }[]
}

export class NBack extends TaskData {
    actualAnswer: string;
    userAnswer: string;
    responseTime: number;
    set: number;
}

export class NBackStimuli implements Stimuli {
    set: {
        trial: number;
        currentLetter: string;
        nback: string;
    }[]
}

export class TaskSwitching extends TaskData {
    color: string;
    digit: number;
    actualAnswer: string;
    userAnswer: string;
    responseTime: number;
}

export class DemandSelection extends TaskData {
    firstPatch: string;
    secondPatch: string;
    selectedPatch: string;
    harderPatch: string;
    selectPatchResponseTime: number;
    respondToNumberResponseTime: number;
    taskGoal: string;   // which counter balance for blocks 5 and 6
    color: string;
    digit: number;
    actualAnswer: string;
    userAnswer: string;
    block: number;
    rotation: number;
}

export class TrailMaking extends TaskData {
    trialType: string;
    actualAnswer: string;
    userAnswer: string;
    timeFromLastClick: number;
}

export function mapTaskIdToTitle(task: string) {
    switch (task) {
        case "demographics_questionnaire_responses":
            return "Demographics Questionnaire";
        case "feedback_questionnaire_responses":
            return "Feedback Questionnaire";
        case "experiment_user":
            return "Registered Participants"
        default:
            return RouteMap[task].title
    }
  }