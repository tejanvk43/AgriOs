const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const path = require('path');

// Load env from parent dir
dotenv.config({ path: path.join(__dirname, '../.env') });

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Note: listModels is usually on the GoogleGenerativeAI instance or a specific manager?
        // Actually the SDK might not expose listModels easily on the top level in all versions?
        // Let's check documentation pattern or just try a getModel for 'gemini-1.5-flash' explicitly and see error.

        // Wait, standard way to list models in node SDK might be via model manager if available, 
        // but typically we just try to use a model. 
        // Let's try to generate with the user's requested model and print the EXACT error.

        const modelName = "gemini-2.0-flash-exp";
        console.log(`Testing model: ${modelName}`);

        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you there?");
        const response = await result.response;
        console.log("Success! Response:", response.text());

    } catch (error) {
        console.error("Error testing model:");
        console.error(error);
    }
}

listModels();
