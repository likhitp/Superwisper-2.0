/**
 * Manages audio recording, processing, and playback
 */
class AudioManager {
  constructor(audioProcessor) {
    this.audioProcessor = audioProcessor;
    this.audioPlayer = null;
    this.stream = null;
  }

  /**
   * Initialize audio player element
   * @param {HTMLAudioElement} audioPlayer - The audio player element
   */
  initializePlayer(audioPlayer) {
    this.audioPlayer = audioPlayer;
  }

  /**
   * Start audio recording
   * @returns {Promise<MediaStream>} The audio stream
   */
  async startRecording() {
    this.stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        channelCount: 1,
        sampleRate: 16000
      }
    });
    
    await this.audioProcessor.initialize(this.stream);
    return this.stream;
  }

  /**
   * Stop audio recording and cleanup
   */
  stopRecording() {
    this.audioProcessor.stopProcessing();
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  /**
   * Play audio response
   * @param {Blob} audioBlob - The audio blob to play
   * @returns {Promise<void>}
   */
  async playAudioResponse(audioBlob) {
    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(audioBlob);
      this.audioPlayer.src = audioUrl;
      this.audioPlayer.style.display = 'block';
      
      this.audioPlayer.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };

      this.audioPlayer.onerror = (e) => {
        console.error('Audio playback error:', e);
        URL.revokeObjectURL(audioUrl);
        reject(new Error('Error playing synthesized speech'));
      };
    });
  }

  /**
   * Hide the audio player
   */
  hidePlayer() {
    if (this.audioPlayer) {
      this.audioPlayer.style.display = 'none';
    }
  }
}

module.exports = AudioManager; 