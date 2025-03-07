/**
 * Deepgram Service Module
 * Handles speech-to-text and text-to-speech using Deepgram API
 */
const { createClient } = require('@deepgram/sdk');
const fs = require('fs');
const path = require('path');
const os = require('os');
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
    
    // Initialize Deepgram with the new v3 format using createClient
    this.deepgram = createClient(apiKey);
    
    this.config = config.deepgram;
    
    // Create temporary directory for audio files
    this.tempDir = path.join(os.tmpdir(), 'superwisper-audio');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Transcribe audio to text
   * @param {Buffer} audioBuffer - Audio buffer to transcribe
   * @returns {Promise<string>} Promise that resolves with the transcription
   */
  async transcribe(audioBuffer) {
    try {
      console.log('Transcribing audio with Deepgram...');
      
      // Create a source object from the audio buffer
      const source = {
        buffer: audioBuffer,
        mimetype: 'audio/wav'
      };
      
      // Use the new v3 transcription API
      const response = await this.deepgram.listen.prerecorded.transcribeFile(source, {
        model: 'nova-2',
        smart_format: true,
        language: 'en-US',
        punctuate: true
      });
      
      // Get the transcript from the response
      const transcript = response.results.channels[0].alternatives[0].transcript;
      console.log('Transcription:', transcript);
      
      return transcript;
    } catch (error) {
      console.error('Deepgram Transcription Error:', error);
      throw error;
    }
  }

  /**
   * Convert text to speech
   * @param {string} text - Text to convert to speech
   * @returns {Promise<string>} Promise that resolves with the URL to the audio file
   */
  async textToSpeech(text) {
    try {
      console.log('Converting text to speech with Deepgram...');
      
      // Use the new v3 speak API with proper options format
      const response = await this.deepgram.speak.request(
        { text },
        {
          model: this.config.tts.model || 'aura-asteria-en',
          voice: 'asteria'
        }
      );
      
      // Get the audio stream from the response
      const stream = await response.getStream();
      if (!stream) {
        throw new Error('Failed to get audio stream from Deepgram');
      }
      
      // Convert the stream to a buffer
      const buffer = await this.getAudioBuffer(stream);
      
      // Save the audio to a temporary file
      const audioFilePath = path.join(this.tempDir, `response-${Date.now()}.mp3`);
      fs.writeFileSync(audioFilePath, buffer);
      
      console.log('Audio saved to:', audioFilePath);
      
      // Return the file URL
      return `file://${audioFilePath}`;
    } catch (error) {
      console.error('Deepgram TTS Error:', error);
      throw error;
    }
  }

  /**
   * Helper method to convert a ReadableStream to a Buffer
   * @param {ReadableStream} stream - The audio stream
   * @returns {Promise<Buffer>} Promise that resolves with the audio buffer
   */
  async getAudioBuffer(stream) {
    const reader = stream.getReader();
    const chunks = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const dataArray = chunks.reduce(
      (acc, chunk) => Uint8Array.from([...acc, ...chunk]),
      new Uint8Array(0)
    );
    
    return Buffer.from(dataArray.buffer);
  }
}

module.exports = DeepgramService; 