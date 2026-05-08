# expo-ecommerce Setup Guide

Follow the steps below to set up the complete `expo-ecommerce` project.

## Project Structure

Create the following directory structure:

```text
expo-ecommerce/
├── backend/          # Express + MongoDB API
├── admin/            # React + Vite admin dashboard
├── mobile/           # Expo mobile app
├── instructions/     # Step-by-step setup guides
├── README.md         # Project overview
└── set-up.md         # Quick setup index
```

## Creating Directories

From the project root, create the folders if they do not already exist:

```bash
# Windows (PowerShell)
mkdir backend, admin, mobile, instructions

# macOS/Linux
mkdir -p backend admin mobile instructions
```

## Setup Flow

1. **[Step 1: Initialize Root Project](instructions/step-1.md)** - Create the folders and initialize the root `package.json`
2. **[Step 2: Set up Backend](instructions/step-2.md)** - Install `express`, `dotenv`, `mongoose`, `mongodb`, and `nodemon`
3. **[Step 3: Set up Admin](instructions/step-3.md)** - Initialize the admin app with Vite and React
4. **[Step 4: Set up Mobile Application](instructions/step-4.md)** - Initialize the Expo mobile app
5. **[Step 5: Configure Clerk Auth](instructions/step-5.md)** - Add authentication keys and install Clerk packages
6. **[Step 6: Configure Inngest](instructions/step-6.md)** - Add background-job support and signing keys
7. **[Step 7: Configure Cloudinary](instructions/step-7.md)** - Add media upload credentials and backend Cloudinary config

## When to Install Dependencies

### Backend
Install these inside `backend/` when you are working on the API:

```bash
npm install express dotenv
npm install mongoose mongodb
npm install cloudinary
npm install --save-dev nodemon
```

- `express` and `dotenv` are needed for almost every backend setup.
- `mongoose` and `mongodb` are needed when the backend connects to MongoDB.
- `cloudinary` is needed when uploading product images from the backend.
- `nodemon` is for development only.

### Admin
Install admin dependencies inside `admin/` when building the dashboard:

```bash
npm create vite@latest .
npm run build
```

- Run `npm run build` before deployment so the `dist/` folder is generated.
- Add packages such as `axios`, `react-router-dom`, `@clerk/clerk-react`, and `@tanstack/react-query` as the admin features grow.

### Mobile
Install mobile dependencies inside `mobile/` when building the Expo app:

```bash
npx create-expo-app@latest .
```

- Add packages such as `@clerk/clerk-expo`, `axios`, `@tanstack/react-query`, and navigation libraries when the mobile features need them.

## Quick Start

After completing the setup steps, run each app from its folder:

```bash
# Backend
cd backend
npm run dev

# Admin
cd admin
npm run dev

# Mobile
cd mobile
npm start
```

## Notes

- Keep backend-only secrets in `backend/.env`.
- Keep React admin environment variables in `admin/.env`.
- Keep Expo public environment variables in `mobile/.env`.
- Keep Cloudinary credentials in `backend/.env` only.
- If you deploy the admin app, build it first so the `dist/` folder exists.