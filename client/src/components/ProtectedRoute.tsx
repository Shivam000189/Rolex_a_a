import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";
import type { UserRole as UserRoleType } from "../types";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRoleType[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-sm">Verifying authentication...</p>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect user to their appropriate default page based on role
    if (user.role === UserRole.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === UserRole.STORE_OWNER) {
      return <Navigate to="/store-owner/dashboard" replace />;
    } else {
      return <Navigate to="/user/stores" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
