# 05 - Authentication Setup (Clerk)

## Overview

Configure Clerk for authentication across all three applications (backend, admin, mobile).

## Prerequisites

- Clerk account (create at clerk.com)
- All apps initialized and running

## Backend Setup

### 1. Install Clerk SDKs

In `backend/`:

```bash
npm install @clerk/clerk-sdk-node
npm install express-jwt
npm install jwks-rsa
```

### 2. Add Clerk Environment Variables

In `backend/.env`:

```
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
```

### 3. Create Auth Middleware

Create `backend/src/middleware/auth.middleware.js`:

```javascript
import { createClerkClient } from "@clerk/clerk-sdk-node";
import jwt from "jsonwebtoken";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const decoded = jwt.verify(token, process.env.CLERK_SIGNED_IN_SECRET);
    req.userId = decoded.sub;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const sellerOnly = async (req, res, next) => {
  try {
    const user = await clerk.users.getUser(req.userId);
    if (user.publicMetadata?.role !== 'seller') {
      return res.status(403).json({ message: 'Seller access required' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Unauthorized' });
  }
};

export const superAdminOnly = async (req, res, next) => {
  try {
    const user = await clerk.users.getUser(req.userId);
    if (user.publicMetadata?.role !== 'super-admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Unauthorized' });
  }
};
```

## Admin Setup

### 1. Install Clerk React

In `admin/`:

```bash
npm install @clerk/clerk-react
```

### 2. Add Environment Variables

In `admin/.env`:

```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 3. Wrap App with ClerkProvider

In `admin/src/main.jsx`:

```javascript
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
    <App />
  </ClerkProvider>
);
```

### 4. Create Protected Routes

In `admin/src/App.jsx`:

```javascript
import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router";

export default function App() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <PageLoader />;

  return (
    <Routes>
      <Route path="/login" element={isSignedIn ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/" element={isSignedIn ? <DashboardLayout /> : <Navigate to="/login" />}>
        {/* Protected pages */}
      </Route>
    </Routes>
  );
}
```

## Mobile Setup

### 1. Install Clerk Expo

In `mobile/`:

```bash
npm install @clerk/clerk-expo
npm install expo-web-browser
```

### 2. Add Environment Variables

In `mobile/.env`:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 3. Create Token Cache

Create `mobile/lib/clerk-cache.ts`:

```typescript
import * as SecureStore from "expo-secure-store";

const createSecureStore = () => {
  return {
    getItem: (key: string) => {
      try {
        return SecureStore.getItemAsync(key);
      } catch (err) {
        return Promise.resolve(null);
      }
    },
    saveItem: (key: string, value: string) => {
      try {
        return SecureStore.setItemAsync(key, value);
      } catch (err) {
        return Promise.resolve();
      }
    },
    removeItem: (key: string) => {
      try {
        return SecureStore.deleteItemAsync(key);
      } catch (err) {
        return Promise.resolve();
      }
    },
  };
};

export const tokenCache = createSecureStore();
```

### 4. Wrap App with ClerkProvider

In `mobile/app/_layout.tsx`:

```typescript
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@/lib/clerk-cache";

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <Stack screenOptions={{ headerShown: false }} />
    </ClerkProvider>
  );
}
```

## Testing Authentication

1. Visit admin dashboard - you should be redirected to login
2. Click "Sign in with Google" or "Sign in with Apple"
3. Authenticate and verify access to dashboard
4. On mobile, scan QR code and follow same auth flow

## Webhook Setup (Backend)

### 1. Configure Clerk Dashboard

1. Go to Clerk Dashboard → Webhooks
2. Create new endpoint pointing to: `https://your-backend.com/webhooks/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy signing secret to `CLERK_WEBHOOK_SECRET` in `.env`

### 2. Create Webhook Handler

Create `backend/src/routes/webhooks.route.js`:

```javascript
import express from 'express';
import { handleClerkWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

router.post('/clerk', handleClerkWebhook);

export default router;
```

Mount in `server.js`:

```javascript
import webhookRoutes from './routes/webhooks.route.js';
app.use('/webhooks', webhookRoutes);
```

## Next Steps

- [08-Inngest-Webhooks.md](./08-inngest-webhooks.md) - Background jobs
- [06-Cloudinary-Setup.md](./06-cloudinary-setup.md) - Image uploads
