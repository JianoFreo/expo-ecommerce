# Step 4: Set up the Mobile Application

## Overview
This step initializes the mobile application using Expo and React Native.

## Prerequisites
- Ensure you're in the root `expo-ecommerce/` directory
- Node.js and npm are installed
- Expo Go app installed on your mobile device (available on [iOS App Store](https://apps.apple.com/us/app/expo-go/id1054059026) and [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent))
- Completed [Step 1](step-1.md), [Step 2](step-2.md), and [Step 3](step-3.md)

## Steps

### 1. Navigate to mobile folder
```bash
cd mobile
```

### 2. Create Expo project
```bash
npx create-expo-app@latest .
```

## What Gets Installed

Expo will automatically install core mobile dependencies:

### Core Dependencies (Installed by Expo)
```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "react": "18.2.0",
    "react-native": "0.74.0"
  },
  "devDependencies": {
    "@types/react": "~18.2.45",
    "typescript": "~5.3.3"
  }
}
```

## Project Structure After Setup
```
mobile/
├── package.json
├── package-lock.json
├── app.json
├── tsconfig.json
├── .gitignore
├── .expo/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── modal.tsx
├── assets/
│   └── images/
└── constants/
    └── theme.ts
```

## Additional Dependencies for Mobile (Optional)

Install these when you need them:

### For Navigation
```bash
# Bottom tab and stack navigation
npm install @react-navigation/bottom-tabs
npm install @react-navigation/native
npm install @react-navigation/stack
npm install react-native-gesture-handler
npm install react-native-reanimated
npm install react-native-screens
```

### For API Calls
```bash
# HTTP client for talking to backend
npm install axios

# Advanced data fetching
npm install @tanstack/react-query
```

### For Styling
```bash
# NativeWind - Tailwind for React Native
npm install nativewind

# Or use StyleSheet from React Native (built-in)
```

### For State Management
```bash
# State management
npm install zustand
npm install redux @reduxjs/toolkit react-redux
```

### For Storage
```bash
# Local device storage
npm install @react-native-async-storage/async-storage

# Secure storage (passwords, tokens)
npm install react-native-keychain
```

### For Authentication
```bash
# Authentication provider
npm install @clerk/clerk-expo
npm install jwt-decode
```

### For Notifications
```bash
# Push notifications
npm install expo-notifications
npm install expo-device
```

### For UI Components
```bash
# Icon library
npm install @expo/vector-icons

# UI Kit for React Native
npm install react-native-paper
npm install react-native-elements
```

### For Location
```bash
# GPS and location services
npm install expo-location
```

### For Camera
```bash
# Camera access
npm install expo-camera
npm install expo-image-picker
```

## Common Mobile Setup (Recommended)

If you want a complete setup right away, install:
```bash
# Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs react-native-gesture-handler react-native-reanimated react-native-screens

# API calls
npm install axios @tanstack/react-query

# State management
npm install zustand

# Local storage
npm install @react-native-async-storage/async-storage

# UI components
npm install react-native-paper
npm install @expo/vector-icons
```

## Available Scripts
Once setup is complete:
```bash
npm start        # Start Expo development server
npm run ios      # Run on iOS simulator (macOS only)
npm run android  # Run on Android emulator
npm run web      # Run in web browser
npm run test     # Run tests
```

## Running on Physical Device

### Method 1: Using Expo Go (Easiest)
1. Install [Expo Go](https://expo.dev/client) on your mobile device
2. Run: `npm start`
3. Scan the QR code with your phone camera (iOS) or Expo Go app (Android)
4. App loads automatically on your device

### Method 2: Using Custom Development Client
```bash
npm install expo-dev-client
npx eas build --platform ios --profile preview
npx eas build --platform android --profile preview
```

## Environment Variables

Create an `.env` file in the mobile folder:

```env
EXPO_PUBLIC_API_URL=http://your-backend-ip:3000/api
EXPO_PUBLIC_APP_NAME=MetricBI Mobile
```

Then access in your code:
```javascript
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

## Connecting to Backend

Example: Fetch data from backend API:
```javascript
import axios from 'axios';

const fetchUsers = async () => {
  const response = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/users`);
  return response.data;
};
```

## Troubleshooting

### Issue: "Cannot connect to backend from mobile device"
**Solution:** Use your computer's local IP address instead of `localhost`
```bash
# Find your local IP
ipconfig getifaddr en0  # macOS
ipconfig              # Windows
```

### Issue: "Expo Go crashes when opening app"
**Solution:** Clear cache and reinstall
```bash
npm start -- --clear
```

## What's Next?
Your project structure is now complete! You can now:
- Develop the backend in `backend/`
- Build the admin panel in `admin/`
- Create the mobile app in `mobile/`

Start with the backend development and connect it to the admin and mobile apps.
