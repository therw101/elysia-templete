import { Elysia } from "elysia";
import { serverConfig, developmentConfig } from "./config/database";
import { loggingMiddleware } from "./middlewares/logging.middleware";
import { corsMiddleware } from "./middlewares/cors.middleware";
import { swaggerConfig } from "./config/swagger";
import { apiRoutes, healthRoutes } from "./routes";
import { DatabaseService } from "./services/database.service";
import { EnvValidator } from "./utils/env.utils";

async function startServer() {
  try {
    // Validate environment variables
    EnvValidator.printStatus();
    const { isValid } = EnvValidator.validate();

    if (!isValid && process.env.NODE_ENV === "production") {
      console.error(
        "❌ Cannot start server: Missing required environment variables"
      );
      process.exit(1);
    }

    // Initialize database connection
    // const db = DatabaseService.getInstance();
    // await db.connect();

    // Create Elysia app with middlewares and routes
    const app = new Elysia()
      .use(loggingMiddleware)
      .use(corsMiddleware)
      // Add Swagger documentation if enabled
      .use(developmentConfig.enableSwagger ? swaggerConfig : new Elysia())
      .use(healthRoutes)
      .use(apiRoutes)
      .onError(({ code, error, set }) => {
        console.error("Application error:", {
          code,
          error: error instanceof Error ? error.message : error,
        });

        switch (code) {
          case "VALIDATION":
            set.status = 400;
            return {
              success: false,
              message: "Validation error",
              errors: [error.message],
            };
          case "NOT_FOUND":
            set.status = 404;
            return {
              success: false,
              message: "Route not found",
            };
          default:
            set.status = 500;
            return {
              success: false,
              message: "Internal server error",
            };
        }
      })
      .get("/", () => ({ api: "Hello Elysia " + serverConfig.appName }))
      .listen(serverConfig.port);

    console.log(`
      🚀 Elysia API is running!
      📍 Server: http://localhost:${serverConfig.port}
      🏥 Health: http://localhost:${serverConfig.port}/health
      📚 API: http://localhost:${serverConfig.port}/api
      ${
        developmentConfig.enableSwagger
          ? `📖 Docs: http://localhost:${serverConfig.port}/docs`
          : ""
      }
      🌐 Environment: ${process.env.NODE_ENV || "development"}
    `);

    // Graceful shutdown handling
    // process.on('SIGINT', async () => {
    //   console.log('\n🛑 Shutting down server...');
    //   try {
    //     await db.disconnect();
    //     process.exit(0);
    //   } catch (error) {
    //     console.error('Error during shutdown:', error);
    //     process.exit(1);
    //   }
    // });

    return app;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer().catch(console.error);
