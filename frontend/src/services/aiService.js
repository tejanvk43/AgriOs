import axios from 'axios';

// Detect dynamic host or fallback to localhost
const API_URL = `/api/ai`;

const chatWithAgent = async (message, imageFile, language = 'en-IN', weatherContext = null) => {
    try {
        const formData = new FormData();
        formData.append('message', message);
        formData.append('language', language);
        if (imageFile) {
            formData.append('image', imageFile);
        }
        if (weatherContext) {
            formData.append('weatherData', JSON.stringify(weatherContext));
        }

        const token = localStorage.getItem('token');
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        const response = await axios.post(`${API_URL}/chat`, formData, config);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getVoiceResponse = async (message, language = 'en-IN', imageFile = null, weatherContext = null) => {
    try {
        const formData = new FormData();
        formData.append('message', message);
        formData.append('language', language);
        if (imageFile) {
            formData.append('image', imageFile);
        }
        if (weatherContext) {
            formData.append('weatherData', JSON.stringify(weatherContext));
        }

        const response = await axios.post(`${API_URL}/voice-audio`, formData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

const getHistory = async () => {
    try {
        const response = await axios.get(`${API_URL}/history`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default {
    chatWithAgent,
    getVoiceResponse,
    getHistory
};
