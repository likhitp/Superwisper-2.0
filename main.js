/**
 * Main Process
 * Handles the application lifecycle and integrates with backend services
 */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
// Load environment variables from .env file
require('dotenv').config();
const OpenAIService = require('./modules/openai-service');
const DeepgramService = require('./modules/deepgram-service');
const config = require('./modules/config');

// Initialize services
let openaiService;
let deepgramService;

// Create temporary directory for audio files
const tempDir = path.join(os.tmpdir(), 'superwisper-audio');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Create main window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
  
  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
  
  return mainWindow;
}

// Initialize the application
app.whenReady().then(() => {
  // Initialize OpenAI service
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
  
  // Log environment variables for debugging (remove in production)
  console.log('Environment variables loaded:');
  console.log('OPENAI_API_KEY exists:', !!openaiApiKey);
  console.log('DEEPGRAM_API_KEY exists:', !!deepgramApiKey);
  
  if (!openaiApiKey) {
    console.error('OpenAI API key not found. Please set the OPENAI_API_KEY environment variable in your .env file.');
    app.quit();
    return;
  }
  
  if (!deepgramApiKey) {
    console.error('Deepgram API key not found. Please set the DEEPGRAM_API_KEY environment variable in your .env file.');
    app.quit();
    return;
  }
  
  try {
    openaiService = new OpenAIService(openaiApiKey);
    console.log('OpenAI service initialized successfully');
    
    deepgramService = new DeepgramService(deepgramApiKey);
    console.log('Deepgram service initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize services:', error);
    app.quit();
    return;
  }
  
  const mainWindow = createWindow();
  
  // Set up IPC handlers
  setupIpcHandlers(mainWindow);
  
  // Send the prompt config to the renderer as soon as the app starts
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Sending initial prompt config');
    mainWindow.webContents.send('prompt-config-update', config.openai);
  });
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Set up IPC handlers
 * @param {BrowserWindow} mainWindow - The main window
 */
function setupIpcHandlers(mainWindow) {
  // Handle start recording
  ipcMain.on('start-recording', (event) => {
    console.log('Start recording');
    
    // Notify the renderer that recording has started
    mainWindow.webContents.send('recording-started');
  });
  
  // Handle stop recording
  ipcMain.on('stop-recording', async (event) => {
    console.log('Stop recording');
    
    try {
      // For now, we'll use a simulated transcription
      // In a real application, we would get audio data from the renderer process
      // through an IPC channel and pass it to Deepgram
      
      // Get the current prompt type
      const promptType = openaiService.currentPromptType;
      
      // These are example transcriptions based on prompt type
      let transcription;
      switch (promptType) {
        case 'email':
          transcription = "I need to write an email to my team about the project delay.";
          break;
        case 'bulletPoints':
          transcription = "I'm thinking about improving our customer service process by implementing a new ticketing system, training our staff better, and maybe creating some kind of reward system for good service.";
          break;
        case 'grammar':
          transcription = "The company have been struggling with they're sales targets and the team dont know how to fix this problem because customers is not interested in our products anymore.";
          break;
        default:
          transcription = "What are your thoughts on this project?";
      }
      
      // Send the transcription to the renderer
      mainWindow.webContents.send('transcription', transcription);
      
      // Process the transcription with OpenAI
      try {
        const aiResponse = await openaiService.processText(transcription);
        mainWindow.webContents.send('ai-response', aiResponse);
        
        // Convert the AI response to speech
        try {
          // Extract the content between <start> and <end> tags for TTS
          let ttsText = aiResponse;
          const startTag = "<start>";
          const endTag = "<end>";
          
          if (aiResponse.includes(startTag) && aiResponse.includes(endTag)) {
            const startIndex = aiResponse.indexOf(startTag) + startTag.length;
            const endIndex = aiResponse.indexOf(endTag);
            ttsText = aiResponse.substring(startIndex, endIndex).trim();
          }
          
          const audioUrl = await deepgramService.textToSpeech(ttsText);
          mainWindow.webContents.send('audio-response', audioUrl);
        } catch (ttsError) {
          console.error('Error converting text to speech:', ttsError);
          mainWindow.webContents.send('error', 'Failed to generate audio response: ' + ttsError.message);
        }
      } catch (aiError) {
        console.error('Error processing with OpenAI:', aiError);
        mainWindow.webContents.send('error', 'Failed to process with AI: ' + aiError.message);
      }
    } catch (error) {
      console.error('Error in stop-recording handler:', error);
      mainWindow.webContents.send('error', error.message);
    }
  });
  
  // Handle prompt type change
  ipcMain.on('set-prompt-type', (event, promptType) => {
    console.log(`Setting prompt type to: ${promptType}`);
    try {
      const success = openaiService.setPromptType(promptType);
      if (!success) {
        mainWindow.webContents.send('error', `Failed to set prompt type: ${promptType}`);
      }
    } catch (error) {
      console.error('Error setting prompt type:', error);
      mainWindow.webContents.send('error', error.message);
    }
  });
  
  // Handle get prompt config request
  ipcMain.on('get-prompt-config', (event) => {
    console.log('Getting prompt config');
    try {
      // Send the prompt config to the renderer
      mainWindow.webContents.send('prompt-config-update', config.openai);
    } catch (error) {
      console.error('Error getting prompt config:', error);
      mainWindow.webContents.send('error', error.message);
    }
  });
} 