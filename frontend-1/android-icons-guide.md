# Android App Icons Setup

## Required Icons for Play Store

You need to create the following icon files and place them in the specified directories:

### App Icons (Place in `android/app/src/main/res/`)
- `mipmap-mdpi/ic_launcher.png` (48x48px)
- `mipmap-hdpi/ic_launcher.png` (72x72px)
- `mipmap-xhdpi/ic_launcher.png` (96x96px)
- `mipmap-xxhdpi/ic_launcher.png` (144x144px)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192px)

### Adaptive Icons (Place in `android/app/src/main/res/`)
- `mipmap-mdpi/ic_launcher_foreground.png` (108x108px)
- `mipmap-hdpi/ic_launcher_foreground.png` (162x162px)
- `mipmap-xhdpi/ic_launcher_foreground.png` (216x216px)
- `mipmap-xxhdpi/ic_launcher_foreground.png` (324x324px)
- `mipmap-xxxhdpi/ic_launcher_foreground.png` (432x432px)

### Play Store Icon
- `play-store-icon.png` (512x512px) - For Play Store listing

## Quick Setup
1. Use your existing `public/logo512.png` as base
2. Use online tools like https://icon.kitchen/ to generate all sizes
3. Copy generated icons to the respective Android directories

## Current Status
- Base logo exists in `public/logo512.png`
- Need to generate and copy Android-specific icons