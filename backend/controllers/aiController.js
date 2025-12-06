const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { ChatMessage } = require('../models');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
        let context = `You are a multilingual expert farming assistant for Indian users. 
        CRITICAL INSTRUCTION: You must ALWAYS reply in the SAME LANGUAGE as the user's message. 
        Supported languages: Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, Gujarati, Bengali, Odia, Punjabi, Urdu, and English.
        Detect the user's language from their text (or use reference: ${languageCode}) and respond ONLY in that language.
        Keep answers natural, conversational, and concise (max 3 sentences) suitable for speech output.
        
        ${historyContext}
        
        Use the following expert data if relevant to the question:\n\n`;

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
            if (imageFile) {
                const imageData = {
                    inlineData: {
                        data: fs.readFileSync(imageFile.path).toString("base64"),
                        mimeType: imageFile.mimetype,
                    },
                };
                result = await model.generateContent([prompt, imageData]);
            } else {
                result = await model.generateContent(prompt);
            }

            const response = await result.response;
            const text = response.text();

            // Save AI Response to DB
            await ChatMessage.create({
                userId: userId,
                sender: 'ai',
                text: text,
                language: languageCode
            });

            if (imageFile) fs.unlink(imageFile.path, () => { });

            res.json({ response: text });
        } catch (geminiError) {
            console.error("Gemini API Error:", geminiError);
            if (imageFile) fs.unlink(imageFile.path, () => { });
            res.status(500).json({ message: "AI Brain Error", error: geminiError.message });
        }

    } catch (error) {
        console.error('AI Agent Error:', error);
        res.status(500).json({ message: 'Error processing AI request', error: error.message });
    }
};

// Neural TTS Handler
exports.voiceAudio = async (req, res) => {
    try {
        console.log('Voice Audio Request:', req.body);
        const userId = req.user.id;
        const userMessage = req.body.message || '';
        const languageCode = req.body.language || 'en-IN';
        const imageFile = req.file;

        // Save User Voice Input
        await ChatMessage.create({
            userId: userId,
            sender: 'user',
            text: userMessage || (imageFile ? '[Analyzed Image]' : ''),
            language: languageCode,
            imageUrl: imageFile ? 'image_upload_placeholder' : null // In production save actual path
        });

        // Fetch History
        const history = await ChatMessage.findAll({
            where: { userId: userId },
            order: [['createdAt', 'DESC']],
            limit: 6
        });
        const contextHistory = history.reverse();
        let historyContext = contextHistory.map(m => `${m.sender}: ${m.text}`).join('\n');

        let context = `You are AgriGenius. Current conversation history:\n${historyContext}\nReply in ${languageCode}. Keep it very short (max 2 sentences) for speech.`;
        if (userMessage.toLowerCase().includes('recommend') && cropData.length > 0) context += JSON.stringify(cropData.slice(0, 3));
        if (userMessage.toLowerCase().includes('price') && marketData.length > 0) context += JSON.stringify(marketData.slice(0, 3));

        let finalMessage = userMessage;
        if (!finalMessage && imageFile) {
            finalMessage = "Analyze this image and tell me what the user is showing. Is it a crop? Describe it briefly.";
        }

        const prompt = context + "\nQuestion: " + finalMessage;

        let replyText = "";

        // Gemini Call
        if (imageFile) {
            const imageData = {
                inlineData: {
                    data: fs.readFileSync(imageFile.path).toString("base64"),
                    mimeType: imageFile.mimetype,
                },
            };
            const result = await model.generateContent([prompt, imageData]);
            const response = await result.response;
            replyText = response.text().replace(/\*|\#|\[.*?\]/g, '').trim();
        } else {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            replyText = response.text().replace(/\*|\#|\[.*?\]/g, '').trim();
        }

        // Clean up file
        if (imageFile) {
            fs.unlink(imageFile.path, () => { });
        }

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
        const voice = VOICE_MAP[languageCode] || 'en-IN-NeerjaNeural';

        const { Communicate } = require('edge-tts-universal');
        const mkComm = new Communicate(replyText, voice);

        const chunks = [];
        for await (const chunk of mkComm.stream()) {
            if (chunk.type === 'audio') {
                chunks.push(chunk.data);
            }
        }

        const audioBuffer = Buffer.concat(chunks);
        const audioBase64 = audioBuffer.toString('base64');

        // Save AI Response
        await ChatMessage.create({
            userId: userId,
            sender: 'ai',
            text: replyText,
            language: languageCode
        });

        res.json({
            replyText,
            audioBase64,
            languageCode
        });

    } catch (error) {
        console.error('TTS/History Error:', error);
        if (req.file) fs.unlink(req.file.path, () => { }); // Cleanup on error
        res.status(500).json({ message: 'Internal Server Error', error: error.message, stack: error.stack });
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
