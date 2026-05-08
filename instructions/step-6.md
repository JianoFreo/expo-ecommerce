# Step 6: Configure Inngest

## Overview
Inngest is a background job and event-processing platform. Use it for tasks like sending emails, processing orders, or running asynchronous workflows.

## What to set up
- Create an Inngest account and a project
- Copy the signing key into the backend `.env` file
- Install the Inngest package in the backend

## Backend setup

From the `backend/` folder, install Inngest:

```bash
cd backend
npm install inngest
```

Add the signing key to `backend/.env`:

```env
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

## How it is used
- Inngest listens for events from your backend
- It runs background jobs without blocking the main request flow
- It is useful for notifications, emails, order processing, and cleanup tasks

## Notes
- Keep the signing key private.
- Only add Inngest when your app needs background jobs or event-driven workflows.