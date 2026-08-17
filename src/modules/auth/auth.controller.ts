import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getJwtExpiresIn, getJwtSecret, getSystemUsers } from "./auth.config";
import { AuthenticatedUser } from "./auth.types";

type AuthRequest = Request & {
    authUser?: AuthenticatedUser;
};

export const login = (req: Request, res: Response): void => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({
            message: "Debes enviar username y password.",
        });
        return;
    }

    const user = getSystemUsers().find(
        (candidate) =>
            candidate.username === String(username).trim() &&
            candidate.password === String(password)
    );

    if (!user) {
        res.status(401).json({ message: "Credenciales inválidas." });
        return;
    }

    const expiresIn = getJwtExpiresIn() as jwt.SignOptions["expiresIn"];
    const accessToken = jwt.sign(
        {
            username: user.username,
            role: user.role,
        },
        getJwtSecret(),
        { expiresIn }
    );

    res.json({
        accessToken,
        tokenType: "Bearer",
        expiresIn,
        user: {
            id: user.username === "admin" ? 1 : 2,
            username: user.username,
            email: `${user.username}@bdb.com`,
            name: user.username === "admin" ? "Administrador" : "Asesor",
            role: user.role,
        },
    });
};

export const getCurrentUser = (req: Request, res: Response): void => {
    const authUser = (req as AuthRequest).authUser;

    if (!authUser) {
        res.status(401).json({ message: "Usuario no autenticado." });
        return;
    }

    const user = getSystemUsers().find((u) => u.username === authUser.username);

    if (!user) {
        res.status(404).json({ message: "Usuario no encontrado." });
        return;
    }

    res.json({
        id: user.username === "admin" ? 1 : 2,
        username: user.username,
        email: `${user.username}@bdb.com`,
        name: user.username === "admin" ? "Administrador" : "Asesor",
        role: user.role,
    });
};
