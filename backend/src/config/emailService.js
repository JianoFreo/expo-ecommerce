import { inngest } from '../config/inngest.js';
import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

// NOTE: You need to configure nodemailer credentials in your .env file
// SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
// Or use a service like SendGrid, AWS SES, etc.

const transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST || 'smtp.gmail.com',
  port: ENV.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: ENV.SMTP_USER || process.env.SMTP_USER,
    pass: ENV.SMTP_PASSWORD || process.env.SMTP_PASSWORD,
  },
});

export const sendOrderConfirmationEmail = inngest.createFunction(
  { id: 'send-order-confirmation-email' },
  { event: 'order/created' },
  async ({ event }) => {
    try {
      const { userEmail, userName, orderDetails, totalPrice } = event.data;

      await transporter.sendMail({
        from: 'noreply@marketplace.com',
        to: userEmail,
        subject: '✅ Order Confirmation - Your order has been placed',
        html: `
          <h2>Order Confirmed!</h2>
          <p>Hi ${userName},</p>
          <p>Thank you for your purchase. Your order has been successfully placed.</p>
          <h3>Order Details:</h3>
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <p><strong>Total Price:</strong> $${totalPrice.toFixed(2)}</p>
          <p><strong>Status:</strong> ${orderDetails.status || 'Pending'}</p>
          <p>You will receive updates on your order status via email.</p>
          <p>Thank you for shopping with us!</p>
        `,
      });

      console.log('Order confirmation email sent to', userEmail);
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      throw error;
    }
  }
);

export const sendPaymentReceiptEmail = inngest.createFunction(
  { id: 'send-payment-receipt-email' },
  { event: 'payment/received' },
  async ({ event }) => {
    try {
      const { sellerEmail, sellerName, buyerName, productName, amount, orderDetails } = event.data;

      await transporter.sendMail({
        from: 'noreply@marketplace.com',
        to: sellerEmail,
        subject: '💰 Payment Received - New Sale!',
        html: `
          <h2>You Have a New Sale!</h2>
          <p>Hi ${sellerName},</p>
          <p><strong>${buyerName}</strong> just purchased <strong>${productName}</strong> from your shop.</p>
          <h3>Payment Details:</h3>
          <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
          <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
          <p>Please prepare the item for shipment.</p>
        `,
      });

      console.log('Payment receipt email sent to', sellerEmail);
    } catch (error) {
      console.error('Error sending payment receipt:', error);
      throw error;
    }
  }
);

export const sendUserBanEmail = inngest.createFunction(
  { id: 'send-user-ban-email' },
  { event: 'user/banned' },
  async ({ event }) => {
    try {
      const { userEmail, userName, reason } = event.data;

      await transporter.sendMail({
        from: 'noreply@marketplace.com',
        to: userEmail,
        subject: '⚠️ Account Suspended',
        html: `
          <h2>Account Suspension Notice</h2>
          <p>Hi ${userName},</p>
          <p>Your account has been suspended for the following reason:</p>
          <p><strong>${reason || 'Violation of marketplace policies'}</strong></p>
          <p>If you believe this is a mistake, please contact our support team.</p>
        `,
      });

      console.log('User ban email sent to', userEmail);
    } catch (error) {
      console.error('Error sending user ban email:', error);
      throw error;
    }
  }
);

export const sendShopCreatedEmail = inngest.createFunction(
  { id: 'send-shop-created-email' },
  { event: 'shop/created' },
  async ({ event }) => {
    try {
      const { ownerEmail, ownerName, shopName, superAdminEmail } = event.data;

      // Send to shop owner
      await transporter.sendMail({
        from: 'noreply@marketplace.com',
        to: ownerEmail,
        subject: '🎉 Welcome! Your Shop is Live',
        html: `
          <h2>Welcome to the Marketplace!</h2>
          <p>Hi ${ownerName},</p>
          <p>Your shop <strong>${shopName}</strong> is now live and ready to sell!</p>
          <p>Start adding products to your inventory and reach customers worldwide.</p>
        `,
      });

      // Notify super admin
      await transporter.sendMail({
        from: 'noreply@marketplace.com',
        to: superAdminEmail || 'magtangob65@gmail.com',
        subject: '📢 New Shop Created',
        html: `
          <h2>New Seller Registered</h2>
          <p><strong>${ownerName}</strong> has created a new shop: <strong>${shopName}</strong></p>
          <p>Review their shop: <a href="http://localhost:3000/admin">Go to Dashboard</a></p>
        `,
      });

      console.log('Shop created emails sent');
    } catch (error) {
      console.error('Error sending shop created email:', error);
      throw error;
    }
  }
);
