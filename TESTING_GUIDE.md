# 🧪 Complete Testing Guide - Admin & Seller Implementation

## ✅ Status Check

- ✅ Backend: Running on `http://localhost:3000`
- ✅ MongoDB: Connected
- ✅ Mobile Expo: Ready on `http://localhost:8081`
- ✅ QR Code: Ready for Expo Go

---

## 📱 How to Test

### Option 1: iOS (Recommended)
1. Install **Expo Go** app from App Store
2. Scan the QR code shown in terminal
3. App opens in Expo Go

### Option 2: Android
1. Install **Expo Go** app from Google Play
2. Scan the QR code shown in terminal
3. App opens in Expo Go

### Option 3: Web Browser
1. Press `w` in mobile terminal
2. Opens at `http://localhost:8081`
3. Limited functionality (some native features won't work)

---

## 🎯 Test Scenarios

### Test 1: Fresh User Signs In as Buyer

**Steps:**
1. Open app
2. **Expected**: Role selection screen with "Shop as Buyer" and "Sell as Seller"
3. Tap "Shop as Buyer" 
4. **Expected**: Navigate to auth screen
5. Tap "Continue with Google" or "Continue with Apple"
6. Complete Clerk sign-in
7. **Expected**: 
   - Backend sets role to `user` (if first time)
   - App routes to `/(tabs)/` (buyer dashboard)
   - See tabs: Home | Cart | Profile
8. Tap Profile tab
9. **Expected**: See "Switch Role" and "Sign Out" buttons

**What's Happening Behind Scenes:**
```
User clicks buyer → RoleContext.setSelectedRole('buyer')
Signs in → useSocialAuth calls GET /api/user/profile
Backend checks email (not super-admin) → role = 'user'
Router pushes to /(tabs)/ based on role
```

---

### Test 2: Fresh User Signs In as Seller

**Steps:**
1. Open app (or clear cache if logged in: `npx expo -c`)
2. See role selection screen
3. Tap "Sell as Seller"
4. **Expected**: Navigate to auth screen
5. Tap "Continue with Google" or "Continue with Apple"
6. Sign in with NEW account (preferably different from Test 1)
7. **Expected**: 
   - useSocialAuth calls GET /api/user/profile (user exists but role='user')
   - useSocialAuth calls POST /api/user/promote-to-seller
   - Backend updates role to 'seller', creates Shop
   - App routes to `/(seller)/` (seller dashboard)
   - See tabs: Dashboard | Products | Orders | Analytics | Profile
8. Check each tab:
   - **Dashboard**: Shows empty/zero stats
   - **Products**: Empty list (no products yet)
   - **Orders**: Empty list (no orders yet)
   - **Analytics**: All zeros
   - **Profile**: Shop name shown (auto-generated), buttons for Edit/Switch Role/Logout

**What's Happening Behind Scenes:**
```
User clicks seller → RoleContext.setSelectedRole('seller')
Signs in → useSocialAuth calls GET /api/user/profile
Backend checks email (not super-admin) → returns role='user'
useSocialAuth sees selectedRole='seller' AND user.role!='seller'
Calls POST /api/user/promote-to-seller
Backend creates Shop, updates role='seller'
Router pushes to /(seller)/ based on role
```

---

### Test 3: Super-Admin (magtangob65@gmail.com) Signs In

**Steps:**
1. Clear app cache: `npx expo -c`
2. Open app
3. See role selection screen
4. Select ANY role (buyer or seller - doesn't matter)
5. Sign in with `magtangob65@gmail.com`
6. **Expected**:
   - Backend detects super-admin email
   - Automatically sets role='super-admin' (regardless of selection)
   - App routes to `/(super-admin)/` (admin dashboard)
   - See tabs: Dashboard | Products | Orders | Users | Shops

**What's Happening Behind Scenes:**
```
User picks role → RoleContext.setSelectedRole(role)
Signs in with magtangob65@gmail.com
useSocialAuth calls GET /api/user/profile
Backend checks email matches ADMIN_EMAIL
Backend forces role='super-admin'
useSocialAuth checks response.user.role == 'super-admin'
Router pushes to /(super-admin)/ instead of /(seller)/ or /(tabs)/
```

---

### Test 4: Switch Roles

**Prerequisites:** Must be logged in

**Steps:**
1. Logged in as any role (buyer, seller, or admin)
2. Go to Profile tab (different locations based on role):
   - Buyer: Tab labeled "Profile" in bottom nav
   - Seller: Tab labeled "Profile" in bottom nav
   - Admin: No profile section in tabs (not implemented for admin)
3. Tap "Switch Role" button (orange outline)
4. **Expected**:
   - Signs out
   - Clears RoleContext
   - Redirects to `/role-selection`
   - See role picker again
5. Select different role
6. Sign in again (can use same account or different)
7. **Expected**: Routes to new role's dashboard

**What's Happening Behind Scenes:**
```
User taps "Switch Role" → useAuthManager.handleSwitchRole()
Calls signOut() from Clerk
Calls setSelectedRole(null) from context
Redirects to /role-selection
User picks new role
Entire auth flow repeats with new selection
```

---

### Test 5: Logout

**Steps:**
1. Logged in as any role
2. Go to Profile (buyer or seller)
3. Tap "Sign Out" button (red)
4. **Expected**:
   - Signs out
   - Redirects to `/role-selection`
   - Fully logged out

---

### Test 6: Seller Dashboard Data Flow

**Prerequisites:** 
- Signed in as seller
- Backend has some products/orders for this seller's shop

**Steps:**
1. On Seller Dashboard (`/(seller)/index.tsx`)
2. See 4 stat cards
3. Tap each number to check calculations:
   - Total Products: Count of products in seller's shop
   - Total Orders: Count of orders containing this seller's products
   - Pending Orders: Count with status='pending'
   - Revenue: Would show sales (stubbed as 0 currently)
4. Go to Products tab
5. **Expected**: List of seller's products with price & stock
6. Go to Orders tab
7. **Expected**: List of orders with status badges (Pending/Shipped/Delivered)
8. Go to Analytics tab
9. **Expected**: 
   - Total Sales: Sum of order totals
   - Total Orders: Count
   - Average Order Value: Total Sales / Orders
   - Conversion Rate: 0% (placeholder)

---

### Test 7: Super-Admin Dashboard Data Flow

**Prerequisites:**
- Signed in as magtangob65@gmail.com
- Backend has products, orders, users, shops

**Steps:**
1. On Admin Dashboard (`/(super-admin)/index.tsx`)
2. See 5 stat cards with platform-wide data
3. Go to Products tab
4. **Expected**: ALL products from all sellers
5. Go to Orders tab
6. **Expected**: ALL orders from all users
7. Go to Users tab
8. **Expected**: ALL users list with roles shown
9. Go to Shops tab
10. **Expected**: ALL shops with owner info and active status

---

## 🔍 Troubleshooting

### Problem: App shows blank screen after selecting role
**Solution:**
1. Check if backend is running: `npm run dev` in backend folder
2. Check if auth endpoint responds: `curl http://localhost:3000/api/user/profile` (with auth header)
3. Check browser console for errors: Press `m` in expo terminal, then "Open debugger"
4. Clear cache: `npx expo -c` and restart

### Problem: Can't sign in with Google
**Solution:**
1. Verify Clerk is configured correctly in `.env.local`
2. Check that `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is set
3. Ensure Clerk app allows OAuth providers (Google/Apple)
4. Try again or use different account

### Problem: After sign-in, stuck on auth screen
**Solution:**
1. Check backend is running
2. Reload app: Press `r` in expo terminal
3. Check API call succeeds: Look at network tab in debugger
4. Verify `/api/user/profile` endpoint doesn't error
5. Check Clerk user data is complete (email, name)

### Problem: Role not updating to seller
**Solution:**
1. Check backend nodemon restarted after seller.controller.js was created
2. Restart backend: Kill process (`Ctrl+C`) and `npm run dev`
3. Check shop creation shows no errors in backend console
4. Try different email (might already be seller from previous test)

### Problem: Super-admin not routing to admin dashboard
**Solution:**
1. Verify email is EXACTLY: `magtangob65@gmail.com` (case-sensitive)
2. Check backend `ADMIN_EMAIL` env var matches
3. Look at backend logs for role assignment
4. Clear app cache and retry: `npx expo -c`

---

## 📊 Data Flow Diagrams

### Sign-In Flow
```
┌─────────────────────────────────────────────────┐
│ User Opens App                                  │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ RoleContext.selectedRole == null ?              │
│ YES → Show Role Picker                          │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ User Selects Buyer/Seller/Admin                 │
│ setSelectedRole(choice)                         │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ Redirect to /(auth)/ (Auth Screen)              │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ User Signs In with Clerk (Google/Apple)         │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│ useSocialAuth: GET /api/user/profile            │
└────────────────────┬────────────────────────────┘
                     ↓
         ┌───┴───┐
         ↓       ↓
    ┌────────┐  ┌──────────────┐
    │seller? │  │super-admin?  │
    └───┬────┘  │ (email check)│
        │       └──────┬───────┘
        ↓              ↓
    POST to         Force role=
    /promote-to-   super-admin
    seller         (if email match)
        │              │
        └────┬─────────┘
             ↓
    Router based on final role:
    user → /(tabs)/
    seller → /(seller)/
    super-admin → /(super-admin)/
```

### Seller Data Load
```
Seller Dashboard Opens
  ↓
Request /api/seller/stats
  ↓
Backend:
  1. Get seller's shop
  2. Count products in shop
  3. Find orders with shop products
  4. Filter by status='pending'
  ↓
Display stats in cards
```

---

## 🎬 Demo Script (5 minutes)

1. **Intro (30s)**: "We now have 3 role-based dashboards in the mobile app"
2. **Buyer Demo (1m)**:
   - Select buyer → Sign in → Show buyer tabs
   - Show profile with Switch Role button
3. **Seller Demo (1m)**:
   - Switch role → Sign in as seller → Auto-promoted
   - Show seller-specific tabs (Products, Orders, Analytics)
   - Show shop profile
4. **Admin Demo (1m)**:
   - Switch role → Sign in as super-admin email
   - Show admin dashboard with all platform data
5. **Features (1m)**:
   - Switch roles anytime
   - Logout
   - Clean separation of concerns

---

## ✅ Sign-In Test Accounts

| Role | Email | Action |
|------|-------|--------|
| Buyer | Any Google | Select Buyer → Sign in |
| Seller | Any different Google | Select Seller → Sign in (auto-promoted) |
| Super-Admin | magtangob65@gmail.com | Any selection → Auto-routes to admin |

---

## 📈 Performance Tips

- **Cold Start**: First load may take 10-15s as Metro bundles
- **Hot Reload**: Pressing `r` reloads app in ~2-3s
- **Network**: API calls show in debugger (press `j`)
- **Console**: Backend logs show in backend terminal, mobile logs in debugger

---

## 🎯 Success Criteria

✅ Test passes if:
1. Role picker appears on fresh open
2. Can sign in as buyer → see buyer tabs
3. Can sign in as seller → auto-promoted → see seller tabs
4. Can sign in as super-admin → see admin tabs
5. Can switch roles anytime
6. Can logout and retest
7. No crashes or blank screens
8. All API calls succeed (200 status)
9. Data displays correctly for each role

🚀 **You're ready to test!**
