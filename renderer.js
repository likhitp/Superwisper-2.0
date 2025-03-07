/**
 * Renderer Script
 * Handles UI interactions and integrates with backend services
 */

// DOM Elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusElement = document.getElementById('status');
const recordingIndicator = document.getElementById('recordingIndicator');
const transcriptElement = document.getElementById('transcript');
const audioPlayer = document.getElementById('audioPlayer');
const promptButtons = document.querySelectorAll('.prompt-btn');

// State variables
let isRecording = false;
let isProcessing = false;
let currentPromptType = 'email'; // Default prompt type

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initPromptSelection();
  initRecordingButtons();
  
  // Load saved prompt type from localStorage if available
  const savedPromptType = localStorage.getItem('currentPromptType');
  if (savedPromptType) {
    setPromptType(savedPromptType);
  }
  
  // Request prompt config from main process to update button labels
  if (window.electronAPI) {
    window.electronAPI.getPromptConfig();
  }
});

/**
 * Initialize prompt selection buttons
 */
function initPromptSelection() {
  promptButtons.forEach(button => {
    button.addEventListener('click', () => {
      const promptType = button.getAttribute('data-prompt-type');
      setPromptType(promptType);
    });
  });
}

/**
 * Update button labels based on config
 * @param {Object} config - The prompt configuration
 */
function updateButtonLabels(config) {
  if (!config || !config.promptTypes) {
    console.error('Invalid prompt config received:', config);
    return;
  }
  
  console.log('Updating button labels with config:', config);
  
  promptButtons.forEach(button => {
    const promptType = button.getAttribute('data-prompt-type');
    const promptConfig = config.promptTypes[promptType];
    
    if (promptConfig && promptConfig.buttonLabel) {
      console.log(`Setting button label for ${promptType} to ${promptConfig.buttonLabel}`);
      button.textContent = promptConfig.buttonLabel;
    } else {
      console.warn(`No button label found for prompt type: ${promptType}`);
    }
  });
}

/**
 * Set the current prompt type
 * @param {string} promptType - The prompt type to set
 */
