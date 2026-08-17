import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "./auth.config";
import { AuthenticatedUser, UserRole } from "./auth.types";

type AuthRequest = Request & {
    authUser?: AuthenticatedUser;
};

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.header("authorization");

    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
        res.status(401).json({ message: "Token de acceso requerido." });
        return;
    }

    const token = authHeader.slice(7).trim();

    try {
        const payload = jwt.verify(token, getJwtSecret()) as AuthenticatedUser;

        if (!payload?.username || !payload?.role) {
            res.status(401).json({ message: "Token inválido." });
            return;
        }

        (req as AuthRequest).authUser = {
            username: payload.username,
            role: payload.role,
        };

        next();
    } catch (_error) {
        res.status(401).json({ message: "Token inválido o expirado." });
    }
};

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const userRole = (req as AuthRequest).authUser?.role;

        if (!userRole) {
            res.status(401).json({ message: "Usuario no autenticado." });
            return;
        }

        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({
                message: "No tienes permisos para ejecutar esta operación.",
            });
            return;
        }

        next();
    };
};
