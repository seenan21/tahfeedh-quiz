import express from "express";
import { getAccessToken } from "../utils/auth.js";

const router = express.Router();

router.get("/token", async (req, res) => {
  try {
    const token = await getAccessToken();
    res.json({ token });
  } catch (e) {
    res.status(500).json({ error: "Failed to get token" });
  }
});

export default router;
