import { Role } from "./InternalDTOs";

export class LoginCredentials {
    email: string;
    password: string;
    confirmPassword: string;
    id: number;
    role: string;
}

export class User {
    userID: string;
    email: string;
    role: Role;
    exp: number;
}

export class JWT {
    UserID: string;
    Email: string;
    Role: Role;
    exp: number;
}