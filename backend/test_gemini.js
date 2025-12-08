const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

async function checkModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No API Key found!");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        console.log("Fetching models from:", url.replace(key, 'HIDDEN_KEY'));
        const res = await axios.get(url);
        let output = "Available Models:\n";
        res.data.models.forEach(m => {
            if (m.name.includes('gemini')) {
                output += `- ${m.name}\n`;
                output += `  Supported: ${m.supportedGenerationMethods}\n`;
            }
        });
        fs.writeFileSync('models_list.txt', output);
        console.log("Models written to models_list.txt");
    } catch (error) {
        console.error("Error fetching models:", error.response ? error.response.data : error.message);
    }
}

checkModels();
