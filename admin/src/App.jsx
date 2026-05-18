import { Navigate, Route, Routes } from "react-router";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "@clerk/clerk-react";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersPage from "./pages/CustomersPage";
import DashboardLayout from "./layouts/DashboardLayout";

import PageLoader from "./components/PageLoader";

function App() {
  /* The line `const { isSignedIn, isLoaded } = useAuth();` is using the `useAuth` hook provided by the
  `@clerk/clerk-react` library to access the authentication state of the user. */
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <PageLoader />;

  return (
    <Routes>
      <Route path="/login" element={isSignedIn ? <Navigate to={"/dashboard"} /> : <LoginPage />} />

      <Route path="/" element={isSignedIn ? <DashboardLayout /> : <Navigate to={"/login"} />}> 
      {/* if the user is not signed in, they will be redirected to the login page. If they are signed in */}
        <Route index element={<Navigate to={"dashboard"} />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="customers" element={<CustomersPage />} />
      </Route>
    </Routes>

    // root/dashboard    root/products     root/orders    root/customers
  );
}

export default App;