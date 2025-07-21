# UniConnect Learning Hub - Frontend Fix

## Issue Fixed
The application was experiencing an "Invalid hook call" error due to:
1. Incompatible React and Material UI versions
2. Possible duplicate React installations

## How to Fix
1. Run the `clean-install.bat` script to:
   - Remove node_modules directory
   - Delete package-lock.json
   - Install clean dependencies
   - Start the application

## What Changed
1. Removed Material UI dependencies to simplify the application
2. Updated React and React Router DOM to compatible versions
3. Fixed the App component structure

## Next Steps
Once the application is running correctly, you can:
1. Add Material UI back if needed (use compatible versions)
2. Continue building your application features

## Troubleshooting
If you still experience issues:
1. Make sure you have Node.js v16+ installed
2. Try running `npm cache clean --force` before reinstalling
3. Check for any global React installations that might conflict