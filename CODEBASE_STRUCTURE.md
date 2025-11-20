# CYJNA - Language Learning Platform

A modern React-based language learning application designed specifically for delivery and hospitality industry professionals. The app uses Google's Gemini AI for interactive lessons, text-to-speech, and practice scenarios.

## 📁 Project Structure

```
src/
├── api/                    # External API integrations
│   └── geminiApi.js       # Google Gemini API calls (text & TTS)
│
├── components/            # Reusable UI components
│   ├── Icon.js            # SVG icon component (all UI icons)
│   ├── TopBar.js          # Top navigation bar with back button
│   └── BottomNav.js       # Bottom navigation bar
│
├── config/                # Configuration files
│   └── apiConfig.js       # API keys and endpoints
│
├── screens/               # Full-page screen components
│   ├── HomeScreen.js      # Dashboard (progress, recent activity)
│   ├── LessonListScreen.js       # List of all lessons
│   ├── LessonDetailScreen.js      # Lesson content and modules
│   ├── FlashcardScreen.js         # Phrase flashcards
│   ├── PronunciationModuleScreen.js  # Pronunciation practice list
│   ├── PronunciationScreen.js     # Individual pronunciation practice
│   └── ChatScreen.js              # AI-powered practice chat
│
├── utils/                 # Utility functions
│   └── audioHelpers.js    # Audio conversion (PCM to WAV, etc.)
│
├── App.js                 # Main app component (routing & state)
├── App.css                # Global app styles
├── index.js               # React entry point
└── index.css              # Global styles with Tailwind directives
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository** (if applicable)
   ```bash
   git clone <repository-url>
   cd cyjnav2.0
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add your Gemini API key**
   - Get a free API key from [Google AI Studio](https://ai.google.dev/)
   - Open `src/config/apiConfig.js`
   - Replace the empty `GEMINI_API_KEY` with your actual key:
   ```javascript
   export const GEMINI_API_KEY = "YOUR_API_KEY_HERE";
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   - The app will open in your browser at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## 📚 Screens & Features

### 1. **Home Screen** (`HomeScreen.js`)
- **Purpose**: Main dashboard after login
- **Features**:
  - Daily progress tracker showing completed lessons
  - Quick-start button to begin lessons
  - Recent activity log
- **Navigation**: Top menu → Lessons, Chat, Progress

### 2. **Lesson List** (`LessonListScreen.js`)
- **Purpose**: Browse all available lessons
- **Features**:
  - 5 structured lessons (10 phrases each)
  - Phrase count per lesson
  - Navigation to lesson detail
- **Data**: Splits the learning plan into organized lessons

### 3. **Lesson Detail** (`LessonDetailScreen.js`)
- **Purpose**: View lesson content and choose study module
- **Features**:
  - Lesson title and phrase count
  - 3 study modules:
    - **Flashcards**: Quick phrase reviews
    - **Pronunciation Practice**: Practice speaking each phrase
    - **Practice Chat**: Real-time conversation scenarios
  - Mark lesson as complete button
- **Data Flow**: Selected lesson from LessonListScreen

### 4. **Flashcard Screen** (`FlashcardScreen.js`)
- **Purpose**: Review phrases using flashcard format
- **Features**:
  - Swipeable phrase cards
  - Text-to-speech playback
  - Phrase category and context
  - Save phrases for offline study
  - Previous/Next navigation
  - Direct link to pronunciation practice
- **Audio**: Uses Gemini TTS API for phrase pronunciation

### 5. **Pronunciation Module** (`PronunciationModuleScreen.js`)
- **Purpose**: Select phrases to practice pronunciation
- **Features**:
  - List view of all lesson phrases
  - Click to open individual pronunciation practice
  - Shows phrase, translation, and audio icon
- **Navigation**: Links to individual pronunciation screen

### 6. **Pronunciation Screen** (`PronunciationScreen.js`)
- **Purpose**: Practice speaking individual phrases
- **Features**:
  - Speech recognition (using Web Speech API)
  - AI-powered feedback on pronunciation
  - Score display (0-100)
  - Improvement tips from Gemini
  - Retry button for re-recording
- **AI Integration**: Uses Gemini to analyze user speech

### 7. **Chat Screen** (`ChatScreen.js`)
- **Purpose**: Practice real English in conversation scenarios
- **Features**:
  - AI practice partner (plays customer role)
  - Dynamic scenario generation
  - Message history with timestamps
  - Translation display for AI responses
  - Text or voice input
  - Recording timer and playback
  - Lesson-specific chat (uses lesson phrases naturally)
- **AI Integration**: 
  - Scenario generation
  - Real-time chat responses
  - Translation to user's native language
  - Industry-aware personalization

## 🔧 Components Reference

### Icon Component
Displays all SVG icons used throughout the app.

```jsx
import Icon from '../components/Icon';

// Usage
<Icon name="home" size={24} className="text-blue-600" />
<Icon name="mic" size={28} />
```

**Available Icons**: `home`, `book`, `chat`, `chart`, `volume`, `mic`, `chevron-left`, `chevron-right`, `arrow-left`, `arrow-right`, `play`, `play-circle`, `card-stack`, `check-circle`, `info`, `bookmark`, `sparkles`, `refresh`

### TopBar Component
Navigation bar at the top with back button, title, and language switcher.

```jsx
<TopBar 
  language={language}
  setLanguage={setLanguage}
  currentScreen={currentScreen}
  setCurrentScreen={setCurrentScreen}
/>
```

### BottomNav Component
Fixed navigation bar at the bottom linking to main screens.

```jsx
<BottomNav 
  currentScreen={currentScreen}
  setCurrentScreen={setCurrentScreen}
/>
```

## 🤖 API Integration

### Gemini API (`api/geminiApi.js`)

#### `callGeminiText(systemInstruction, contents, generationConfig)`
Generates text responses for chat, scenarios, and analysis.

```javascript
import { callGeminiText } from '../api/geminiApi';

const response = await callGeminiText(
  { parts: [{ text: "You are an English teacher..." }] },
  [{ role: 'user', parts: [{ text: "Hello!" }] }]
);
```

#### `callGeminiTTS(text)`
Converts text to speech using Gemini's TTS model.

```javascript
import { callGeminiTTS } from '../api/geminiApi';

const { audioData, sampleRate } = await callGeminiTTS("Hello, how are you?");
```

### API Configuration (`config/apiConfig.js`)
- **GEMINI_API_KEY**: Your Gemini API key (required)
- **GEMINI_TEXT_API_URL**: Endpoint for text generation
- **GEMINI_TTS_API_URL**: Endpoint for text-to-speech
- **Default values**: Language, industry, city for personalization

## 🎨 Styling

The app uses **Tailwind CSS** for all styling with a mobile-first approach.

### Key Tailwind Classes Used
- **Layout**: `flex`, `grid`, `fixed`, `absolute`
- **Spacing**: `p-*`, `m-*`, `gap-*`, `px-*`, `py-*`
- **Colors**: `text-blue-600`, `bg-white`, `border-gray-200`
- **Responsive**: `md:` prefix for tablet/desktop breakpoints
- **Animations**: `animate-spin`, `animate-pulse`, `transition-*`

### Customization
Edit `tailwind.config.js` to customize colors, spacing, or add new utilities.

## 🔄 State Management

The app uses **React Hooks** for state management:

- **useState**: For component-level state (current screen, messages, etc.)
- **useEffect**: For side effects (API calls, listeners, etc.)
- **localStorage**: For persisting user data across sessions

### Key State Variables
- `currentScreen`: Currently displayed screen
- `user`: Logged-in user info
- `learningPlan`: Array of lessons/phrases
- `completedLessonIds`: IDs of completed lessons
- `messages`: Chat message history
- `recentActivity`: User activity log

## 📱 Responsive Design

The app is fully responsive:
- **Mobile** (< 768px): Single column, optimized touch targets
- **Tablet** (768px - 1024px): Wider layouts, better spacing
- **Desktop** (> 1024px): Full-width, centered max-width container

Use the `md:` prefix in Tailwind classes for tablet+ breakpoints:
```jsx
<div className="text-sm md:text-lg p-4 md:p-6">
```

## 🐛 Troubleshooting

### "Authentication failed (Error 401)"
- **Cause**: Missing or invalid Gemini API key
- **Solution**: Check `src/config/apiConfig.js` and add your valid API key

### Audio playback fails
- **Cause**: Browser permissions or API key issue
- **Solution**: Check browser microphone/audio permissions and API key

### Blank screen after login
- **Cause**: No lessons generated or network error
- **Solution**: Check browser console for errors, verify API key

### Lessons not appearing
- **Cause**: Learning plan not generated during onboarding
- **Solution**: Complete the onboarding process to generate lessons

## 🚀 Future Enhancements

- [ ] User authentication (Firebase/Auth0)
- [ ] Lesson analytics and insights
- [ ] Offline mode with service workers
- [ ] More industry-specific content
- [ ] Leaderboards and gamification
- [ ] Advanced speech recognition
- [ ] Custom lesson creation
- [ ] Community features

## 📄 License

This project is part of CYJNA Capstone MVP. See LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please:
1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review console errors in browser dev tools
- Check the component comments for usage examples

---

**Happy Learning! 🎓**
