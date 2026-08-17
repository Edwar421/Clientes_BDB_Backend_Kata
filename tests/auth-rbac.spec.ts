import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import customerRoutes from "../src/routes/customers";
import { authenticateToken, authorizeRoles } from "../src/modules/auth/auth.middleware";
import { UserRole } from "../src/modules/auth/auth.types";
import authRoutes from "../src/routes/auth";

describe("Auth and RBAC", () => {
    const secret = "test-jwt-secret";

    beforeAll(() => {
        process.env.JWT_SECRET = secret;
        process.env.ADMIN_USERNAME = "admin";
        process.env.ADMIN_PASSWORD = "admin123";
        process.env.ASESOR_USERNAME = "asesor";
        process.env.ASESOR_PASSWORD = "asesor123";
    });

    const signToken = (role: UserRole, username: string) => {
        return jwt.sign({ username, role }, secret, { expiresIn: "1h" });
    };

    it("returns token on successful login", async () => {
        const app = express();
        app.use(express.json());
        app.use("/api/auth", authRoutes);

        const response = await request(app).post("/api/auth/login").send({
            username: "admin",
            password: "admin123",
        });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("accessToken");
        expect(response.body.user.role).toBe(UserRole.ADMIN);
    });

    it("returns 401 when token is missing", async () => {
        const app = express();
        app.use(express.json());
        app.get("/api/protected", authenticateToken, (_req, res) => {
            res.status(200).json({ ok: true });
        });

        const response = await request(app).get("/api/protected");

        expect(response.status).toBe(401);
    });

    it("returns 403 for ASESOR on ADMIN-only endpoint", async () => {
        const app = express();
        app.use(express.json());
        app.get(
            "/api/admin-only",
            authenticateToken,
            authorizeRoles(UserRole.ADMIN),
            (_req, res) => {
                res.status(200).json({ ok: true });
            }
        );

        const token = signToken(UserRole.ASESOR, "asesor");
        const response = await request(app)
            .get("/api/admin-only")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(403);
    });

    it("returns 403 for ASESOR trying to update customers", async () => {
        const app = express();
        app.use(express.json());
        app.use("/api/customers", customerRoutes);

        const token = signToken(UserRole.ASESOR, "asesor");
        const response = await request(app)
            .put("/api/customers/1")
            .set("Authorization", `Bearer ${token}`)
            .send({
                typeId: "cedula de ciudadania",
                identification: "12345678",
                name: "Juan Perez",
                age: 32,
                email: "juan@example.com",
                product: "cuenta de ahorros",
            });

        expect(response.status).toBe(403);
    });

    it("allows ADMIN to pass the RBAC middleware", async () => {
        const app = express();
        app.use(express.json());
        app.get(
            "/api/admin-only",
            authenticateToken,
            authorizeRoles(UserRole.ADMIN),
            (_req, res) => {
                res.status(200).json({ ok: true });
            }
        );

        const token = signToken(UserRole.ADMIN, "admin");
        const response = await request(app)
            .get("/api/admin-only")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
    });
});
