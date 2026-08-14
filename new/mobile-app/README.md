# Posture Analyzer - Mobile App

AI-powered posture detection and exercise recommendation mobile application built with React Native and Expo.

## Features

### Current Features (From Web App)
✅ 5 Health Conditions: Back Pain, Knee Pain, Joint Pain, Obesity, Diabetes  
✅ 15 BMI-based personalized exercises  
✅ Multilingual Support (English + Kannada)  
✅ Voice guidance for exercises  
✅ BMI calculation and tracking  
✅ Dashboard with analytics  

### New Mobile Features
🆕 Real-time sitting posture detection using phone camera  
🆕 Video upload and AI-powered movement analysis  
🆕 Posture quality scoring (0-100)  
🆕 Real-time alerts (vibration + sound) for poor posture  
🆕 Movement pattern recognition  
🆕 Corrective exercise recommendations  
🆕 Posture history tracking  
🆕 Mobile-optimized UI/UX  

## Tech Stack

**Frontend:**
- React Native 0.73+
- Expo SDK 50
- React Navigation 6
- Zustand (State Management)
- React Native Paper (UI Components)

**Backend:**
- Node.js + Express
- MongoDB Atlas
- MediaPipe Pose Detection
- FFmpeg (Video Processing)

## Setup Instructions

### Prerequisites
1. **Node.js** (v18 or higher) - Already installed ✓
2. **npm** or **yarn** - Already available ✓
3. **Expo Go** app on your phone (iOS/Android)
   - Download from App Store or Play Store

### Installation

1. **Navigate to mobile app directory:**
```bash
cd mobile-app
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the development server:**
```bash
npm start
```

4. **Run on your device:**
   - **Option A**: Scan QR code with Expo Go app
   - **Option B**: Press `a` for Android emulator
   - **Option C**: Press `i` for iOS simulator

### Backend Setup

The mobile app connects to your existing backend server.

1. **Start your backend server:**
```bash
cd ..
npm start
```

2. **Update API URL in mobile app:**
   - Open `mobile-app/src/services/api.js` (will be created)
   - Replace `YOUR_SERVER_IP` with your computer's local IP address
   - Example: `http://192.168.1.100:3000/api`

## Project Structure

```
mobile-app/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js          # Main dashboard
│   │   ├── ProfileScreen.js       # User health profile
│   │   ├── ExerciseScreen.js      # Exercise recommendations
│   │   ├── PostureScreen.js       # Real-time posture detection
│   │   ├── VideoUploadScreen.js   # Video upload
│   │   ├── AnalysisScreen.js      # Video analysis results
│   │   └── SettingsScreen.js      # App settings
│   ├── components/
│   │   ├── CameraView.js          # Camera component
│   │   ├── VideoPlayer.js         # Video playback
│   │   ├── PostureMeter.js        # Posture score display
│   │   └── ExerciseCard.js        # Exercise card UI
│   ├── services/
│   │   ├── api.js                 # API integration
│   │   ├── postureDetection.js    # AI posture logic
│   │   └── videoAnalysis.js       # Video processing
│   ├── store/
│   │   └── userStore.js           # User state management ✓
│   ├── data/
│   │   └── exercises.js           # Exercise database ✓
│   └── utils/
│       ├── bmiCalculator.js       # BMI utilities
│       └── postureScorer.js       # Scoring algorithms
├── App.js                         # Main app entry
├── app.json                       # Expo config ✓
└── package.json                   # Dependencies ✓
```

## Features Implementation Status

### ✅ Completed
- [x] Project structure setup
- [x] Package configuration
- [x] User state management (Zustand)
- [x] Exercise knowledge base (15 exercises)
- [x] BMI calculation logic
- [x] Health conditions data

### 🚧 In Progress
- [ ] API service integration
- [ ] Home screen UI
- [ ] Profile screen
- [ ] Exercise recommendation screen
- [ ] Navigation setup

### 📋 Planned
- [ ] Real-time posture detection
- [ ] Video upload feature
- [ ] Posture alert system
- [ ] Settings screen
- [ ] Testing & optimization

## How to Use

### For Users

1. **Setup Profile:**
   - Enter name, age, gender
   - Input weight and height
   - Select health condition

2. **Get Exercise Recommendations:**
   - App calculates BMI automatically
   - Shows personalized exercises
   - Follow step-by-step instructions

3. **Monitor Posture:**
   - Place phone on desk
   - Camera detects sitting posture
   - Get real-time alerts for poor posture

4. **Upload Videos:**
   - Record yourself doing exercises
   - Upload for AI analysis
   - Receive detailed feedback

### For Developers

**Adding new exercises:**
1. Open `src/data/exercises.js`
2. Add exercise to appropriate health condition
3. Include name, image, angles, benefits, instructions
4. App will automatically display it

**Customizing alerts:**
1. Open `src/services/postureDetection.js`
2. Adjust `alertThreshold` (default: 30 seconds)
3. Modify `sensitivity` levels

## API Endpoints (Backend)

### Existing Endpoints (Already Working)
```
POST   /api/users          - Create user
POST   /api/sessions       - Save exercise session
POST   /api/bmi            - Save BMI record
GET    /api/progress       - Get user progress
```

### New Endpoints (To Be Added)
```
POST   /api/video/upload        - Upload video
GET    /api/video/analyze/:id   - Get analysis results
POST   /api/posture/check       - Real-time posture check
GET    /api/posture/history     - Posture history
```

## Troubleshooting

### App won't start
```bash
# Clear cache and restart
npm start -- --clear
```

### Camera not working
- Ensure camera permissions are granted
- Check `app.json` permissions configuration

### Can't connect to backend
- Verify server is running on port 3000
- Check IP address in API configuration
- Ensure phone and computer are on same WiFi

### Build errors
```bash
# Remove node_modules and reinstall
rm -rf node_modules
npm install
```

## Next Steps

1. **Install dependencies:**
```bash
cd mobile-app
npm install
```

2. **Complete screen implementations:**
   - Home Screen
   - Profile Screen
   - Exercise Screen
   - Posture Detection Screen

3. **Upgrade backend with new endpoints:**
   - Video upload
   - Posture analysis
   - Real-time detection

4. **Test on physical device**

5. **Build APK for Android**

## Support

For issues or questions:
- Check the troubleshooting section
- Review Expo documentation: https://docs.expo.dev
- Check React Native docs: https://reactnative.dev

## License

MIT License - Feel free to use for personal and educational purposes.

---

**Current Version:** 1.0.0 (Development)  
**Last Updated:** 2026-04-27
