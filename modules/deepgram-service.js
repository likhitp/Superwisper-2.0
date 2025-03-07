/**
 * Deepgram Service Module
 * Handles all interactions with Deepgram API for speech-to-text and text-to-speech
 */
const config = require('./config');

class DeepgramService {
  /**
   * Initialize the Deepgram service
   * @param {string} apiKey - Deepgram API key
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Deepgram API key is required');
    }
    this.apiKey = apiKey;
    this.config = config.deepgram;
  }

  /**
   * Create a WebSocket connection for live transcription
   * @returns {WebSocket} WebSocket connection to Deepgram
   */
  createWebSocket() {
    const { encoding, sampleRate, channels } = this.config.stt;
    const url = `wss://api.deepgram.com/v1/listen?encoding=${encoding}&sample_rate=${sampleRate}&channels=${channels}`;
    
    return new WebSocket(url, [
      'token',
      this.apiKey,
    ]);
  }

  /**
   * Convert text to speech using Deepgram
   * @param {string} text - Text to convert to speech
   * @returns {Promise<Blob>} Promise that resolves with the audio blob
   */
  async textToSpeech(text) {
    try {
      console.log('Converting to speech:', text);
      const url = `https://api.deepgram.com/v1/speak?model=${this.config.tts.model}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TTS API error: ${response.status} - ${errorText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('TTS Error:', error);
      throw error;
    }
  }
}

module.exports = DeepgramService; 