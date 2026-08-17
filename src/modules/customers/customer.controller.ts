import { Request, Response } from "express";
import { AppDataSource } from "../../ormconfig";
import { Customer, CustomerProduct, typeIdentification } from "../../entities/Customer";
import { emailService, isEmailEnabled } from "../../utils/email.utils";
import { AuthenticatedUser, UserRole } from "../auth/auth.types";
import { AuditAction } from "../../entities/AuditLog";
import { safeWriteAuditLog } from "../audit/audit.service";


const customerTypes: typeIdentification[] = [
    "cedula de ciudadania",
    "cedula de extranjeria",
    "pasaporte"
];

const customerProducts: CustomerProduct[] = [
    "cuenta de ahorros",
    "cuenta corriente",
    "tarjeta de credito",
    "credito libre inversion",
    "credito de vehiculo",
    "credito rotativo",
];

export const normalizeText = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const getCustomerRepository = () => AppDataSource.getRepository(Customer);

type AuthRequest = Request & {
    authUser?: AuthenticatedUser;
};

const getAuditActor = (req: Request) => {
    const authUser = (req as AuthRequest).authUser;

    return {
        performedBy: authUser?.username ?? "unknown",
        performedByRole: authUser?.role ?? UserRole.ASESOR,
    };
};

export const validateCustomerFields = (
    typeId: string,
    identification: string,
    name: string,
    age: number,
    email: string,
    product: string
) => {
    const errors: string[] = [];
    const normalizedTypeId = normalizeText(String(typeId || ""));
    const trimmedIdentification = String(identification || "").trim();
    const trimmedName = String(name || "").trim();
    const trimmedEmail = String(email || "").trim();
    const numericAge = Number(age);
    const normalizedProduct = normalizeText(String(product || ""));

    if (!customerTypes.includes(normalizedTypeId as typeIdentification)) {
        errors.push(
            "El tipo de identificación debe ser uno de estos: cedula de ciudadania, cedula de extranjeria o pasaporte."
        );
    }

    if (!/^\d{7,10}$/.test(trimmedIdentification)) {
        errors.push(
            "La identificación debe contener entre 7 y 10 números y solo aceptar dígitos."
        );
    }

    if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
        errors.push("El nombre debe tener entre 2 y 100 caracteres.");
    }

    if (!Number.isInteger(numericAge) || numericAge < 1 || numericAge > 120) {
        errors.push("La edad debe ser un número entero entre 1 y 120.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
        errors.push("El correo electrónico debe ser válido.");
    }

    if (!customerProducts.includes(normalizedProduct as CustomerProduct)) {
        errors.push(
            "El producto debe ser uno de estos: cuenta de ahorros, cuenta corriente, tarjeta de credito, credito libre inversion, credito de vehiculo o credito rotativo."
        );
    }

    return {
        errors,
        normalizedTypeId: normalizedTypeId as typeIdentification,
        normalizedIdentification: trimmedIdentification,
        normalizedName: trimmedName,
        normalizedAge: numericAge,
        normalizedEmail: trimmedEmail,
        normalizedProduct: normalizedProduct as CustomerProduct,
    };
};

export const getCustomers = async (_req: Request, res: Response) => {
    try {
        const customers = await getCustomerRepository().find({
            order: { id: "ASC" },
        });

        res.json(customers);
    } catch (error) {
        res.status(500).json({
            message: "Error obteniendo clientes",
            error: (error as Error).message,
        });
    }
};

