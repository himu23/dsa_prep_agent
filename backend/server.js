import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Test endpoint to verify server is running
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "Backend is running!",
    model: "gemini-2.0-flash",
    apiKeyConfigured: !!process.env.GEMINI_API_KEY
  });
});

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { 
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      },
      { 
        headers: { "Content-Type": "application/json" },
        timeout: 30000
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("=== API ERROR ===");
    console.error("Full error:", error);
    console.error("Response status:", error.response?.status);
    console.error("Response data:", JSON.stringify(error.response?.data, null, 2));
    console.error("Error message:", error.message);
    
    // Don't pass through the 404 from Gemini - return 500 instead with details
    const statusCode = 500; // Always return 500 for server errors
    const errorMessage = error.response?.data?.error?.message || error.message || "Unknown error";
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: error.response?.data,
      url: error.config?.url?.replace(process.env.GEMINI_API_KEY, "KEY_HIDDEN"),
      hint: "Check console logs for full error details"
    });
  }
});

app.listen(5000, () => console.log("Backend running ✅"));
