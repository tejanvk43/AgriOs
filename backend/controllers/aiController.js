const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { ChatMessage } = require('../models');
const { callGeminiWithRetry } = require('../utils/geminiClient');

// Initialize Gemini
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Replaced by geminiClient
console.log("AI Controller: API Key Status -", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");
const MODEL_NAME = "gemini-2.5-flash"; // Available with quota

// Load Datasets into Memory
let cropData = [];
let marketData = [];

const loadDatasets = () => {
    try {
        const cropPath = path.join(__dirname, '../data/crop_recommendation.csv');
        const marketPath = path.join(__dirname, '../data/market_prices.csv');

        if (fs.existsSync(cropPath)) {
            fs.createReadStream(cropPath)
                .pipe(csv())
                .on('data', (row) => cropData.push(row))
                .on('end', () => console.log('Crop Dataset loaded:', cropData.length, 'rows'));
        }

        if (fs.existsSync(marketPath)) {
            fs.createReadStream(marketPath)
                .pipe(csv())
                .on('data', (row) => marketData.push(row))
                .on('end', () => console.log('Market Dataset loaded:', marketData.length, 'rows'));
        }
    } catch (err) {
        console.error("Error loading datasets:", err);
    }
};

// Initial load
loadDatasets();

exports.chatAgent = async (req, res) => {
    try {
        console.log('AI Request Received');
        const userId = req.user.id;
        const userMessage = req.body.message || '';
        const languageCode = req.body.language || 'en-IN';
        const imageFile = req.file;

        let weatherContextJson = null;
        if (req.body.weatherData) {
            try {
                weatherContextJson = JSON.parse(req.body.weatherData);
            } catch (e) {
                console.error("Weather Parse Error", e);
            }
        }

        // 0. Save User Message to DB
        let imageUrl = null;
        if (imageFile) {
            // Placeholder for image storage logic
        }
        await ChatMessage.create({
            userId: userId,
            sender: 'user',
            text: userMessage || (imageFile ? '[Image Uploaded]' : ''),
            language: languageCode,
            imageUrl: imageUrl
        });

        // 1. Fetch History for Context
        const history = await ChatMessage.findAll({
            where: { userId: userId },
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        const contextHistory = history.reverse();

        let historyContext = "Recent Conversation History:\n";
        contextHistory.forEach(msg => {
            historyContext += `${msg.sender === 'user' ? 'User' : 'AgriGenius'}: ${msg.text}\n`;
        });

        // 2. Construct Context
        let context = `You are AgriGenius, a warm, wise, and enthusiastic farming companion for Indian farmers.
        
        CRITICAL PERSONA INSTRUCTIONS:
        1. **Tone**: Be friendly, caring, and encouraging. Use simple, natural language. Avoid acting like a robot.
        2. **Empathy**: If the user mentions problems (pests, low prices), show empathy first ("I'm sorry to hear that...", "Don't worry, we can fix this...").
        3. **Visuals**: Use relevant Emojis (🌾, 🌻, 🚜, 🌧️, 💚) in your responses to make them feel warm and alive.
        4. **Length**: Keep answers concise (max 2-3 sentences) so they are easy to listen to.
        
        LANGUAGE INSTRUCTIONS:
        - You must ALWAYS reply in the SAME LANGUAGE as the user's message.
        - Supported languages: Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, Gujarati, Bengali, Odia, Punjabi, Urdu, and English.
        - Detect the user's language from their text (or use reference: ${languageCode}) and respond ONLY in that language.
        
        ${historyContext}
        
        Use the following expert data if relevant to the question:\n\n`;

        // Weather Context
        if (weatherContextJson && weatherContextJson.current) {
            const w = weatherContextJson.current;
            context += `[Live Weather Data for User's Location]: 
            Temp: ${w.temp}°C, Humidity: ${w.humidity}%, Rain: ${w.rain || 0}mm, Wind: ${w.wind_speed_10m}km/h. 
            Condition Code: ${w.code}.
            Detailed: Pressure ${w.surface_pressure}hPa, Precipitation ${w.precipitation}mm.
            (Mention weather only if asked or critical for the crop advice).
            \n`;
        }

        if (userMessage && (userMessage.toLowerCase().includes('recommend') || userMessage.toLowerCase().includes('crop') || userMessage.toLowerCase().includes('grow'))) {
            if (cropData.length > 0) {
                context += "[Reference Data] Crop Recommendations (N,P,K,Temp,Rain -> Label):\n" + JSON.stringify(cropData.slice(0, 5)) + "...\n";
            }
        }
        if (userMessage && (userMessage.toLowerCase().includes('price') || userMessage.toLowerCase().includes('rate') || userMessage.toLowerCase().includes('market'))) {
            if (marketData.length > 0) {
                context += "[Reference Data] Market Prices (State, Commodity, Modal_Price):\n" + JSON.stringify(marketData.slice(0, 8)) + "...\n";
            }
        }

        let finalMessage = userMessage;
        if (!finalMessage && imageFile) {
            finalMessage = "Analyze this image and tell me what crop this is or if there are any diseases.";
        } else if (!finalMessage) {
            finalMessage = "Hello";
        }

        const prompt = context + "\nUser Question: " + finalMessage;

        let result;
        try {
            // JSON Output for Visual Grounding
            if (imageFile) {
                // JSON Prompt
                const visionPrompt = `
                    ${prompt}
                    CRITICAL OUTPUT FORMAT:
                    Return a strictly valid JSON object. Do not use Markdown code blocks.
                    Structure: 
                    {
                        "text": "Your conversational response here (in ${languageCode})",
                        "boxes": [
                            {"label": "object_name", "ymin": 0-1000, "xmin": 0-1000, "ymax": 0-1000, "xmax": 0-1000}
                        ]
                    }
                    Coordinates should be normalized to 0-1000 scale.
                    If no specific object/pest is detected or relevant, return empty boxes array.
                `;

                const imageData = fs.readFileSync(imageFile.path).toString("base64");
                const content = [{
                    parts: [
                        { text: visionPrompt },
                        { inlineData: { mimeType: imageFile.mimetype, data: imageData } }
                    ]
                }];

                const result = await callGeminiWithRetry(MODEL_NAME, { contents: content });
                const rawText = result.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
                let responseJson = { text: rawText, boxes: [] };
                try {
                    responseJson = JSON.parse(rawText);
                } catch (e) {
                    console.error("JSON Parse Error:", e);
                }

                // Save AI Response
                await ChatMessage.create({
                    userId: userId,
                    sender: 'ai',
                    text: responseJson.text,
                    language: languageCode,
                    boxes: responseJson.boxes
                });

                if (imageFile) fs.unlink(imageFile.path, () => { });

                res.json({
                    response: responseJson.text,
                    boxes: responseJson.boxes || []
                });

            } else {
                const result = await callGeminiWithRetry(MODEL_NAME, { contents: [{ parts: [{ text: prompt }] }] });
                const text = result.candidates[0].content.parts[0].text.replace(/\*|\#|\[.*?\]/g, '').trim();

                await ChatMessage.create({
                    userId: userId,
                    sender: 'ai',
                    text: text,
                    language: languageCode
                });

                res.json({ response: text });
            }

        } catch (geminiError) {
            console.error("Gemini API Error Details:", {
                message: geminiError.message,
                status: geminiError.status,
                statusText: geminiError.statusText,
                stack: geminiError.stack
            });
            if (imageFile) fs.unlink(imageFile.path, () => { });

            // Check for rate limit
            if (geminiError.status === 429 || geminiError.message?.includes('429') || geminiError.message?.includes('quota')) {
                return res.status(429).json({
                    message: "AI service is currently at capacity. Please try again in a few moments.",
                    error: "Rate limit exceeded"
                });
            }

            // User-friendly error for network issues
            const errorMsg = geminiError.message?.includes('fetch failed')
                ? "Cannot connect to AI Brain. Please check your internet connection and firewall settings."
                : "AI processing error. Please try again.";

            res.status(500).json({
                message: errorMsg,
                error: geminiError.message,
                hint: "Verify GEMINI_API_KEY is set and internet is accessible from backend server."
            });
        }
    } catch (error) {
        console.error('AI Agent Error:', error);
        res.status(500).json({ message: 'Error processing AI request', error: error.message });
    }
};

// Neural TTS Handler
// Neural TTS Handler
exports.voiceAudio = async (req, res) => {
    try {
        const start = Date.now();
        const userId = req.user.id;
        const userMessage = req.body.message || '';
        const languageCode = req.body.language || 'en-IN';
        const imageFile = req.file;

        let weatherContextJson = null;
        if (req.body.weatherData) {
            try {
                weatherContextJson = JSON.parse(req.body.weatherData);
            } catch (e) { }
        }

        // 1. NON-BLOCKING: Save User Message
        ChatMessage.create({
            userId: userId,
            sender: 'user',
            text: userMessage || (imageFile ? '[Analyzed Image]' : ''),
            language: languageCode,
            imageUrl: imageFile ? 'image_upload_placeholder' : null
        }).catch(e => console.error("Async User Msg Save Error:", e.message));

        // 2. Fetch History (Wait for this as we need context)
        const history = await ChatMessage.findAll({
            where: { userId: userId },
            order: [['createdAt', 'DESC']],
            limit: 4 // Reduced context for speed
        });
        const historyContext = history.reverse().map(m => `${m.sender}: ${m.text}`).join('\n');

        // 3. Optimized Prompt Construction
        let context = `You are AgriGenius, a friendly Indian farming expert.
        History:
        ${historyContext}
        
        Current Input: "${userMessage}"
        User Language Pref: ${languageCode}
        
        Task:
        1. Detect language of Input. if input is in roman script (e.g "elaukunnaru") but language is indian (Telugu), reply in Native Script (Telugu).
        2. Give a helpful, warm answer (max 2 sentences).
        3. Use Emojis 🌾 force.
        
        Response Schema (JSON):
        {
            "replyText": "Response in detected language",
            "detectedLanguage": "code (e.g. te-IN, hi-IN)"
        }`;

        // Weather Context (Shortened)
        if (weatherContextJson?.current) {
            const w = weatherContextJson.current;
            context += `\nWeather: ${w.temp}°C, ${w.weather_desc}.`;
        }

        if (imageFile) context += "\n[Image attached: Analyze crop/pest]";

        // 4. Call Gemini with Native JSON encoding
        let replyText = "";
        let detectedLang = languageCode;

        const generationConfig = {
            response_mime_type: "application/json"
        };

        if (imageFile) {
            const imageData = fs.readFileSync(imageFile.path).toString("base64");
            const content = [{
                parts: [
                    { text: context },
                    { inlineData: { mimeType: imageFile.mimetype, data: imageData } }
                ]
            }];

            const result = await callGeminiWithRetry(MODEL_NAME, { contents: content, generationConfig });
            const json = JSON.parse(result.candidates[0].content.parts[0].text);
            replyText = json.replyText;
            detectedLang = json.detectedLanguage || languageCode;

            fs.unlink(imageFile.path, () => { }); // Async cleanup
        } else {
            const result = await callGeminiWithRetry(MODEL_NAME, {
                contents: [{ parts: [{ text: context }] }],
                generationConfig
            });
            const json = JSON.parse(result.candidates[0].content.parts[0].text);
            replyText = json.replyText;
            detectedLang = json.detectedLanguage || languageCode;
        }

        // 5. TTS Generation
        const VOICE_MAP = {
            'en-IN': 'en-IN-NeerjaNeural',
            'hi-IN': 'hi-IN-SwaraNeural',
            'te-IN': 'te-IN-ShrutiNeural',
            'ta-IN': 'ta-IN-PallaviNeural',
            'kn-IN': 'kn-IN-GaganNeural',
            'ml-IN': 'ml-IN-SobhanaNeural',
            'mr-IN': 'mr-IN-AarohiNeural',
            'bn-IN': 'bn-IN-TanishaaNeural',
            'gu-IN': 'gu-IN-DhwaniNeural',
            'pa-IN': 'pa-IN-OjasNeural',
            'or-IN': 'or-IN-SubhasiniNeural'
        };
        const voice = VOICE_MAP[detectedLang] || VOICE_MAP[languageCode] || 'en-IN-NeerjaNeural';

        const { Communicate } = require('edge-tts-universal');
        const mkComm = new Communicate(replyText, voice);

        const chunks = [];
        for await (const chunk of mkComm.stream()) {
            if (chunk.type === 'audio') chunks.push(chunk.data);
        }
        const audioBase64 = Buffer.concat(chunks).toString('base64');

        // 6. NON-BLOCKING: Save AI Response
        ChatMessage.create({
            userId: userId,
            sender: 'ai',
            text: replyText,
            language: languageCode
        }).catch(e => console.error("Async AI Msg Save Error:", e.message));

        console.log(`Voice Request processed in ${Date.now() - start}ms`);

        res.json({
            replyText,
            audioBase64,
            languageCode: detectedLang
        });

    } catch (error) {
        console.error('TTS Error:', error);
        if (req.file) fs.unlink(req.file.path, () => { });

        const status = error.message?.includes('429') ? 429 : 500;
        const msg = status === 429 ? "Server Busy" : "Error";
        res.status(status).json({ message: msg, error: error.message });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        console.log("Fetching history for user:", req.user.id);
        const history = await ChatMessage.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'ASC']]
        });
        res.json(history);
    } catch (error) {
        console.error("History Fetch Error:", error);
        res.status(500).json({ message: 'Error fetching history', error: error.message });
    }
};

