import { Elysia } from "elysia";
import { authController } from "../controllers/auth.controller";
import { jobsController } from "../controllers/jobs.controller";

export const apiRoutes = new Elysia({ prefix: "/api" })
  .use(authController)
  .use(jobsController);

// Health check endpoint
export const healthRoutes = new Elysia().get(
  "/health",
  () => ({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  }),
  {
    detail: {
      summary: "Health check",
      description: "Check the health status of the API server",
      tags: ["Health"],
      responses: {
        200: {
          description: "Server is healthy",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    example: "healthy",
                    description: "Server health status",
                  },
                  timestamp: {
                    type: "string",
                    format: "date-time",
                    example: "2024-01-15T10:30:00.000Z",
                    description: "Current server timestamp",
                  },
                  uptime: {
                    type: "number",
                    example: 3600,
                    description: "Server uptime in seconds",
                  },
                  environment: {
                    type: "string",
                    example: "development",
                    description: "Current environment",
                  },
                },
              },
            },
          },
        },
      },
    },
  }
);
