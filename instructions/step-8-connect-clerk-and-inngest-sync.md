# Step 8: Configure Clerk in Admin and Sync Users with Inngest

## Overview
This step connects the admin dashboard to Clerk and wires Clerk webhooks into Inngest so user records can be synced into MongoDB from the backend.

## Prerequisites
- Completed [Step 5: Configure Clerk Authentication](step-5.md)
- Completed [Step 6: Configure Inngest](step-6.md)
- Backend and admin dependencies installed

## Admin setup

### 1. Install the Clerk React package
From the `admin/` folder, install the Clerk React SDK if it is not already present:

```bash
cd admin
npm install @clerk/clerk-react
```

### 2. Configure the Clerk provider
Update `admin/src/main.jsx` so the app reads the publishable key from the environment and wraps the app with `ClerkProvider`:

```javascript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import "./index.css";
import App from "./App.jsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </StrictMode>,
);
```

### 3. Clean the admin starter UI
Replace the starter Vite content in `admin/src/App.jsx` with your own dashboard UI.

The current starter component already uses Clerk auth helpers like:
- `SignedIn`
- `SignedOut`
- `SignInButton`
- `UserButton`

## Webhook and Inngest setup

### 1. Create Clerk webhooks
In the Clerk dashboard:
- Open **Developers**
- Select **Webhooks**
- Click **Add an Endpoint**
- Choose **Inngest** as the destination
- Connect Clerk to Inngest
- Create the webhook endpoint

### 2. Subscribe to the correct events
For the current backend implementation, subscribe to:
- `User Created`
- `User Deleted`

If you later add profile update syncing, you can also subscribe to `User Updated`.

### 3. Install Inngest in the backend
From the `backend/` folder, install Inngest:

```bash
cd backend
npm install inngest
```

## Backend flow

The backend already exposes the Inngest handler in `backend/src/server.js` and the user sync functions in `backend/src/config/inggest.js`.

When Clerk sends a webhook event to Inngest:
- `clerk/user.created` creates a user record in MongoDB
- `clerk/user.deleted` removes the matching user record from MongoDB

## Notes
- Keep `VITE_CLERK_PUBLISHABLE_KEY` in `admin/.env`.
- Keep `CLERK_SECRET_KEY` and `INNGEST_SIGNING_KEY` in `backend/.env`.
- The backend webhook endpoint is served from `/api/inngest`.
