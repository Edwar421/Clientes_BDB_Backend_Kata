import "reflect-metadata";
import serverless from "serverless-http";
import { AppDataSource } from "./ormconfig";
import { app } from "./server";

let isDbInitialized = false;

const initializeDatabase = async () => {
    if (!isDbInitialized && !AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        isDbInitialized = true;
        console.log("Database connected");
    }
};

export const handler = async (event: any, context: any) => {
    context.callbackWaitsForEmptyEventLoop = false;
    await initializeDatabase();
    const serverlessHandler = serverless(app);
    return serverlessHandler(event, context);
};
