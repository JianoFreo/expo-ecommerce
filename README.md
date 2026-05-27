# JianoFreo Marketplace - E-commerce Platform


## [📱 Click to Download Android APK](JFreo%20Marketplace.apk)

A full-stack e-commerce platform built with **Expo (React Native)**, **React + Vite** (Admin), and **Node.js + Express** (Backend). Features multi-seller support, real-time order management, analytics, guest browsing, and Stripe/COD payments.

<table>
<tr>
<td align="center">

<h2><b>AUTH</b></h2>

<img width="433" height="962" alt="image" src="https://github.com/user-attachments/assets/8e9ce5b7-0fd2-49fe-bacb-facf62de6285" />
</td>

<td align="center">

<h2><b>CLERK</b></h2>

<img width="444" height="967" alt="image" src="https://github.com/user-attachments/assets/0a5f2b82-64bc-4c8d-9dbd-08b748ca4daf" />

</td>
</tr>
</table>

<table>
<tr>
<td align="center">

<h2><b>PRODUCTS</b></h2>

<img width="444" height="970" alt="image" src="https://github.com/user-attachments/assets/12b73e4c-304b-4e6d-b3d5-03d3ea23e007" />
</td>

<td align="center">

<h2><b>CART</b></h2>

<img width="448" height="973" alt="image" src="https://github.com/user-attachments/assets/3398fb35-f39f-4042-a791-64fe0a43686e" />

</td>
</tr>
</table>

<table>
<tr>
<td align="center">

<h2><b>STRIPE PAYMENT</b></h2>

<img width="445" height="960" alt="image" src="https://github.com/user-attachments/assets/0c4fc79b-f41c-4459-950e-3922586b6426" />
</td>

<td align="center">

<h2><b>PROFILE</b></h2>

<img width="452" height="974" alt="image" src="https://github.com/user-attachments/assets/3f39a5c4-6ddf-4b16-994a-818cebb294d7" />

</td>
</tr>
</table>

# =======================SELLER===========================

<table>
<tr>
<td align="center">

<h2><b>DASHBOARD</b></h2>

<img width="440" height="960" alt="image" src="https://github.com/user-attachments/assets/072b81c8-493d-40a0-910a-cad671de3a3d" />
</td>

<td align="center">

<h2><b>ORDER INVOICE - SELLER'S INVOICE</b></h2>

<img width="445" height="950" alt="image" src="https://github.com/user-attachments/assets/caf19f8b-d3cf-40ec-8077-13a4759e6bac" />

</td>
</tr>
</table>
<table>
<tr>
<td align="center">

<h2><b>SELLERS ANALYTICS</b></h2>

<img width="444" height="964" alt="image" src="https://github.com/user-attachments/assets/f7cbde71-84db-4269-abbd-e53f71ffbf75" />
</td>

<td align="center">

<h2><b>ORDER INVOICE - SELLER'S PROFILE</b></h2>

<img width="454" height="974" alt="image" src="https://github.com/user-attachments/assets/ec46e498-fecf-4f50-8c1c-29273651419b" />

</td>
</tr>
</table>



### SUPER ADMIN - MANAGES THE ENTIRE APP DETAILS AND ACTIVITY
### =====ONLY ONE PERSON CAN ACCESS (ME)====




</table>
<table>
<tr>
<td align="center">

<h2><b>DASHBOARD</b></h2>

<img width="440" height="954" alt="image" src="https://github.com/user-attachments/assets/0befc7a9-cf45-4290-8b21-242dd65157e8" />
</td>

<td align="center">

<h2><b>USERS HANDLING</b></h2>

<img width="455" height="969" alt="image" src="https://github.com/user-attachments/assets/118c3930-1f2c-4f87-a22d-240396ee4e0d" />

</td>
</tr>
</table>

</table>
<table>
<tr>
<td align="center">

<h2><b>SHOP HANDLING</b></h2>

<img width="455" height="973" alt="image" src="https://github.com/user-attachments/assets/e2f913e3-c9e0-43fe-88ff-7244e68d7149" />

</td>

<td align="center">

<h2><b>HOME</b></h2>
<h2>Can change the banner for ads</h2>

<img width="452" height="970" alt="image" src="https://github.com/user-attachments/assets/f76a6b82-9d95-4238-b38e-5cb1955dcad8" />

</td>
</tr>
</table>


