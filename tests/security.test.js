const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
const User = require("../models/userModel");
const Task = require("../models/taskModel");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.DATABASE = mongoUri;
  await mongoose.connect(mongoUri);
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}, 120000);

describe("Security Hardening & Input Sanitization Suite", () => {
  let authCookie;

  beforeAll(async () => {
    // Create base user for testing
    const signupRes = await request(app)
      .post("/api/v1/users/signup")
      .send({
        name: "Security Tester",
        email: "security@taskflow.dev",
        password: "Secure<Password>123!",
        passwordConfirm: "Secure<Password>123!",
      })
      .expect(201);

    authCookie = signupRes.headers["set-cookie"];
  });

  describe("1. NoSQL Injection Prevention", () => {
    it("should sanitize and block NoSQL injection in login payload", async () => {
      // Attempt NoSQL query operator injection: { email: { "$gt": "" } }
      const res = await request(app)
        .post("/api/v1/users/login")
        .send({
          email: { $gt: "" },
          password: "Secure<Password>123!",
        })
        .expect(400);

      expect(res.body.status).toBe("fail");
    });

    it("should sanitize NoSQL query operators in task filter query string", async () => {
      const res = await request(app)
        .get("/api/v1/tasks?priority[$ne]=null")
        .set("Cookie", authCookie)
        .expect(200);

      expect(res.body.status).toBe("success");
    });
  });

  describe("2. Cross-Site Scripting (XSS) Sanitization", () => {
    it("should strip script tags and HTML injection from task title and description", async () => {
      const res = await request(app)
        .post("/api/v1/tasks")
        .set("Cookie", authCookie)
        .send({
          title: "<script>alert('XSS')</script>Build Production Firewall",
          description: "<img src=x onerror=alert(1)><b>Detailed</b> implementation specs",
          priority: "high",
          status: "todo",
        })
        .expect(201);

      const task = res.body.data.task;
      expect(task.title).toBe("Build Production Firewall");
      expect(task.title).not.toContain("<script>");
      expect(task.description).toBe("Detailed implementation specs");
      expect(task.description).not.toContain("<img");
      expect(task.description).not.toContain("<b>");
    });

    it("should sanitize checklist item payloads against XSS", async () => {
      const createRes = await request(app)
        .post("/api/v1/tasks")
        .set("Cookie", authCookie)
        .send({
          title: "Checklist Security Task",
          priority: "medium",
        })
        .expect(201);

      const taskId = createRes.body.data.task._id;

      const addChecklistRes = await request(app)
        .post(`/api/v1/tasks/${taskId}/checklist`)
        .set("Cookie", authCookie)
        .send({
          text: "<script>dangerousCode()</script>Verify TLS Certificates",
        })
        .expect(200);

      const items = addChecklistRes.body.data.task.checklist;
      expect(items.length).toBe(1);
      expect(items[0].text).toBe("Verify TLS Certificates");
      expect(items[0].text).not.toContain("<script>");
    });

    it("should strictly preserve password fields containing < and > characters without modification", async () => {
      const loginRes = await request(app)
        .post("/api/v1/users/login")
        .send({
          email: "security@taskflow.dev",
          password: "Secure<Password>123!",
        })
        .expect(200);

      expect(loginRes.body.status).toBe("success");
    });
  });

  describe("3. Security HTTP Headers (Helmet)", () => {
    it("should enforce robust security headers on all responses", async () => {
      const res = await request(app).get("/api/v1/users/me");

      expect(res.headers).toHaveProperty("x-content-type-options", "nosniff");
      expect(res.headers).toHaveProperty("x-frame-options", "SAMEORIGIN");
      expect(res.headers).toHaveProperty("x-dns-prefetch-control", "off");
    });
  });
});
