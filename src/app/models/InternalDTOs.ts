import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarType, TaskType } from './enums';

export class ConfirmationDialogMessage {
    message: string;

    warning: string;

    constructor(msg: string, warning?: string) {
        this.message = msg;
        this.warning = warning;
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
    ARROWLEFT = 'ArrowLeft',
    ARROWRIGHT = 'ArrowRight',
    NUMONE = '1',
    NUMTWO = '2',
    NUMTHREE = '3',
    NUMFOUR = '4',
    NUMFIVE = '5',
    Q = 'q',
    P = 'p',
    Z = 'z',
    M = 'm',
    NONE = 'none',
}

export enum Color {
    BLUE = 'blue',
    ORANGE = 'orange',
    TRANSPARENT = 'transparent',
}

// to be deprecated when we shift everything over to translated
export enum Feedback {
    CORRECT = 'Correct',
    INCORRECT = 'Incorrect',
    TOOSLOW = 'Too slow',
    NORESPONSE = 'No response',
}

export enum TranslatedFeedback {
    CORRECT = 'correct',
    INCORRECT = 'incorrect',
    TOOSLOW = 'too-slow',
    NORESPONSE = 'no-response',
}

// an enum representing the semantic answer given by the user that gets uploaded to the database
export enum UserResponse {
    GREATER = 'GREATER',
    LESSER = 'LESSER',
    ODD = 'ODD',
    EVEN = 'EVEN',
    NA = 'NA',
    INVALID = 'INVALID',
    RED = 'RED',
    GREEN = 'GREEN',
    BLUE = 'BLUE',
    NO = 'NO',
    YES = 'YES',
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
    BOTH = 'BOTH',
    SHORT = 'SHORT',
    LONG = 'LONG',
    GO = 'GO',
    NOGO = 'NOGO',
}