// @desc    Dedicated Pest/Disease Diagnosis
// @route   POST /api/ai/diagnose
exports.diagnosePest = async (req, res) => {
    try {
        console.log('Diagnosis Request Received');
        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({ message: 'Image is required for diagnosis' });
        }

        const prompt = `
        You are an expert Agricultural Pathologist.
        Analyze the uploaded image strictly.
        
        1. Identify the crop.
        2. Identify any pest, disease, or nutrient deficiency visible.
        3. If the plant is healthy, explicitly state "Healthy".
        4. Provide organic AND chemical remedies if a problem is found.
        5. Provide a confidence score (0-100%).

        Response must be valid JSON ONLY:
        {
            "diagnosis": "Name of disease/pest or 'Healthy'",
            "crop": "Crop Name",
            "confidence": 95,
                    "symptoms": ["symptom1", "symptom2"],
            "organic_remedy": "Description...",
            "chemical_remedy": "Description..."
        }
        `;

        const imageData = fs.readFileSync(imageFile.path).toString("base64");
        const content = [{
            parts: [
                { text: prompt },
                { inlineData: { mimeType: imageFile.mimetype, data: imageData } }
            ]
        }];

        const result = await callGeminiWithRetry(MODEL_NAME, { contents: content });
        const text = result.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();

        // Cleanup
        fs.unlink(imageFile.path, () => { });

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(text);
        } catch (e) {
            jsonResponse = {
                diagnosis: "Analysis Failed",
                crop: "Unknown",
                confidence: 0,
                symptoms: [],
                organic_remedy: text, // Fallback to raw text
                chemical_remedy: ""
            };
        }

        // Save to DB (optional, simplified for now)
        await ChatMessage.create({
            userId: req.user.id,
            sender: 'ai',
            text: `Diagnosis: ${jsonResponse.diagnosis} on ${jsonResponse.crop}`,
            language: 'en-IN'
        });

        res.json(jsonResponse);

    } catch (error) {
        console.error('Diagnosis Error:', error);
        if (req.file) fs.unlink(req.file.path, () => { });
        res.status(500).json({ message: 'Error diagnosing image' });
    }
};

