# Superwisper 2.0

A voice assistant application with multiple AI conversation modes.

## Features

- **Voice-to-Text**: Record your voice and convert it to text
- **AI Processing**: Process your text with OpenAI's powerful language models
- **Text-to-Speech**: Convert AI responses back to speech
- **Multiple Conversation Modes**:
  - **General Conversation**: Balanced between formality and friendliness
  - **Professional Mode**: More formal and structured responses
  - **Creative Mode**: More creative and exploratory responses

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up your OpenAI API key as an environment variable:
   ```
   export OPENAI_API_KEY=your_api_key_here
   ```
4. Start the application:
   ```
   npm start
   ```

## Development

To run the application in development mode with DevTools:

```
npm run dev
```

## Building

To build the application for distribution:

```
npm run build
```

## Architecture

The application follows a modular architecture:

- **Main Process**: Handles the application lifecycle and integrates with backend services
- **Renderer Process**: Handles UI interactions
- **OpenAI Service**: Handles interactions with OpenAI API
- **Configuration**: Central location for application settings

## User Interface

The user interface provides:

- Buttons to start and stop recording
- Prompt selection buttons to switch between conversation modes
- Status indicators for recording and processing
- Transcript display for conversation history
- Audio player for speech output

## License

ISC 