# 11 - Advanced Authentication with Clerk

## Overview

Complete authentication setup with Clerk, including role-based access control (RBAC), social authentication, and webhook integration.

## Prerequisites

- All previous steps completed
- Clerk account created (clerk.com)
- Backend API running

## Backend Setup

### 1. Install Clerk SDK

```bash
cd backend
npm install @clerk/clerk-sdk-node dotenv
```

### 2. Configure Environment Variables

In `backend/.env`:

```
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 3. Create Clerk Middleware

Create `backend/src/middleware/auth.js`:

```javascript
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { clerkClient } from '@clerk/clerk-sdk-node';

export const requireAuth = ClerkExpressRequireAuth();

export const verifyToken = async (req, res, next) => {
  try {
    const sessionCookie = req.cookies?.__session;
    if (!sessionCookie) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const session = await clerkClient.sessions.verifySession(sessionCookie);
    req.auth = session;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      const userId = req.auth?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await clerkClient.users.getUser(userId);
      const userRole = user.publicMetadata?.role || 'customer';

      if (!roles.includes(userRole)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      req.user = { id: userId, role: userRole };
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error verifying role' });
    }
  };
};
```

### 4. Apply Middleware to Routes

In `backend/src/routes/products.js`:

```javascript
import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);

// Protected routes - require authentication
router.post('/', requireAuth, requireRole(['admin', 'seller']), createProduct);

// Admin only
router.put('/:id', requireAuth, requireRole(['admin']), updateProduct);
router.delete('/:id', requireAuth, requireRole(['admin']), deleteProduct);

export default router;
```

### 5. Setup Webhook Receiver

Create `backend/src/routes/webhooks.js`:

```javascript
import express from 'express';
import { Webhook } from 'svix';
import { clerkClient } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

const router = express.Router();

router.post('/clerk', async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(req.body, req.headers);
  } catch (err) {
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    
    await User.create({
      clerkId: id,
      email: email_addresses[0].email_address,
      name: `${first_name || ''} ${last_name || ''}`.trim(),
      role: 'customer',
      metadata: {},
    });
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    
    await User.update(
      {
        email: email_addresses[0].email_address,
        name: `${first_name || ''} ${last_name || ''}`.trim(),
      },
      { where: { clerkId: id } }
    );
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    await User.destroy({
      where: { clerkId: id }
    });
  }

  res.status(200).json({ success: true });
});

export default router;
```

## Admin Dashboard Setup

### 1. Install Clerk React

```bash
cd admin
npm install @clerk/clerk-react
```

### 2. Configure Environment Variables

In `admin/.env`:

```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 3. Wrap App with ClerkProvider

In `admin/src/main.jsx`:

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
)
```

### 4. Create Protected Routes

Create `admin/src/components/ProtectedRoute.jsx`:

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import PageLoader from './PageLoader';

export const ProtectedRoute = ({ 
  Component, 
  requiredRole = null 
}) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return <PageLoader />;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" />;
  }

  if (requiredRole) {
    const userRole = user?.publicMetadata?.role;
    if (!requiredRole.includes(userRole)) {
      return <Navigate to="/unauthorized" />;
    }
  }

  return <Component />;
};
```

### 5. Update Router

In `admin/src/App.jsx`:

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { ProtectedRoute } from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/sign-in/*" element={<SignIn />} />
        <Route path="/sign-up/*" element={<SignUp />} />
        
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute Component={DashboardPage} />}
        />
        
        <Route 
          path="/products" 
          element={
            <ProtectedRoute 
              Component={ProductsPage}
              requiredRole={['admin', 'seller']}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
```

## Mobile App Setup

### 1. Install Clerk Expo

```bash
cd mobile
npm install @clerk/clerk-expo expo-web-browser
npx expo install expo-web-browser
```

### 2. Configure Environment Variables

In `mobile/.env`:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 3. Wrap App with ClerkProvider

In `mobile/app/_layout.tsx`:

```typescript
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

const tokenCache = {
  getToken: async (key: string) => {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  saveToken: async (key: string, value: string) => {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export default function RootLayout() {
  return (
    <ClerkProvider 
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <Stack />
    </ClerkProvider>
  );
}
```

### 4. Create Authentication Screens

Create `mobile/app/(auth)/sign-in.tsx`:

```typescript
import React, { useCallback } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSignIn, useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;
    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/(tabs)/home');
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  }, [isLoaded, emailAddress, password]);

  return (
    <View className="flex-1 justify-center items-center px-4">
      <Text className="text-2xl font-bold mb-6">Sign In</Text>
      
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Email"
        onChangeText={setEmailAddress}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
      />
      
      <TextInput
        value={password}
        placeholder="Password"
        secureTextEntry={true}
        onChangeText={setPassword}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
      />
      
      <TouchableOpacity 
        onPress={onSignInPress}
        className="w-full bg-blue-600 py-3 rounded"
      >
        <Text className="text-white font-semibold text-center">Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Role-Based Access Control (RBAC)

### 1. Set User Role in Clerk Dashboard

1. Go to Clerk Dashboard → Users
2. Select a user
3. In "Public Metadata", add:
```json
{
  "role": "admin"
}
```

### 2. Backend: Sync Roles

Update user role on startup:

```javascript
import { clerkClient } from '@clerk/clerk-sdk-node';

export const syncUserRole = async (userId, role) => {
  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });
};
```

### 3. Frontend: Conditionally Render

```javascript
import { useUser } from '@clerk/clerk-react';

export const AdminPanel = () => {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role;

  if (userRole !== 'admin') {
    return null;
  }

  return <div>Admin Content</div>;
};
```

## Social Authentication

### Configure in Clerk Dashboard

1. Go to Clerk Dashboard → Configure → Social Connections
2. Enable: Google, GitHub, Apple
3. Add OAuth credentials

### Use Social Auth in Expo

```typescript
import { useOAuth } from '@clerk/clerk-expo';

export default function SignInScreen() {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId } = await startOAuthFlow();
      if (createdSessionId) {
        router.push('/(tabs)/home');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <TouchableOpacity onPress={handleGoogleSignIn}>
      <Text>Sign in with Google</Text>
    </TouchableOpacity>
  );
}
```

## Security Best Practices

1. **Always verify tokens on backend**
   - Don't trust frontend tokens
   - Check token expiration

2. **Use HTTPS in production**
   - Secure-only cookies
   - TLS/SSL certificates

3. **Rotate secrets regularly**
   - Update webhook secrets
   - Rotate API keys

4. **Limit API access**
   - Time-based tokens
   - Scope-limited permissions

## Testing Authentication

```bash
# Test protected endpoint
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/admin

# Test webhook locally
# Use ngrok to expose localhost
ngrok http 3000

# Add webhook URL to Clerk dashboard
# https://your-ngrok-url.ngrok.io/webhooks/clerk
```

## Next Steps

- [12-API-Documentation.md](./12-api-documentation.md) - Document your APIs
- [13-Deployment.md](./13-deployment.md) - Deploy to production
