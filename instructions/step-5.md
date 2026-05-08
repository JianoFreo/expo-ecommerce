# Step 5: Configure Clerk Authentication

## Overview
Clerk provides authentication for the backend, admin dashboard, and mobile app.

## What to set up
- Sign up for a Clerk account and create a project
- Copy the publishable key into the frontend `.env` files
- Copy the secret key into the backend `.env` file

## Backend setup

From the `backend/` folder, install the Clerk Express middleware:

```bash
cd backend
npm install @clerk/express
```

Add the Clerk secret key to `backend/.env`:

```env
CLERK_SECRET_KEY=your_clerk_secret_key
```

## Admin setup

Add the Clerk publishable key to `admin/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Install the Clerk React package if it is not already installed:

```bash
cd admin
npm install @clerk/clerk-react
```

## Mobile setup

If the mobile app uses Clerk authentication, add the publishable key to `mobile/.env`:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Install the Clerk Expo package when needed:

```bash
cd mobile
npm install @clerk/clerk-expo
```

## Notes
- Use the publishable key in admin and mobile apps only.
- Use the secret key in the backend only.
- Keep sensitive keys out of source control.
