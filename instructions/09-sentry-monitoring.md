# 09 - Sentry Error Monitoring Setup

## Overview

Configure Sentry for error tracking and performance monitoring across all applications.

## Prerequisites

- Sentry account (create at sentry.io)
- All apps initialized

## Backend Setup

### 1. Install Sentry SDK

In `backend/`:

```bash
npm install @sentry/node
npm install @sentry/tracing
```

### 2. Add Environment Variable

In `backend/.env`:

```
SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ENVIRONMENT=development
```

### 3. Initialize Sentry

In `backend/src/server.js`:

```javascript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || 'development',
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ request: true, serverName: true, transaction: true }),
  ]
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ... your routes

app.use(Sentry.Handlers.errorHandler());
```

### 4. Capture Exceptions

```javascript
import * as Sentry from '@sentry/node';

export const createProduct = async (req, res) => {
  try {
    // ... product creation logic
  } catch (error) {
    Sentry.captureException(error, {
      tags: { section: 'products' },
      extra: { productName: req.body.name }
    });
    res.status(500).json({ message: 'Error creating product' });
  }
};
```

## Admin Dashboard Setup

### 1. Install Sentry React

In `admin/`:

```bash
npm install @sentry/react
npm install @sentry/tracing
```

### 2. Add Environment Variable

In `admin/.env`:

```
VITE_SENTRY_DSN=your_sentry_dsn
```

### 3. Wrap App with Sentry

In `admin/src/main.jsx`:

```javascript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

function App() {
  return <Router />;
}

export default Sentry.withProfiler(App);
```

### 4. Capture Errors

```javascript
import * as Sentry from '@sentry/react';

export const ProductsPage = () => {
  const errorHandler = (error) => {
    Sentry.captureException(error);
    console.error(error);
  };

  // ... component logic
};
```

## Mobile App Setup

### 1. Install Sentry React Native

In `mobile/`:

```bash
npm install @sentry/react-native
npx expo prebuild
```

### 2. Add Environment Variable

In `mobile/.env`:

```
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### 3. Initialize Sentry

In `mobile/app/_layout.tsx`:

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 1.0,
  attachStacktrace: true,
  enableAutoPerformanceTracing: true,
});

export default Sentry.wrap(RootLayout);
```

## Sentry Dashboard Configuration

### 1. Create Projects

- Create three projects: Backend, Admin, Mobile
- Each will have its own DSN

### 2. Configure Alerts

1. Go to Alerts → Create Alert Rule
2. Set conditions (e.g., error rate > 5%)
3. Set notification channel (email, Slack, etc.)

### 3. Setup Source Maps

For production builds, upload source maps:

```bash
# Admin
npm run build
sentry-cli releases files upload-sourcemaps ./dist

# Mobile
npx eas build --platform all
# Source maps auto-uploaded via EAS
```

## Performance Monitoring

### Track Transactions

```javascript
// Backend
export const getOrders = async (req, res) => {
  const transaction = Sentry.startTransaction({
    op: 'db.query',
    name: 'Get Orders',
  });

  try {
    const orders = await Order.find();
    transaction.finish();
    res.json(orders);
  } catch (error) {
    transaction.finish();
    Sentry.captureException(error);
  }
};
```

## Error Resolution

When an error occurs:

1. Check Sentry Dashboard
2. Review error details and stack trace
3. Click on issue to view all occurrences
4. Assign to team member
5. Create fix in code
6. Deploy
7. Mark as resolved

## Testing

### Backend

```bash
curl http://localhost:3000/test-error
```

### Admin/Mobile

Trigger an error in the UI and check Sentry dashboard for event.

## Useful Integrations

- **Slack**: Get notifications for errors
- **GitHub**: Link issues to commits
- **Jira**: Create tickets for errors
- **PagerDuty**: Alert on-call engineers

## Next Steps

- [10-Database-Migrations.md](./10-database-migrations.md) - Database setup
