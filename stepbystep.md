# expo-ecommerce From Scratch Guide

Use this guide if you want to recreate the project from a clean folder and set it up in the same order as this codebase.

## What You Need Installed

Install these tools before you start:

- Node.js 20 or newer
- npm
- Git
- VS Code
- MongoDB Atlas account for the database
- Clerk account for authentication
- Inngest account for webhook and background-job syncing
- Cloudinary account for media uploads
- Expo Go on your phone if you want to test the mobile app

Helpful VS Code extensions:

- ESLint
- Prettier
- ES7+ React/Redux/React-Native snippets
- React Native Tools

## Dependency Map

Install each dependency in the folder that owns the code it supports.

### Root folder `expo-ecommerce/`

Use the root for shared scripts only. If you want shared tooling, install it here:

```bash
npm install -D prettier eslint
```

### Backend folder `backend/`

Install these in `backend/`:

- `express` for the API server
- `dotenv` for environment variables
- `mongoose` for MongoDB models and queries
- `@clerk/express` for Clerk auth middleware
- `inngest` for Clerk webhook syncing and background jobs
- `cloudinary` for file and image uploads
- `nodemon` as a dev dependency for local server restarts

Example:

```bash
cd backend
npm install express dotenv mongoose @clerk/express inngest cloudinary
npm install --save-dev nodemon
```

### Admin folder `admin/`

Install these in `admin/`:

- `@clerk/clerk-react` for the admin auth UI
- `react` and `react-dom` are created by Vite
- `vite` and the Vite React plugin are created by Vite

Example:

```bash
cd admin
npm install @clerk/clerk-react
```

### Mobile folder `mobile/`

The mobile app is created with Expo, which installs the core Expo stack for you.

If you later add mobile auth, install:

- `@clerk/clerk-expo`

Example:

```bash
cd mobile
npm install @clerk/clerk-expo
```

### External accounts and services

These are not npm packages, but you still need them configured:

- MongoDB Atlas for the backend database
- Clerk for authentication
- Inngest for webhook delivery and sync functions
- Cloudinary for media storage
- Expo Go for mobile testing

## Project Order

Build the project in this sequence:

1. Root project and shared scripts
2. Backend API
3. Admin dashboard
4. Mobile app
5. Clerk authentication
6. Inngest webhook sync
7. Cloudinary uploads

That order matches the dependencies already used in the codebase and avoids wiring frontend code before the backend is ready.

## 1. Create the Workspace

Create a folder named `expo-ecommerce` and open it in VS Code.

Inside it, create these folders:

- `backend`
- `admin`
- `mobile`
- `instructions`

## 2. Initialize the Root Project

From the project root, run:

```bash
npm init -y
```

Then set up the root scripts used by this repo:

- `npm run dev` should start the backend
- `npm run start` should start the backend in production mode
- `npm run build` should install backend and admin dependencies and build the admin app

The root `package.json` in this repo currently uses:

- `dev`: `npm run dev --prefix backend`
- `start`: `npm run start --prefix backend`
- `build`: installs backend and admin dependencies, then builds the admin app

## 3. Set Up the Backend First

Go into the backend folder and initialize it:

```bash
cd backend
npm init -y
```

Install the backend dependencies that this codebase uses:

```bash
npm install express dotenv mongoose @clerk/express cloudinary inngest
npm install --save-dev nodemon
```

What each dependency is for:

- `express`: API server
- `dotenv`: loads `.env`
- `mongoose`: MongoDB connection and models
- `@clerk/express`: Clerk auth middleware for backend routes
- `cloudinary`: image upload and media storage
- `inngest`: webhook-driven sync and background jobs
- `nodemon`: restarts the backend during development

Then create the backend files in this order:

1. `backend/src/config/env.js`
2. `backend/src/config/db.js`
3. `backend/src/models/user.model.js`
4. `backend/src/config/inggest.js`
5. `backend/src/server.js`
6. `backend/src/config/cloudinary.js`

How the backend is wired in this repo:

- `env.js` loads environment variables such as `DB_URL`, `CLERK_SECRET_KEY`, `INNGEST_SIGNING_KEY`, and Cloudinary keys
- `db.js` connects to MongoDB
- `user.model.js` stores Clerk-linked users, addresses, and wishlist data
- `inggest.js` defines the Clerk user sync functions for `clerk/user.created` and `clerk/user.deleted`
- `server.js` mounts Express middleware, Clerk middleware, and the Inngest endpoint
- `cloudinary.js` configures media uploads

