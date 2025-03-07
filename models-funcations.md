# Superwisper 2.0 Module Documentation

## Core Modules

### `audio-processor.js`
**Path:** `modules/audio-processor.js`  
**Purpose:** Handles low-level audio processing and format conversion  
**Key Responsibilities:**
- Manages Web Audio API context and nodes
- Converts float32 audio data to 16-bit PCM format
- Provides real-time audio processing callback system
- Maintains recording state

### `audio-recorder.js`
**Path:** `modules/audio-recorder.js`  
**Purpose:** Manages audio recording functionality  
**Key Responsibilities:**
- Handles MediaRecorder initialization
- Manages audio chunk collection
- Provides start/stop recording controls
- Handles audio stream acquisition

### `deepgram-service.js` 
**Path:** `modules/deepgram-service.js`  
**Purpose:** Deepgram API integration layer  
**Key Responsibilities:**
- Speech-to-text transcription (STT)
- Text-to-speech synthesis (TTS)
- Audio file management for temporary storage
- Handles Deepgram API v3 client interactions
- Manages audio format conversions for API compatibility

### `openai-service.js`
**Path:** `modules/openai-service.js`  
**Purpose:** OpenAI API integration and prompt management  
**Key Responsibilities:**
- Processes text through ChatGPT API
- Manages multiple prompt configurations
- Handles dynamic prompt selection
- Maintains conversation context
- Implements temperature and token controls

### `config.js`
**Path:** `modules/config.js`  
**Purpose:** Central configuration management  
**Contains:**
- OpenAI prompt templates and parameters
- Deepgram voice/model configurations
- Audio processing settings
- Application state defaults
- Debug controls

### `ui-controller.js`
**Path:** `modules/ui-controller.js`  
**Purpose:** Application orchestration layer  
**Key Responsibilities:**
- Manages inter-module communication
- Handles user interaction flow
- Coordinates audio/transcript processing
- Maintains application state
- Manages WebSocket connections

### `transcript-manager.js`
**Path:** `modules/transcript-manager.js`  
**Purpose:** Transcript processing and state management  
**Key Responsibilities:**
- Maintains current/complete transcripts
- Handles partial/final transcript differentiation
- Manages transcript display updates
- Provides transcript history access

## Supporting Modules

### `audio-manager.js`
**Path:** `modules/audio-manager.js`  
**Purpose:** Audio playback and recording coordination  
**Key Responsibilities:**
- Manages audio input/output devices
- Handles audio playback functionality
- Coordinates with audio processor

### `renderer.js` (Expanded)
**Path:** `renderer.js`  
**Purpose:** Main renderer process controller  
**Key Responsibilities:**
- Manages UI event listeners (recording buttons, prompt selection)
- Handles audio playback functionality
- Maintains conversation transcript display
- Coordinates with preload.js for IPC communication
- Manages visual state indicators (recording/processing)
- Implements local storage for user preferences

### `preload.js`
**Path:** `preload.js`  
**Purpose:** Electron preload script for secure IPC communication  
**Key Responsibilities:**
- Exposes safe API methods between main and renderer processes
- Manages IPC channels for audio/transcript data
- Handles prompt configuration updates
- Provides error event forwarding

## Root Files

### `README.md`
**Path:** `README.md`  
**Purpose:** Project documentation  
**Contains:**
- Feature overview
- Installation instructions
- Usage guidelines
- Architecture overview
- License information

### `index.html`
**Path:** `index.html`  
**Purpose:** Main application UI structure  
**Contains:**
- Recording controls UI
- Prompt selection interface
- Conversation transcript container
- Audio player element
- Status indicators
- Style definitions for all UI components

### `main.js`
**Path:** `main.js`  
**Purpose:** Electron main process controller  
**Key Responsibilities:**
- Manages application lifecycle
- Initializes AI services (OpenAI/Deepgram)
- Handles IPC communication with renderer
- Coordinates audio processing pipeline
- Manages temporary file storage
- Implements error handling and recovery

### `package.json`
**Path:** `package.json`  
**Purpose:** Project configuration and dependency management  
**Contains:**
- Application metadata and build settings
- NPM script definitions (start/build/dev)
- Production dependencies (Deepgram SDK, OpenAI)
- Development dependencies (Electron, builder)
- Platform-specific build configurations

### `package-lock.json`
**Path:** `package-lock.json`  
**Purpose:** Exact dependency tree locking  
**Function:**
- Ensures reproducible installs
- Locks dependency versions
- Maintains integrity checksums
