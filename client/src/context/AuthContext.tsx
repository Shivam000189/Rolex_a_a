import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "../types";
import type { User } from "../types";
import { authAPI } from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  isUser: boolean;
  isStoreOwner: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUserState(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to restore auth session:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUserState(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUserState(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const setUser = (updatedUser: User | null) => {
    setUserState(updatedUser);
    if (updatedUser) {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem("user");
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    await authAPI.updatePassword({ currentPassword, newPassword });
  };

  const isAdmin = user?.role === UserRole.ADMIN;
  const isUser = user?.role === UserRole.USER;
  const isStoreOwner = user?.role === UserRole.STORE_OWNER;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        isUser,
        isStoreOwner,
        login,
        logout,
        updatePassword,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