Create a `backend/.env` file with values like:

```env
NODE_ENV=development
PORT=5000
DB_URL=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## 4. Set Up the Admin Dashboard

Go into the admin folder and create the Vite app:

```bash
cd ../admin
npm create vite@latest .
```

Choose:

- React
- JavaScript

Install the admin dependencies used in this repo:

```bash
npm install @clerk/clerk-react
```

The admin app currently uses these files:

- `admin/src/main.jsx`
- `admin/src/App.jsx`

Setup order for the admin app:

1. Add `ClerkProvider` to `main.jsx`
2. Read `VITE_CLERK_PUBLISHABLE_KEY` from the environment
3. Keep the dashboard UI in `App.jsx`
4. Use Clerk components such as `SignedIn`, `SignedOut`, `SignInButton`, and `UserButton`

Create `admin/.env` with:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## 5. Set Up the Mobile App

Go into the mobile folder and create the Expo app:

```bash
cd ../mobile
npx create-expo-app@latest .
```

The mobile project in this repo uses Expo Router and React Navigation. Its main files are:

- `mobile/app/_layout.tsx`
- `mobile/app/(tabs)/_layout.tsx`
- `mobile/app/(tabs)/index.tsx`
- `mobile/app/(tabs)/explore.tsx`

The mobile app is usually set up after the backend and admin because it depends on the same API and auth decisions.

If you want mobile authentication later, add the Clerk publishable key to `mobile/.env` and install `@clerk/clerk-expo` when needed.

## 6. Configure Clerk

Clerk is used in two places:

- Admin dashboard authentication in `admin/src/main.jsx`
- Backend request protection in `backend/src/server.js`

What to do:

1. Create a Clerk project
2. Copy the publishable key into `admin/.env`
3. Copy the secret key into `backend/.env`
4. Wrap the admin app in `ClerkProvider`
5. Add `clerkMiddleware()` in the backend server

This is the code order that matters:

1. Install `@clerk/express` and `@clerk/clerk-react`
2. Set the `.env` values
3. Update `admin/src/main.jsx`
4. Update `backend/src/server.js`

## 7. Configure Inngest

Inngest is the event layer used to sync Clerk user changes into MongoDB.

Install it in the backend:

```bash
cd ../backend
npm install inngest
```

Set the signing key in `backend/.env`:

```env
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

The backend uses Inngest in this sequence:

1. `backend/src/config/inggest.js` defines the user sync jobs
2. `backend/src/server.js` exposes them through `serve({ client: inngest, functions })`
3. Clerk webhooks send user events to Inngest
4. Inngest writes the data into MongoDB through the `User` model

Subscribe to these Clerk events:

- `User Created`
- `User Deleted`

## 8. Configure Cloudinary

Cloudinary handles media uploads from the backend.

Install it in the backend if it is not already installed:

```bash
cd ../backend
npm install cloudinary
```

Add these values to `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Then create `backend/src/config/cloudinary.js` and connect the config to your controllers or services.

## 9. Run the Project

After setup, start each part in this order:

1. Backend: `cd backend && npm run dev`
2. Admin: `cd admin && npm run dev`
3. Mobile: `cd mobile && npm start`

## 10. What to Check If Something Fails

- If the backend does not start, check `DB_URL` and the MongoDB connection
- If Clerk login fails in admin, check `VITE_CLERK_PUBLISHABLE_KEY`
- If user sync fails, check the Clerk webhook, Inngest setup, and `INNGEST_SIGNING_KEY`
- If uploads fail, check the Cloudinary credentials
- If the admin app does not build, run `npm run build` in `admin`

## Summary of Build Sequence

If you want the shortest correct order, use this:

1. Install tools: Node.js, VS Code, Git, MongoDB Atlas, Clerk, Inngest, Cloudinary, Expo Go
2. Create the root folder and run `npm init -y`
3. Set up `backend/` and its `.env`
4. Set up `admin/` and its Clerk provider
5. Set up `mobile/`
6. Connect Clerk auth in admin and backend
7. Connect Inngest webhooks for user sync
8. Configure Cloudinary uploads
9. Run backend, admin, and mobile
