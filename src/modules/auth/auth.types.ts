export enum UserRole {
    ADMIN = "ADMIN",
    ASESOR = "ASESOR",
}

export type AuthenticatedUser = {
    username: string;
    role: UserRole;
};

export type LoginUser = AuthenticatedUser & {
    password: string;
};
