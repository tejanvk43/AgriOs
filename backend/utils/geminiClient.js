const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Sends a POST request to the Gemini API with retry logic for 429 errors.
 * 
 * @param {string} model - The model name (e.g., 'gemini-2.0-flash-lite').
 * @param {object} contentBody - The JSON body for the 'generateContent' endpoint.
 * @param {number} maxRetries - Maximum number of retries (default: 5).
 * @param {number} initialDelayMs - Initial delay in milliseconds (default: 800).
 * @returns {Promise<object>} - The API response data.
 */
async function callGeminiWithRetry(model, contentBody, maxRetries = 5, initialDelayMs = 800) {
    const endpoint = `${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;

    let attempt = 0;
    let delay = initialDelayMs;

    while (attempt <= maxRetries) {
        try {
            const response = await axios.post(endpoint, contentBody, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data; // Success

        } catch (error) {
            if (error.response && error.response.status === 429) {
                attempt++;
                if (attempt > maxRetries) {
                    throw new Error(`Gemini request failed after ${maxRetries} retries: Rate limit exceeded.`);
                }

                console.warn(`Gemini 429 Rate Limit. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff: 800, 1600, 3200, 6400, 12800
            } else {
                // Non-retriable error (e.g., 400 Bad Request, 401 Unauthorized, 500 Server Error)
                // Note: You could optionally retry 500s too if desired, but 429 is the main target.
                throw error;
            }
        }
    }
}

module.exports = { callGeminiWithRetry };
