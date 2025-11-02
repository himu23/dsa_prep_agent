// Check available Gemini models
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function checkModels() {
  try {
    console.log("Checking available Gemini models...\n");
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    
    const response = await axios.get(url);
    
    console.log("✅ Available models:\n");
    
    const models = response.data.models || [];
    models.forEach(model => {
      if (model.name && model.supportedGenerationMethods) {
        const methods = model.supportedGenerationMethods || [];
        if (methods.includes("generateContent")) {
          const shortName = model.name.replace("models/", "");
          console.log(`✓ ${shortName}`);
          console.log(`  Supported methods: ${methods.join(", ")}`);
          console.log(`  Display name: ${model.displayName || "N/A"}\n`);
        }
      }
    });
    
    // Try common model names
    const commonModels = [
      "gemini-pro",
      "gemini-1.5-pro",
      "gemini-1.5-flash",
      "gemini-pro-vision"
    ];
    
    console.log("\nTesting common model names...\n");
    
    for (const modelName of commonModels) {
      try {
        const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;
        const testResponse = await axios.post(
          testUrl,
          {
            contents: [{
              parts: [{ text: "Say 'working' if you can read this." }]
            }]
          },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 5000
          }
        );
        
        console.log(`✅ ${modelName} - WORKS!`);
        if (testResponse.data.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.log(`   Response: ${testResponse.data.candidates[0].content.parts[0].text.substring(0, 50)}...`);
        }
      } catch (err) {
        console.log(`❌ ${modelName} - ${err.response?.status || err.message}`);
      }
    }
    
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
}

checkModels();

