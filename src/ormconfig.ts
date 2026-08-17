import { DataSource } from "typeorm";
import { Customer } from "./entities/Customer";
import { AuditLog } from "./entities/AuditLog";
import dotenv from "dotenv";
import path from "path";

const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

if (!isLambda) {
    const envFile = process.env.APP_MODE === "prod" ? ".env.prod" : ".env.dev";
    dotenv.config({ path: path.resolve(process.cwd(), envFile) });
}

const dbUsername = process.env.DB_USER || process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;

if (!dbHost || !dbPort || !dbUsername || !dbPassword || !dbName) {
    throw new Error(
        `Missing required database environment variables. Got: HOST=${dbHost}, PORT=${dbPort}, USER=${dbUsername ? "[SET]" : "[MISSING]"}, PASS=${dbPassword ? "[SET]" : "[MISSING]"}, NAME=${dbName}`
    );
}

export const AppDataSource = new DataSource({
    type: "postgres",
    host: dbHost,
    port: parseInt(dbPort, 10),
    username: dbUsername,
    password: dbPassword,
    database: dbName,
    ssl: isLambda ? { rejectUnauthorized: false } : false,
    synchronize: true,
    logging: !isLambda,
    entities: [Customer, AuditLog],
});