// @desc    Smart Crop Recommendation
// @route   POST /api/ai/recommend
exports.recommendCrops = async (req, res) => {
    try {
        console.log('Crop Recommendation Request Received');
        const { soilData, budget, landId, customCrop } = req.body;
        const userId = req.user.id;

        // Fetch Land Record (if available) for location context
        let landContext = "Location: India (General)";
        if (landId) {
            const { LandRecord } = require('../models');
            const land = await LandRecord.findByPk(landId);
            if (land) {
                landContext = `Location: ${land.village}, ${land.mandal}, ${land.district}, ${land.state}. Total Area: ${land.totalAcres} acres. Land Type: ${land.landType}.`;
            }
        }

        const prompt = `
        You are an expert Agronomist and Market Analyst.
        
        TASK: Recommend optimal crops based on the following specific constraints.
        
        INPUT DATA:
        1. ${landContext}
        2. Soil Report: ${JSON.stringify(soilData || {})} (If empty, assume standard soil for the location).
        3. Financial Budget (Initial Investment): ₹${budget || 'Flexible'}.
        4. Specific Interest: ${customCrop ? `The farmer specifically wants to know about "${customCrop}".` : "Recommend 5-10 best options."}

        ANALYSIS REQUIREMENTS:
        1. **Market Trends**: Analyze FUTURE prices for the expected harvest time.
        2. **Feasibility**: Check if the soil N-P-K and pH are suitable.
        3. **Economics**: Ensure initial cost fits within ₹${budget}.
        
        OUTPUT FORMAT:
        Return a STRICT VALID JSON Object with this structure:
        {
            "recommendations": [
                {
                    "crop_name": "Name",
                    "confidence_score": 95,
                    "suitability_reason": "Why this is good for this soil/location.",
                    "timeline": {
                        "sowing_month": "Month",
                        "harvest_month": "Month",
                        "duration_days": 120
                    },
                    "economics": {
                        "estimated_cost_per_acre": 15000,
                        "expected_yield_per_acre": "20-25 quintals",
                        "market_price_forecast": "₹2500/quintal (Rising Trend)",
                        "profit_potential": "High"
                    },
                    "cultivation_steps": [
                        {"stage": "Sowing", "advice": "...", "fertilizer": "Name & Qty"},
                        {"stage": "Growth", "advice": "...", "fertilizer": "Name & Qty"},
                        {"stage": "Harvest", "advice": "..."}
                    ]
                }
            ],
            "market_insight": "General summary of agricultural market trends for this region.",
            "disclaimer": "AI prediction based on historical data. Consult local AO."
        }
        
        CONSTRAINT:
        - If the user asked for a specific crop ("${customCrop}"), providing detailed analysis for ONLY that crop (and maybe 1-2 alternatives).
        - If no specific crop, provide 5-10 diverse options (Cereals, Pulses, Cash Crops).
        `;

        const result = await callGeminiWithRetry(MODEL_NAME, { contents: [{ parts: [{ text: prompt }] }] });
        const text = result.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error", e);
            // Fallback to text
            jsonResponse = {
                recommendations: [],
                market_insight: text,
                disclaimer: "Parse Error. Raw AI Response provided."
            };
        }

        // Save to History (Optional)
        await ChatMessage.create({
            userId: userId,
            sender: 'ai',
            text: `Crop Recommendation Generated for budget ₹${budget}`,
            language: 'en-IN' // Defaulting for system messages
        });

        res.json(jsonResponse);

    } catch (error) {
        console.error('Recommendation Error:', error);
        res.status(500).json({ message: 'Error generating recommendations', error: error.message });
    }
};

