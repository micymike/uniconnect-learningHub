# Making UniConnect Downloadable as Mobile and Desktop Apps

## Current Status
- The frontend is a React app built with Vite.
- PWA features are enabled (manifest.json, sw.js for notifications).
- Users can install the app via browser as a PWA.

## Next Steps

### Mobile App (Android/iOS)
1. **Capacitor Setup**
   - Install Capacitor in the frontend project.
   - Initialize Capacitor and configure it to use the React build output.
   - Add Android and iOS platforms.
   - Build the React app and copy assets to Capacitor.
   - Test on device/emulator.
   - Prepare for app store submission (icons, splash screens, permissions).

2. **Enhance PWA Features (Optional)**
   - Ensure offline support and caching.
   - Add "Add to Home Screen" prompts.

### Desktop App (Windows/Mac/Linux)
1. **Electron Setup**
   - Add Electron as a dependency in the frontend project.
   - Create main Electron process to load the React build.
   - Configure packaging scripts (e.g., electron-builder).
   - Build and test desktop app.
   - Prepare installers for distribution.

## Todo List

- [x] Analyze current frontend build and PWA status
- [x] Check service worker for offline/PWA support
- [x] Plan mobile app packaging (PWA/Capacitor)
- [ ] Plan desktop app packaging (Electron)
- [x] Implement mobile app packaging (Capacitor)
- [x] Configure Android project for Play Store
- [x] Add mobile-specific optimizations
- [ ] Generate app icons and assets
- [ ] Create signed release build
- [ ] Submit to Play Store
- [ ] Implement desktop app packaging (Electron)
- [ ] Test mobile and desktop builds
- [x] Document download/install process

## References
- [Capacitor Docs](https://capacitorjs.com/docs/getting-started)
- [Electron Docs](https://www.electronjs.org/docs/latest/tutorial/quick-start)
