# 01 - Initialize Project

## Overview

This guide sets up the root project structure and initializes configuration files for the multi-app workspace.

## Prerequisites

- Node.js v18+ installed
- npm or yarn available
- Git repository initialized

## Steps

### 1. Create Project Directory Structure

From the root of your project, create the following directories:

```bash
# Windows (PowerShell)
mkdir backend, admin, mobile, tools

# macOS/Linux
mkdir -p backend admin mobile tools
```

### 2. Initialize Root package.json

Create a `package.json` at the root level (not inside any subfolder):

```bash
npm init -y
```

Modify the root `package.json` to define the workspace:

```json
{
  "name": "expo-ecommerce",
  "version": "1.0.0",
  "description": "Full-stack e-commerce platform with Expo, React, and Node.js",
  "private": true,
  "workspaces": [
    "backend",
    "admin",
    "mobile"
  ],
  "scripts": {
    "backend": "cd backend && npm start",
    "admin": "cd admin && npm run dev",
    "mobile": "cd mobile && npm start",
    "install-all": "npm install && cd backend && npm install && cd ../admin && npm install && cd ../mobile && npm install"
  },
  "keywords": [
    "ecommerce",
    "expo",
    "react",
    "express",
    "mongodb"
  ]
}
```

### 3. Create Root .gitignore

Create `.gitignore` in the root:

```
# Dependencies
node_modules/
/.pnp
.pnp.js

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Build outputs
dist/
build/
.expo/
*.tsbuildinfo

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Temporary
*.tmp
.cache/
```

### 4. Create Root .env.example

Create `.env.example` in the root as reference:

```
# Backend
MONGODB_URI=mongodb://localhost:27017/ecommerce
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
INNGEST_SIGNING_KEY=your_inngest_signing_key
INNGEST_EVENT_KEY=your_inngest_event_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Admin
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Mobile
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 5. Initialize Backend

```bash
cd backend
npm init -y
```

### 6. Initialize Admin

```bash
cd ../admin
npm init -y
```

### 7. Initialize Mobile

```bash
cd ../mobile
npm init -y
```

### 8. Commit Structure

```bash
cd ..
git add -A
git commit -m "Initial project structure"
```

## Next Steps

- [02-Backend-Setup.md](./02-backend-setup.md) - Set up the Express backend
- [03-Admin-Dashboard-Setup.md](./03-admin-dashboard-setup.md) - Initialize the admin dashboard
- [04-Mobile-App-Setup.md](./04-mobile-app-setup.md) - Set up the mobile app
