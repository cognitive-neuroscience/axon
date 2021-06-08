import { MatSnackBar } from "@angular/material/snack-bar";
import { SnackbarType, TaskType } from "./enums";
import { Task } from "./Task";
export class JsonForm {
    img: string;
    title: string;
    summary: {
        caption: string;
        words: string[];
    }[];
    secondTitle: string;
    body: {
        caption: string;
        words: string[];
    }[];
    endMessage: string;
    buttons: {
        reject: {
            show: boolean;
            text: string;
        };
        accept: {
            show: boolean;
            text: string;
        };
    };
}

export class JitteredInterval {
    lowerbound: number;
    upperbound: number;
}

export class ConfirmationDialogMessage {
    message: string;

    constructor(msg: string) {
        this.message = msg;
    }
}

export class SnackbarData {
    message: string;
    action: string;
    type: SnackbarType;
    snackbarRef: MatSnackBar;

    constructor(msg: string, act: string, type: SnackbarType) {
        this.message = msg;
        this.action = act;
        this.type = type;
    }
}

export class EmbeddedPageData {
    ID: string;
    taskType: TaskType;
}

// enum that represents valid keys for the user to input
export enum Key {
    ARROWLEFT = "ArrowLeft",
    ARROWRIGHT = "ArrowRight",
    NUMONE = "1",
    NUMTWO = "2",
    NUMTHREE = "3",
    NUMFOUR = "4",
    NUMFIVE = "5",
    Q = "q",
    P = "p",
    Z = "z",
    M = "m",
}

export enum Color {
    BLUE = "blue",
    ORANGE = "orange",
    TRANSPARENT = "transparent",
}

export class StudiesRoutingMap {
    [key: string]: Task;
}

export enum Feedback {
    CORRECT = "Correct",
    INCORRECT = "Incorrect",
    TOOSLOW = "Too slow",
    NORESPONSE = "No response",
}

// an enum representing the semantic answer given by the user that gets uploaded to the database
export enum UserResponse {
    GREATER = "GREATER",
    LESSER = "LESSER",
    ODD = "ODD",
    EVEN = "EVEN",
    NA = "NA",
    INVALID = "INVALID",
    RED = "RED",
    GREEN = "GREEN",
    BLUE = "BLUE",
    NO = "NO",
    YES = "YES",
    LEFT = "LEFT",
    RIGHT = "RIGHT",
    BOTH = "BOTH",
    SHORT = "SHORT",
    LONG = "LONG",
}

// special strings that are important to the backend
export enum BEStrings {
    EXPERIMENTUSERS = "experiment_users",
    FEEDBACKQUESTIONNAIRE = "feedback_questionnaire_responses",
}
