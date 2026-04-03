import request from "supertest";
import { App } from "../../src/app";
import { closeTestDatabase, connectTestDatabase, clearTestDatabase } from "../setup/testDb";

const integrationDescribe = process.env.RUN_INTEGRATION_TESTS === "true" ? describe : describe.skip;

integrationDescribe("API integration", () => {
  const app = new App().instance;

  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterEach(async () => {
    await clearTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  it("supports bootstrap admin, role-based access, and dashboard access", async () => {
    const bootstrapResponse = await request(app).post("/api/auth/register").send({
      name: "Admin",
      email: "admin@test.com",
      password: "Password@123"
    });
    expect(bootstrapResponse.status).toBe(201);

    const adminLogin = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "Password@123"
    });
    expect(adminLogin.status).toBe(200);
    const adminToken = adminLogin.body.data.tokens.accessToken as string;

    const analystCreate = await request(app)
      .post("/api/auth/register")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Analyst",
        email: "analyst@test.com",
        password: "Password@123",
        role: "analyst"
      });
    expect(analystCreate.status).toBe(201);

    const viewerCreate = await request(app)
      .post("/api/auth/register")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Viewer",
        email: "viewer@test.com",
        password: "Password@123",
        role: "viewer"
      });
    expect(viewerCreate.status).toBe(201);

    const analystLogin = await request(app).post("/api/auth/login").send({
      email: "analyst@test.com",
      password: "Password@123"
    });
    expect(analystLogin.status).toBe(200);
    const analystToken = analystLogin.body.data.tokens.accessToken as string;

    const viewerLogin = await request(app).post("/api/auth/login").send({
      email: "viewer@test.com",
      password: "Password@123"
    });
    expect(viewerLogin.status).toBe(200);
    const viewerToken = viewerLogin.body.data.tokens.accessToken as string;

    const createRecord = await request(app)
      .post("/api/financial-records")
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        amount: 1000,
        type: "income",
        category: "Consulting",
        date: "2026-04-02T00:00:00.000Z",
        notes: "Project payment"
      });
    expect(createRecord.status).toBe(201);

    const recordId = createRecord.body.data._id as string;

    const analystUpdate = await request(app)
      .patch(`/api/financial-records/${recordId}`)
      .set("Authorization", `Bearer ${analystToken}`)
      .send({
        amount: 1200
      });
    expect(analystUpdate.status).toBe(200);

    const analystDelete = await request(app)
      .delete(`/api/financial-records/${recordId}`)
      .set("Authorization", `Bearer ${analystToken}`);
    expect(analystDelete.status).toBe(403);

    const viewerCreateRecord = await request(app)
      .post("/api/financial-records")
      .set("Authorization", `Bearer ${viewerToken}`)
      .send({
        amount: 250,
        type: "expense",
        category: "Supplies",
        date: "2026-04-02T00:00:00.000Z"
      });
    expect(viewerCreateRecord.status).toBe(403);

    const viewerDashboard = await request(app)
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${viewerToken}`);
    expect(viewerDashboard.status).toBe(200);
    expect(viewerDashboard.body.success).toBe(true);
  });
});
