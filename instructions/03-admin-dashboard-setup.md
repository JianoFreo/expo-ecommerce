# 03 - Admin Dashboard Setup

## Overview

Set up the React + Vite admin dashboard for multi-seller marketplace management.

## Prerequisites

- Node.js v18+
- Admin folder initialized

## Installation Steps

### 1. Initialize Vite Project

From the `admin/` directory:

```bash
npm create vite@latest . -- --template react
npm install
```

### 2. Install UI & Styling

```bash
npm install -D tailwindcss postcss autoprefixer
npm install -D daisyui
npx tailwindcss init -p
```

### 3. Configure Tailwind

Update `tailwind.config.js`:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["dark"],
  },
}
```

### 4. Install Core Dependencies

```bash
npm install axios react-router
npm install @tanstack/react-query
npm install recharts
npm install lucide-react
npm install @clerk/clerk-react
```

### 5. Create Project Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   └── PageLoader.jsx
├── layouts/
│   └── DashboardLayout.jsx
├── lib/
│   ├── api.js
│   ├── axios.js
│   └── utils.js
├── pages/
│   ├── DashboardPage.jsx
│   ├── OrdersPage.jsx
│   ├── ProductsPage.jsx
│   ├── CustomersPage.jsx
│   └── LoginPage.jsx
├── App.jsx
├── index.css
└── main.jsx
```

### 6. Create .env

Create `admin/.env`:

```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
SENTRY_AUTH_TOKEN=your_sentry_auth_token (optional)
```

### 7. Start Dev Server

```bash
npm run dev
```

Server will run at `http://localhost:5173`

## Key Components

### Navbar.jsx
Navigation bar with user profile and current page indicator.

### Sidebar.jsx
Navigation sidebar with role-based links (Admin vs Seller).

### DashboardLayout.jsx
Main layout wrapper for all dashboard pages.

### Pages
- **DashboardPage**: System overview and analytics
- **OrdersPage**: All orders management (admin only)
- **SellerOrdersPage**: Seller's orders (seller only)
- **ProductsPage**: Product management
- **CustomersPage**: User management (admin only)

## Build for Production

```bash
npm run build
```

This creates a `dist/` folder ready for deployment.

## Next Steps

- [04-Mobile-App-Setup.md](./04-mobile-app-setup.md) - Set up mobile app
- [05-Authentication-Setup.md](./05-authentication-setup.md) - Configure Clerk
