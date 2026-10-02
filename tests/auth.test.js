const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");

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

describe("Auth API", () => {
  it("should create a new user with signup", async () => {
    const res = await request(app)
      .post("/api/v1/users/signup")
      .send({
        name: "Maya Chen",
        email: "maya@example.com",
        password: "Password123!",
        passwordConfirm: "Password123!",
      })
      .expect(201);

    expect(res.body.status).toBe("success");
    expect(res.body.data.user).toHaveProperty("email", "maya@example.com");
    expect(res.body.data.user).not.toHaveProperty("password");
  });

  it("should send a welcome email when a user signs up", async () => {
    const Email = require("../utils/email");
    Email.lastSentEmail = null;

    const res = await request(app)
      .post("/api/v1/users/signup")
      .send({
        name: "Welcome Tester",
        email: "welcome.test@example.com",
        password: "Password123!",
        passwordConfirm: "Password123!",
      })
      .expect(201);

    expect(res.body.status).toBe("success");
    expect(Email.lastSentEmail).toBeDefined();
    expect(Email.lastSentEmail.to).toBe("welcome.test@example.com");
    expect(Email.lastSentEmail.subject).toContain("Welcome to TaskFlow");
    expect(Email.lastSentEmail.html).toContain("Welcome aboard, Welcome!");
  });

  it("should reject signup with a weak password", async () => {
    const res = await request(app).post("/api/v1/users/signup").send({
      name: "Weak User",
      email: "weak@example.com",
      password: "weak",
      passwordConfirm: "weak",
    });

    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("should login an existing user", async () => {
    const res = await request(app)
      .post("/api/v1/users/login")
      .send({
        email: "maya@example.com",
        password: "Password123!",
      })
      .expect(200);

    expect(res.body.status).toBe("success");
    expect(res.body.token).toBeTruthy();
    expect(res.body.data.user).toHaveProperty("email", "maya@example.com");
    expect(res.body.data.user).not.toHaveProperty("password");
  });

  it("should reject login with wrong credentials", async () => {
    const res = await request(app).post("/api/v1/users/login").send({
      email: "maya@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe("fail");
  });

  it("should allow access to current user route with a valid token", async () => {
    const loginRes = await request(app).post("/api/v1/users/login").send({
      email: "maya@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${loginRes.body.token}`)
      .expect(200);

    expect(res.body.status).toBe("success");
    expect(res.body.data.user).toHaveProperty("email", "maya@example.com");
    expect(res.body.data.user).not.toHaveProperty("password");
  });

  it("should reject access to current user route without a token", async () => {
    const res = await request(app).get("/api/v1/users/me");

    expect(res.status).toBe(401);
    expect(res.body.status).toBe("fail");
  });

  it("should reject access with an invalid or malformed token", async () => {
    const res = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", "Bearer invalid.token.value");

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Invalid token/i);
  });

  it("should reject access when token has expired", async () => {
    const jwt = require("jsonwebtoken");
    const expiredToken = jwt.sign(
      { id: "507f1f77bcf86cd799439011" },
      process.env.JWT_SECRET,
      { expiresIn: "0s" },
    );

    const res = await request(app)
      .get("/api/v1/users/me")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/expired/i);
  });

  it("should clear the jwt cookie on logout", async () => {
    const res = await request(app).get("/api/v1/users/logout").expect(200);

    expect(res.body.status).toBe("success");
    const cookie = res.headers["set-cookie"];
    expect(cookie).toBeDefined();
    expect(cookie[0]).toContain("jwt=loggedout");
  });

  it("should update user profile details via updateMe", async () => {
    const loginRes = await request(app).post("/api/v1/users/login").send({
      email: "maya@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .patch("/api/v1/users/updateMe")
      .set("Authorization", `Bearer ${loginRes.body.token}`)
      .send({
        name: "Maya Updated",
      })
      .expect(200);

    expect(res.body.status).toBe("success");
    expect(res.body.data.user.name).toBe("Maya Updated");
  });

  it("should reject password updates via updateMe", async () => {
    const loginRes = await request(app).post("/api/v1/users/login").send({
      email: "maya@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .patch("/api/v1/users/updateMe")
      .set("Authorization", `Bearer ${loginRes.body.token}`)
      .send({
        password: "NewPassword123!",
      })
      .expect(400);

    expect(res.body.status).toBe("fail");
  });

  it("should update password via updateMyPassword and reissue token", async () => {
    const loginRes = await request(app).post("/api/v1/users/login").send({
      email: "maya@example.com",
      password: "Password123!",
    });

    const res = await request(app)
      .patch("/api/v1/users/updateMyPassword")
      .set("Authorization", `Bearer ${loginRes.body.token}`)
      .send({
        passwordCurrent: "Password123!",
        password: "NewPassword123!",
        passwordConfirm: "NewPassword123!",
      })
      .expect(200);

    expect(res.body.status).toBe("success");
    expect(res.body.token).toBeTruthy();

    // Verify login with new password works
    const newLogin = await request(app).post("/api/v1/users/login").send({
      email: "maya@example.com",
      password: "NewPassword123!",
    });
    expect(newLogin.status).toBe(200);
  });

  it("should reject updateMyPassword with wrong current password", async () => {
    const loginRes = await request(app).post("/api/v1/users/login").send({
      email: "maya@example.com",
      password: "NewPassword123!",
    });

    const res = await request(app)
      .patch("/api/v1/users/updateMyPassword")
      .set("Authorization", `Bearer ${loginRes.body.token}`)
      .send({
        passwordCurrent: "WrongPassword123!",
        password: "AnotherPassword123!",
        passwordConfirm: "AnotherPassword123!",
      })
      .expect(401);

    expect(res.body.status).toBe("fail");
  });

  it("should reject updateMyPassword when new password is the same as current password", async () => {
    const loginRes = await request(app).post("/api/v1/users/login").send({
      email: "maya@example.com",
      password: "NewPassword123!",
    });

    const res = await request(app)
      .patch("/api/v1/users/updateMyPassword")
      .set("Authorization", `Bearer ${loginRes.body.token}`)
      .send({
        passwordCurrent: "NewPassword123!",
        password: "NewPassword123!",
        passwordConfirm: "NewPassword123!",
      })
      .expect(400);

    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("New password cannot be the same");
  });

  it("should upload user avatar image via updateMe", async () => {
    const loginRes = await request(app).post("/api/v1/users/login").send({
      email: "maya@example.com",
      password: "NewPassword123!",
    });

    const res = await request(app)
      .patch("/api/v1/users/updateMe")
      .set("Authorization", `Bearer ${loginRes.body.token}`)
      .field("name", "Maya With Avatar")
      .attach("photo", Buffer.from("fake image content"), "avatar.jpg")
      .expect(200);

    expect(res.body.status).toBe("success");
    expect(res.body.data.user.name).toBe("Maya With Avatar");
    expect(res.body.data.user.photo).toContain("/public/img/users/user-");
  });

  it("should reject non-image file uploads via updateMe", async () => {
    const loginRes = await request(app).post("/api/v1/users/login").send({
      email: "maya@example.com",
      password: "NewPassword123!",
    });

    const res = await request(app)
      .patch("/api/v1/users/updateMe")
      .set("Authorization", `Bearer ${loginRes.body.token}`)
      .attach("photo", Buffer.from("this is text"), "document.txt")
      .expect(400);

    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("Not an image");
  });

  it("should generate a password reset token for registered email", async () => {
    const res = await request(app)
      .post("/api/v1/users/forgotPassword")
      .send({ email: "maya@example.com" })
      .expect(200);

    expect(res.body.status).toBe("success");
    expect(res.body.resetToken).toBeDefined();
    expect(res.body.resetURL).toContain("/reset-password/");
  });

  it("should return 404 for non-existent email in forgotPassword", async () => {
    const res = await request(app)
      .post("/api/v1/users/forgotPassword")
      .send({ email: "nonexistent@example.com" })
      .expect(404);

    expect(res.body.status).toBe("fail");
  });

  it("should reset password with valid token and allow login with new password", async () => {
    // 1) Request reset token
    const forgotRes = await request(app)
      .post("/api/v1/users/forgotPassword")
      .send({ email: "maya@example.com" })
      .expect(200);

    const token = forgotRes.body.resetToken;

    // 2) Reset password
    const resetRes = await request(app)
      .patch(`/api/v1/users/resetPassword/${token}`)
      .send({
        password: "BrandNewPassword123!",
        passwordConfirm: "BrandNewPassword123!",
      })
      .expect(200);

    expect(resetRes.body.status).toBe("success");
    expect(resetRes.body.token).toBeDefined();

    // 3) Login with newly reset password
    const loginRes = await request(app)
      .post("/api/v1/users/login")
      .send({
        email: "maya@example.com",
        password: "BrandNewPassword123!",
      })
      .expect(200);

    expect(loginRes.body.status).toBe("success");
  });

  it("should reject password reset with invalid token", async () => {
    const res = await request(app)
      .patch("/api/v1/users/resetPassword/invalidtoken123456789")
      .send({
        password: "BrandNewPassword123!",
        passwordConfirm: "BrandNewPassword123!",
      })
      .expect(400);

    expect(res.body.status).toBe("fail");
    expect(res.body.message).toContain("Token is invalid or has expired");
  });

  it("should reject password reset when new password is the same as the current password", async () => {
    // 1) Request reset token
    const forgotRes = await request(app)
      .post("/api/v1/users/forgotPassword")
      .send({ email: "maya@example.com" })
      .expect(200);

    const token = forgotRes.body.resetToken;

    // 2) Attempt to reset with current password ("BrandNewPassword123!" from previous test)
    const resetRes = await request(app)
      .patch(`/api/v1/users/resetPassword/${token}`)
      .send({
        password: "BrandNewPassword123!",
        passwordConfirm: "BrandNewPassword123!",
      })
      .expect(400);

    expect(resetRes.body.status).toBe("fail");
    expect(resetRes.body.message).toContain("New password cannot be the same as your current password");
  });
});



