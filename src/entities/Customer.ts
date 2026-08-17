import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from "typeorm";

export type typeIdentification =
    | "cedula de ciudadania"
    | "cedula de extranjeria"
    | "pasaporte";

export type CustomerProduct =
    | "cuenta de ahorros"
    | "cuenta corriente"
    | "tarjeta de credito"
    | "credito libre inversion"
    | "credito de vehiculo"
    | "credito rotativo";

@Entity()
export class Customer {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 40 })
    typeId!: typeIdentification;

    @Column({ unique: true, length: 10 })
    identification!: string;

    @Column({ length: 100 })
    name!: string;

    @Column({ type: "int" })
    age!: number;

    @Column({ length: 120 })
    email!: string;

    @Column({ length: 40 })
    product!: CustomerProduct;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;
}