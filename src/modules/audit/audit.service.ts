import { AppDataSource } from "../../ormconfig";
import { AuditAction, AuditLog } from "../../entities/AuditLog";
import { UserRole } from "../auth/auth.types";

type AuditPayload = {
    action: AuditAction;
    entityName: string;
    entityId?: number | null;
    performedBy: string;
    performedByRole: UserRole;
    details?: Record<string, unknown> | null;
};

const getAuditRepository = () => AppDataSource.getRepository(AuditLog);

export type ListAuditLogsFilters = {
    action?: AuditAction;
    performedBy?: string;
    role?: UserRole;
    dateFrom?: Date;
    dateTo?: Date;
};

export const writeAuditLog = async (payload: AuditPayload): Promise<void> => {
    const repo = getAuditRepository();

    const entry = repo.create({
        action: payload.action,
        entityName: payload.entityName,
        entityId: payload.entityId ?? null,
        performedBy: payload.performedBy,
        performedByRole: payload.performedByRole,
        details: payload.details ?? null,
    });

    await repo.save(entry);
};

export const safeWriteAuditLog = async (payload: AuditPayload): Promise<void> => {
    try {
        await writeAuditLog(payload);
    } catch (error) {
        console.error("No se pudo guardar el log de auditoría:", (error as Error).message);
    }
};

export const listAuditLogs = async (
    limit: number,
    offset: number,
    filters: ListAuditLogsFilters = {}
) => {
    const queryBuilder = getAuditRepository()
        .createQueryBuilder("audit")
        .orderBy("audit.id", "DESC")
        .take(limit)
        .skip(offset);

    if (filters.action) {
        queryBuilder.andWhere("audit.action = :action", {
            action: filters.action,
        });
    }

    if (filters.role) {
        queryBuilder.andWhere("audit.performedByRole = :role", {
            role: filters.role,
        });
    }

    if (filters.performedBy) {
        queryBuilder.andWhere("LOWER(audit.performedBy) LIKE :performedBy", {
            performedBy: `%${filters.performedBy.toLowerCase()}%`,
        });
    }

    if (filters.dateFrom) {
        queryBuilder.andWhere("audit.createdAt >= :dateFrom", {
            dateFrom: filters.dateFrom,
        });
    }

    if (filters.dateTo) {
        queryBuilder.andWhere("audit.createdAt <= :dateTo", {
            dateTo: filters.dateTo,
        });
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total };
};
