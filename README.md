# LIFE TIMER - Local Setup Guide

This project was generated in AI Studio and is ready to be built for iOS using Capacitor.

## Prerequisites

- **Node.js**: Version 18 or higher.
- **npm**: Usually comes with Node.js.
- **Xcode**: Required for iOS builds (Mac only).

## Getting Started

1. **Download the code**: Ensure all files from the AI Studio project are in a single folder (e.g., `life-timer-app`).
2. **Open Terminal**: Open your terminal application.
3. **Navigate to the project folder**:
   ```bash
   # Replace 'path/to/your/folder' with the actual path where you saved the files
   cd path/to/your/folder
   ```
   *Note: If you are seeing the 'ENOENT: no such file or directory' error, it means you are not inside the folder containing `package.json`.*

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Build the web project**:
   ```bash
   npm run build
   ```

6. **Add iOS platform**:
   ```bash
   npx cap add ios
   ```

7. **Sync and Open in Xcode**:
   ```bash
   npm run sync
   npm run open:ios
   ```

## Troubleshooting

### "Could not read package.json" Error
This happens when you run `npm` commands in a folder that doesn't have the `package.json` file.
**Solution**: Use `ls` to see the files in your current directory. If you don't see `package.json`, use `cd` to move into the correct directory.

### "vite: command not found"
This happens if you haven't run `npm install` yet.
**Solution**: Run `npm install` first.
