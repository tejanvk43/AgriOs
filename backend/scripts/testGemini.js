const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGeminiAPI() {
    try {
        console.log("Testing Gemini API...");
        console.log("API Key:", process.env.GEMINI_API_KEY ? "Loaded ✓" : "Missing ✗");
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        console.log("\nSending test request...");
        const result = await model.generateContent("Say hello in one word");
        const response = await result.response;
        const text = response.text();
        
        console.log("\n✅ SUCCESS!");
        console.log("Response:", text);
        console.log("\nYour API key is working correctly!");
        console.log("Model: gemini-1.5-flash");
        
    } catch (error) {
        console.log("\n❌ ERROR!");
        console.log("Status:", error.status);
        console.log("Message:", error.message);
        
        if (error.status === 429) {
            console.log("\n⚠️  QUOTA EXCEEDED - Your API key has hit rate limits");
        } else if (error.status === 404) {
            console.log("\n⚠️  MODEL NOT FOUND - Try a different model name");
        } else if (error.status === 401 || error.status === 403) {
            console.log("\n⚠️  INVALID API KEY - Check your API key");
        }
    }
}

testGeminiAPI();
