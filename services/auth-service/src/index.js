import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));
app.use(express.json());

/* =======================
   CONFIG
======================= */
const PORT = 4001;

//  FORCE ATLA
const MONGO_URI = "mongodb+srv://2024tm93519_db_user:Test1234@projects.hc5yaxo.mongodb.net/fsad_lab_booking";

const JWT_SECRET = "dev_secret_change_me";

/* =======================
   DB CONNECT
======================= */
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(" MongoDB connected");

    //  DEBUG
    console.log(" DB Name:", mongoose.connection.name);
    console.log(" DB Host:", mongoose.connection.host);

    app.listen(PORT, () => {
      console.log(` Auth service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error(" MongoDB connection error:", err);
    process.exit(1);
  });

/* =======================
   MODEL
======================= */
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student"
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

/* =======================
   HELPERS
======================= */
function signToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      email: user.email
    },
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
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

/* =======================
   ROUTES
======================= */

// Health
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// SIGNUP
app.post("/auth/signup", async (req, res) => {
  try {
    console.log(" Signup request:", req.body);

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email, password required"
      });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || "student"
    });

    console.log(" User saved:", user.email);

    const token = signToken(user);

    return res.status(201).json({
      message: "User created",
      token,
      user
    });

  } catch (err) {
    console.error(" Signup error:", err);
    return res.status(500).json({
      message: "Signup failed",
      error: err.message
    });
  }
});

// LOGIN
app.post("/auth/login", async (req, res) => {
  try {
    console.log(" Login request:", req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);

    if (!match) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    console.log(" Login success:", user.email);

    const token = signToken(user);

    return res.json({
      message: "Login successful",
      token,
      user
    });

  } catch (err) {
    console.error(" Login error:", err);
    return res.status(500).json({
      message: "Login failed"
    });
  }
});

// CURRENT USER
app.get("/auth/me", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-passwordHash");
    res.json(user);
  } catch {
    res.status(500).json({ message: "Error fetching user" });
  }
});
