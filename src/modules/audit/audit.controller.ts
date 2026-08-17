import { Request, Response } from "express";
import { listAuditLogs } from "./audit.service";
import { AuditAction } from "../../entities/AuditLog";
import { UserRole } from "../auth/auth.types";

const parseAuditAction = (value: unknown): AuditAction | undefined => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    const availableValues = Object.values(AuditAction);
    return availableValues.includes(trimmed as AuditAction)
        ? (trimmed as AuditAction)
        : undefined;
};

const parseRole = (value: unknown): UserRole | undefined => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim().toUpperCase();
    const availableValues = Object.values(UserRole);
    return availableValues.includes(trimmed as UserRole)
        ? (trimmed as UserRole)
        : undefined;
};

const parseDate = (value: unknown, endOfDay = false): Date | undefined => {
    if (typeof value !== "string" || value.trim() === "") return undefined;

    const candidate = endOfDay
        ? `${value.trim()}T23:59:59.999Z`
        : `${value.trim()}T00:00:00.000Z`;

    const parsed = new Date(candidate);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
        const offset = (page - 1) * limit;

        const action = parseAuditAction(req.query.action);
        const role = parseRole(req.query.role);
        const performedBy =
            typeof req.query.performedBy === "string"
                ? req.query.performedBy.trim()
                : undefined;
        const dateFrom = parseDate(req.query.dateFrom);
        const dateTo = parseDate(req.query.dateTo, true);

        const { items, total } = await listAuditLogs(limit, offset, {
            action,
            role,
            performedBy,
            dateFrom,
            dateTo,
        });

        res.json({
            data: items,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            filters: {
                action: action ?? null,
                role: role ?? null,
                performedBy: performedBy ?? null,
                dateFrom: dateFrom?.toISOString() ?? null,
                dateTo: dateTo?.toISOString() ?? null,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Error obteniendo auditoría",
            error: (error as Error).message,
        });
    }
};
