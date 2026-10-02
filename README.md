# 🚀 TaskFlow — Modern Full-Stack Task & Project Management Platform

A high-performance, production-grade task and project management web application built with **React 19**, **Node.js**, **Express**, **MongoDB Atlas**, and **Tailwind CSS**. Designed with rich aesthetics, dual **Dark & Light modes**, multi-tier in-memory caching, comprehensive security hardening, and transactional email notifications.

---

## 🌟 Key Features

### 1. 🔐 Enterprise-Grade Authentication & Security
- **Secure JWT Architecture:** Authenticated using HTTP-Only cookies with CSRF & XSS mitigation.
- **Password Security:** Salted and hashed using `bcryptjs` (cost factor 12) with entropy protection.
- **Password Recovery Flow:** Cryptographically secure one-time reset tokens (SHA-256 hashed with 10-minute expiry).
- **Email Notifications:** Transactional welcome emails on signup and reset password emails powered by Nodemailer.
- **NoSQL Injection Defense:** Sanitizes query parameters and bodies with `express-mongo-sanitize` and strict type boundaries.
- **Cross-Site Scripting (XSS) Sanitization:** Strips script tags and malicious attributes across user inputs while preserving password character integrity.
- **Rate Limiting:** Multi-tiered IP rate limits (`express-rate-limit`) preventing brute force and API abuse.
- **Security Headers:** Strict `helmet` policy enforcing `nosniff`, `SAMEORIGIN`, and restrictive CORS.

### 2. 📋 Comprehensive Task Management & Vertical Workflows
- **Dynamic Task Creation & Editing:** Title, description, project tags, due date, status, and priority levels.
- **Real-Time Checklists:** Subtask tracking with interactive progress calculation.
- **Full Activity Timeline:** Automatic audit log recording task creation, status changes, checklist toggles, and updates.
- **Advanced Filtering & Search:** Real-time multi-criteria filtering by status (`todo`, `in-progress`, `done`), priority (`low`, `medium`, `high`), and safe regex search.

### 3. 📊 Dashboard Analytics & Focus Metrics
- **Live Metric Cards:** Total tasks, completed, in-progress, and overdue tracking.
- **Algorithmic Focus Score:** Dynamic productivity score calculated from task completion ratios and deadline adherence.
- **Today's Focus Section:** Dedicated daily task overview for immediate execution.
- **Interactive Quick-Action Modals:** Seamless modal views for quick task updates and detail exploration.

### 4. 🎨 Design System & Theme Engine
- **Dark & Light Mode Support:** One-click instant theme switching with persistent user preference storage.
- **Refined Luxury Aesthetics:** Modern glassmorphism, tailored contrast palettes, smooth transitions, and responsive navigation drawer.
- **Accessible & Responsive:** Fully responsive across mobile, tablet, and widescreen desktop layouts.

### 5. ⚡ Performance & Multi-Tier Caching
- **Server-Side In-Memory Cache:** Zero-dependency TTL cache engine cutting MongoDB query latency by over 60%.
- **Instant Client Hydration:** Cold-start loading spinners eliminated via TanStack Query and local session hydration.
- **Lean Database Queries:** Stripped heavy subdocuments from list views and optimized aggregation pipelines.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Lucide Icons
- **State & Server Cache:** TanStack React Query (v5)
- **Forms:** React Hook Form
- **Notifications:** React Hot Toast
- **Routing:** React Router DOM (v7)

### Backend
- **Runtime:** Node.js + Express
- **Database:** MongoDB Atlas + Mongoose (v8)
- **Security:** Helmet, Express Mongo Sanitize, Express Rate Limit, BcryptJS, JSONWebToken, Validator
- **File Uploads:** Multer (restricted image upload with size & mime guards)
- **Email Service:** Nodemailer
- **Testing:** Jest, Supertest, MongoMemoryServer

---

## 📁 Project Architecture

```text
task-manager/
├── client/                     # Frontend Vite + React application
│   ├── src/
│   │   ├── assets/             # Static graphics and icons
│   │   ├── context/            # ThemeContext (Dark/Light mode)
│   │   ├── features/           # Feature-by-Feature (Vertical Slices)
│   │   │   ├── auth/           # Auth forms, hooks, API services
│   │   │   └── tasks/          # Task tables, modals, checklists, hooks
│   │   ├── pages/              # Routed views (Dashboard, Tasks, Profile, etc.)
│   │   ├── services/           # Axios/Fetch base API client
│   │   ├── ui/                 # Reusable atomic UI components (Buttons, Spinners)
│   │   └── utils/              # Client helpers (avatar formatters, theme helpers)
│   └── package.json
├── controllers/                # Express controllers (auth, task, user, error)
├── models/                     # Mongoose schemas (userModel, taskModel)
├── routes/                     # Express REST routes (userRoutes, taskRoutes)
├── utils/                      # In-memory cache, email service, XSS sanitizer, API features
├── tests/                      # Automated test suites (auth, task, security, email)
├── public/                     # Static assets and user uploads
├── app.js                      # Express middleware and security pipeline
├── server.js                   # Application entry point and database connection
├── config.env.example          # Environment variable template
└── package.json
```

---

## 🚦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account or local MongoDB instance

### 1. Clone the Repository
```bash
git clone https://github.com/AbdallaTaher/taskFlow.git
cd taskFlow
```

### 2. Configure Environment Variables
Copy the template configuration file:
```bash
cp config.env.example config.env
```
Open `config.env` and fill in your values:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-here-minimum-32-chars
JWT_EXPIRES_IN=7d
DATABASE=your_mongodb_connection_string

# Email Service (Mailtrap or SMTP)
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USERNAME=your_username
EMAIL_PASSWORD=your_password
EMAIL_FROM="TaskFlow <welcome@taskflow.dev>"
```

### 3. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 4. Run Development Servers
```bash
# Run backend server (http://localhost:5000)
npm run dev

# In a separate terminal, run frontend client (http://localhost:5173)
npm run client
```

---

## 🧪 Testing

TaskFlow features automated testing covering authentication flows, task CRUD, ownership isolation, NoSQL injection, XSS defense, and email delivery.

```bash
# Run all automated test suites with Jest
npm test
```

### Test Suite Summary:
```text
PASS tests/security.test.js
PASS tests/auth.test.js
PASS tests/task.test.js
PASS tests/email.test.js

Test Suites: 4 passed, 4 total
Tests:       41 passed, 41 total
```

---

## 🔒 Security & Privacy

- Sensitive files (`config.env`, credentials) are strictly ignored via `.gitignore`.
- Production errors conceal stack traces and sensitive database information.
- All requests are sanitized against query hijacking and code injection.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
