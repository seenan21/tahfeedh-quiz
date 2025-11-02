import express from "express";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/auth.js";
import verseRoutes from "./routes/verse.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/verse", verseRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const serverDir = path.resolve();
  const clientBuildPath = path.join(serverDir, "../client/dist");

  // Serve static files first
  app.use(express.static(clientBuildPath));

  // Fallback: send index.html for all non-API routes
  app.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith("/api/")) return next();

    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

// Dev route for checking env
if (process.env.NODE_ENV !== "production") {
  app.get("/api/debug/env", (req, res) => {
    return res.json({
      client_id: process.env.CLIENT_ID,
      client_secret_present: Boolean(process.env.CLIENT_SECRET),
    });
  });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
