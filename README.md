# Voice Assistant - Phase 1

A proof-of-concept voice-based chatbot for Windows, built using Electron, Deepgram, and OpenAI.

## Features

- Simple UI with Start/Stop recording buttons
- Voice recording from your microphone
- Speech-to-text conversion using Deepgram
- AI response generation using OpenAI
- Text-to-speech conversion using Deepgram
- Audio playback of AI responses

## Prerequisites

Before running this application, you need to:

1. Sign up for a [Deepgram account](https://console.deepgram.com/signup) and get an API key
2. Sign up for an [OpenAI account](https://platform.openai.com) and get an API key
3. Have [Node.js](https://nodejs.org/) installed (version 14 or higher)

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your API keys:
   ```
   DEEPGRAM_API_KEY=your_deepgram_api_key
   OPENAI_API_KEY=your_openai_api_key
   ```

## Running the Application

To start the application, run:

```
npm start
```

## How to Use

1. Click the "Start Recording" button to begin recording your voice
2. Speak your question or command
3. Click the "Stop Recording" button when you're finished speaking
4. Wait for the application to process your speech and generate a response
5. Listen to the AI's spoken response

## Technology Stack

- **Electron**: JavaScript-based desktop framework
- **Deepgram**: Speech-to-text and text-to-speech processing
- **OpenAI**: AI response generation
- **Web Audio API**: Browser-based audio recording

## Project Structure

- `main.js`: Electron main process
- `index.html`: UI layout
- `renderer.js`: Audio recording and processing logic
- `preload.js`: Preload script for potential IPC communication

## Limitations

This is a proof-of-concept application with the following limitations:

- No persistent conversation history
- Basic error handling
- Limited UI features
- Not optimized for performance

## Future Enhancements (for Phase 2)

- Add conversation history
- Improve UI with transcription display
- Add settings for voice selection
- Implement better error handling
- Optimize performance 