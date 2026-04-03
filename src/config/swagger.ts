import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

const dateInputDescription =
  "Accepted formats: YYYY-MM-DD, ISO date-time (e.g. 2026-04-04T10:30:00Z), or Unix timestamp in milliseconds.";

const userIdPathParameter = {
  name: "id",
  in: "path",
  required: true,
  description: "MongoDB ObjectId",
  schema: { type: "string", minLength: 24, maxLength: 24 }
};

const financialRecordIdPathParameter = {
  name: "id",
  in: "path",
  required: true,
  description: "MongoDB ObjectId",
  schema: { type: "string", minLength: 24, maxLength: 24 }
};

const financialUserIdPathParameter = {
  name: "userId",
  in: "path",
  required: true,
  description: "User MongoDB ObjectId",
  schema: { type: "string", minLength: 24, maxLength: 24 }
};

const financialListQueryParameters = [
  { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
  { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
  {
    name: "userId",
    in: "query",
    description: "Filter records by creator user id",
    schema: { type: "string", minLength: 24, maxLength: 24 }
  },
  {
    name: "fromDate",
    in: "query",
    description: dateInputDescription,
    schema: { type: "string", example: "2026-04-01" }
  },
  {
    name: "toDate",
    in: "query",
    description: dateInputDescription,
    schema: { type: "string", example: "2026-04-30" }
  },
  { name: "type", in: "query", schema: { type: "string", enum: ["income", "expense"] } },
  { name: "category", in: "query", schema: { type: "string" } },
  { name: "minAmount", in: "query", schema: { type: "number", minimum: 0 } },
  { name: "maxAmount", in: "query", schema: { type: "number", minimum: 0 } },
  {
    name: "sortBy",
    in: "query",
    schema: { type: "string", enum: ["date", "amount", "createdAt"], default: "date" }
  },
  { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } }
];

const dashboardQueryParameters = [
  {
    name: "userId",
    in: "query",
    description: "Optional for admin. Viewer/analyst are always scoped to their own user id.",
    schema: { type: "string", minLength: 24, maxLength: 24 }
  },
  {
    name: "fromDate",
    in: "query",
    description: dateInputDescription,
    schema: { type: "string", example: "2026-04-01" }
  },
  {
    name: "toDate",
    in: "query",
    description: dateInputDescription,
    schema: { type: "string", example: "2026-04-30" }
  },
  { name: "type", in: "query", schema: { type: "string", enum: ["income", "expense"] } },
  { name: "category", in: "query", schema: { type: "string" } },
  { name: "minAmount", in: "query", schema: { type: "number", minimum: 0 } },
  { name: "maxAmount", in: "query", schema: { type: "number", minimum: 0 } },
  { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 10 } }
];

