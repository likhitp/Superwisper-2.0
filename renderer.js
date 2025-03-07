// renderer.js - Main entry point, coordinates modules

// Import required modules
require('dotenv').config();
const DeepgramService = require('./modules/deepgram-service');
const OpenAIService = require('./modules/openai-service');
const UIController = require('./modules/ui-controller');

// Initialize Deepgram service
const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
if (!deepgramApiKey) {
    document.getElementById('transcript').textContent = 'Error: Deepgram API key not configured';
    throw new Error('DEEPGRAM_API_KEY not found in environment variables');
}

// Initialize OpenAI service
const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
    document.getElementById('transcript').textContent = 'Error: OpenAI API key not configured';
    throw new Error('OPENAI_API_KEY not found in environment variables');
}

// Create services
const deepgramService = new DeepgramService(deepgramApiKey);
const openaiService = new OpenAIService(openaiApiKey);
const uiController = new UIController(deepgramService, openaiService);

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing application...');
    uiController.init();
}); 