/**
 * Configuration Module
 * Central location for application settings
 */
const config = {
  // OpenAI settings
  openai: {
    // Default system prompt for the AI
    systemPrompt: "You are a helpful voice assistant. Keep responses concise, natural, and conversational. Be direct and to the point.",
    
    // Default model to use
    model: "gpt-4o-mini",
    
    // Temperature (0-1): Lower values make output more deterministic, higher values more creative
    temperature: 0.3,
    
    // Maximum number of tokens to generate
    maxTokens: 256
  },
  
  // Deepgram settings
  deepgram: {
    // TTS voice settings
    tts: {
      // Voice model to use
      model: "aura-asteria-en"
    },
    
    // STT settings
    stt: {
      encoding: "linear16",
      sampleRate: 16000,
      channels: 1
    }
  },
  
  // Audio settings
  audio: {
    // Time to wait for final transcript in ms
    finalTranscriptWaitTime: 1000
  },
  
  // Debug settings
  debug: {
    // Log detailed information
    verbose: false
  }
};

module.exports = config; 