// @desc    Smart Crop Recommendation
// @route   POST /api/ai/recommend
exports.recommendCrops = async (req, res) => {
    try {
        console.log('Crop Recommendation Request Received');
        const { soilData, budget, landId, customCrop } = req.body;
        const userId = req.user.id;

        // Fetch Land Record (if available) for location context
        let landContext = "Location: India (General)";
        if (landId) {
            const { LandRecord } = require('../models');
            const land = await LandRecord.findByPk(landId);
            if (land) {
                landContext = `Location: ${land.village}, ${land.mandal}, ${land.district}, ${land.state}. Total Area: ${land.totalAcres} acres. Land Type: ${land.landType}.`;
            }
        }

        const prompt = `
        You are an expert Agronomist and Market Analyst.
        
        TASK: Recommend optimal crops based on the following specific constraints.
        
        INPUT DATA:
        1. ${landContext}
        2. Soil Report: ${JSON.stringify(soilData || {})} (If empty, assume standard soil for the location).
        3. Financial Budget (Initial Investment): ₹${budget || 'Flexible'}.
        4. Specific Interest: ${customCrop ? `The farmer specifically wants to know about "${customCrop}".` : "Recommend 5-10 best options."}

        ANALYSIS REQUIREMENTS:
        1. **Market Trends**: Analyze FUTURE prices for the expected harvest time.
        2. **Feasibility**: Check if the soil N-P-K and pH are suitable.
        3. **Economics**: Ensure initial cost fits within ₹${budget}.
        
        OUTPUT FORMAT:
        Return a STRICT VALID JSON Object with this structure:
        {
            "recommendations": [
                {
                    "crop_name": "Name",
                    "confidence_score": 95,
                    "suitability_reason": "Why this is good for this soil/location.",
                    "timeline": {
                        "sowing_month": "Month",
                        "harvest_month": "Month",
                        "duration_days": 120
                    },
                    "economics": {
                        "estimated_cost_per_acre": 15000,
                        "expected_yield_per_acre": "20-25 quintals",
                        "market_price_forecast": "₹2500/quintal (Rising Trend)",
                        "profit_potential": "High"
                    },
                    "cultivation_steps": [
                        {"stage": "Sowing", "advice": "...", "fertilizer": "Name & Qty"},
                        {"stage": "Growth", "advice": "...", "fertilizer": "Name & Qty"},
                        {"stage": "Harvest", "advice": "..."}
                    ]
                }
            ],
            "market_insight": "General summary of agricultural market trends for this region.",
            "disclaimer": "AI prediction based on historical data. Consult local AO."
        }
        
        CONSTRAINT:
        - If the user asked for a specific crop ("${customCrop}"), providing detailed analysis for ONLY that crop (and maybe 1-2 alternatives).
        - If no specific crop, provide 5-10 diverse options (Cereals, Pulses, Cash Crops).
        `;

        const result = await callGeminiWithRetry(MODEL_NAME, { contents: [{ parts: [{ text: prompt }] }] });
        const text = result.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error", e);
            // Fallback to text
            jsonResponse = {
                recommendations: [],
                market_insight: text,
                disclaimer: "Parse Error. Raw AI Response provided."
            };
        }

        // Save to History (Optional)
        await ChatMessage.create({
            userId: userId,
            sender: 'ai',
            text: `Crop Recommendation Generated for budget ₹${budget}`,
            language: 'en-IN' // Defaulting for system messages
        });

        res.json(jsonResponse);

    } catch (error) {
        console.error('Recommendation Error:', error);

        const status = error.message?.includes('429') ? 429 : 500;
        const msg = status === 429 ? "AI Server Busy (Quota Exceeded). Please try again in 1 minute." : "Error generating recommendations";

        res.status(status).json({ message: msg, error: error.message });
    }
};