const dateInputBodySchema = {
  oneOf: [
    { type: "string", example: "2026-04-04" },
    { type: "string", example: "2026-04-04T10:30:00Z" },
    { type: "number", example: 1775298600000 }
  ],
  description: dateInputDescription
};

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Finance Data Processing and Access Control API",
      version: "1.0.0",
      description: "Backend APIs for financial records, dashboard insights, user management, and RBAC."
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" },
            requestId: { type: "string" }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Health" },
      { name: "Auth" },
      { name: "Users" },
      { name: "Financial Records" },
      { name: "Dashboard" }
    ],
    paths: {
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          security: [],
          responses: {
            "200": {
              description: "API is healthy"
            }
          }
        }
      },
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register first admin or admin-create user",
          description:
            "First user can be registered without token. After bootstrap, registration requires an admin access token.",
          security: [{ bearerAuth: [] }, {}],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string", minLength: 2, maxLength: 100 },
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 8, maxLength: 72 },
                    role: { type: "string", enum: ["viewer", "analyst", "admin"] },
                    status: { type: "string", enum: ["active", "inactive"] }
                  }
                }
              }
            }
          },
          responses: {
            "201": { description: "User created" },
            "400": { description: "Validation failed" },
            "401": { description: "Unauthorized" },
            "409": { description: "Conflict" }
          }
        }
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login and receive JWT tokens",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Authenticated" },
            "401": { description: "Invalid credentials" }
          }
        }
      },
      "/api/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh access token",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["refreshToken"],
                  properties: {
                    refreshToken: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Tokens refreshed" },
            "401": { description: "Invalid refresh token" }
          }
        }
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Current user profile",
          description: "Requires access token in Authorize dialog.",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Current user" },
            "401": { description: "Unauthorized" }
          }
        }
      },
      "/api/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout and invalidate refresh token",
          description:
            "Requires access token in Authorize dialog. This clears stored refresh token so /api/auth/refresh fails after logout.",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Logged out" },
            "401": { description: "Unauthorized" }
          }
        }
      },
      "/api/users": {
        get: {
          tags: ["Users"],
          summary: "List users (admin only)",
          responses: {
            "200": { description: "User list" },
            "403": { description: "Forbidden" }
          }
        },
        post: {
          tags: ["Users"],
          summary: "Create user (admin only)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password", "role"],
                  properties: {
                    name: { type: "string", minLength: 2, maxLength: 100 },
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 8, maxLength: 72 },
                    role: { type: "string", enum: ["viewer", "analyst", "admin"] },
                    status: { type: "string", enum: ["active", "inactive"] }
                  }
                }
              }
            }
          },
          responses: {
            "201": { description: "User created" }
          }
        }
      },
      "/api/users/{id}": {
        patch: {
          tags: ["Users"],
          summary: "Update user role/status (admin only)",
          parameters: [userIdPathParameter],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", minLength: 2, maxLength: 100 },
                    role: { type: "string", enum: ["viewer", "analyst", "admin"] },
                    status: { type: "string", enum: ["active", "inactive"] }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "User updated" }
          }
        }
      },
      "/api/financial-records": {
        get: {
          tags: ["Financial Records"],
          summary: "List financial records (analyst/admin)",
          parameters: financialListQueryParameters,
          responses: {
            "200": { description: "Record list" }
          }
        },
        post: {
          tags: ["Financial Records"],
          summary: "Create financial record (analyst/admin)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["amount", "type", "category", "date"],
                  properties: {
                    amount: { type: "number", minimum: 0.01 },
                    type: { type: "string", enum: ["income", "expense"] },
                    category: { type: "string", minLength: 1, maxLength: 100 },
                    date: dateInputBodySchema,
                    notes: { type: "string", maxLength: 1000 }
                  }
                }
              }
            }
          },
          responses: {
            "201": { description: "Record created" }
          }
        }
      },
      "/api/financial-records/{id}": {
        get: {
          tags: ["Financial Records"],
          summary: "Get financial record by id",
          parameters: [financialRecordIdPathParameter],
          responses: {
            "200": { description: "Record details" }
          }
        },
        patch: {
          tags: ["Financial Records"],
          summary: "Update financial record (analyst own record or admin)",
          parameters: [financialRecordIdPathParameter],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    amount: { type: "number", minimum: 0.01 },
                    type: { type: "string", enum: ["income", "expense"] },
                    category: { type: "string", minLength: 1, maxLength: 100 },
                    date: dateInputBodySchema,
                    notes: { type: "string", maxLength: 1000 }
                  }
                }
              }
            }
          },
          responses: {
            "200": { description: "Record updated" },
            "403": { description: "Forbidden" }
          }
        },
        delete: {
          tags: ["Financial Records"],
          summary: "Delete financial record (admin only)",
          parameters: [financialRecordIdPathParameter],
          responses: {
            "200": { description: "Record deleted" }
          }
        }
      },
      "/api/financial-records/user/{userId}": {
        get: {
          tags: ["Financial Records"],
          summary: "List financial records for a specific user",
          description:
            "Admins can query any user. Analysts can query only their own user id; other user ids return forbidden.",
          parameters: [
            financialUserIdPathParameter,
            ...financialListQueryParameters.filter((parameter) => parameter.name !== "userId")
          ],
          responses: {
            "200": { description: "User financial records" },
            "403": { description: "Forbidden" }
          }
        }
      },
      "/api/dashboard/summary": {
        get: {
          tags: ["Dashboard"],
          summary: "Get total income, expense, and net balance",
          description: "Viewer and analyst receive only their own data. Admin can query all data or filter by userId.",
          parameters: dashboardQueryParameters,
          responses: { "200": { description: "Summary data" } }
        }
      },
      "/api/dashboard/category-totals": {
        get: {
          tags: ["Dashboard"],
          summary: "Get category-wise totals",
          description: "Viewer and analyst receive only their own data. Admin can query all data or filter by userId.",
          parameters: dashboardQueryParameters,
          responses: { "200": { description: "Category totals" } }
        }
      },
      "/api/dashboard/trends": {
        get: {
          tags: ["Dashboard"],
          summary: "Get monthly trends",
          description: "Viewer and analyst receive only their own data. Admin can query all data or filter by userId.",
          parameters: dashboardQueryParameters,
          responses: { "200": { description: "Trend data" } }
        }
      },
      "/api/dashboard/recent-activity": {
        get: {
          tags: ["Dashboard"],
          summary: "Get recent financial activity",
          description: "Viewer and analyst receive only their own data. Admin can query all data or filter by userId.",
          parameters: dashboardQueryParameters,
          responses: { "200": { description: "Recent activity" } }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
