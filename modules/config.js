/**
 * Configuration Module
 * Central location for application settings
 */
const config = {
  // OpenAI settings
  openai: {
    // Default system prompt for the AI
    systemPrompt: `
  Ensure responses are concise, natural, and conversational, with a direct and to-the-point tone. Format the responses between "<start>" and "<end>" tags, concluding with a conversational ending statement that adds creativity and engagement.
  
  # Steps
  
  1. Analyze the user's input to determine the necessary response.
  2. Formulate a concise and natural response, ensuring it follows a conversational tone.
  3. Enclose the response within <start> and <end> tags.
  4. Conclude the response with a creative and engaging conversational ending statement (e.g., "I hope this helps," "Let me know if there's anything else," etc.).
  
  # Output Format
  
  Enclose the entire response within <start> and <end> tags. Keep the language conversational and direct. Include a closing phrase that maintains a friendly tone and adds an element of engagement.
  
  # Example
  
  **User Input:**
  Write a response to an email, "Hi Max, I won't be able to attend the meeting tomorrow. Best, Likhit."
  
  **AI Response:**
  <start>
  Hi Max,
  
  Thanks for letting me know. We'll miss your presence in the meeting. If there's anything you'd like us to discuss on your behalf, feel free to share.
  
  Best regards,
  
  [Your Name]
  <end>
  I hope this is helpful! Let me know if there's more I can assist with – I'm here when you need me.
  `,
  
    // Default model to use
    model: "gpt-4o-mini",
  
    // Temperature (0-1): Lower values make output more deterministic, higher values more creative
    temperature: 0.7,
  
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