# == WEB PAGE - SUPER ADMIN AND SELLER ONLY ===
# ============ SUPER ADMIN ==================
<img width="1919" height="904" alt="image" src="https://github.com/user-attachments/assets/a200aaa2-adfd-42e6-83bf-86b193464743" />
<img width="1919" height="906" alt="image" src="https://github.com/user-attachments/assets/43570fde-0429-4e9b-adf8-8e00df91a0d5" />
<img width="1883" height="904" alt="image" src="https://github.com/user-attachments/assets/c476c591-683a-4783-8c2b-b0cb0feeca4a" />


# ======== SELLER ============

<img width="1919" height="909" alt="image" src="https://github.com/user-attachments/assets/d447bde4-d876-4b73-ae89-8e3632bfef6a" />


##  Project Architecture

```
expo-ecommerce/
├── backend/              # Node.js + Express API
├── admin/                # React + Vite admin dashboard
├── mobile/               # Expo (React Native) mobile app
├── instructions/         # Setup & configuration guides
├── README.md            # This file (project overview & features)
└── package.json         # Root workspace config
```

##  Tech Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: Clerk
- **File Uploads**: Cloudinary
- **Background Jobs**: Inngest
- **Payments**: Stripe
- **Monitoring**: Sentry

### Admin Dashboard
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + DaisyUI
- **HTTP Client**: Axios
- **State Management**: TanStack React Query (v5)
- **Charts**: Recharts
- **Authentication**: @clerk/clerk-react
- **Icons**: Lucide React

### Mobile App
- **Framework**: Expo (React Native)
- **Navigation**: Expo Router
- **Styling**: NativeWind (Tailwind for React Native)
- **HTTP Client**: Axios
- **State Management**: TanStack React Query (v5)
- **Authentication**: @clerk/clerk-expo
- **Local Storage**: @react-native-async-storage/async-storage
- **Payments**: @stripe/stripe-react-native
- **Monitoring**: @sentry/react-native

##  Key Features

### For Buyers
- **Guest Browsing**: Browse products without authentication (admin-controlled toggle)
- **Product Discovery**: Browse products by category, search, and filters
- **Shopping Cart**: Add/remove items, manage quantities
- **Wishlist**: Save favorite products
- **Checkout**: Multiple payment methods (Stripe, COD)
- **Order Tracking**: View order status (pending → shipped → delivered)
- **Order History**: Access past orders and details
- **Reviews & Ratings**: Rate products and read reviews
- **Address Management**: Save and manage shipping addresses
- **User Profile**: Manage account and preferences

### For Sellers
- **Shop Management**: Create and manage personal shop
- **Product Management**: 
  - Upload products with images (Cloudinary)
  - Bulk operations
  - Stock management
- **Order Management**:
  - View orders containing their products
  - Update order status (pending → shipped → delivered → cancelled)
  - Track fulfillment
- **Analytics Dashboard**:
  - Sales by category
  - Total revenue
  - Units sold
  - Order metrics
  - Order history with filtering

### For Super Admin
- **Dashboard**: System-wide analytics and stats
- **Order Management**: View and update all orders
- **User Management**: Ban/unban users
- **Shop Management**: Approve/manage seller shops
- **Settings**: Toggle features (e.g., guest browsing)
- **Customer Management**: View all users and activity
- **Analytics**: System-wide insights

### System Features
- **Role-Based Access**: Buyer, Seller, Super Admin
- **Authentication**: Clerk (social login with Google/Apple)
- **Webhooks**: Clerk user sync with Inngest background jobs
- **Real-Time Updates**: React Query cache invalidation on actions
- **Error Handling**: Sentry integration for frontend/backend monitoring
- **Stripe Payments**: Secure card payments with payment intent
- **Cash on Delivery (COD)**: Alternative payment option
- **Image Uploads**: Cloudinary integration for product images
- **Responsive Design**: Mobile-first UI for all platforms

##  Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- MongoDB instance (local or cloud)
- Clerk account (for authentication)
- Cloudinary account (for image uploads)
- Stripe account (for payments)
- Inngest account (for background jobs)
- Sentry project (for error tracking)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd expo-ecommerce
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Admin
   cd ../admin
   npm install
   
   # Mobile
   cd ../mobile
   npm install
   ```

3. **Set up environment variables**
   - Create `.env` in each folder (backend, admin, mobile)
   - See instruction guides for required variables

4. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm start
   
   # Terminal 2: Admin Dashboard
   cd admin
   npm run dev
   
   # Terminal 3: Mobile App
   cd mobile
   npm start
   ```

5. **Access the applications**
   - Backend API: http://localhost:3000
   - Admin Dashboard: http://localhost:5173
   - Mobile: Use Expo Go app or scan QR code from terminal

##  Project Status

