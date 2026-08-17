import express from "express";
import {
	createCustomer,
	deleteCustomer,
	getCustomers,
	updateCustomer,
} from "../modules/customers/customer.controller";
import { authenticateToken, authorizeRoles } from "../modules/auth/auth.middleware";
import { UserRole } from "../modules/auth/auth.types";

const router = express.Router();

router.use(authenticateToken);

router.get("/", authorizeRoles(UserRole.ADMIN, UserRole.ASESOR), getCustomers);
router.post("/", authorizeRoles(UserRole.ADMIN, UserRole.ASESOR), createCustomer);
router.put("/:id", authorizeRoles(UserRole.ADMIN), updateCustomer);
router.delete("/:id", authorizeRoles(UserRole.ADMIN), deleteCustomer);

export default router;