import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from "typeorm";
import { UserRole } from "../modules/auth/auth.types";

export enum AuditAction {
    CUSTOMER_CREATED = "CUSTOMER_CREATED",
    CUSTOMER_UPDATED = "CUSTOMER_UPDATED",
    CUSTOMER_DELETED = "CUSTOMER_DELETED",
}

@Entity()
export class AuditLog {
    @PrimaryGeneratedColumn()
    id!: number;

    @Index()
    @Column({ length: 60 })
    action!: AuditAction;

    @Column({ length: 60 })
    entityName!: string;

    @Column({ type: "int", nullable: true })
    entityId!: number | null;

    @Column({ length: 60 })
    performedBy!: string;

    @Column({ length: 20 })
    performedByRole!: UserRole;

    @Column({ type: "jsonb", nullable: true })
    details!: Record<string, unknown> | null;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;
}
