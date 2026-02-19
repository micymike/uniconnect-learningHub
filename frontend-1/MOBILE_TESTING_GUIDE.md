# Mobile Testing Guide

## Prerequisites
1. **Install Java JDK 11+**
   - Download from: https://adoptium.net/
   - Add to PATH and set JAVA_HOME

2. **Install Android Studio** (Optional but recommended)
   - Download from: https://developer.android.com/studio
   - Includes Android SDK and emulator

## Method 1: USB Debugging (Fastest)

### Setup Phone
1. Enable Developer Options:
   - Settings > About Phone > Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings > Developer Options > USB Debugging

### Test App
```bash
cd frontend-1
npm run android:dev
```

## Method 2: APK Installation

### Build APK
```bash
cd frontend-1/android
./gradlew assembleDebug
```

### Install APK
1. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`
2. Transfer to phone via USB/email/cloud
3. Enable "Install from Unknown Sources" in phone settings
4. Install the APK

## Method 3: Android Emulator

### Setup Emulator
1. Install Android Studio
2. Open AVD Manager
3. Create virtual device
4. Start emulator

### Run App
```bash
npm run android:dev
```

## Quick Start (No Java/Android Studio)
If you just want to test quickly:

1. **Use PWA version**: Open your deployed web app in mobile browser
2. **Add to Home Screen**: Browser menu > "Add to Home Screen"
3. **Test mobile features**: Works like a native app

## Current Status
- Capacitor setup: ✅ Complete
- Ready for testing: ✅ Yes
- Needs: Java JDK for APK building