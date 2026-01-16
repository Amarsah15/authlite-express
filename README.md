# authlite-express

A lightweight, plug-and-play **authentication and authorization SDK for Express.js**, inspired by the developer experience of platforms like Clerk, but designed to be **self-hosted, minimal, and backend-focused**.

This library abstracts common authentication logic (JWT, password hashing, RBAC, middleware) into a reusable npm package so developers don’t have to reimplement auth in every Express project.

---

## ✨ Why authlite-express?

In most Express applications, developers repeatedly write:

- Password hashing logic
- JWT generation and verification
- Authentication middleware
- Role-based authorization checks

**authlite-express** packages these concerns into a clean, reusable SDK with a simple API and minimal configuration.

---

## 📂 Project Folder Structure (Library)

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
└── .npmignore
```

---

## 🚀 Features (MVP)

- JWT-based authentication
- Secure password hashing using bcrypt
- Role-Based Access Control (RBAC)
- Plug-and-play Express middleware
- ES Modules (`type: module`) support
- Minimal configuration
- Fully self-hosted (no third-party auth provider)

---

## ❌ Non-Goals (Intentional)

To keep the library focused and maintainable, the following are **out of scope for the MVP**:

- OAuth (Google, GitHub, etc.)
- Refresh tokens
- Cookie-based sessions
- UI components
- Opinionated database adapters

---

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
  roleField: "role", // optional (default: "role")
  tokenExpiry: "7d", // optional (default: "7d")
});
```

> ⚠️ `initAuth()` **must be called before using any middleware or services**.

---

## 🔐 Authentication API

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

## 🛡️ Middleware Usage

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
import {
  initAuth,
  authenticate,
  authorize,
  AuthService,
} from "authlite-express";
import User from "./models/User.js";

dotenv.config();
const app = express();
app.use(express.json());

await mongoose.connect(process.env.MONGO_URI);

initAuth({
  jwtSecret: process.env.JWT_SECRET,
  userModel: User,
  roleField: "role",
});

app.post("/login", async (req, res) => {
  try {
    const data = await AuthService.loginUser(req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/admin", authenticate(), authorize("admin"), (req, res) =>
  res.send("Admin access granted")
);

app.listen(3000, () => console.log("Demo server running"));
```

---

## 🧠 How It Works (High Level)

1. Passwords are hashed using bcrypt during registration
2. JWT is generated on successful login
3. `authenticate()` verifies token and attaches claims to `req.user`
4. `authorize()` checks role-based access

---

## 📄 License

MIT
