# expo-ecommerce Setup Index

Use the links below to follow the full setup flow for the project.

## Setup Steps

1. **[Step 1: Initialize Root Project](instructions/step-1-initialize-root-project.md)** - Create the folders and initialize the root `package.json`
2. **[Step 2: Set up Backend](instructions/step-2-setup-backend-api.md)** - Install backend dependencies and nodemon
3. **[Step 3: Set up Admin](instructions/step-3-setup-admin-dashboard.md)** - Initialize the React + Vite admin app
4. **[Step 4: Set up Mobile Application](instructions/step-4-setup-mobile-app.md)** - Initialize the Expo mobile app
5. **[Step 5: Configure Clerk Auth](instructions/step-5-configure-clerk-auth.md)** - Add Clerk keys and packages
6. **[Step 6: Configure Inngest](instructions/step-6-configure-inngest-webhooks.md)** - Add background jobs and signing keys
7. **[Step 7: Configure Cloudinary](instructions/step-7-configure-cloudinary-uploads.md)** - Add Cloudinary credentials and backend config
8. **[Step 8: Configure Clerk and Webhooks](instructions/step-8-connect-clerk-and-inngest-sync.md)** - Connect the admin app to Clerk and sync users with Inngest

## Folder Structure

The project should look like this:

```text
expo-ecommerce/
├── backend/
├── admin/
├── mobile/
├── instructions/
├── README.md
└── set-up.md
```

## Dependency Timing

- Install `express`, `dotenv`, `mongoose`, `mongodb`, and `nodemon` in `backend/`.
- Run `npm run build` in `admin/` to generate `dist/` before deployment.
- Install Expo packages in `mobile/`.
- Add Clerk, Inngest, and Cloudinary packages when you reach Steps 5 through 8.

## Quick Commands

```bash
cd backend
npm run dev

cd admin
npm run dev

cd mobile
npm start
```
