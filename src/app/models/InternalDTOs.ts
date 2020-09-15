export class SnackbarData {
    message: string;
    action: string;

    constructor(msg: string, act: string) {
        this.message = msg;
        this.action = act
    }
}

export enum LoginMode {
    LOGIN = "LOGIN",
    REGISTER = "REGISTER",
}