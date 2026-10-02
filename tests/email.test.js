const Email = require("../utils/email");

describe("Email Utility", () => {
  beforeEach(() => {
    Email.lastSentEmail = null;
  });

  it("should send a welcome email with correct recipient, subject, and personalized greeting", async () => {
    const user = {
      name: "Sarah Connor",
      email: "sarah@example.com",
    };
    const dashboardUrl = "http://localhost:5173/dashboard";

    const email = new Email(user, dashboardUrl);
    await email.sendWelcome();

    expect(Email.lastSentEmail).toBeDefined();
    expect(Email.lastSentEmail.to).toBe("sarah@example.com");
    expect(Email.lastSentEmail.subject).toContain("Welcome to TaskFlow, Sarah!");
    expect(Email.lastSentEmail.html).toContain("Welcome aboard, Sarah!");
    expect(Email.lastSentEmail.html).toContain(dashboardUrl);
    expect(Email.lastSentEmail.text).toContain("Welcome to TaskFlow, Sarah!");
  });

  it("should fallback to 'there' if user has no name", async () => {
    const user = {
      email: "anonymous@example.com",
    };

    const email = new Email(user);
    await email.sendWelcome();

    expect(Email.lastSentEmail).toBeDefined();
    expect(Email.lastSentEmail.to).toBe("anonymous@example.com");
    expect(Email.lastSentEmail.subject).toContain("Welcome to TaskFlow, there!");
    expect(Email.lastSentEmail.html).toContain("Welcome aboard, there!");
  });

  it("should send a password reset email with reset token URL", async () => {
    const user = {
      name: "John Doe",
      email: "john@example.com",
    };
    const resetUrl = "http://localhost:5173/reset-password/sample-token-123";

    const email = new Email(user, resetUrl);
    await email.sendPasswordReset();

    expect(Email.lastSentEmail).toBeDefined();
    expect(Email.lastSentEmail.to).toBe("john@example.com");
    expect(Email.lastSentEmail.subject).toContain("Password Reset");
    expect(Email.lastSentEmail.html).toContain(resetUrl);
    expect(Email.lastSentEmail.text).toContain(resetUrl);
  });
});
