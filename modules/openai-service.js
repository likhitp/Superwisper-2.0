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
    
    // Set the current prompt type to the default
    this.currentPromptType = this.config.defaultPromptType;
  }

  /**
   * Get the current prompt configuration
   * @returns {Object} The current prompt configuration
   */
  getCurrentPromptConfig() {
    return this.config.promptTypes[this.currentPromptType];
  }

  /**
   * Set the current prompt type
   * @param {string} promptType - The prompt type to set
   * @returns {boolean} Whether the prompt type was successfully set
   */
  setPromptType(promptType) {
    if (this.config.promptTypes[promptType]) {
      this.currentPromptType = promptType;
      console.log(`Prompt type set to: ${promptType}`);
      return true;
    } else {
      console.error(`Invalid prompt type: ${promptType}`);
      return false;
    }
  }

  /**
   * Get all available prompt types
   * @returns {Object} All available prompt types
   */
  getAvailablePromptTypes() {
    return Object.keys(this.config.promptTypes).map(key => ({
      id: key,
      name: this.config.promptTypes[key].name
    }));
  }

  /**
   * Process text through OpenAI
   * @param {string} text - Text to process
   * @param {Object} options - Optional processing options
   * @param {string} options.promptType - Prompt type to use for this request
   * @param {string} options.model - Model to use
   * @returns {Promise<string>} Promise that resolves with the processed text
   */
  async processText(text, options = {}) {
    try {
      console.log('Processing text with OpenAI');
      
      // Get the prompt type to use for this request
      const promptType = options.promptType || this.currentPromptType;
      const promptConfig = this.config.promptTypes[promptType];
      
      if (!promptConfig) {
        throw new Error(`Invalid prompt type: ${promptType}`);
      }
      
      const {
        systemPrompt = promptConfig.systemPrompt,
        model = options.model || this.config.model,
        temperature = promptConfig.temperature || this.config.temperature,
        maxTokens = promptConfig.maxTokens || this.config.maxTokens
      } = options;

      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        temperature,
        max_tokens: maxTokens
      });

      const result = response.choices[0].message.content.trim();
      console.log('OpenAI response received');
      return result;
    } catch (error) {
      console.error('OpenAI Error:', error);
      throw error;
    }
  }
}

module.exports = OpenAIService; 