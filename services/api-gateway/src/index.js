import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:4001";
const RESOURCE_SERVICE_URL =
  process.env.RESOURCE_SERVICE_URL || "http://localhost:4002";
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || "http://localhost:4003";

app.get("/health", (_req, res) => {
  res.json({ service: "api-gateway", status: "ok" });
});

app.use(
  "/auth",
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true
  })
);

app.use(
  "/resources",
  createProxyMiddleware({
    target: RESOURCE_SERVICE_URL,
    changeOrigin: true
  })
);

app.use(
  "/bookings",
  createProxyMiddleware({
    target: BOOKING_SERVICE_URL,
    changeOrigin: true
  })
);

app.use(
  "/docs/auth",
  createProxyMiddleware({
    target: `${AUTH_SERVICE_URL}/api-docs`,
    changeOrigin: true,
    pathRewrite: { "^/docs/auth": "" }
  })
);

app.use(
  "/docs/resources",
  createProxyMiddleware({
    target: `${RESOURCE_SERVICE_URL}/api-docs`,
    changeOrigin: true,
    pathRewrite: { "^/docs/resources": "" }
  })
);

app.use(
  "/docs/bookings",
  createProxyMiddleware({
    target: `${BOOKING_SERVICE_URL}/api-docs`,
    changeOrigin: true,
    pathRewrite: { "^/docs/bookings": "" }
  })
);

app.listen(PORT, () => {
  console.log(`api-gateway running on port ${PORT}`);
});
