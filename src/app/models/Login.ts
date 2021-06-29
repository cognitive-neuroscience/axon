import { Role } from "./enums";

export class User {
    id: number;
    email: string;
    password?: string;
    role: Role;
    createdAt: string;
}

export class JWT {
    UserID: string;
    Email: string;
    Role: Role;
    exp: number;
}
