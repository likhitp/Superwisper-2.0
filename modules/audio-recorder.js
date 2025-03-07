/**
 * Audio Recorder Module
 * Handles all audio recording functionality
 */
class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.audioStream = null;
  }

  /**
   * Start recording audio from the microphone
   * @returns {Promise<void>} Promise that resolves when recording starts
   */
  async startRecording() {
    // Reset any previous recording state
    this.audioChunks = [];
    
    try {
      // Request microphone access
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Configure media recorder
      const options = { mimeType: 'audio/webm' };
      try {
        this.mediaRecorder = new MediaRecorder(this.audioStream, options);
      } catch (e) {
        console.error('MediaRecorder creation failed with specified MIME type:', e);
        // Fallback to default MIME type
        this.mediaRecorder = new MediaRecorder(this.audioStream);
      }
      
      // Set up data handling
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log('Audio chunk received:', event.data.size, 'bytes');
        }
      };
      
      // Handle errors
      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        throw new Error('Recording error occurred');
      };
      
      // Start recording with smaller chunks for better feedback
      this.mediaRecorder.start(100); // Collect data every 100ms
      console.log('Recording started');
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error in startRecording:', error);
      this.cleanupResources();
      return Promise.reject(error);
    }
  }

  /**
   * Stop recording and return the audio blob
   * @returns {Promise<Blob>} Promise that resolves with the recorded audio blob
   */
  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        console.warn('Stop recording called but recorder is not active');
        this.cleanupResources();
        reject(new Error('No active recording'));
        return;
      }
      
      try {
        // Set up onstop handler to process the recording
        this.mediaRecorder.onstop = () => {
          try {
            // Create audio blob from chunks
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            console.log('Audio blob created, size:', audioBlob.size, 'bytes');
            
            // Clean up resources
            this.cleanupResources();
            
            // Resolve with the audio blob
            resolve(audioBlob);
          } catch (error) {
            console.error('Error creating audio blob:', error);
            this.cleanupResources();
            reject(error);
          }
        };
        
        // Stop recording
        console.log('Stopping recording...');
        this.mediaRecorder.stop();
      } catch (error) {
        console.error('Error in stopRecording:', error);
        this.cleanupResources();
        reject(error);
      }
    });
  }

  /**
   * Clean up audio resources
   */
  cleanupResources() {
    // Stop audio tracks
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
    }
    
    // Reset state
    this.audioStream = null;
    this.mediaRecorder = null;
    console.log('Audio resources cleaned up');
  }
}

module.exports = AudioRecorder; 