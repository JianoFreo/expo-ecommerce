# Step 8: Configure Clerk in Admin and Sync Users with Inngest

## Overview
This step connects the admin dashboard to Clerk and wires Clerk webhooks into Inngest so user records can be synced into MongoDB from the backend.

## Prerequisites
- Completed [Step 5: Configure Clerk Authentication](step-5-configure-clerk-auth.md)
- Completed [Step 6: Configure Inngest](step-6-configure-inngest-webhooks.md)
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

The backend already exposes the Inngest handler in `backend/src/server.js` and the user sync functions in `backend/src/config/inngest.js`.

When Clerk sends a webhook event to Inngest:
- `clerk/user.created` creates a user record in MongoDB
- `clerk/user.deleted` removes the matching user record from MongoDB

## How Data Syncs From Clerk to MongoDB

This section explains the exact data flow when a user signs up.

### Step 1: User Signs Up in Clerk

User fills out the sign-up form in the admin app (`admin/src/App.jsx`). Clerk creates the user in its system with:
- `id` (Clerk user ID)
- `email_addresses` (array of email objects)
- `first_name`
- `last_name`
- `image_url`

### Step 2: Clerk Sends a Webhook

Clerk automatically sends a `clerk/user.created` event to your Inngest endpoint. This webhook is configured in the Clerk dashboard under **Developers → Webhooks**.

### Step 3: Inngest Receives and Extracts the Data

The `syncUser` function in `backend/src/config/inngest.js` listens for this event and runs automatically:

```javascript
export const syncUser = inngest.createFunction(
    {
        id: "sync-user",
        triggers: [{ event: "clerk/user.created" }],  // ← Listening for this event
    },

    async ({ event }) => {
        await connectDB();  // Connect to MongoDB

        // Inngest automatically passes the Clerk webhook data in event.data
        const {
            id,                 // Clerk user ID
            email_addresses,    // Array of email objects
            first_name,
            last_name,
            image_url,
        } = event.data;

        // Create the new user record in your MongoDB
        const newUser = {
            clerkId: id,                                    // Link to Clerk
            email: email_addresses[0]?.email_address,       // Extract first email
            name: `${first_name || ""} ${last_name || ""}` || "User",
            imageUrl: image_url,
            addresses: [],  // Empty at first, user adds later
            wishlist: [],   // Empty at first
        };

        await User.create(newUser);  // Save to MongoDB
    }
);
```

### Step 4: Data Appears in MongoDB

Once the function runs, the user is saved with these fields (from `backend/src/models/user.model.js`):
- `email` — user contact
- `name` — display name
- `imageURL` — profile picture
- `clerkId` — linked to Clerk account
- `addresses` — empty array for now, user adds later
- `wishlist` — empty array for now
- `createdAt` and `updatedAt` — timestamps

### Data Mapping

From the Clerk webhook, Inngest extracts and transforms:

| Clerk field | Stored in MongoDB as | Used for |
|---|---|---|
| `id` | `clerkId` | Link to Clerk account |
| `email_addresses[0].email_address` | `email` | User contact |
| `first_name` + `last_name` | `name` | Display name |
| `image_url` | `imageUrl` | Profile picture |

### If the Sync Doesn't Happen

Check these items:

1. **Clerk webhook configured?** Go to **Developers → Webhooks** in the Clerk dashboard and verify the endpoint is connected
2. **Inngest signing key set?** Make sure `INNGEST_SIGNING_KEY` is in `backend/.env`
3. **MongoDB connection?** Verify `DB_URL` is correct in `backend/.env`
4. **Backend endpoint registered?** The backend exposes `/api/inngest` for webhooks (see `backend/src/server.js`)
5. **Correct events subscribed?** Make sure you subscribed to `User Created` and `User Deleted` in the Clerk webhook

## Notes
- Keep `VITE_CLERK_PUBLISHABLE_KEY` in `admin/.env`.
- Keep `CLERK_SECRET_KEY` and `INNGEST_SIGNING_KEY` in `backend/.env`.
- The backend webhook endpoint is served from `/api/inngest`.
