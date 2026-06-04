import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Users from "./pages/Users";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) return <Navigate to="/login" replace />;
  return children;
}
