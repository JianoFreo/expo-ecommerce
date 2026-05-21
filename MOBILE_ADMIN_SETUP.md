# Mobile Admin & Seller Implementation - Setup Guide

## Overview
Implemented a 3-role system (buyer/seller/super-admin) in the mobile Expo app with automatic seller promotion and role-based routing.

---

## What Was Built

### 1. Backend Changes

#### User Model (`backend/src/models/user.model.js`)
- Updated role enum: `user / seller / super-admin`
- Removed old `admin` role

#### New Endpoints

**`GET /api/user/profile`** - Get current user's profile
- Returns user object with role and their shop (if seller)
- Usage: Check role after sign-in to route correctly
- Auto-promotes super-admin based on email

**`POST /api/user/promote-to-seller`** - Convert user to seller
- Takes optional `shopName` in body
- Auto-creates shop with owner reference
- Returns user + newly created shop
- Called automatically after seller signs in

#### Auth Middleware Updates
- `adminOnly` → now maps to super-admin (backwards compatible with web admin)
- `sellerOnly` → new middleware for seller-level access
- `superAdminOnly` → kept as-is for super-admin routes

---

### 2. Mobile Changes

#### Context (`mobile/context/RoleContext.tsx`)
- Global role selection state
- Stores `'buyer' | 'seller' | null`
- Used before Clerk sign-in to determine user intent

#### New Hook (`mobile/hooks/useAuthManager.ts`)
- `handleLogout()` - Sign out + clear role + redirect to role picker
- `handleSwitchRole()` - Same as logout (resets to role picker)

#### Auth Flow
1. User lands on app
2. Role Context = null → redirects to `/role-selection`
3. **Role Selection Screen** (`mobile/app/role-selection.tsx`)
   - Choose "Shop as Buyer" or "Sell as Seller"
   - Stores choice in RoleContext
4. **Auth Screen** (`mobile/app/(auth)/index.tsx`)
   - Checks if role selected
   - Shows Google/Apple sign-in
5. **useSocialAuth Hook** (updated)
   - After SSO, calls `GET /api/user/profile`
   - If role was 'seller', calls `POST /api/user/promote-to-seller`
   - Routes based on user's role:
     - `super-admin` → `/(super-admin)/`
     - `seller` → `/(seller)/`
     - `user` → `/(tabs)/` (buyer)

---

### 3. New Dashboard UIs

#### Seller Dashboard (`mobile/app/(seller)/`)
- **Tabs**: Dashboard | Products | Orders | Analytics | Profile
- Dashboard: Stats cards (Total Products, Orders, Pending Orders, Revenue)
- Products: List seller's products with prices & stock
- Orders: List seller's orders with status badges
- Analytics: Sales metrics (revenue, orders, AOV, conversion)
- Profile: Shop info + Switch Role + Logout buttons

#### Super-Admin Dashboard (`mobile/app/(super-admin)/`)
- **Tabs**: Dashboard | Products | Orders | Users | Shops
- Dashboard: Platform-wide stats (Total Products, Orders, Users, Shops, Revenue)
- Products: All products (all sellers)
- Orders: All orders (all users)
- Users: All users list with roles
- Shops: All shops with owner info & active status

#### Buyer UI (Existing) - Enhanced
- Profile tab: Added "Switch Role" button
- Can switch between buyer/seller/super-admin by signing out and choosing a new role

---

## API Endpoints Needed

### Seller Endpoints (create if not already exists)
```
GET /api/seller/products       - User's products
GET /api/seller/orders         - User's orders
GET /api/seller/stats          - Dashboard stats (products, orders, pending, revenue)
GET /api/seller/analytics      - Analytics (sales, orders, AOV, conversion)
```

### Admin Endpoints (already exist)
```
GET /api/admin/products        - getAllProducts
GET /api/admin/orders          - getAllOrders
GET /api/admin/users           - getAllUsers  
GET /api/admin/shops           - getAllShopsAdmin
GET /api/admin/stats           - getDashboardStats
POST /api/admin/migrations/*   - various migrations
```

---

## Sign-In Flow Example

### Buyer Signs In
1. Opens app → sees role picker
2. Clicks "Shop as Buyer"
3. Goes to auth screen → signs in with Google
4. Backend checks email: not super-admin → stays as `user`
5. Routes to `/(tabs)/` (buyer dashboard)

### New Seller Signs In
1. Opens app → sees role picker
2. Clicks "Sell as Seller"
3. Goes to auth screen → signs in with Google
4. Backend calls `getCurrentUserProfile`:
   - Email not super-admin → role = `user`
   - No shop yet
5. Mobile app calls `POST /api/user/promote-to-seller`
   - Role updated to `seller` in DB
   - Shop created automatically
6. Routes to `/(seller)/` (seller dashboard)

### Super-Admin (magtangob65@gmail.com) Signs In
1. Role picker → email doesn't matter (same sign-in flow)
2. Signs in with Google
3. Backend `getCurrentUserProfile` detects super-admin email:
   - Auto-sets role = `super-admin` if not already
4. Routes to `/(super-admin)/` (admin dashboard)

---

## Testing Checklist

- [ ] Role selection screen appears on first app load
- [ ] Can select buyer → signs in → routes to buyer tabs
- [ ] Can select seller → signs in → auto-promoted → routes to seller tabs
- [ ] Can sign in as magtangob65@gmail.com → routes to super-admin tabs
- [ ] Seller endpoints return correct data
- [ ] "Switch Role" button signs out + returns to role picker
- [ ] "Logout" button signs out + returns to role picker
- [ ] Web admin still works independently

---

## Configuration Needed

### Environment Variables
- Backend: `ADMIN_EMAIL=magtangob65@gmail.com` (already set?)
- Mobile: No new vars needed (uses existing Clerk + backend config)

### Database
- User model updated (migration may be needed for existing users if changing role enum)
- No schema changes needed beyond role enum

---

## Next Steps (Optional)

1. **Seller Features**
   - Add product creation/editing screen
   - Add order status update functionality
   - Add analytics charts

2. **Super-Admin Features**
   - Add user banning/unbanning
   - Add shop approval workflow
   - Add detailed activity logs

3. **General**
   - Add socket.io for real-time order updates
   - Add push notifications
   - Add seller analytics charts with react-native charts

---

## Troubleshooting

**Issue**: Role selection not showing
- Check RoleProvider is wrapping the app in `_layout.tsx`
- Clear cache: `expo -c`

**Issue**: After sign-in, stuck on auth screen
- Check `getCurrentUserProfile` endpoint is working
- Verify Clerk is properly configured
- Check browser console for API errors

**Issue**: Seller not promoted
- Verify `promote-to-seller` endpoint is being called
- Check backend logs for shop creation errors
- Ensure user's email is not super-admin email

**Issue**: Super-admin doesn't route to admin dashboard
- Verify email is exactly `magtangob65@gmail.com` in Clerk
- Check `getCurrentUserProfile` is setting role correctly
- Clear app cache and re-sign in

