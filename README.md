# authlite-express

A lightweight, plug-and-play **authentication and authorization SDK for Express.js**, inspired by the developer experience of platforms like Clerk, but designed to be **self-hosted, minimal, and backend-focused**.

This library abstracts authentication logic (JWT, password hashing, RBAC, middleware) into a reusable npm package so developers don’t have to reimplement auth in every Express project.

---

## Why authlite-express?

In most Express applications, developers repeatedly write:

- Password hashing logic
- JWT generation and verification
- Authentication middleware
- Role-based authorization checks

**authlite-express** packages these concerns into a clean, reusable SDK with a simple API and minimal configuration.

---

## 📂 Project Folder Structure

```
authlite-express/
├── src/
│   ├── config/
│   │   └── initAuth.js
│   │
│   ├── core/
│   │   ├── AuthService.js
│   │   ├── PasswordService.js
│   │   └── TokenService.js
│   │
│   ├── middleware/
│   │   ├── authenticate.js
│   │   └── authorize.js
│   │
│   └── index.js
│
├── package.json
├── README.md
├── .gitignore
└── .npmignore
```

---

## 🚀 Features

- JWT-based authentication
- Secure password hashing using bcrypt
- Role-Based Access Control (RBAC)
- Plug-and-play Express middleware
- Minimal configuration
- Fully self-hosted (no third-party auth provider)
- Written in modern JavaScript (ES6+)

## 📦 Installation

```bash
npm install authlite-express
```

---

## ⚙️ One-Time Initialization

```js
import { initAuth } from "authlite-express";

initAuth({
  jwtSecret: process.env.JWT_SECRET,
  userModel: User,
  roleField: "role",
  tokenExpiry: "7d",
});
```

> ⚠️ `initAuth()` **must be called before using any middleware or services**.

---

## Authentication API

### Register User

```js
import { AuthService } from "authlite-express";

await AuthService.registerUser({
  email: "user@example.com",
  password: "securepassword",
  role: "user",
});
```

---

### Login User

```js
const { user, token } = await AuthService.loginUser({
  email: "user@example.com",
  password: "securepassword",
});
```

---

## Middleware Usage

### Authenticate Requests

```js
import { authenticate } from "authlite-express";

app.get("/profile", authenticate(), (req, res) => {
  res.json(req.user);
});
```

### Role-Based Authorization

```js
import { authenticate, authorize } from "authlite-express";

app.get("/admin", authenticate(), authorize("admin"), (req, res) =>
  res.send("Admin access granted")
);
```

---

## 📌 Demo Application

A complete **Express.js demo application** demonstrating real-world usage of
`authlite-express` is available here:

👉 **Demo Repository:**  
https://github.com/Amarsah15/authlite-express-demo

### What the demo shows

- User registration using `AuthService.registerUser`
- User login with JWT generation
- Route protection using `authenticate()` middleware
- Role-based access control using `authorize()`
- MongoDB integration (Docker-based)

The demo app intentionally keeps business logic minimal to highlight the
developer experience and integration flow of the library.

---

## 📌 Demo Application (Separate Repository)

A minimal demo Express app that consumes this package exactly like a real user.

### Demo Repo Structure

```
authlite-express-demo/
├── src/
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── auth.routes.js
│   └── index.js
│
├── .env.example
├── package.json
└── README.md
```

### Demo `src/index.js`

```js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import User from "./models/User.js";
import { initAuth } from "authlite-express";

dotenv.config();

const app = express();
app.use(express.json());

// Database connection
await mongoose.connect(process.env.MONGO_URI);
console.log("MongoDB connected");

// Initialize authlite-express
initAuth({
  jwtSecret: process.env.JWT_SECRET,
  userModel: User,
  roleField: "role",
});

// Routes
app.use("/", authRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("authlite-express demo running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

## How It Works

1. Passwords are hashed using bcrypt during registration
2. JWT is generated on successful login
3. `authenticate()` verifies token and attaches claims to `req.user`
4. `authorize()` checks role-based access

---

## 📄 License

MIT
