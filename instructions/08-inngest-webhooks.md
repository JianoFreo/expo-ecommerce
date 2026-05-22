# 08 - Inngest Background Jobs Setup

## Overview

Configure Inngest for background job processing (webhooks, email, sync tasks).

## Prerequisites

- Inngest account (sign up at inngest.com)
- Backend initialized

## Backend Setup

### 1. Install Inngest SDK

In `backend/`:

```bash
npm install inngest
```

### 2. Add Environment Variables

In `backend/.env`:

```
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

### 3. Initialize Inngest Client

Create `backend/src/lib/inngest.js`:

```javascript
import { Inngest } from 'inngest';

export const inngest = new Inngest({
  id: 'ecommerce',
  eventKey: process.env.INNGEST_EVENT_KEY,
  signingKey: process.env.INNGEST_SIGNING_KEY,
});

export const events = {
  USER_CREATED: 'user/created',
  USER_SYNCED: 'user/synced',
  ORDER_CREATED: 'order/created',
  PRODUCT_UPLOADED: 'product/uploaded',
};
```

### 4. Create Background Functions

Create `backend/src/inngest/functions.js`:

```javascript
import { inngest, events } from '../lib/inngest.js';
import { User } from '../models/user.model.js';
import { sendWelcomeEmail } from '../lib/email.js';

// When Clerk creates a user, sync to our DB
export const syncUserFromClerk = inngest.createFunction(
  { id: 'sync-user-from-clerk' },
  { event: events.USER_CREATED },
  async ({ event }) => {
    const { clerkId, email, firstName, lastName } = event.data;

    try {
      const existingUser = await User.findOne({ clerkId });
      if (existingUser) return { status: 'already_exists' };

      const user = new User({
        clerkId,
        email,
        name: `${firstName} ${lastName}`,
      });

      await user.save();
      
      // Send welcome email
      await sendWelcomeEmail(email, firstName);

      return { status: 'synced', userId: user._id };
    } catch (error) {
      console.error('Error syncing user:', error);
      throw error;
    }
  }
);

// When order is created, trigger notifications
export const onOrderCreated = inngest.createFunction(
  { id: 'on-order-created' },
  { event: events.ORDER_CREATED },
  async ({ event }) => {
    const { orderId, buyerId, sellerId } = event.data;

    try {
      // Send notification to buyer
      // Send notification to seller
      // Update inventory
      // Log activity

      return { status: 'processed' };
    } catch (error) {
      console.error('Error processing order:', error);
      throw error;
    }
  }
);
```

### 5. Mount Inngest Handler

In `backend/src/server.js`:

```javascript
import { serve } from 'inngest/express';
import { inngest } from './lib/inngest.js';
import * as functions from './inngest/functions.js';

app.use('/inngest', serve(inngest, Object.values(functions)));
```

### 6. Trigger Events

When creating an order in controllers:

```javascript
import { inngest, events } from '../lib/inngest.js';

export const createOrder = async (req, res) => {
  try {
    // ... order creation logic

    // Trigger background job
    await inngest.send({
      name: events.ORDER_CREATED,
      data: {
        orderId: order._id,
        buyerId: req.user._id,
        sellerId: order.orderItems[0].product.shop.owner,
      },
    });

    res.status(201).json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order' });
  }
};
```

## Webhook Setup (Clerk)

### 1. Configure Clerk Dashboard

1. Go to Clerk Dashboard → Webhooks
2. Create endpoint to: `https://your-backend.com/inngest`
3. Select events: `user.created`, `user.updated`
4. Copy signing secret

### 2. Handle Clerk Webhooks

In `backend/src/controllers/webhook.controller.js`:

```javascript
import crypto from 'crypto';
import { inngest, events } from '../lib/inngest.js';

export const handleClerkWebhook = async (req, res) => {
  try {
    const signature = req.headers['svix-signature'];
    const timestamp = req.headers['svix-timestamp'];
    const id = req.headers['svix-id'];

    // Verify signature
    const verified = verifyWebhookSignature(
      JSON.stringify(req.body),
      signature,
      timestamp,
      process.env.CLERK_WEBHOOK_SECRET
    );

    if (!verified) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { type, data } = req.body;

    if (type === 'user.created') {
      await inngest.send({
        name: events.USER_CREATED,
        data: {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
        },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ message: 'Webhook error' });
  }
};

function verifyWebhookSignature(payload, signature, timestamp, secret) {
  const msg = `${id}.${timestamp}.${payload}`;
  const computed = crypto
    .createHmac('sha256', secret)
    .update(msg)
    .digest('base64');
  
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
}
```

## Testing

### 1. Local Development

```bash
npx inngest-cli dev
```

This starts a local Inngest dev server that logs all events.

### 2. Trigger Test Events

```bash
curl -X POST http://localhost:3000/inngest \
  -H "Content-Type: application/json" \
  -d '{
    "name": "user/created",
    "data": {
      "clerkId": "test-user",
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User"
    }
  }'
```

## Production Deployment

1. Sign up for Inngest cloud
2. Get production keys from Inngest dashboard
3. Update `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` in `.env`
4. Deploy backend
5. Configure webhook endpoints in Inngest dashboard

## Next Steps

- [09-Sentry-Monitoring.md](./09-sentry-monitoring.md) - Error tracking
- [10-Database-Migrations.md](./10-database-migrations.md) - Database setup