function setPromptType(promptType) {
  // Update UI
  promptButtons.forEach(btn => {
    if (btn.getAttribute('data-prompt-type') === promptType) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Update state
  currentPromptType = promptType;
  
  // Save to localStorage
  localStorage.setItem('currentPromptType', promptType);
  
  // Update status message
  const promptName = getPromptName(promptType);
  updateStatus(`Mode switched to: ${promptName}`);
  
  // Notify the main process about the prompt type change
  if (window.electronAPI) {
    window.electronAPI.setPromptType(promptType);
  }
}

/**
 * Get the display name for a prompt type
 * @param {string} promptType - The prompt type
 * @returns {string} The display name
 */
function getPromptName(promptType) {
  const promptNames = {
    'email': 'Email Writing',
    'bulletPoints': 'Bullet Points',
    'grammar': 'Grammar Fix'
  };
  return promptNames[promptType] || 'Unknown Mode';
}

/**
 * Initialize recording buttons
 */
function initRecordingButtons() {
  startBtn.addEventListener('click', startRecording);
  stopBtn.addEventListener('click', stopRecording);
}

/**
 * Start recording
 */
function startRecording() {
  if (isRecording) return;
  
  isRecording = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  recordingIndicator.classList.add('recording-active');
  updateStatus('Recording...');
  
  // Notify the main process to start recording
  if (window.electronAPI) {
    window.electronAPI.startRecording();
  }
}

/**
 * Stop recording
 */
function stopRecording() {
  if (!isRecording) return;
  
  isRecording = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  recordingIndicator.classList.remove('recording-active');
  
  // Show processing indicator
  showProcessingIndicator();
  
  // Notify the main process to stop recording
  if (window.electronAPI) {
    window.electronAPI.stopRecording();
  }
}

/**
 * Show processing indicator
 */
function showProcessingIndicator() {
  isProcessing = true;
  updateStatus('Processing...');
  
  // Create processing indicator if it doesn't exist
  let processingIndicator = document.querySelector('.processing-indicator');
  if (!processingIndicator) {
    processingIndicator = document.createElement('div');
    processingIndicator.className = 'processing-indicator';
    document.querySelector('.status-container').appendChild(processingIndicator);
  }
  
  processingIndicator.classList.add('processing-active');
}

/**
 * Hide processing indicator
 */
function hideProcessingIndicator() {
  isProcessing = false;
  updateStatus('Ready to record');
  
  const processingIndicator = document.querySelector('.processing-indicator');
  if (processingIndicator) {
    processingIndicator.classList.remove('processing-active');
  }
}

/**
 * Update status message
 * @param {string} message - Status message
 */
function updateStatus(message) {
  statusElement.textContent = message;
}

/**
 * Add message to transcript
 * @param {string} text - Message text
 * @param {string} role - Message role ('user' or 'assistant')
 */
function addMessageToTranscript(text, role) {
  const messageDiv = document.createElement('div');
  messageDiv.className = role === 'user' ? 'user-message' : 'assistant-message';
  
  const labelDiv = document.createElement('div');
  labelDiv.className = 'message-label';
  labelDiv.textContent = role === 'user' ? 'You:' : 'Assistant:';
  
  const contentDiv = document.createElement('div');
  contentDiv.textContent = text;
  
  messageDiv.appendChild(labelDiv);
  messageDiv.appendChild(contentDiv);
  
  transcriptElement.appendChild(messageDiv);
  transcriptElement.scrollTop = transcriptElement.scrollHeight;
}

/**
 * Play audio response
 * @param {string} audioUrl - URL to audio file
 */
function playAudioResponse(audioUrl) {
  console.log('Playing audio from:', audioUrl);
  
  try {
    // Make sure the URL is properly formatted for the audio element
    // For file:// URLs, we need to ensure they're properly formatted
    if (audioUrl.startsWith('file://')) {
      // On Windows, file URLs need an extra / at the beginning
      if (audioUrl.startsWith('file:///') === false && navigator.platform.indexOf('Win') > -1) {
        audioUrl = audioUrl.replace('file://', 'file:///');
      }
    }
    
    audioPlayer.src = audioUrl;
    audioPlayer.style.display = 'block';
    
    // Add error handling for audio playback
    audioPlayer.onerror = (e) => {
      console.error('Audio playback error:', e);
      console.error('Audio error details:', audioPlayer.error);
      updateStatus(`Error playing audio: ${audioPlayer.error?.message || 'Unknown error'}`);
    };
    
    // Add success handling for audio playback
    audioPlayer.oncanplaythrough = () => {
      console.log('Audio loaded and ready to play');
      audioPlayer.play().catch(err => {
        console.error('Failed to play audio:', err);
        // Try again with a slight delay as a fallback
        setTimeout(() => {
          audioPlayer.play().catch(e => {
            console.error('Second attempt failed:', e);
            updateStatus('Error: Audio playback failed. Please try again.');
          });
        }, 500);
      });
    };
  } catch (error) {
    console.error('Error setting up audio playback:', error);
    updateStatus(`Error: ${error.message}`);
  }
}

// Set up IPC listeners if in Electron environment
if (window.electronAPI) {
  // Listen for transcription results
  window.electronAPI.onTranscription((text) => {
    addMessageToTranscript(text, 'user');
  });
  
  // Listen for AI responses
  window.electronAPI.onAIResponse((text) => {
    addMessageToTranscript(text, 'assistant');
    hideProcessingIndicator();
  });
  
  // Listen for audio responses
  window.electronAPI.onAudioResponse((audioUrl) => {
    playAudioResponse(audioUrl);
    hideProcessingIndicator();
  });
  
  // Listen for prompt config updates
  window.electronAPI.onPromptConfigUpdate((config) => {
    console.log('Received prompt config update:', config);
    updateButtonLabels(config);
  });
  
  // Listen for errors
  window.electronAPI.onError((error) => {
    console.error('Error from main process:', error);
    updateStatus(`Error: ${error}`);
    hideProcessingIndicator();
  });
} 