const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const routes = require("./infrastructure/http/routes/index");
const errorHandler = require("./infrastructure/http/middlewares/errorHandler");

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10kb" }));

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
app.use(generalLimiter);

app.get("/health", (req, res) => { res.status(200).json({ status: "ok", timestamp: new Date().toISOString() }); });
app.use("/api/v1", routes);
app.use((req, res) => { res.status(404).json({ success: false, error: `Ruta ${req.method} ${req.path} no encontrada.`, code: "NOT_FOUND" }); });
app.use(errorHandler);

module.exports = app;