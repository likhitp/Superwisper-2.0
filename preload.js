/**
 * Preload Script
 * Sets up the communication between the renderer process and the main process
 */
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electronAPI', {
    // Send events to main process
    startRecording: () => ipcRenderer.send('start-recording'),
    stopRecording: () => ipcRenderer.send('stop-recording'),
    setPromptType: (promptType) => ipcRenderer.send('set-prompt-type', promptType),
    getPromptConfig: () => ipcRenderer.send('get-prompt-config'),
    
    // Receive events from main process
    onTranscription: (callback) => ipcRenderer.on('transcription', (_, text) => callback(text)),
    onAIResponse: (callback) => ipcRenderer.on('ai-response', (_, text) => callback(text)),
    onAudioResponse: (callback) => ipcRenderer.on('audio-response', (_, audioUrl) => callback(audioUrl)),
    onPromptConfigUpdate: (callback) => ipcRenderer.on('prompt-config-update', (_, config) => callback(config)),
    onError: (callback) => ipcRenderer.on('error', (_, error) => callback(error))
  }
);

// This file is intentionally empty for now, but we'll keep it
// for potential future use to expose API functions to the renderer 