###  Implemented
- Multi-seller marketplace with shop management
- Buyer browsing (authenticated and guest)
- Guest role with limited features (no cart/wishlist/checkout)
- Product uploads with Cloudinary integration
- Order creation and management
- Status tracking (pending → shipped → delivered → cancelled)
- Seller order filtering and management
- Admin order management and status updates
- Seller analytics (by category, revenue, units sold)
- Admin analytics dashboard
- Stripe and COD payments
- Wishlist functionality
- Client-side role persistence
- Guest banner on mobile
- Multi-role routing (buyer, seller, super-admin)
- Clerk authentication with social login

###  In Progress / Planned
- Mobile seller analytics
- Advanced search and filters
- Notifications system
- Returns/refunds management
- Product recommendations
- Promotional codes

##  Project Structure

### Backend (`/backend`)
```
src/
├── config/           # Database and external service configs
├── controllers/      # Route handlers (shop, product, order, seller, etc.)
├── middleware/       # Auth, multer file upload, error handling
├── models/           # Mongoose schemas (Order, Product, Shop, User, etc.)
├── routes/           # API route definitions
├── seeds/            # Database seed scripts
└── server.js         # Main server entry point
```

### Admin Dashboard (`/admin`)
```
src/
├── components/       # Reusable UI components (Navbar, Sidebar, etc.)
├── layouts/          # Page layouts
├── lib/              # API client, utilities
├── pages/            # Page components (Dashboard, Orders, Products, etc.)
└── App.jsx          # Main app component
```

### Mobile App (`/mobile`)
```
app/                  # Expo Router navigation structure
├── (auth)/          # Authentication screens
├── (tabs)/          # Buyer tabs (shop, cart, profile)
├── (seller)/        # Seller screens
├── (profile)/       # User profile screens
└── product/         # Product detail screens
components/          # Reusable React Native components
context/             # Context providers (RoleContext, etc.)
hooks/               # Custom React hooks
lib/                 # API client, utilities
types/               # TypeScript types
```

##  Environment Variables

### Backend (.env)
```
MONGODB_URI=
CLERK_WEBHOOK_SECRET=
INNGEST_SIGNING_KEY=
INNGEST_EVENT_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRIPE_SECRET_KEY=
SENTRY_AUTH_TOKEN=
```

### Admin (.env)
```
VITE_CLERK_PUBLISHABLE_KEY=
SENTRY_AUTH_TOKEN=
```

### Mobile (.env)
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=
SENTRY_AUTH_TOKEN=
```

##  Troubleshooting

### Duplicate Key Error on Orders
**Issue**: E11000 duplicate key error on `clerkId` index
**Solution**: Run migration script to remove duplicates and recreate non-unique index
```bash
cd backend
node tools/dropDuplicateKeyIndex.js
node tools/removeDuplicateOrders.js
npm start
```

### AsyncStorage Not Available
**Issue**: "Native module is null" on Expo Go
**Solution**: Use in-memory fallback (current implementation) or create a development build
```bash
cd mobile
eas build --platform android --profile preview
```

### Guest Role Not Persisting
**Issue**: Guest role resets after app restart on Expo Go
**Solution**: This is expected with Expo Go. Create a development build for persistent storage.

### Orders Not Appearing in Seller Analytics
**Issue**: "Units Sold" shows 0 or incorrect values
**Solution**: Ensure order aggregation is working and product IDs are correctly handled
```bash
cd backend
node tools/checkSellerStats.js
```

---

##  Setup Instructions

For detailed setup and configuration steps, see the [instructions folder](./instructions/):

1. **[01-Initialize-Project.md](./instructions/01-initialize-project.md)** - Project initialization and structure
2. **[02-Backend-Setup.md](./instructions/02-backend-setup.md)** - Backend API configuration
3. **[03-Admin-Dashboard-Setup.md](./instructions/03-admin-dashboard-setup.md)** - Admin frontend setup
4. **[04-Mobile-App-Setup.md](./instructions/04-mobile-app-setup.md)** - Mobile app configuration
5. **[05-Authentication-Setup.md](./instructions/05-authentication-setup.md)** - Clerk authentication
6. **[06-Cloudinary-Setup.md](./instructions/06-cloudinary-setup.md)** - Image uploads
7. **[07-Stripe-Payments.md](./instructions/07-stripe-payments.md)** - Payment processing
8. **[08-Inngest-Webhooks.md](./instructions/08-inngest-webhooks.md)** - Background jobs
9. **[09-Sentry-Monitoring.md](./instructions/09-sentry-monitoring.md)** - Error tracking
10. **[10-Database-Migrations.md](./instructions/10-database-migrations.md)** - Migration scripts
