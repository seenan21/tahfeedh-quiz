// server/index.js
import express from "express";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth.js";
import verseRoutes from "./routes/verse.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// --- API routes (mount BEFORE any static/spa fallback) ---
app.use("/api/auth", authRoutes);
app.use("/api/verse", verseRoutes);

// --- production: serve client build that lives at ../client/dist ---
if (process.env.NODE_ENV === "production") {
  const serverDir = path.resolve();           // e.g. /opt/render/project/src/tahfeedh-quiz/server
  const clientBuildPath = path.join(serverDir, "..", "client", "dist");
  console.log("Serving React build from:", clientBuildPath);

  // Serve static assets first
  app.use(express.static(clientBuildPath));

  // Robust SPA fallback middleware (works with Express 4 & 5)
  // - skips API routes
  // - only handles GET requests
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api/")) return next();
    // express.static already handled requests for real files (js/css). This fallback sends index.html
    res.sendFile(path.join(clientBuildPath, "index.html"), (err) => {
      if (err) {
        console.error("Error sending index.html:", err);
        next(err);
      }
    });
  });
} else {
  // dev helper route
  app.get("/api/debug/env", (req, res) => {
    return res.json({
      client_id: process.env.CLIENT_ID,
      client_secret_present: Boolean(process.env.CLIENT_SECRET),
    });
  });
}

// --- Diagnostic: print registered routes to help find malformed patterns ---
function listRegisteredRoutes() {
  const out = [];
  if (!app._router) {
    console.log("No router stack present");
    return;
  }
  app._router.stack.forEach((layer) => {
    if (layer.route && layer.route.path) {
      // direct route like app.get('/foo')
      const methods = Object.keys(layer.route.methods).join(",").toUpperCase();
      out.push(`${methods} ${layer.route.path}`);
    } else if (layer.name === "router" && layer.handle && layer.handle.stack) {
      // mounted router, e.g., app.use('/api', router)
      layer.handle.stack.forEach((r) => {
        if (r.route && r.route.path) {
          const methods = Object.keys(r.route.methods).join(",").toUpperCase();
          // prepend the parent mount path if available
          const mountPath = layer.regexp && layer.regexp.fast_slash ? "" : (layer.regexp && layer.regexp.source) ? "" : "";
          out.push(`${methods} ${layer.regexp ? layer.regexp : ""} -> ${r.route.path}`);
        }
      });
    }
  });
  console.log("Registered routes (may include regex for mounted routers):");
  out.forEach((l) => console.log("  ", l));
}
listRegisteredRoutes();

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`)
);
