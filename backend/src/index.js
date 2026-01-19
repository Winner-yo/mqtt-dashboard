const http = require("http");
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const sensorService = require("./services/sensorService");

// Prefer backend/.env, but also support a root .env if you keep one there.
const backendEnvPath = path.resolve(__dirname, "../.env");
const rootEnvPath = path.resolve(__dirname, "../../.env");
const envPathToLoad = fs.existsSync(backendEnvPath) ? backendEnvPath : rootEnvPath;
const envResult = dotenv.config({ path: envPathToLoad });
if (envResult.error) {
  console.warn(`⚠️ Could not load env file at ${envPathToLoad}:`, envResult.error.message);
} else {
  console.log(`✅ Loaded env from ${envPathToLoad}`);
}

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "mqtt-dashboard-backend" });
});

app.get("/api/sensor", (_req, res) => {
  res.json(sensorService.getCurrentData());
});

app.get("/api/status", (_req, res) => {
  res.json(sensorService.getConnectionStatus());
});

const server = http.createServer(app);
sensorService.initializeWebSocket(server);
sensorService.connectToMQTT();

const PORT = Number(process.env.PORT || 4000);
console.log(`🔧 Using PORT: ${PORT} (from ${process.env.PORT ? "backend/.env" : "default"})`);

server.listen(PORT, () => {
  console.log(`✅ Backend listening on http://localhost:${PORT}`);
  console.log(`✅ WebSocket available at ws://localhost:${PORT}`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error(`   → To fix this:`);
    console.error(`   1. Stop the process using port ${PORT} (Ctrl+C in its terminal)`);
    console.error(`   2. Or change PORT in backend/.env to a different port (e.g., 4040)`);
    console.error(`   → Current PORT value: ${PORT} (${process.env.PORT ? `from .env: ${process.env.PORT}` : "default"})`);
    console.error(`\n💡 Tip: Run 'netstat -ano | findstr :${PORT}' to find the process ID\n`);
  } else {
    console.error("❌ Server error:", err);
  }
  process.exit(1);
});

function shutdown() {
  console.log("Shutting down...");
  sensorService.disconnect();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

