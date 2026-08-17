import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import customerRoutes from "./routes/customers";
import authRoutes from "./routes/auth";
import auditRoutes from "./routes/audit";

export const buildServer = () => {
	const app = express();

	app.use(cors());
	app.use(express.json());

	app.get("/health", (_req, res) => {
		res.json({ status: "ok" });
	});

	app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
	app.get("/api-docs.json", (_req, res) => {
		res.setHeader("Content-Type", "application/json");
		res.send(swaggerSpec);
	});

	app.use("/api/auth", authRoutes);
	app.use("/api/customers", customerRoutes);
	app.use("/api/audit-logs", auditRoutes);

	return app;
};

export const app = buildServer();
