# 04 - Mobile App Setup

## Overview

Set up the Expo React Native mobile application with Expo Router and NativeWind.

## Prerequisites

- Node.js v18+
- Expo account (create at expo.dev)
- Mobile folder initialized

## Installation Steps

### 1. Initialize Expo Project

From the `mobile/` directory:

```bash
npx create-expo-app@latest . --template
npm install expo-router expo-constants
```

### 2. Install UI & Styling

```bash
npm install nativewind
npm install -D tailwindcss
```

### 3. Install Core Dependencies

```bash
npm install @react-native-async-storage/async-storage
npm install axios
npm install @tanstack/react-query
npm install @clerk/clerk-expo
npm install @stripe/stripe-react-native
npm install @sentry/react-native
npm install react-native-safe-area-context
npm install expo-blur
npm install expo-image
npm install lucide-react-native
```

### 4. Create tailwind.config.js

```javascript
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
}
```

### 5. Create nativewind-env.d.ts

```typescript
import { type ClassValue } from "clsx";
declare module "nativewind" {
  interface Nativewind {
    cn(...inputs: (ClassValue | undefined)[]): string;
  }
}
```

### 6. Project Structure

```
mobile/
├── app/
│   ├── _layout.tsx              # Root layout
│   ├── index.tsx                # Root index
│   ├── (auth)/                  # Auth screens
│   ├── (tabs)/                  # Buyer screens
│   ├── (seller)/                # Seller screens
│   ├── (profile)/               # Profile screens
│   ├── product/                 # Product detail
│   └── role-selection.tsx       # Role selection
├── components/                  # Reusable components
├── context/                     # Context providers
├── hooks/                       # Custom hooks
├── lib/                         # API client & utilities
├── types/                       # TypeScript types
├── app.json
├── metro.config.js
├── nativewind.config.ts
├── tailwind.config.js
├── tsconfig.json
└── .env
```

### 7. Create .env

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
SENTRY_AUTH_TOKEN=your_sentry_auth_token (optional)
```

### 8. Configure app.json

```json
{
  "expo": {
    "name": "JianoFreo Marketplace",
    "slug": "jianofreo-marketplace",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "plugins": [
      "@react-native-async-storage/async-storage",
      "@stripe/stripe-react-native"
    ],
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### 9. Start Development Server

```bash
npm start
```

Use Expo Go app on your phone to scan QR code, or press `a` for Android/`i` for iOS simulator.

## Key Features

- **Expo Router**: File-based routing
- **NativeWind**: Tailwind CSS for React Native
- **Clerk**: Social authentication
- **Stripe**: Payment processing
- **AsyncStorage**: Local data persistence
- **React Query**: State management

## Guest Role Implementation

The mobile app supports a "guest" role that allows:
- Browsing products without sign-in
- Viewing product details
- Limited features (no cart/wishlist/checkout)

Guests are prompted to sign in when attempting restricted actions.

## Next Steps

- [05-Authentication-Setup.md](./05-authentication-setup.md) - Configure Clerk
- [07-Stripe-Payments.md](./07-stripe-payments.md) - Set up payments