// @desc    Extract Soil Data from Image
// @route   POST /api/ai/extract-soil
exports.extractSoilFromImage = async (req, res) => {
    try {
        console.log("Soil Extraction Started");
        console.log("File received:", req.file ? req.file.originalname : "No file");
        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const prompt = `
        You are an intelligent data extractor.
        Analyze this image of a Soil Health Card.
        
        TASK: Extract the numerical values for:
        1. Nitrogen (N)
        2. Phosphorus (P)
        3. Potassium (K)
        4. pH Level

        OUTPUT FORMAT:
        Return a strictly valid JSON object:
        {
            "n": "value or ''",
            "p": "value or ''",
            "k": "value or ''",
            "ph": "value or ''"
        }
        
        If a value is not found, leave it as an empty string. remove units (kg/ha etc) just keep the number.
        `;

        const imageData = fs.readFileSync(imageFile.path).toString("base64");
        const content = [{
            parts: [
                { text: prompt },
                { inlineData: { mimeType: imageFile.mimetype, data: imageData } }
            ]
        }];

        const result = await callGeminiWithRetry(MODEL_NAME, { contents: content });
        const text = result.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();

        // Cleanup
        fs.unlink(imageFile.path, () => { });

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error", e);
            jsonResponse = { n: '', p: '', k: '', ph: '' };
        }

        res.json(jsonResponse);

    } catch (error) {
        console.error('Extraction Error Details:', {
            message: error.message,
            status: error.status,
            stack: error.stack
        });
        if (req.file) fs.unlink(req.file.path, () => { });

        // Check for rate limit errors
        if (error.status === 429 || error.message?.includes('429') || error.message?.includes('Resource exhausted')) {
            return res.status(429).json({
                message: "Gemini API quota exceeded. Please try again in a few minutes or enter soil data manually.",
                error: "Rate limit reached"
            });
        }

        res.status(500).json({
            message: "Error extracting data from image. Please enter manually.",
            error: error.message
        });
    }
};
