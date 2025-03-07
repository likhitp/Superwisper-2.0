/**
 * Manages UI state and elements
 */
class UIStateManager {
  constructor() {
    this.startBtn = null;
    this.stopBtn = null;
    this.statusElement = null;
    this.recordingIndicator = null;
    this.processingIndicator = null;
  }

  /**
   * Initialize UI elements
   */
  initializeElements() {
    this.startBtn = document.getElementById('startBtn');
    this.stopBtn = document.getElementById('stopBtn');
    this.statusElement = document.getElementById('status');
    this.recordingIndicator = document.getElementById('recordingIndicator');
    this.createProcessingIndicator();
    
    this.logUIElementsStatus();
  }

  /**
   * Create and add processing indicator
   */
  createProcessingIndicator() {
    if (!document.getElementById('processingIndicator')) {
      this.processingIndicator = document.createElement('div');
      this.processingIndicator.id = 'processingIndicator';
      this.processingIndicator.className = 'processing-indicator';
      
      const statusContainer = document.querySelector('.status-container');
      if (statusContainer) {
        statusContainer.appendChild(this.processingIndicator);
      }
    } else {
      this.processingIndicator = document.getElementById('processingIndicator');
    }
  }

  /**
   * Log the status of UI elements for debugging
   */
  logUIElementsStatus() {
    console.log('[DEBUG] UI Elements found:');
    console.log('[DEBUG] startBtn:', this.startBtn ? 'Found ✓' : 'Missing ✗');
    console.log('[DEBUG] stopBtn:', this.stopBtn ? 'Found ✓' : 'Missing ✗');
    console.log('[DEBUG] statusElement:', this.statusElement ? 'Found ✓' : 'Missing ✗');
    console.log('[DEBUG] recordingIndicator:', this.recordingIndicator ? 'Found ✓' : 'Missing ✗');
    console.log('[DEBUG] processingIndicator:', this.processingIndicator ? 'Found ✓' : 'Missing ✗');
  }

  /**
   * Set recording state UI
   * @param {boolean} isRecording - Whether recording is active
   */
  setRecordingState(isRecording) {
    this.startBtn.disabled = isRecording;
    this.stopBtn.disabled = !isRecording;
    if (isRecording) {
      this.recordingIndicator.classList.add('recording-active');
    } else {
      this.recordingIndicator.classList.remove('recording-active');
    }
  }

  /**
   * Set processing state UI
   * @param {boolean} isProcessing - Whether processing is active
   */
  setProcessingState(isProcessing) {
    if (isProcessing) {
      this.processingIndicator.classList.add('processing-active');
    } else {
      this.processingIndicator.classList.remove('processing-active');
    }
  }

  /**
   * Update status message
   * @param {string} message - Status message to display
   */
  updateStatus(message) {
    if (this.statusElement) {
      this.statusElement.textContent = message;
      console.log('Status:', message);
    }
  }
}

module.exports = UIStateManager; 