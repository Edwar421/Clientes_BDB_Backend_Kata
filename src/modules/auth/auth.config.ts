import { LoginUser, UserRole } from "./auth.types";

export const getJwtSecret = () => process.env.JWT_SECRET || "dev-jwt-secret";

export const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || "8h";

export const getSystemUsers = (): LoginUser[] => {
    return [
        {
            username: process.env.ADMIN_USERNAME || "admin",
            password: process.env.ADMIN_PASSWORD || "admin123",
            role: UserRole.ADMIN,
        },
        {
            username: process.env.ASESOR_USERNAME || "asesor",
            password: process.env.ASESOR_PASSWORD || "asesor123",
            role: UserRole.ASESOR,
        },
    ];
};
