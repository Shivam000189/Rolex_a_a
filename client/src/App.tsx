import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { UserRole } from "./types";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import PasswordUpdate from "./pages/PasswordUpdate";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Stores from "./pages/admin/Stores";
import UserDetails from "./pages/admin/UserDetails";

// User Pages
import StoresList from "./pages/user/StoresList";
import UsersList from "./pages/user/UsersList";

// Store Owner Pages
import StoreOwnerDashboard from "./pages/storeOwner/Dashboard";

// Helper component for role-based home redirect
const RootRedirect: React.FC = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === UserRole.ADMIN) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === UserRole.STORE_OWNER) {
    return <Navigate to="/store-owner/dashboard" replace />;
  }

  return <Navigate to="/user/stores" replace />;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public Routes - No Navbar */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Root Redirect based on user state and role */}
              <Route path="/" element={<RootRedirect />} />

              {/* Protected Routes inside App Shell Layout with Navbar */}
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                {/* Password Update - All Authenticated Roles */}
                <Route path="/password" element={<PasswordUpdate />} />

                {/* Admin Only Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                      <Users />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/stores"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                      <Stores />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users/:id"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                      <UserDetails />
                    </ProtectedRoute>
                  }
                />

                {/* User Only Routes */}
                <Route
                  path="/user/stores"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.USER]}>
                      <StoresList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/users"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.USER]}>
                      <UsersList />
                    </ProtectedRoute>
                  }
                />

                {/* Store Owner Only Routes */}
                <Route
                  path="/store-owner/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={[UserRole.STORE_OWNER]}>
                      <StoreOwnerDashboard />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
