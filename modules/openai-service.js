/**
 * OpenAI Service Module
 * Handles all interactions with OpenAI API for text processing
 */
const OpenAI = require('openai');
const config = require('./config');

class OpenAIService {
  /**
   * Initialize the OpenAI service
   * @param {string} apiKey - OpenAI API key
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.apiKey = apiKey;
    this.openai = new OpenAI({ 
      apiKey,
      dangerouslyAllowBrowser: true // Allow usage in Electron (browser-like environment)
    });
    this.config = config.openai;
  }

  /**
   * Process text through OpenAI
   * @param {string} text - Text to process
   * @param {Object} options - Optional processing options
   * @param {string} options.systemPrompt - System prompt for the AI
   * @param {string} options.model - Model to use
   * @returns {Promise<string>} Promise that resolves with the processed text
   */
  async processText(text, options = {}) {
    try {
      console.log('Processing text with OpenAI:', text);
      
      const {
        systemPrompt = this.config.systemPrompt,
        model = this.config.model
      } = options;

      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens
      });

      const result = response.choices[0].message.content.trim();
      console.log('OpenAI response:', result);
      return result;
    } catch (error) {
      console.error('OpenAI Error:', error);
      throw error;
    }
  }
}

module.exports = OpenAIService; 