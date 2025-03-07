/**
 * UI Controller Module
 * Orchestrates the interaction between UI, audio, and transcript components
 */
const AudioProcessor = require('./audio-processor');
const AudioManager = require('./audio-manager');
const UIStateManager = require('./ui-state-manager');
const TranscriptManager = require('./transcript-manager');

class UIController {
  constructor(deepgramService, openaiService) {
    // Initialize managers
    this.uiState = new UIStateManager();
    this.audioProcessor = new AudioProcessor();
    this.audioManager = new AudioManager(this.audioProcessor);
    this.transcriptManager = new TranscriptManager();
    
    // Services
    this.deepgramService = deepgramService;
    this.openaiService = openaiService;
    this.socket = null;

    console.log('UIController initialized');
  }

  /**
   * Initialize the controller
   */
  init() {
    console.log('Initializing UI Controller...');
    this.uiState.initializeElements();
    this.setupEventListeners();
    this.setInitialState();
    
    // Initialize audio and transcript components
    this.audioManager.initializePlayer(document.getElementById('audioPlayer'));
    this.transcriptManager.initialize(document.getElementById('transcript'));
    console.log('UI Controller initialization complete');
  }

  /**
   * Set up event listeners for buttons
   */
  setupEventListeners() {
    console.log('Setting up event listeners...');
    console.log('Start button:', this.uiState.startBtn);
    console.log('Stop button:', this.uiState.stopBtn);
    
    if (!this.uiState.startBtn || !this.uiState.stopBtn) {
      console.error('Buttons not found! Cannot set up event listeners.');
      return;
    }

    this.uiState.startBtn.addEventListener('click', () => {
      console.log('Start button clicked');
      this.startRecording();
    });
    
    this.uiState.stopBtn.addEventListener('click', () => {
      console.log('Stop button clicked');
      this.stopRecording();
    });
    
    console.log('Event listeners set up successfully');
  }

  /**
   * Set initial state
   */
  setInitialState() {
    this.uiState.setRecordingState(false);
    this.uiState.setProcessingState(false);
    this.uiState.updateStatus('Ready to record');
    this.transcriptManager.reset();
  }

  /**
   * Start recording audio
   */
  async startRecording() {
    try {
      this.uiState.updateStatus('Requesting microphone access...');
      
      // Reset state and start recording
      this.transcriptManager.reset();
      this.audioManager.hidePlayer();
      await this.audioManager.startRecording();
      
      // Connect to Deepgram
      this.socket = this.deepgramService.createWebSocket();
      this.setupWebSocketHandlers();
      
    } catch (error) {
      console.error('Error:', error);
      this.uiState.updateStatus(`Error: ${error.message}`);
    }
  }

