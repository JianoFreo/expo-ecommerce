# metricBI Setup Guide

Follow the steps below to set up the complete metricBI project.

## Project Structure

Create the following directory structure:

```
metricBI/
├── backend/          # Node.js Express backend
├── admin/            # React Vite admin panel
├── application/      # Expo React Native mobile app
├── README.md         # This file
├── set-up.md         # Setup instructions
└── instructions/     # Detailed setup guides
    ├── step-1.md
    ├── step-2.md
    ├── step-3.md
    └── step-4.md
```

## Creating Directories

From the project root, create the necessary folders:

```bash
# On Windows (PowerShell)
mkdir backend, admin, application

# On macOS/Linux
mkdir -p backend admin application
```

## Setup Steps

1. **[Step 1: Initialize Root Project](instructions/step-1.md)** - Set up folders and initialize package.json from the root file

2. **[Step 2: Set up Backend](instructions/step-2.md)** - Install Express, dotenv, and nodemon

3. **[Step 3: Set up Admin](instructions/step-3.md)** - Initialize React admin panel with Vite

4. **[Step 4: Set up Mobile Application](instructions/step-4.md)** - Initialize Expo mobile application

## Quick Start
After completing all steps, you can start development:

```bash
# Backend (from backend/)
npm run dev

# Admin (from admin/)
npm run dev

# Mobile (from application/)
npm start
```