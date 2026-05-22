# 07 - Stripe Payments Setup

## Overview

Configure Stripe for card payments and cash-on-delivery (COD) option.

## Prerequisites

- Stripe account (create at stripe.com)
- Backend initialized
- Admin & Mobile apps initialized

## Backend Setup

### 1. Install Stripe SDK

In `backend/`:

```bash
npm install stripe
```

### 2. Add Stripe Keys

In `backend/.env`:

```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key (for reference)
```

### 3. Create Payment Intent Controller

Create `backend/src/controllers/payment.controller.js`:

```javascript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
  try {
    const { cartItems, shippingAddress, paymentMethod } = req.body;

    // Calculate amounts
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 10.00;
    const tax = subtotal * 0.08;
    const total = Math.round((subtotal + shipping + tax) * 100);

    if (paymentMethod === 'cod') {
      // Cash on Delivery - create order directly
      const order = new Order({
        user: req.user._id,
        clerkId: req.user.clerkId,
        orderItems: cartItems,
        shippingAddress,
        totalPrice: Math.round(total / 100 * 100) / 100,
        status: 'pending',
        paymentResult: { status: 'pending_cod' },
      });

      await order.save();
      return res.status(201).json({ order, clientSecret: null });
    }

    // Credit card payment via Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      metadata: {
        userId: req.user._id.toString(),
        cartItems: JSON.stringify(cartItems),
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ message: 'Payment error' });
  }
};

export const handlePaymentSuccess = async (req, res) => {
  try {
    const { paymentIntentId, cartItems, shippingAddress } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 10.00;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    const order = new Order({
      user: req.user._id,
      clerkId: req.user.clerkId,
      orderItems: cartItems,
      shippingAddress,
      totalPrice: Math.round(total * 100) / 100,
      status: 'pending',
      paymentResult: {
        id: paymentIntentId,
        status: 'succeeded',
      },
    });

    await order.save();

    // Decrement stock for products
    for (const item of cartItems) {
      const product = await Product.findById(item.productId || item.product);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    res.status(201).json({ order });
  } catch (error) {
    console.error('Payment success handler error:', error);
    res.status(500).json({ message: 'Order creation error' });
  }
};
```

### 4. Create Payment Routes

Create `backend/src/routes/payment.route.js`:

```javascript
import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { createPaymentIntent, handlePaymentSuccess } from '../controllers/payment.controller.js';

const router = express.Router();

router.use(protectRoute);

router.post('/create-intent', createPaymentIntent);
router.post('/success', handlePaymentSuccess);

export default router;
```

## Admin Setup

### 1. Add Stripe Key

In `admin/.env`:

```
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 2. Create Payment Modal

The payment sheet is typically handled on mobile/web client-side only.

## Mobile Setup

### 1. Install Stripe React Native

In `mobile/`:

```bash
npm install @stripe/stripe-react-native
```

### 2. Add Environment Variable

In `mobile/.env`:

```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 3. Wrap App with Stripe Provider

In `mobile/app/_layout.tsx`:

```typescript
import { StripeProvider } from '@stripe/stripe-react-native';

export default function RootLayout() {
  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}>
      {/* Your layout */}
    </StripeProvider>
  );
}
```

### 4. Create Checkout Flow

Create `mobile/hooks/useStripePayment.ts`:

```typescript
import { useStripe } from '@stripe/stripe-react-native';
import { useApi } from '@/lib/api';

export const useStripePayment = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const api = useApi();

  const checkout = async (cartItems: any[], shippingAddress: any) => {
    try {
      // Create payment intent
      const { data } = await api.post('/payment/create-intent', {
        cartItems,
        shippingAddress,
        paymentMethod: 'card',
      });

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: data.clientSecret,
        merchantDisplayName: 'JianoFreo',
      });

      if (initError) throw new Error(initError.message);

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) throw new Error(presentError.message);

      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const checkoutCOD = async (cartItems: any[], shippingAddress: any) => {
    try {
      const { data } = await api.post('/payment/create-intent', {
        cartItems,
        shippingAddress,
        paymentMethod: 'cod',
      });

      return { success: true, order: data.order };
    } catch (error) {
      throw error;
    }
  };

  return { checkout, checkoutCOD };
};
```

## Testing

### Development Mode

1. Use Stripe test keys (starts with `pk_test_` or `sk_test_`)
2. Use test card: `4242 4242 4242 4242` with any future expiry
3. Verify orders are created in MongoDB

### Production Mode

1. Switch to live keys (starts with `pk_live_` or `sk_live_`)
2. Use actual payment cards
3. Verify webhooks are configured

## Webhook Setup (Optional)

For production, configure Stripe webhooks:

1. Go to Stripe Dashboard → Webhooks
2. Create endpoint pointing to: `https://your-backend.com/webhooks/stripe`
3. Subscribe to: `payment_intent.succeeded`, `payment_intent.payment_failed`

## Next Steps

- [08-Inngest-Webhooks.md](./08-inngest-webhooks.md) - Background jobs
- [09-Sentry-Monitoring.md](./09-sentry-monitoring.md) - Error tracking
