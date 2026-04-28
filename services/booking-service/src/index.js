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

const PORT = process.env.PORT || 4003;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fsad_lab_booking";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const SERVER_URL = `http://localhost:${PORT}`;

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Booking Service API",
      version: "1.0.0",
      description: "Booking request and review workflow APIs."
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
      "/bookings": {
        get: { summary: "List bookings", security: [{ bearerAuth: [] }], responses: { 200: { description: "OK" } } },
        post: { summary: "Create booking (student)", security: [{ bearerAuth: [] }], responses: { 201: { description: "Created" } } }
      },
      "/bookings/{id}/decision": {
        patch: { summary: "Approve or reject booking", security: [{ bearerAuth: [] }], responses: { 200: { description: "Updated" } } }
      },
      "/bookings/{id}/return": {
        patch: { summary: "Mark booking returned", security: [{ bearerAuth: [] }], responses: { 200: { description: "Updated" } } }
      }
    }
  },
  apis: []
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const bookingSchema = new mongoose.Schema(
  {
    resourceId: { type: String, required: true },
    resourceName: { type: String, required: true },
    requestedBy: { type: String, required: true },
    requestedByEmail: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    purpose: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "returned"],
      default: "pending"
    },
    reviewedBy: { type: String, default: "" }
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

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
  res.json({ service: "booking-service", status: "ok" });
});

app.get("/bookings", authRequired, async (req, res) => {
  const filter = {};
  if (req.user.role === "student") filter.requestedBy = req.user.userId;
  const items = await Booking.find(filter).sort({ createdAt: -1 });
  res.json(items);
});

app.post("/bookings", authRequired, requireRole("student"), async (req, res) => {
  try {
    const { resourceId, resourceName, startTime, endTime, purpose } = req.body;
    if (!resourceId || !resourceName || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required booking fields" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      return res.status(400).json({ message: "Invalid time range" });
    }

    // Prevent overlapping approved bookings for the same resource.
    const overlap = await Booking.findOne({
      resourceId,
      status: "approved",
      startTime: { $lt: end },
      endTime: { $gt: start }
    });
    if (overlap) {
      return res.status(409).json({ message: "Resource already booked for this slot" });
    }

    const booking = await Booking.create({
      resourceId,
      resourceName,
      requestedBy: req.user.userId,
      requestedByEmail: req.user.email,
      startTime: start,
      endTime: end,
      purpose: purpose || ""
    });
    return res.status(201).json(booking);
  } catch (error) {
    return res.status(500).json({ message: "Create booking failed", error: error.message });
  }
});

app.patch(
  "/bookings/:id/decision",
  authRequired,
  requireRole("faculty", "admin"),
  async (req, res) => {
    const { decision } = req.body;
    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "decision must be approved or rejected" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Only pending bookings can be reviewed" });
    }

    if (decision === "approved") {
      const overlap = await Booking.findOne({
        _id: { $ne: booking._id },
        resourceId: booking.resourceId,
        status: "approved",
        startTime: { $lt: booking.endTime },
        endTime: { $gt: booking.startTime }
      });
      if (overlap) {
        return res
          .status(409)
          .json({ message: "Conflict: another approved booking exists for this slot" });
      }
    }

    booking.status = decision;
    booking.reviewedBy = req.user.email;
    await booking.save();
    return res.json(booking);
  }
);

app.patch(
  "/bookings/:id/return",
  authRequired,
  requireRole("faculty", "admin"),
  async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "approved") {
      return res.status(400).json({ message: "Only approved bookings can be marked returned" });
    }
    booking.status = "returned";
    booking.reviewedBy = req.user.email;
    await booking.save();
    return res.json(booking);
  }
);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`booking-service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Mongo connection failed:", error.message);
    process.exit(1);
  });
