import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Users from "./pages/Users";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import OrderDetail from "./pages/OrderDetail";
import Shops from "./pages/Shops";
import Banner from "./pages/Banner";
import Seller from "./pages/Seller";
import Reviews from "./pages/Reviews";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import PageLoader from "./components/PageLoader";

export default function App() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-base-content">
      {isSignedIn ? <Navbar /> : null}
      <div className={isSignedIn ? "flex" : "flex min-h-screen"}>
        {isSignedIn ? <Sidebar /> : null}
        <main className={isSignedIn ? "flex-1 p-4 md:p-6" : "flex-1 p-0"}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/products"
              element={
                <RequireAuth>
                  <Products />
                </RequireAuth>
              }
            />
            <Route
              path="/users"
              element={
                <RequireAuth>
                  <Users />
                </RequireAuth>
              }
            />
            <Route
              path="/orders"
              element={
                <RequireAuth>
                  <Orders />
                </RequireAuth>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <RequireAuth>
                  <OrderDetail />
                </RequireAuth>
              }
            />
            <Route
              path="/shops"
              element={
                <RequireAuth>
                  <Shops />
                </RequireAuth>
              }
            />
            <Route
              path="/banner"
              element={
                <RequireAuth>
                  <Banner />
                </RequireAuth>
              }
            />
            <Route
              path="/seller"
              element={
                <RequireAuth>
                  <Seller />
                </RequireAuth>
              }
            />
            <Route
              path="/reviews"
              element={
                <RequireAuth>
                  <Reviews />
                </RequireAuth>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <PageLoader />;
  if (!isSignedIn) return <Navigate to="/login" replace />;
  return children;
}
