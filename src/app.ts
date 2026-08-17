import "reflect-metadata";
import { AppDataSource } from "./ormconfig";
import { app } from "./server";

const appName = process.env.APP_NAME || "customers-dev";
const PORT = Number(process.env.SERVER_PORT || 8080);

const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log(`Database connected for ${appName}`);

        app.listen(PORT, () => {
            console.log(`${appName} running on port ${PORT} `);
            console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error("Error during Data Source initialization:", error);
        process.exit(1);
    }
};

startServer();
