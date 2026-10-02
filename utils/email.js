const nodemailer = require("nodemailer");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name ? user.name.trim().split(" ")[0] : "there";
    this.url = url || "http://localhost:5173/dashboard";
    this.from = process.env.EMAIL_FROM || "TaskFlow <welcome@taskflow.dev>";
  }

  newTransport() {
    // 1) Test environment: in-memory mock to keep tests instant and offline
    if (process.env.NODE_ENV === "test") {
      return {
        sendMail: async (mailOptions) => {
          Email.lastSentEmail = mailOptions;
          return { messageId: "test-mock-id", ...mailOptions };
        },
      };
    }

    // 2) If real SMTP credentials are provided (e.g. Mailtrap, SendGrid, Gmail)
    if (process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io",
        port: process.env.EMAIL_PORT || 2525,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    // 3) Development fallback: Stream transport with console preview
    return nodemailer.createTransport({
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });
  }

  // Send the actual email
  async send(subject, html, text) {
    // 1) Define mail options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text,
    };

    // 2) Create transport and send
    const transport = this.newTransport();
    const info = await transport.sendMail(mailOptions);

    // In local development without external SMTP, log formatted preview in console
    if (
      process.env.NODE_ENV !== "test" &&
      (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD)
    ) {
      console.log("\n=======================================================");
      console.log(`✉️  [TASKFLOW EMAIL SERVICE] Welcome Email Preview`);
      console.log(`To: ${this.to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Dashboard Link: ${this.url}`);
      console.log("=======================================================\n");
    }

    return info;
  }

  // Welcome email template
  async sendWelcome() {
    const subject = `Welcome to TaskFlow, ${this.firstName}! 🚀`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #070b14;
      color: #edf1ff;
    }
    .wrapper {
      width: 100%;
      background-color: #070b14;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #0c1424;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .header {
      padding: 36px 40px 24px;
      text-align: center;
      background: linear-gradient(135deg, rgba(124, 92, 255, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .logo {
      font-size: 26px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.5px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .logo-badge {
      background: linear-gradient(135deg, #7c3aed, #3b82f6);
      color: #ffffff;
      padding: 6px 10px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: bold;
    }
    .content {
      padding: 36px 40px;
      font-size: 15px;
      line-height: 1.65;
      color: #cbd5e1;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      margin-top: 0;
      margin-bottom: 18px;
    }
    .card {
      background-color: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 20px;
      margin: 24px 0;
    }
    .card-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 14px;
    }
    .card-item:last-child {
      margin-bottom: 0;
    }
    .item-bullet {
      font-size: 18px;
      margin-right: 12px;
      line-height: 1.4;
    }
    .item-text strong {
      color: #ffffff;
    }
    .cta-container {
      text-align: center;
      margin: 32px 0 24px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 34px;
      border-radius: 14px;
      font-weight: 700;
      font-size: 15px;
      letter-spacing: 0.2px;
      box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.5);
    }
    .footer {
      padding: 24px 40px 32px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">
          <span class="logo-badge">✓</span> TaskFlow
        </div>
      </div>
      <div class="content">
        <h1>Welcome aboard, ${this.firstName}! 👋</h1>
        <p>
          We're thrilled to welcome you to <strong>TaskFlow</strong>. Your personal productivity headquarters is officially set up and ready to help you plan, execute, and deliver results.
        </p>

        <div class="card">
          <div class="card-item">
            <span class="item-bullet">🎯</span>
            <div class="item-text">
              <strong>Smart Priorities:</strong> Categorize your workload into High, Medium, and Low priorities with clear visual tracking.
            </div>
          </div>
          <div class="card-item" style="margin-top: 12px;">
            <span class="item-bullet">⚡</span>
            <div class="item-text">
              <strong>Focus & Velocity Score:</strong> Get immediate real-time feedback on your daily momentum and completion rates.
            </div>
          </div>
          <div class="card-item" style="margin-top: 12px;">
            <span class="item-bullet">🌓</span>
            <div class="item-text">
              <strong>Seamless Themes:</strong> Enjoy custom Dark and Light modes tailored for focus and readability any time of day.
            </div>
          </div>
        </div>

        <div class="cta-container">
          <a href="${this.url}" class="btn" target="_blank">Launch Your Dashboard &rarr;</a>
        </div>

        <p style="font-size: 13px; color: #94a3b8; text-align: center;">
          Or open this link directly in your browser: <br>
          <a href="${this.url}" style="color: #a78bfa; word-break: break-all;">${this.url}</a>
        </p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} TaskFlow Inc. Built for peak productivity.</p>
        <p>You received this email because an account was registered with ${this.to}.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Welcome to TaskFlow, ${this.firstName}!

Your personal productivity headquarters is ready.

Features ready for you:
- Smart Priorities: Categorize your workload with clear visual tracking.
- Focus & Velocity: Real-time feedback on your momentum and completion rates.
- Seamless Dark & Light Modes: Tailored for focus any time of day.

Launch your dashboard:
${this.url}

Cheers,
The TaskFlow Team
    `.trim();

    return this.send(subject, html, text);
  }

  // Password reset email template
  async sendPasswordReset() {
    const subject = "Your TaskFlow Password Reset Token (Valid for 10 minutes)";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #070b14; color: #cbd5e1; margin: 0; padding: 40px 0; }
    .container { max-width: 540px; margin: 0 auto; background-color: #0c1424; border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; padding: 36px; }
    h1 { color: #ffffff; font-size: 22px; margin-top: 0; }
    .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed, #3b82f6); color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: bold; margin: 20px 0; }
    .footer { font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Password Reset Request</h1>
    <p>Hi ${this.firstName},</p>
    <p>Forgot your password? Click the button below to choose a new password. This reset link is valid for <strong>10 minutes</strong>.</p>
    <div style="text-align: center;">
      <a href="${this.url}" class="btn" target="_blank">Reset Password &rarr;</a>
    </div>
    <p style="font-size: 12px; color: #94a3b8;">If you did not request a password reset, you can safely ignore this email.</p>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} TaskFlow. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
Hi ${this.firstName},

Forgot your password? Use the link below to set a new password (valid for 10 minutes):
${this.url}

If you didn't request a password reset, please ignore this email.

The TaskFlow Team
    `.trim();

    return this.send(subject, html, text);
  }
};
