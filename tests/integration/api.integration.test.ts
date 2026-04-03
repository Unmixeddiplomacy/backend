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

  it("covers health, auth, users, financial, and dashboard endpoints", async () => {
    const health = await request(app).get("/api/health");
    expect(health.status).toBe(200);
    expect(health.body.success).toBe(true);

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
    const adminRefresh = adminLogin.body.data.tokens.refreshToken as string;

    const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${adminToken}`);
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe("admin@test.com");

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
    const viewerId = viewerCreate.body.data.id as string;

    const usersList = await request(app).get("/api/users").set("Authorization", `Bearer ${adminToken}`);
    expect(usersList.status).toBe(200);
    expect(Array.isArray(usersList.body.data)).toBe(true);

    const usersUpdate = await request(app)
      .patch(`/api/users/${viewerId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "inactive"
      });
    expect(usersUpdate.status).toBe(200);

    const viewerLoginInactive = await request(app).post("/api/auth/login").send({
      email: "viewer@test.com",
      password: "Password@123"
    });
    expect(viewerLoginInactive.status).toBe(401);

    const usersUpdateActive = await request(app)
      .patch(`/api/users/${viewerId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "active"
      });
    expect(usersUpdateActive.status).toBe(200);

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

    const adminCreatesAnalystRecord = await request(app)
      .post("/api/financial-records")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        amount: 200,
        type: "expense",
        category: "Ops",
        date: "2026-04-01",
        notes: "Admin created expense"
      });
    expect(adminCreatesAnalystRecord.status).toBe(201);

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

    const getRecord = await request(app)
      .get(`/api/financial-records/${recordId}`)
      .set("Authorization", `Bearer ${analystToken}`);
    expect(getRecord.status).toBe(200);

    const listRecords = await request(app)
      .get("/api/financial-records")
      .query({ fromDate: "2026-04-01", toDate: "2026-04-30", sortBy: "date", sortOrder: "desc" })
      .set("Authorization", `Bearer ${analystToken}`);
    expect(listRecords.status).toBe(200);

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

    const adminDelete = await request(app)
      .delete(`/api/financial-records/${recordId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(adminDelete.status).toBe(200);

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

    const analystUserScoped = await request(app)
      .get(`/api/financial-records/user/${viewerId}`)
      .set("Authorization", `Bearer ${analystToken}`);
    expect(analystUserScoped.status).toBe(403);

    const adminUserScoped = await request(app)
      .get(`/api/financial-records/user/${viewerId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(adminUserScoped.status).toBe(200);

    const viewerDashboard = await request(app)
      .get("/api/dashboard/summary")
      .set("Authorization", `Bearer ${viewerToken}`);
    expect(viewerDashboard.status).toBe(200);
    expect(viewerDashboard.body.success).toBe(true);

    const dashboardCategory = await request(app)
      .get("/api/dashboard/category-totals")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(dashboardCategory.status).toBe(200);

    const dashboardTrends = await request(app)
      .get("/api/dashboard/trends")
      .query({ fromDate: "2026-04-01", toDate: "2026-04-30" })
      .set("Authorization", `Bearer ${adminToken}`);
    expect(dashboardTrends.status).toBe(200);

    const dashboardRecent = await request(app)
      .get("/api/dashboard/recent-activity")
      .query({ limit: 5 })
      .set("Authorization", `Bearer ${adminToken}`);
    expect(dashboardRecent.status).toBe(200);

    const logout = await request(app).post("/api/auth/logout").set("Authorization", `Bearer ${adminToken}`);
    expect(logout.status).toBe(200);

    const refreshAfterLogout = await request(app).post("/api/auth/refresh").send({
      refreshToken: adminRefresh
    });
    expect(refreshAfterLogout.status).toBe(401);
  });
});
