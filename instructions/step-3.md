# Step 3: Set up the Admin

## Overview
This step initializes the admin panel using Vite and React. You'll also learn what dependencies are needed and when to install them.

## Prerequisites
- Ensure you're in the root `expo-ecommerce/` directory
- Node.js and npm are installed
- Completed [Step 1](step-1.md) and [Step 2](step-2.md)

## Steps

### 1. Navigate to admin folder
```bash
cd admin
```

### 2. Create Vite project
```bash
npm create vite@latest .
```

### 3. Select configuration
When prompted, choose:
- **Framework**: React
- **Variant**: JavaScript
- **Install with npm and start now?**: Yes (or choose No and run `npm install` manually)

## What Gets Installed

Vite will automatically install core admin dependencies:

### Core Dependencies (Installed by Vite)
```json
{
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "vite": "^8.0.0",
    "@vitejs/plugin-react": "^5.1.0",
    "eslint": "^9.39.0"
  }
}
```

## Additional Dependencies for Admin (Optional)

Install these when you need them:

### For Styling
```bash
# Tailwind CSS + Vite plugin
npm install -D tailwindcss postcss autoprefixer
npm install -D @tailwindcss/vite

# Or use a CSS framework
npm install daisyui  # Tailwind component library
```

### For Routing
```bash
# Client-side routing
npm install react-router react-router-dom
```

### For API Calls
```bash
# HTTP client for talking to backend
npm install axios

# Advanced data fetching
npm install @tanstack/react-query
```

### For State Management
```bash
# State management (optional)
npm install zustand
npm install redux @reduxjs/toolkit react-redux
```

### For Authentication
```bash
# Auth provider
npm install @clerk/clerk-react
npm install jsonwebtoken
```

### For UI Components
```bash
# Icon library
npm install lucide-react

# Component library
npm install @shadcn/ui
```

### For Error Tracking
```bash
npm install @sentry/react
```

## Project Structure After Setup
```
admin/
├── package.json
├── package-lock.json
├── vite.config.js
├── index.html
├── .gitignore
├── public/
│   └── vite.svg
└── src/
    ├── App.jsx
    ├── App.css
    ├── main.jsx
    ├── index.css
    └── assets/
        └── react.svg
```

## Available Scripts
Once setup is complete:
```bash
npm run dev      # Start development server (hot reload)
npm run build    # Build for production (creates dist/ folder)
npm run lint     # Run ESLint to check code quality
npm run preview  # Preview production build locally
```

### Understanding the Build Process

**`npm run dev`** - Development Mode
- Starts a local development server
- Hot reload (changes appear instantly)
- Does NOT create dist/ folder
- Only for local development

**`npm run build`** - Production Build
- Bundles and optimizes all code
- Creates `dist/` folder with production-ready files
- Minifies JavaScript and CSS
- Generates `node_modules/` if not present
- Required before deploying to production
- This is what Render uses during deployment

### Build Output

After running `npm run build`, you'll see:
```
admin/
├── dist/                    # Production-ready files (created by build)
│   ├── index.html          # Main HTML file
│   ├── assets/             # Bundled JS, CSS, images
│   └── ...
├── node_modules/           # Dependencies folder
├── src/                     # Source code
├── package.json
└── vite.config.js
```

**Important:** The `dist/` folder is what gets deployed to production servers (like Render).

## Common Admin Setup (Recommended)

If you want a complete setup right away, install:
```bash
# Styling
npm install -D tailwindcss postcss autoprefixer @tailwindcss/vite

# Routing
npm install react-router-dom

# API calls
npm install axios @tanstack/react-query

# UI Components
npm install lucide-react daisyui

# Icons and utilities
npm install classnames
```

## Environment Variables

Create a `.env` file in the admin folder to connect to your backend:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=MetricBI Admin
```

Then access in your code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Connecting to Backend

Example: Fetch data from backend API:
```javascript
import axios from 'axios';

const fetchUsers = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`);
  return response.data;
};
```

## Building for Production

When you're ready to deploy the admin panel:

### 1. Build the project
```bash
npm run build
```

This creates a `dist/` folder with optimized, production-ready files.

### 2. What gets generated
- `dist/` folder - Contains all files ready for deployment
- `node_modules/` - All dependencies installed and ready
- Minified and bundled JavaScript and CSS
- Optimized images and assets

### 3. Deploy the dist folder
Upload the contents of the `dist/` folder to your hosting:
- Render
- Vercel
- Netlify
- AWS S3
- Any web server

### 4. Connecting to backend on production
Make sure your `.env` file has the correct backend URL:
```env
VITE_API_URL=https://your-production-backend.com/api
```

## What's Next?
Proceed to [Step 4: Set up the Mobile Application](step-4.md) to initialize the Expo mobile app.
