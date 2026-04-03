# Finance Data Processing and Access Control Backend

Production-style backend implementation for the assignment using Node.js, TypeScript, Express, MongoDB, class-based architecture, and Swagger API documentation.

## Tech Stack

- Node.js + Express
- TypeScript (strict mode)
- MongoDB + Mongoose
- JWT authentication (access + refresh)
- Zod request validation
- Swagger/OpenAPI docs
- Jest + Supertest tests

## Architecture

Class-based layered design with clear separation of concerns:

- Controller layer: HTTP request/response orchestration
- Service layer: business logic and role-based authorization rules
- Repository layer: database access and aggregation logic
- Middleware layer: auth, role checks, validation, rate limiting, error handling

Folder structure:

- src/config: environment, database, swagger
- src/common: shared errors, middleware, utilities
- src/modules/auth: auth routes/controller/service
- src/modules/users: user management routes/controller/service/repository/model
- src/modules/financial: financial CRUD, filters, aggregations
- src/modules/dashboard: summary and analytics endpoints
- src/modules/audit: mutation audit logging
- src/routes: API route composition
- src/seeds: seed script
- tests/unit: fast unit tests
- tests/integration: API integration tests

## Roles and Access Control

- viewer
  - Can access dashboard APIs
  - Cannot create/update/delete financial records
  - Cannot manage users

- analyst
  - Can create/read/update financial records
  - Can update only records created by themselves
  - Cannot delete financial records
  - Can access dashboard APIs

- admin
  - Full access to financial records, including delete
  - Full user management access
  - Can create users through admin flows

## API Documentation

Swagger UI is available at:

- http://localhost:3000/api-docs

Base API prefix:

- /api

Health endpoint:

- GET /api/health

## Core Endpoints

Auth:

- POST /api/auth/register
  - First call bootstraps initial admin when no users exist
  - Later calls require admin access token
- POST /api/auth/login
- POST /api/auth/refresh
- GET /api/auth/me
- POST /api/auth/logout

Users (admin only):

- GET /api/users
- POST /api/users
- PATCH /api/users/:id

Financial Records:

- GET /api/financial-records
- GET /api/financial-records/:id
- POST /api/financial-records
- PATCH /api/financial-records/:id
- DELETE /api/financial-records/:id (admin only)

Dashboard:

- GET /api/dashboard/summary
- GET /api/dashboard/category-totals
- GET /api/dashboard/trends
- GET /api/dashboard/recent-activity

## Date Input Format

Date fields and date query filters accept these formats:

- YYYY-MM-DD
  - Example: 2026-04-04
- ISO date-time string
  - Example: 2026-04-04T10:30:00Z
- Unix timestamp in milliseconds
  - Example: 1775298600000

Where this applies:

- Financial create/update body field: date
- Financial list query params: fromDate, toDate
- Dashboard query params: fromDate, toDate

If date format is invalid, API returns 400 with validation details.

## Validation and Error Handling

- Zod schemas validate body/query/params
- Consistent error response shape with request id
- Proper HTTP status codes for validation/auth/access/resource errors
- Global error middleware handles Mongoose and app-level errors

## Setup

1. Install dependencies

```bash
npm install
```

2. Create local env file

```bash
copy .env.example .env
```

3. Start MongoDB locally (or set remote URI in .env)

4. Run development server

```bash
npm run dev
```

5. Build and run production mode

```bash
npm run build
npm start
```

## Vercel Deployment

This backend is configured for Vercel serverless deployment.

Files used for deployment:

- vercel.json
- api/index.ts

Deployment steps:

1. Push repository to GitHub.
2. Import project in Vercel.
3. In Vercel Project Settings -> Environment Variables, set all variables from .env.example.
4. Deploy.

Important environment setup for Vercel:

- NODE_ENV=production
- CORS_ORIGIN must be your frontend URL, for example https://your-frontend.vercel.app
- JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be real strong secrets (not placeholders)
- MONGODB_URI should point to MongoDB Atlas database

MongoDB Atlas requirements:

- Add Vercel access in Network Access (commonly 0.0.0.0/0 for serverless platforms, restricted by strong DB user credentials)
- Use dedicated DB user with least required permissions

Post-deploy endpoints:

- https://<your-backend-domain>/api/health
- https://<your-backend-domain>/api-docs

## Environment Variables

See .env.example for full list.

Required:

- MONGODB_URI
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- JWT_ACCESS_EXPIRES_IN
- JWT_REFRESH_EXPIRES_IN
- BCRYPT_ROUNDS
- CORS_ORIGIN

Do not commit real secrets in .env. Configure secrets only in Vercel Environment Variables.

## Seed Data

Creates default users and sample financial records.

```bash
npm run seed
```

Seeded users:

- admin@zorvyn.local / Admin@12345
- analyst@zorvyn.local / Analyst@12345
- viewer@zorvyn.local / Viewer@12345

## Tests

Unit tests:

```bash
npm test
```

Integration tests:

```bash
set RUN_INTEGRATION_TESTS=true
npm run test:integration
```

Note: integration tests use mongodb-memory-server-core, which downloads a MongoDB binary on first run and may take significant time depending on network.

## Production-Oriented Decisions

- Strict TypeScript and explicit layers for maintainability
- Refresh token hash persisted in DB for secure logout/rotation
- Request correlation id for traceable error responses
- Rate limiting and security headers enabled
- Audit logs for sensitive mutations (login/create/update/delete)
- Filtered and paginated financial listing
- MongoDB indexes on common query fields

## Assumptions and Tradeoffs

- Single-tenant finance system
- Viewer has dashboard-only data access
- Analyst can update only own records
- Integration tests are opt-in due large Mongo binary bootstrap in some environments
- No external object storage or queueing included (kept assignment-focused)
