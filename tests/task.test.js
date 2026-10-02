const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.DATABASE = mongoUri;
  await mongoose.connect(mongoUri);

  const signupRes = await request(app).post("/api/v1/users/signup").send({
    name: "Task User",
    email: "taskuser@example.com",
    password: "Password123!",
    passwordConfirm: "Password123!",
  });

  token = signupRes.body.token;
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}, 120000);

describe("Task API", () => {
  it("should create a task for the authenticated user", async () => {
    const res = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Build task dashboard",
        description: "Create analytics cards for task overview.",
        project: "TaskFlow",
        priority: "high",
        status: "todo",
        dueDate: "2026-10-10T00:00:00.000Z",
        checklist: [{ text: "Design cards", completed: false }],
      })
      .expect(201);

    expect(res.body.status).toBe("success");
    expect(res.body.data.task).toHaveProperty("title", "Build task dashboard");
    expect(res.body.data.task.owner).toBeTruthy();
  });

  it("should list tasks for the authenticated user and support filters", async () => {
    await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Review sprint board",
        description: "Check sprint board and close blockers.",
        project: "TaskFlow",
        priority: "high",
        status: "in-progress",
        dueDate: "2026-10-12T00:00:00.000Z",
      });

    const res = await request(app)
      .get("/api/v1/tasks?status=todo&priority=high")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data.tasks)).toBe(true);
    expect(res.body.data.tasks.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.tasks.every((task) => task.priority === "high")).toBe(
      true,
    );
    expect(res.body.data.tasks.every((task) => task.status === "todo")).toBe(
      true,
    );
  });

  it("should filter tasks due today", async () => {
    const today = new Date().toISOString();
    await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Submit daily standup report",
        project: "TaskFlow",
        priority: "medium",
        status: "todo",
        dueDate: today,
      });

    const res = await request(app)
      .get("/api/v1/tasks?dueDate=today")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.status).toBe("success");
    expect(res.body.data.tasks.some((t) => t.title === "Submit daily standup report")).toBe(true);
  });

  it("should search tasks safely including special characters without crashing", async () => {
    await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test special chars [bug #42]",
        description: "Verify regex escaping (v1.0)",
        project: "TaskFlow",
        priority: "low",
        status: "todo",
      });

    const res = await request(app)
      .get("/api/v1/tasks?search=[bug #42]")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.status).toBe("success");
    expect(res.body.data.tasks.some((t) => t.title.includes("[bug #42]"))).toBe(true);
  });

  it("should update a task owned by the authenticated user", async () => {
    const createRes = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Plan backlog cleanup",
        description: "Clean outdated sprint items.",
        project: "TaskFlow",
        priority: "medium",
        status: "todo",
      });

    const taskId = createRes.body.data.task._id;

    const res = await request(app)
      .patch(`/api/v1/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "done",
        priority: "low",
      })
      .expect(200);

    expect(res.body.status).toBe("success");
    expect(res.body.data.task.status).toBe("done");
    expect(res.body.data.task.priority).toBe("low");
  });

  it("should delete a task owned by the authenticated user", async () => {
    const createRes = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Archive resolved tasks",
        description: "Move completed tasks to archive.",
        project: "TaskFlow",
        priority: "low",
        status: "done",
      });

    const taskId = createRes.body.data.task._id;

    const res = await request(app)
      .delete(`/api/v1/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    expect(res.body).toEqual({});
  });

  it("should retrieve task detail with populated owner and activity log", async () => {
    const createRes = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Task Detail",
        description: "Verify task detail with activity",
        project: "TaskFlow",
        priority: "high",
        status: "in-progress",
        checklist: [{ text: "Item 1", completed: false }],
      });

    const taskId = createRes.body.data.task._id;

    const res = await request(app)
      .get(`/api/v1/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.status).toBe("success");
    expect(res.body.data.task.title).toBe("Test Task Detail");
    expect(res.body.data.task.owner).toHaveProperty("name");
    expect(res.body.data.task.owner).toHaveProperty("email");
    expect(Array.isArray(res.body.data.task.activity)).toBe(true);
    expect(res.body.data.task.activity.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.task.activity[0].text).toBe("Task created");
  });

  it("should add, toggle, and delete checklist items with activity tracking", async () => {
    const createRes = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Checklist Flow Task",
        project: "TaskFlow",
        priority: "medium",
        status: "todo",
      });

    const taskId = createRes.body.data.task._id;

    // 1) Add checklist item
    const addRes = await request(app)
      .post(`/api/v1/tasks/${taskId}/checklist`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Write unit tests" })
      .expect(200);

    expect(addRes.body.data.task.checklist.length).toBe(1);
    expect(addRes.body.data.task.checklist[0].text).toBe("Write unit tests");
    expect(addRes.body.data.task.checklist[0].completed).toBe(false);

    const itemId = addRes.body.data.task.checklist[0]._id;

    // 2) Toggle checklist item
    const toggleRes = await request(app)
      .patch(`/api/v1/tasks/${taskId}/checklist/${itemId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ completed: true })
      .expect(200);

    expect(toggleRes.body.data.task.checklist[0].completed).toBe(true);

    // 3) Delete checklist item
    const deleteRes = await request(app)
      .delete(`/api/v1/tasks/${taskId}/checklist/${itemId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(deleteRes.body.data.task.checklist.length).toBe(0);
  });

  it("should prevent unauthorized access to another user's task", async () => {
    // 1) Create task as first user
    const createRes = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Private User Task",
        project: "TaskFlow",
      });

    const taskId = createRes.body.data.task._id;

    // 2) Sign up second user
    const otherUserRes = await request(app)
      .post("/api/v1/users/signup")
      .send({
        name: "Other User",
        email: "otheruser@example.com",
        password: "Password123!",
        passwordConfirm: "Password123!",
      });

    const otherToken = otherUserRes.body.token;

    // 3) Second user tries to GET first user's task
    await request(app)
      .get(`/api/v1/tasks/${taskId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .expect(404);

    // 4) Second user tries to PATCH first user's task
    await request(app)
      .patch(`/api/v1/tasks/${taskId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ title: "Hacked Title" })
      .expect(404);
  });

  it("should return accurate dashboard statistics for authenticated user only", async () => {
    // 1) Query dashboard-stats for the primary user
    const statsRes = await request(app)
      .get("/api/v1/tasks/dashboard-stats")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(statsRes.body.status).toBe("success");
    const { stats } = statsRes.body.data;
    expect(stats).toHaveProperty("totalTasks");
    expect(stats).toHaveProperty("completedTasks");
    expect(stats).toHaveProperty("inProgressTasks");
    expect(stats).toHaveProperty("todoTasks");
    expect(stats).toHaveProperty("overdueTasks");
    expect(stats).toHaveProperty("focusScore");
    expect(stats).toHaveProperty("priority");
    expect(stats.priority).toHaveProperty("high");
    expect(stats.priority).toHaveProperty("medium");
    expect(stats.priority).toHaveProperty("low");
    expect(Array.isArray(stats.recentActivity)).toBe(true);
    expect(Array.isArray(stats.todayTasks)).toBe(true);

    // 2) Verify a newly signed up user gets 0 tasks and clean slate focusScore of 100
    const freshUserRes = await request(app)
      .post("/api/v1/users/signup")
      .send({
        name: "Fresh Analytics User",
        email: "freshanalytics@example.com",
        password: "Password123!",
        passwordConfirm: "Password123!",
      });

    const freshStatsRes = await request(app)
      .get("/api/v1/tasks/dashboard-stats")
      .set("Authorization", `Bearer ${freshUserRes.body.token}`)
      .expect(200);

    const freshStats = freshStatsRes.body.data.stats;
    expect(freshStats.totalTasks).toBe(0);
    expect(freshStats.completedTasks).toBe(0);
    expect(freshStats.inProgressTasks).toBe(0);
    expect(freshStats.overdueTasks).toBe(0);
    expect(freshStats.focusScore).toBe(100);
  });
});
