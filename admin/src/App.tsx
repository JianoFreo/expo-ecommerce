import React from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "./shared";
import Dashboard from "./pages/Dashboard";
import BuyerHome from "./pages/BuyerHome";
import SellerHome from "./pages/SellerHome";
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

type RoleView = "buyer" | "seller" | "super-admin";

export default function App() {
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [viewerMode, setViewerMode] = React.useState<RoleView>("buyer");
  const [profileRole, setProfileRole] = React.useState<RoleView | null>(null);
  const [profileLoaded, setProfileLoaded] = React.useState(false);

  React.useEffect(() => {
    let alive = true;

    if (!isLoaded) return;

    if (!isSignedIn) {
      setProfileRole(null);
      setProfileLoaded(true);
      return;
    }

    axios
      .get("/user/profile")
      .then((res) => {
        if (!alive) return;
        const fetchedRole = (res.data?.user?.role || "buyer") as RoleView;
        setProfileRole(fetchedRole);
        setViewerMode(fetchedRole === "super-admin" ? "super-admin" : "buyer");
      })
      .catch(() => {
        if (!alive) return;
        setProfileRole("buyer");
        setViewerMode("buyer");
      })
      .finally(() => {
        if (!alive) return;
        setProfileLoaded(true);
      });

    return () => {
      alive = false;
    };
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || (isSignedIn && !profileLoaded)) {
    return <PageLoader />;
  }

  const currentRole: RoleView = viewerMode === "super-admin" && profileRole === "super-admin" ? "super-admin" : viewerMode === "seller" && (profileRole === "seller" || profileRole === "super-admin") ? "seller" : "buyer";

  const defaultPath = currentRole === "super-admin" ? "/dashboard" : currentRole === "seller" ? "/seller" : "/buyer";

  const canAccessAdmin = currentRole === "super-admin";
  const canAccessSeller = currentRole === "seller" || currentRole === "super-admin";
  const isBuyerPath = location.pathname.startsWith("/buyer") || location.pathname === "/";
  const isSellerPath = location.pathname.startsWith("/seller");
  const isAdminPath = ["/dashboard", "/users", "/shops", "/banner", "/reviews"].some((path) => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white">
      {isSignedIn ? <Navbar role={currentRole} onSwitchRole={setViewerMode} /> : null}
      <div className="flex min-h-screen">
        {isSignedIn ? <Sidebar role={currentRole} /> : null}
        <main className="flex-1 p-4 md:p-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/buyer"
              element={
                <RequireAuth>
                  <BuyerHome />
                </RequireAuth>
              }
            />
            <Route
              path="/seller"
              element={
                <RequireAuth allowSeller={true} currentRole={currentRole}>
                  <SellerHome />
                </RequireAuth>
              }
            />
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
                <RequireAuth requireAdmin={true} allowSeller={false} currentRole={currentRole}>
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
                <RequireAuth requireAdmin={true} allowSeller={false} currentRole={currentRole}>
                  <Shops />
                </RequireAuth>
              }
            />
            <Route
              path="/banner"
              element={
                <RequireAuth requireAdmin={true} allowSeller={false} currentRole={currentRole}>
                  <Banner />
                </RequireAuth>
              }
            />
            <Route
              path="/reviews"
              element={
                <RequireAuth requireAdmin={true} allowSeller={false} currentRole={currentRole}>
                  <Reviews />
                </RequireAuth>
              }
            />
            <Route path="/" element={<Navigate to={defaultPath} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function RequireAuth({ children, requireAdmin = false, allowSeller = true, currentRole }: { children: JSX.Element; requireAdmin?: boolean; allowSeller?: boolean; currentRole?: RoleView }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <PageLoader />;
  if (!isSignedIn) return <Navigate to="/login" replace />;
  const role = currentRole || "buyer";
  if (requireAdmin && role !== "super-admin") return <Navigate to="/buyer" replace />;
  if (!allowSeller && role === "seller") return <Navigate to="/buyer" replace />;
  return children;
}