  /**
   * Set up WebSocket event handlers
   */
  setupWebSocketHandlers() {
    this.socket.onopen = () => {
      this.uiState.updateStatus('Connected to Deepgram');
      this.uiState.setRecordingState(true);
      
      // Start audio processing
      this.audioProcessor.startProcessing((audioData) => {
        if (this.socket.readyState === 1) {
          this.socket.send(audioData);
        }
      });
    };

    this.socket.onmessage = (message) => {
      const received = JSON.parse(message.data);
      console.log('Received message from Deepgram:', received);
      this.transcriptManager.processTranscript(received);
    };

    this.socket.onclose = () => {
      console.log('WebSocket closed');
      this.uiState.updateStatus('Disconnected from Deepgram');
      if (this.audioProcessor.isRecording) {
        this.stopRecording();
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.uiState.updateStatus('Error connecting to Deepgram');
    };
  }

  /**
   * Stop recording audio
   */
  async stopRecording() {
    const transcript = this.transcriptManager.getCompleteTranscript();
    console.log('Stopping recording...', { 
      transcript,
      finalTranscriptReceived: this.transcriptManager.hasFinalTranscript()
    });
    
    this.audioManager.stopRecording();
    this.uiState.setRecordingState(false);
    
    if (this.socket && this.socket.readyState === 1) {
      this.socket.close();
    }

    // Wait briefly for final transcript if needed
    if (!this.transcriptManager.hasFinalTranscript()) {
      this.uiState.updateStatus('Waiting for final transcript...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (transcript.trim()) {
      await this.processWithAI(transcript);
    } else {
      this.uiState.updateStatus('Recording stopped (no speech detected)');
    }
  }

  /**
   * Process transcript with OpenAI
   * @param {string} transcript - The transcript to process
   */
  async processWithAI(transcript) {
    try {
      this.uiState.setProcessingState(true);
      this.uiState.updateStatus('Processing transcript with AI...');
      
      // Display original transcript with user styling
      this.displayUserMessage(transcript);
      
      // Process with OpenAI
      const processedText = await this.openaiService.processText(transcript);
      
      // Display AI response with assistant styling
      this.displayAssistantMessage(processedText);
      
      // Convert AI response to speech
      await this.convertToSpeech(processedText);
    } catch (error) {
      console.error('AI Processing Error:', error);
      this.uiState.updateStatus(`AI processing error: ${error.message}`);
      this.uiState.setProcessingState(false);
    }
  }

  /**
   * Display a user message in the transcript
   * @param {string} message - The message to display
   */
  displayUserMessage(message) {
    const transcriptEl = document.getElementById('transcript');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'user-message';
    
    const label = document.createElement('div');
    label.className = 'message-label';
    label.textContent = 'You:';
    
    const content = document.createElement('div');
    content.textContent = message;
    
    messageDiv.appendChild(label);
    messageDiv.appendChild(content);
    transcriptEl.appendChild(messageDiv);
    
    // Scroll to bottom
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
  }

  /**
   * Display an assistant message in the transcript
   * @param {string} message - The message to display
   */
  displayAssistantMessage(message) {
    const transcriptEl = document.getElementById('transcript');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'assistant-message';
    
    const label = document.createElement('div');
    label.className = 'message-label';
    label.textContent = 'Assistant:';
    
    const content = document.createElement('div');
    
    // Extract only the content between <start> and <end> tags
    let displayText = message;
    const startTagIndex = message.indexOf('<start>');
    const endTagIndex = message.indexOf('<end>');
    
    if (startTagIndex !== -1 && endTagIndex !== -1 && endTagIndex > startTagIndex) {
      // Extract text between <start> and <end> tags
      displayText = message.substring(startTagIndex + 7, endTagIndex).trim();
    }
    
    content.textContent = displayText;
    
    messageDiv.appendChild(label);
    messageDiv.appendChild(content);
    transcriptEl.appendChild(messageDiv);
    
    // Scroll to bottom
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
  }

  /**
   * Convert transcript to speech
   */
  async convertToSpeech(transcript) {
    this.uiState.setProcessingState(true);
    this.uiState.updateStatus('Converting to speech...');
    
    try {
      // Extract text outside of <start> and <end> tags
      let textToSpeak = transcript;
      
      // Check if the transcript contains <start> and <end> tags
      const startTagIndex = transcript.indexOf('<start>');
      const endTagIndex = transcript.indexOf('<end>');
      
      if (startTagIndex !== -1 && endTagIndex !== -1 && endTagIndex > startTagIndex) {
        // Extract text after the </end> tag
        const textAfterEndTag = transcript.substring(endTagIndex + 6).trim();
        
        if (textAfterEndTag) {
          // Use only the text after the </end> tag for TTS
          textToSpeak = textAfterEndTag;
        } else {
          // If there's no text after </end>, don't process TTS
          this.uiState.updateStatus('No text to speak outside of tags');
          this.uiState.setProcessingState(false);
          return;
        }
      }
      
      const audioBlob = await this.deepgramService.textToSpeech(textToSpeak);
      await this.audioManager.playAudioResponse(audioBlob);
      this.uiState.updateStatus('Audio ready to play');
    } catch (error) {
      console.error('TTS Error:', error);
      this.uiState.updateStatus(`Text-to-speech error: ${error.message}`);
    } finally {
      this.uiState.setProcessingState(false);
    }
  }
}

module.exports = UIController; 