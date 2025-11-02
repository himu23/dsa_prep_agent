// Simple test script to verify Gemini API key
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in .env file");
  process.exit(1);
}

console.log("Testing Gemini API...");
console.log(`API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 4)}`);

async function testAPI() {
  try {
    // Test with the exact endpoint format
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    
    console.log("\nTesting endpoint:", url.replace(API_KEY, "KEY_HIDDEN"));
    
    const response = await axios.post(
      url,
      {
        contents: [{
          parts: [{
            text: "Say 'API is working' if you can read this."
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50
        }
      },
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    console.log("\n✅ SUCCESS! API is working!");
    console.log("Response:", JSON.stringify(response.data, null, 2));
    
    if (response.data.candidates && response.data.candidates[0]) {
      const text = response.data.candidates[0].content?.parts?.[0]?.text;
      console.log("\nGenerated text:", text);
    }

  } catch (error) {
    console.error("\n❌ ERROR:");
    console.error("Status:", error.response?.status);
    console.error("Status Text:", error.response?.statusText);
    console.error("Error Message:", error.message);
    
    if (error.response?.data) {
      console.error("\nError Details:", JSON.stringify(error.response.data, null, 2));
      
      if (error.response.data.error) {
        console.error("\nAPI Error Code:", error.response.data.error.code);
        console.error("API Error Message:", error.response.data.error.message);
        
        if (error.response.data.error.message?.includes("API key")) {
          console.error("\n💡 TIP: Your API key might be invalid or expired");
          console.error("   Get a new key from: https://makersuite.google.com/app/apikey");
        }
        
        if (error.response.data.error.message?.includes("permission")) {
          console.error("\n💡 TIP: Your API key might not have access to this model");
          console.error("   Make sure Generative Language API is enabled in Google Cloud");
        }
      }
    }
    
    // Try alternative endpoint
    console.log("\n\nTrying alternative endpoint format...");
    try {
      const altUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
      const altResponse = await axios.post(
        altUrl,
        {
          contents: [{
            parts: [{ text: "Hello" }]
          }]
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000
        }
      );
      console.log("✅ Alternative endpoint (gemini-pro) works!");
      console.log("   Consider using gemini-pro instead of gemini-1.5-flash");
    } catch (altError) {
      console.error("❌ Alternative endpoint also failed");
    }
  }
}

testAPI();

