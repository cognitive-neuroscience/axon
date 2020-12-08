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

export enum SnackbarType {
    SUCCESS = "SUCCESS",
    ERROR = "ERROR",
    INFO = "INFO"
}

export enum Role {
    ADMIN = "ADMIN",
    PARTICIPANT = "PARTICIPANT"
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

export enum Key {
    ARROWLEFT = "ArrowLeft",
    ARROWRIGHT = "ArrowRight"
}

export enum Color {
    BLUE = "blue",
    ORANGE = "orange",
    TRANSPARENT = "transparent"
  }

export class ExperimentRoutingMap {
    [key: string]: Task
}

export enum UserResponse {
    GREATER = "GREATER",
    LESSER = "LESSER",
    ODD = "ODD",
    EVEN = "EVEN"
}