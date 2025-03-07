/**
 * Manages transcript processing and state
 */
class TranscriptManager {
  constructor() {
    this.transcriptElement = null;
    this.currentTranscript = '';
    this.completeTranscript = '';
    this.transcriptSegments = [];
    this.finalTranscriptReceived = false;
  }

  /**
   * Initialize transcript element
   * @param {HTMLElement} element - The transcript display element
   */
  initialize(element) {
    this.transcriptElement = element;
    this.reset();
  }

  /**
   * Reset transcript state
   */
  reset() {
    this.currentTranscript = '';
    this.completeTranscript = '';
    this.transcriptSegments = [];
    this.finalTranscriptReceived = false;
    
    // Clear the transcript display element
    if (this.transcriptElement) {
      this.transcriptElement.innerHTML = '';
    }
  }

  /**
   * Process new transcript data
   * @param {Object} data - Transcript data from Deepgram
   * @returns {boolean} - Whether final transcript was received
   */
  processTranscript(data) {
    const transcript = data.channel?.alternatives[0]?.transcript || '';
    const isFinal = data.is_final === true;
    
    if (transcript && transcript.trim()) {
      this.currentTranscript = transcript;
      
      if (isFinal) {
        console.log('Saving final transcript segment:', transcript);
        this.transcriptSegments.push(transcript);
        this.completeTranscript = this.transcriptSegments.join(' ');
        this.finalTranscriptReceived = true;
      }
      
      this.updateDisplay();
      return isFinal;
    }
    return false;
  }

  /**
   * Update transcript display
   */
  updateDisplay() {
    if (this.transcriptElement) {
      const displayText = [
        ...this.transcriptSegments,
        this.finalTranscriptReceived ? '' : this.currentTranscript
      ].filter(Boolean).join(' ');
      
      this.transcriptElement.textContent = displayText;
    }
  }

  /**
   * Get the complete transcript
   * @returns {string} The complete transcript
   */
  getCompleteTranscript() {
    return this.transcriptSegments.join(' ');
  }

  /**
   * Check if final transcript was received
   * @returns {boolean}
   */
  hasFinalTranscript() {
    return this.finalTranscriptReceived;
  }
}

module.exports = TranscriptManager; 