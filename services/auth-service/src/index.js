import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4001;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fsad_lab_booking";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const SERVER_URL = `http://localhost:${PORT}`;

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auth Service API",
      version: "1.0.0",
      description: "Authentication and user profile APIs."
    },
    servers: [{ url: SERVER_URL }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    paths: {
      "/health": {
        get: {
          summary: "Service health check",
          responses: { 200: { description: "Service is healthy" } }
        }
      },
      "/auth/signup": {
        post: {
          summary: "Create user account",
          responses: { 201: { description: "Created" }, 400: { description: "Bad request" } }
        }
      },
      "/auth/login": {
        post: {
          summary: "Login and get token",
          responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } }
        }
      },
      "/auth/me": {
        get: {
          summary: "Current user profile",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "OK" }, 401: { description: "Unauthorized" } }
        }
      }
    }
  },
  apis: []
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student"
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function authRequired(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

app.get("/health", (_req, res) => {
  res.json({ service: "auth-service", status: "ok" });
});

app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 chars" });
    }
    if (role && !["student", "faculty", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || "student"
    });

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ message: "Signup failed", error: error.message });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
});

app.get("/auth/me", authRequired, async (req, res) => {
  const user = await User.findById(req.user.userId).select("-passwordHash");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  return res.json(user);
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`auth-service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Mongo connection failed:", error.message);
    process.exit(1);
  });
