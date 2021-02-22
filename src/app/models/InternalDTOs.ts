import { MatSnackBar } from '@angular/material/snack-bar';
import { Task } from './Task';
export class ConsentForm {
    img: string;
    title: string;
    summary: {
        caption: string,
        words: string[]
    }[];
    secondTitle: string;
    body: {
        caption: string,
        words: string[]
    }[];
    endMessage: string;
}

export class JitteredInterval {
    lowerbound: number;
    upperbound: number;
}

export enum SnackbarType {
    SUCCESS = "SUCCESS",
    ERROR = "ERROR",
    INFO = "INFO"
}

export enum Role {
    ADMIN = "ADMIN",
    PARTICIPANT = "PARTICIPANT",
    GUEST = "GUEST" // access to admin views but cannot make any calls to backend
}

export class ConfirmationDialogMessage {
    message: string

    constructor(msg: string) {
        this.message = msg
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

export enum LoginMode {
    LOGIN = "LOGIN",
    REGISTER = "REGISTER",
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
    Z = 'z',
    M = 'm'
}

export enum Color {
    BLUE = "blue",
    ORANGE = "orange",
    TRANSPARENT = "transparent"
  }

export class ExperimentRoutingMap {
    [key: string]: Task
}

export enum Feedback {
    CORRECT = "Correct",
    INCORRECT = "Incorrect",
    TOOSLOW = "Too slow",
    NORESPONSE = "No response"
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
    LONG = "LONG"
}


export enum TaskType {
    NAB = "NAB",
    Experimental = "Experimental",
    Questionnaire = "Questionnaire"
}

// special strings that are important to the backend
export enum BEStrings {
    EXPERIMENTUSERS = "experiment_users",
    FEEDBACKQUESTIONNAIRE = "feedback_questionnaire_responses"
}