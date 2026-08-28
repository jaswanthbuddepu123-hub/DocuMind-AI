const { GoogleGenAI } = require('@google/genai');
const env = require('../../config/env');

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

module.exports = ai;