export const createCustomer = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { typeId, identification, name, age, email, product } = req.body;

        const validation = validateCustomerFields(
            typeId,
            identification,
            name,
            age,
            email,
            product
        );

        if (validation.errors.length > 0) {
            res.status(400).json({ errors: validation.errors });
            return;
        }

        const customerRepository = getCustomerRepository();
        const existingCustomer = await customerRepository.findOne({
            where: { identification: validation.normalizedIdentification },
        });

        if (existingCustomer) {
            res.status(409).json({
                message: "Ya existe un cliente con esa identificación.",
            });
            return;
        }

        const customer = customerRepository.create({
            typeId: validation.normalizedTypeId,
            identification: validation.normalizedIdentification,
            name: validation.normalizedName,
            age: validation.normalizedAge,
            email: validation.normalizedEmail,
            product: validation.normalizedProduct,
        });

        const savedCustomer = await customerRepository.save(customer);
        const actor = getAuditActor(req);

        await safeWriteAuditLog({
            action: AuditAction.CUSTOMER_CREATED,
            entityName: "Customer",
            entityId: savedCustomer.id,
            performedBy: actor.performedBy,
            performedByRole: actor.performedByRole,
            details: {
                identification: savedCustomer.identification,
                email: savedCustomer.email,
                product: savedCustomer.product,
            },
        });

        if (isEmailEnabled()) {
            try {
                await emailService.sendCustomerCreated(savedCustomer);
            } catch (emailError) {
                console.error(
                    "No se pudo enviar el correo de registro al cliente:",
                    (emailError as Error).message
                );
            }
        }

        res.status(201).json(savedCustomer);
    } catch (error) {
        res.status(500).json({
            message: "Error creando cliente",
            error: (error as Error).message,
        });
    }
};

export const updateCustomer = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const customerId = Number(req.params.id);

        if (!Number.isInteger(customerId) || customerId <= 0) {
            res.status(400).json({ message: "El id del cliente no es válido." });
            return;
        }

        const { typeId, identification, name, age, email, product } = req.body;

        const validation = validateCustomerFields(
            typeId,
            identification,
            name,
            age,
            email,
            product
        );

        if (validation.errors.length > 0) {
            res.status(400).json({ errors: validation.errors });
            return;
        }

        const customerRepository = getCustomerRepository();
        const customerToUpdate = await customerRepository.findOne({
            where: { id: customerId },
        });

        if (!customerToUpdate) {
            res.status(404).json({ message: "Cliente no encontrado." });
            return;
        }

        const existingCustomer = await customerRepository.findOne({
            where: { identification: validation.normalizedIdentification },
        });

        if (existingCustomer && existingCustomer.id !== customerId) {
            res.status(409).json({
                message: "Ya existe un cliente con esa identificación.",
            });
            return;
        }

        customerToUpdate.typeId = validation.normalizedTypeId;
        customerToUpdate.identification = validation.normalizedIdentification;
        customerToUpdate.name = validation.normalizedName;
        customerToUpdate.age = validation.normalizedAge;
        customerToUpdate.email = validation.normalizedEmail;
        customerToUpdate.product = validation.normalizedProduct;

        const updatedCustomer = await customerRepository.save(customerToUpdate);
        const actor = getAuditActor(req);

        await safeWriteAuditLog({
            action: AuditAction.CUSTOMER_UPDATED,
            entityName: "Customer",
            entityId: updatedCustomer.id,
            performedBy: actor.performedBy,
            performedByRole: actor.performedByRole,
            details: {
                identification: updatedCustomer.identification,
                email: updatedCustomer.email,
                product: updatedCustomer.product,
            },
        });

        res.json(updatedCustomer);
    } catch (error) {
        res.status(500).json({
            message: "Error actualizando cliente",
            error: (error as Error).message,
        });
    }
};

export const deleteCustomer = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const customerId = Number(req.params.id);

        if (!Number.isInteger(customerId) || customerId <= 0) {
            res.status(400).json({ message: "El id del cliente no es válido." });
            return;
        }

        const customerRepository = getCustomerRepository();
        const customerToDelete = await customerRepository.findOne({
            where: { id: customerId },
        });

        if (!customerToDelete) {
            res.status(404).json({ message: "Cliente no encontrado." });
            return;
        }

        await customerRepository.remove(customerToDelete);
        const actor = getAuditActor(req);

        await safeWriteAuditLog({
            action: AuditAction.CUSTOMER_DELETED,
            entityName: "Customer",
            entityId: customerToDelete.id,
            performedBy: actor.performedBy,
            performedByRole: actor.performedByRole,
            details: {
                identification: customerToDelete.identification,
                email: customerToDelete.email,
                product: customerToDelete.product,
            },
        });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            message: "Error eliminando cliente",
            error: (error as Error).message,
        });
    }
};
