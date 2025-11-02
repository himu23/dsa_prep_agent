// Debug script to test the exact same call the server makes
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

async function debugCall() {
  const API_KEY = process.env.GEMINI_API_KEY;
  const prompt = "Say hello";
  
  console.log("Testing exact same call as server...");
  console.log(`API Key: ${API_KEY ? API_KEY.substring(0, 10) + "..." : "NOT FOUND"}`);
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    
    console.log("\nURL:", url.replace(API_KEY, "KEY_HIDDEN"));
    
    const response = await axios.post(
      url,
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
    
    console.log("\n✅ SUCCESS!");
    console.log("Response:", JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error("\n❌ ERROR:");
    console.error("Status:", error.response?.status);
    console.error("Status Text:", error.response?.statusText);
    console.error("\nFull error response:", JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.data?.error) {
      console.error("\nAPI Error Details:");
      console.error("Code:", error.response.data.error.code);
      console.error("Message:", error.response.data.error.message);
      console.error("Status:", error.response.data.error.status);
    }
    
    // Try alternative models
    console.log("\n\nTrying alternative models...");
    const alternatives = [
      "gemini-flash-latest",
      "gemini-2.5-flash",
      "gemini-2.0-flash-001"
    ];
    
    for (const model of alternatives) {
      try {
        const altUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
        const altResponse = await axios.post(
          altUrl,
          { contents: [{ parts: [{ text: "test" }] }] },
          { headers: { "Content-Type": "application/json" }, timeout: 5000 }
        );
        console.log(`✅ ${model} - WORKS!`);
        break;
      } catch (e) {
        console.log(`❌ ${model} - ${e.response?.status || e.message}`);
      }
    }
  }
}

debugCall();

