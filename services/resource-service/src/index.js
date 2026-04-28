import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4002;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fsad_lab_booking";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const SERVER_URL = `http://localhost:${PORT}`;

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Resource Service API",
      version: "1.0.0",
      description: "Lab resource CRUD APIs."
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
      "/health": { get: { summary: "Health check", responses: { 200: { description: "OK" } } } },
      "/resources": {
        get: { summary: "List resources", security: [{ bearerAuth: [] }], responses: { 200: { description: "OK" } } },
        post: { summary: "Create resource (admin)", security: [{ bearerAuth: [] }], responses: { 201: { description: "Created" } } }
      },
      "/resources/{id}": {
        put: { summary: "Update resource (admin)", security: [{ bearerAuth: [] }], responses: { 200: { description: "Updated" } } },
        delete: { summary: "Delete resource (admin)", security: [{ bearerAuth: [] }], responses: { 200: { description: "Deleted" } } }
      }
    }
  },
  apis: []
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    availableCount: { type: Number, required: true, min: 0 },
    condition: { type: String, default: "Good" }
  },
  { timestamps: true }
);

const Resource = mongoose.model("Resource", resourceSchema);

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

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}

app.get("/health", (_req, res) => {
  res.json({ service: "resource-service", status: "ok" });
});

app.get("/resources", authRequired, async (req, res) => {
  const { category, availableOnly, q } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (availableOnly === "true") filter.availableCount = { $gt: 0 };
  if (q) filter.name = { $regex: q, $options: "i" };

  const resources = await Resource.find(filter).sort({ createdAt: -1 });
  res.json(resources);
});

app.post("/resources", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const { name, category, description, quantity, availableCount, condition } = req.body;
    if (!name || !category || !quantity) {
      return res.status(400).json({ message: "name, category, quantity required" });
    }

    const resource = await Resource.create({
      name,
      category,
      description: description || "",
      quantity,
      availableCount: availableCount ?? quantity,
      condition: condition || "Good"
    });
    return res.status(201).json(resource);
  } catch (error) {
    return res.status(500).json({ message: "Create resource failed", error: error.message });
  }
});

app.put("/resources/:id", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const updated = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ message: "Resource not found" });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Update failed", error: error.message });
  }
});

app.delete("/resources/:id", authRequired, requireRole("admin"), async (req, res) => {
  const deleted = await Resource.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Resource not found" });
  return res.json({ message: "Resource deleted" });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`resource-service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Mongo connection failed:", error.message);
    process.exit(1);
  });
