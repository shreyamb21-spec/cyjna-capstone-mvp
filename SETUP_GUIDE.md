# Setup & Development Guide

## 📋 Table of Contents
1. [Initial Setup](#initial-setup)
2. [Directory Structure Explanation](#directory-structure-explanation)
3. [Component Documentation](#component-documentation)
4. [Screen Documentation](#screen-documentation)
5. [API Integration](#api-integration)
6. [Development Workflow](#development-workflow)
7. [Common Tasks](#common-tasks)

## Initial Setup

### Step 1: Install Dependencies
```bash
npm install
```

This installs:
- `react` & `react-dom`: Core React library
- `react-scripts`: Build tools and dev server
- `tailwindcss`: Utility-first CSS framework
- `postcss`: CSS processing
- `autoprefixer`: Browser prefix support

### Step 2: Add API Key
1. Go to [Google AI Studio](https://ai.google.dev/)
2. Create an API key
3. Open `src/config/apiConfig.js`
4. Replace `GEMINI_API_KEY` value with your key

⚠️ **Important**: Never commit your API key to version control!

### Step 3: Start Development
```bash
npm start
```

The app opens at `http://localhost:3000` with hot-reload enabled.

## Directory Structure Explanation

### `/src/api/` - External API Integration
**Purpose**: Handle all external API calls

**Files**:
- `geminiApi.js` - Google Gemini API integration
  - `callGeminiText()` - Generate text responses
  - `callGeminiTTS()` - Convert text to speech

**Why separate**: Keeps API logic isolated and testable

### `/src/components/` - Reusable UI Components
**Purpose**: Small, reusable UI building blocks used across screens

**Files**:
- `Icon.js` - SVG icon component (24+ icons)
- `TopBar.js` - Top navigation with back button and language switch
- `BottomNav.js` - Bottom navigation to main screens

**Key principle**: Components are stateless and receive props for configuration

### `/src/config/` - Configuration
**Purpose**: Centralized configuration and constants

**Files**:
- `apiConfig.js` - API keys, endpoints, default values

**Why separate**: Easy to update configuration without changing code

### `/src/screens/` - Full-Page Components
**Purpose**: Complete page views that users interact with

**Files**:
- `HomeScreen.js` - Dashboard with progress
- `LessonListScreen.js` - Browse lessons
- `LessonDetailScreen.js` - Lesson content and modules
- `FlashcardScreen.js` - Phrase flashcards
- `PronunciationModuleScreen.js` - Pronunciation practice selection
- `PronunciationScreen.js` - Individual phrase pronunciation
- `ChatScreen.js` - AI conversation practice

**Key principle**: Screens manage their own state and may contain sub-components

### `/src/utils/` - Utility Functions
**Purpose**: Helper functions for common tasks

**Files**:
- `audioHelpers.js` - Audio conversion and playback
  - `base64ToArrayBuffer()` - Decode audio data
  - `pcmToWav()` - Convert PCM to WAV format
  - `playAudioBlob()` - Play audio with cleanup

**Why separate**: Reusable functions can be imported anywhere

### Root Files
- `App.js` - Main app component, routing, and global state
- `index.js` - React entry point with BrowserRouter
- `index.css` - Global Tailwind directives
- `App.css` - App-level styles

## Component Documentation

### Icon Component (`components/Icon.js`)

**Purpose**: Centralized icon library for consistency

**Usage**:
```jsx
import Icon from '../components/Icon';

<Icon 
  name="home" 
  size={24} 
  className="text-blue-600"
/>
```

**Available Icons**: home, book, chat, chart, volume, mic, chevron-left, chevron-right, arrow-left, arrow-right, play, play-circle, card-stack, check-circle, info, bookmark, sparkles, refresh

### TopBar Component (`components/TopBar.js`)

**Purpose**: Top navigation with context-aware back button

**Props**:
- `language` (string): Current language ('EN' or '中文')
- `setLanguage` (function): Callback to change language
- `currentScreen` (string): Current screen name
- `setCurrentScreen` (function): Navigation callback

**Features**:
- Intelligent back navigation based on current screen
- Language switcher
- User profile icon
- Responsive design

### BottomNav Component (`components/BottomNav.js`)

**Purpose**: Fixed bottom navigation to main sections

**Props**:
- `currentScreen` (string): Current screen name
- `setCurrentScreen` (function): Navigation callback

**Nav Items**:
- Home: `home`
- Lessons: `lesson-list` (also activates on lesson-detail, flashcards, etc.)
- Chat: `chat` or `chat-main`
- Progress: `progress`

## Screen Documentation

### HomeScreen (`screens/HomeScreen.js`)

**Purpose**: Main dashboard after login

**Props**:
- `setCurrentScreen` (function): Navigate to other screens
- `completedLessonIds` (array): IDs of completed lessons
- `recentActivity` (array): User activity log

**State Management**: Receives data from parent App component

**Key Elements**:
- Progress bar (completed lessons / total lessons)
- Start lesson button
- Recent activity list

**Navigation Flow**: Home → Lessons → Lesson Detail → Flashcards/Chat

### LessonListScreen (`screens/LessonListScreen.js`)

**Purpose**: Display all lessons for selection

**Props**:
- `learningPlan` (array): All phrases to be split into lessons
- `setCurrentScreen` (function): Navigate callback
- `setCurrentLesson` (function): Set selected lesson

**Logic**:
- Splits 50 phrases into 5 lessons (10 phrases each)
- Creates lesson objects with title and phrase count
- Handles lesson selection and navigation

**Data Structure**:
```javascript
{
  id: 'lesson1',
  title: 'Lesson 1: Getting Started',
  phrases: [ /* 10 phrase objects */ ],
  phraseCount: 10
}
```

### LessonDetailScreen (`screens/LessonDetailScreen.js`)

**Purpose**: Show lesson content and available study modules

**Props**:
- `currentLesson` (object): Selected lesson data
- `setCurrentScreen` (function): Navigate callback
- `completedLessonIds` (array): Track completion
- `setCompletedLessonIds` (function): Mark lesson complete
- `setRecentActivity` (function): Log completion

**Study Modules**:
1. Flashcards - Quick phrase review
2. Pronunciation Practice - Speak each phrase
3. Practice Chat - Conversation scenarios

**Features**:
- Mark as complete button (records in recent activity)
- Module selection cards
- Lesson metadata display

### FlashcardScreen (`screens/FlashcardScreen.js`)

**Purpose**: Study phrases using flashcard format

**Props**:
- `setCurrentScreen` (function): Navigate callback
- `setPronunciationPhrase` (function): Select phrase for pronunciation
- `currentLesson` (object): Lesson data with phrases

**Features**:
- Phrase display with translation and phonetic guide
- Text-to-speech button (calls Gemini TTS)
- Save for offline button
- Previous/Next navigation
- Direct link to pronunciation practice

**State**:
- `currentPhrase` (number): Index of displayed phrase
- `isListening` (boolean): TTS loading state
- `audioError` (string): Error message if TTS fails

### PronunciationModuleScreen (`screens/PronunciationModuleScreen.js`)

**Purpose**: Select individual phrases for pronunciation practice

**Props**:
- `currentLesson` (object): Lesson with phrases
- `setCurrentScreen` (function): Navigate callback
- `setPronunciationPhrase` (function): Select phrase

**Features**:
- List of all lesson phrases
- Click to practice individual phrase
- Shows translation and audio icon

### PronunciationScreen (`screens/PronunciationScreen.js`)

**Purpose**: Practice speaking with AI feedback

**Props**:
- `phraseData` (object): Phrase to practice
- `userPersona` (object): User profile data
- `setCurrentScreen` (function): Navigate callback
- `setRecentActivity` (function): Log practice session

**Features**:
- Record user speech (Web Speech API)
- Send to Gemini for analysis
- Display score (0-100)
- Show improvement tips
- Retry and next buttons

**State**:
- `micState` (string): idle, recording, processing, result
- `score` (number): Pronunciation score
- `transcript` (string): User's spoken text
- `improvementTip` (string): AI-generated feedback

### ChatScreen (`screens/ChatScreen.js`)

**Purpose**: Practice real English in conversation

**Props**:
- `userPersona` (object): User profile
- `currentLesson` (object): Optional lesson context
- `setRecentActivity` (function): Log chat sessions

**Features**:
- AI practice partner
- Dynamic scenario generation
- Message history with timestamps
- Translation display for AI responses
- Record/type input
- Industry-aware conversations

**State**:
- `messages` (array): Chat history
- `inputText` (string): User input
- `recordingState` (string): idle, recording, processing
- `initialScenario` (object): Current conversation scenario

## API Integration

### Google Gemini API Configuration

**File**: `src/config/apiConfig.js`

```javascript
// Your API key (required)
export const GEMINI_API_KEY = "YOUR_KEY_HERE";

// API endpoints (auto-constructed)
export const GEMINI_TEXT_API_URL = `...?key=${GEMINI_API_KEY}`;
export const GEMINI_TTS_API_URL = `...?key=${GEMINI_API_KEY}`;
```

### Using Gemini API

**Text Generation** (chat, scenarios, feedback):
```javascript
import { callGeminiText } from '../api/geminiApi';

const response = await callGeminiText(
  { parts: [{ text: "You are an English teacher..." }] },  // System instruction
  [{ role: 'user', parts: [{ text: "What's your name?" }] }]  // Chat history
);
```

**Text-to-Speech**:
```javascript
import { callGeminiTTS } from '../api/geminiApi';

const { audioData, sampleRate } = await callGeminiTTS("Hello!");
// audioData is base64 encoded PCM audio
```

### Audio Processing

**Convert API audio to playable format**:
```javascript
import { 
  base64ToArrayBuffer, 
  pcmToWav, 
  playAudioBlob 
} from '../utils/audioHelpers';

// Process API response
const arrayBuffer = base64ToArrayBuffer(audioData);
const pcmData = new Int16Array(arrayBuffer);
const wavBlob = pcmToWav(pcmData, sampleRate);

// Play the audio
await playAudioBlob(wavBlob);
```

## Development Workflow

### Adding a New Screen

1. **Create the screen file** in `/src/screens/`
2. **Add comments** describing purpose and props
3. **Import in App.js**:
   ```jsx
   import NewScreen from './screens/NewScreen';
   ```
4. **Add conditional rendering** in App.js:
   ```jsx
   if (currentScreen === 'new-screen') {
     return <NewScreen {...props} />;
   }
   ```
5. **Update navigation** in TopBar or BottomNav

### Adding a New Component

1. **Create file** in `/src/components/`
2. **Add JSDoc comments** for props and purpose
3. **Export as default**:
   ```jsx
   export default ComponentName;
   ```
4. **Use in screens**:
   ```jsx
   import Component from '../components/Component';
   ```

### Adding New API Functions

1. **Add function to** `/src/api/geminiApi.js`
2. **Document with JSDoc**:
   ```javascript
   /**
    * Description
    * @param {type} name - description
    * @returns {Promise<type>} description
    */
   ```
3. **Import and use** in screens:
   ```javascript
   import { newFunction } from '../api/geminiApi';
   ```

## Common Tasks

### Change API Key
1. Open `src/config/apiConfig.js`
2. Replace `GEMINI_API_KEY` value
3. Restart dev server

### Customize Theme
1. Edit `tailwind.config.js` in root
2. Change colors, spacing, fonts
3. Restart dev server (Tailwind rebuilds)

### Add New Icon
1. Open `src/components/Icon.js`
2. Add SVG path to `icons` object
3. Use in components:
   ```jsx
   <Icon name="new-icon" size={24} />
   ```

### Debug API Errors
1. Open browser Developer Tools (F12)
2. Check Console tab for error messages
3. Look for "Gemini API Error" messages
4. Common issues:
   - 401: Invalid/missing API key
   - 429: Rate limited
   - Empty response: Network issue

### Update Dependencies
```bash
npm update
```

### Build for Production
```bash
npm run build
```

Creates optimized `build/` folder ready for deployment.

---

**Next Steps**:
- Review `CODEBASE_STRUCTURE.md` for detailed component info
- Check individual screen files for implementation details
- Test the app: `npm start`
- Add your API key to `src/config/apiConfig.js`

