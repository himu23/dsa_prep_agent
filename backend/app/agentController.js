// backend/app/agentController.js

import { model } from "../services/aiClient.js";   // ✅ correct path
import express from "express";

const router = express.Router();

router.post("/suggest-next-question", async (req, res) => {
  try {
    const { solvedProblems, userLevel } = req.body;

    const prompt = `
      User level: ${userLevel}
      Solved problems: ${solvedProblems.join(", ")}

      Suggest the next 3 Codeforces problems (just problem numbers + short reason).
    `;

    const response = await model.generateContent(prompt);

    res.json({ suggestions: response.response.text() });

  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

export default router;
