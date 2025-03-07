/**
 * Audio Processor Module
 * Handles audio capture and processing
 */
class AudioProcessor {
  constructor() {
    this.audioContext = null;
    this.audioSource = null;
    this.audioProcessor = null;
    this.isRecording = false;
  }

  /**
   * Initialize audio capture with specified settings
   * @param {MediaStream} stream - The media stream from getUserMedia
   * @returns {Promise<void>}
   */
  async initialize(stream) {
    // Initialize audio context and processing
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 16000
    });
    this.audioSource = this.audioContext.createMediaStreamSource(stream);
    this.audioProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
  }

  /**
   * Start processing audio with callback for processed data
   * @param {Function} onAudioProcess - Callback for processed audio data
   */
  startProcessing(onAudioProcess) {
    this.isRecording = true;
    
    // Set up audio processing
    this.audioProcessor.onaudioprocess = (e) => {
      if (this.isRecording) {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = this.floatTo16BitPCM(inputData);
        onAudioProcess(pcmData.buffer);
      }
    };
    
    // Connect the audio nodes
    this.audioSource.connect(this.audioProcessor);
    this.audioProcessor.connect(this.audioContext.destination);
  }

  /**
   * Stop audio processing and cleanup
   */
  stopProcessing() {
    this.isRecording = false;
    
    if (this.audioProcessor && this.audioSource) {
      this.audioProcessor.disconnect();
      this.audioSource.disconnect();
      this.audioContext.close();
    }
  }

  /**
   * Convert float32 audio data to 16-bit PCM
   * @param {Float32Array} float32Arr - Input audio data
   * @returns {Int16Array} - Converted PCM data
   */
  floatTo16BitPCM(float32Arr) {
    const int16Arr = new Int16Array(float32Arr.length);
    for (let i = 0; i < float32Arr.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Arr[i]));
      int16Arr[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Arr;
  }
}

module.exports = AudioProcessor; 