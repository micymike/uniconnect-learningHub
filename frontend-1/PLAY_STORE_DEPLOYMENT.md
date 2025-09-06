# Play Store Deployment Guide

## Prerequisites
1. **Android Studio** - Download from https://developer.android.com/studio
2. **Google Play Console Account** - $25 one-time fee at https://play.google.com/console
3. **Java Development Kit (JDK)** - Version 11 or higher

## Step 1: Setup Development Environment
```bash
# Install Android Studio and SDK
# Set ANDROID_HOME environment variable
# Add Android SDK tools to PATH
```

## Step 2: Build and Test
```bash
# Build the app
npm run build:mobile

# Open in Android Studio
npm run android:open

# Or run on device/emulator
npm run android:dev
```

## Step 3: Generate Signed APK/AAB

### Create Keystore
```bash
keytool -genkey -v -keystore uniconnect-release-key.keystore -alias uniconnect -keyalg RSA -keysize 2048 -validity 10000
```

### Configure Signing (in android/app/build.gradle)
```gradle
android {
    signingConfigs {
        release {
            storeFile file('../../uniconnect-release-key.keystore')
            storePassword 'your-store-password'
            keyAlias 'uniconnect'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Build Release
```bash
cd android
./gradlew assembleRelease  # For APK
./gradlew bundleRelease    # For AAB (recommended)
```

## Step 4: Play Store Requirements

### App Icons
- [x] App icon (512x512px)
- [ ] Feature graphic (1024x500px)
- [ ] Screenshots (phone, tablet)

### Store Listing
- **Title**: UniConnect Learning Hub
- **Short Description**: Modern learning platform for students and educators
- **Full Description**: 
```
UniConnect Learning Hub is a comprehensive learning management system designed for modern education. Features include:

• Interactive course management
• Real-time chat and collaboration
• AI-powered study assistance
• Progress tracking and analytics
• Mobile-optimized learning experience
• Offline content access

Perfect for students, educators, and institutions looking for a modern, engaging learning platform.
```

### Privacy Policy
- Required for apps that handle user data
- Host at: https://your-domain.com/privacy-policy

### Content Rating
- Educational content
- No inappropriate content

## Step 5: Upload to Play Store

1. **Create App in Play Console**
   - Choose "Create app"
   - Fill in app details
   - Select content rating

2. **Upload App Bundle**
   - Go to "Release" > "Production"
   - Upload the AAB file from `android/app/build/outputs/bundle/release/`

3. **Complete Store Listing**
   - Add screenshots
   - Write descriptions
   - Set pricing (Free)

4. **Review and Publish**
   - Complete all required sections
   - Submit for review

## Current Status
- [x] Capacitor setup complete
- [x] Android project generated
- [x] Build configuration ready
- [ ] Generate app icons
- [ ] Create keystore for signing
- [ ] Build signed release
- [ ] Create Play Store listing
- [ ] Upload to Play Store

## Next Steps
1. Generate proper app icons using the existing logo
2. Create signing keystore
3. Build signed release version
4. Set up Play Store listing
5. Submit for review

## Useful Commands
```bash
# Development
npm run android:dev

# Open Android Studio
npm run android:open

# Build for production
npm run build:mobile

# Check build
cd android && ./gradlew assembleDebug
```