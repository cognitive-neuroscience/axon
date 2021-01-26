import { Role } from "./InternalDTOs";

export class LoginCredentials {
    email: string;
    password: string;
    confirmPassword: string;
    id: number;
    role: string;
}

export class User {
    UserID: string;
    Email: string;
    Role: Role;
    exp: number;
}

export class JWT extends User {}