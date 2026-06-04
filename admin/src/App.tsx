import React from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "./shared";
import Dashboard from "./pages/Dashboard";
import BuyerHome from "./pages/BuyerHome";
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
  const [role, setRole] = React.useState<RoleView | null>(null);
  const [roleLoaded, setRoleLoaded] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    let alive = true;

    if (!isLoaded) return;

    if (!isSignedIn) {
      setRole(null);
      setRoleLoaded(true);
      return;
    }

    axios
      .get("/user/profile")
      .then((res) => {
        if (!alive) return;
        const fetchedRole = (res.data?.user?.role || "buyer") as RoleView;
        setRole(fetchedRole);
      })
      .catch(() => {
        if (!alive) return;
        setRole("buyer");
      })
      .finally(() => {
        if (!alive) return;
        setRoleLoaded(true);
      });

    return () => {
      alive = false;
    };
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || (isSignedIn && !roleLoaded)) {
    return <PageLoader />;
  }

  const currentRole: RoleView = role || "buyer";

  const defaultPath = currentRole === "super-admin" ? "/dashboard" : currentRole === "seller" ? "/seller" : "/buyer";

  const canAccessAdmin = currentRole === "super-admin";
  const canAccessSeller = currentRole === "seller" || currentRole === "super-admin";

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-base-content">
      {isSignedIn ? <Navbar role={currentRole} onSwitchRole={(nextRole) => navigate(nextRole === "buyer" ? "/buyer" : nextRole === "seller" ? "/seller" : "/dashboard", { replace: true })} /> : null}
      <div className={isSignedIn ? "flex" : "flex min-h-screen"}>
        {isSignedIn ? <Sidebar role={currentRole} /> : null}
        <main className={isSignedIn ? "flex-1 p-4 md:p-6" : "flex-1 p-0"}>
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
              path="/seller"
              element={
                <RequireAuth allowSeller={true} currentRole={currentRole}>
                  <Seller />
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
