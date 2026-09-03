import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserRole } from "../types";
import type { UserRole as UserRoleType } from "../types";
import {
  Store as StoreIcon,
  LayoutDashboard,
  Users,
  Building2,
  KeyRound,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User as UserIcon,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin, isStoreOwner, isUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleBadge = (role?: UserRoleType) => {
    switch (role) {
      case UserRole.ADMIN:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3 h-3" /> Admin
          </span>
        );
      case UserRole.STORE_OWNER:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <ShoppingBag className="w-3 h-3" /> Store Owner
          </span>
        );
      case UserRole.USER:
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <UserIcon className="w-3 h-3" /> User
          </span>
        );
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
      isActive
        ? "bg-indigo-50 text-indigo-700 shadow-xs font-semibold"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
      isActive
        ? "bg-indigo-50 text-indigo-700 font-semibold"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link
              to={
                isAdmin
                  ? "/admin/dashboard"
                  : isStoreOwner
                  ? "/store-owner/dashboard"
                  : "/user/stores"
              }
              className="flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <StoreIcon className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-linear-to-r from-slate-900 via-indigo-950 to-indigo-800 bg-clip-text text-transparent tracking-tight">
                  StoreRating
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-1">
                  Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {isAdmin && (
                <>
                  <NavLink to="/admin/dashboard" className={navLinkClass}>
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </NavLink>
                  <NavLink to="/admin/users" className={navLinkClass}>
                    <Users className="w-4 h-4" />
                    Users
                  </NavLink>
                  <NavLink to="/admin/stores" className={navLinkClass}>
                    <Building2 className="w-4 h-4" />
                    Stores
                  </NavLink>
                </>
              )}

              {isUser && (
                <>
                  <NavLink to="/user/stores" className={navLinkClass}>
                    <Building2 className="w-4 h-4" />
                    Stores
                  </NavLink>
                  <NavLink to="/user/users" className={navLinkClass}>
                    <Users className="w-4 h-4" />
                    Users
                  </NavLink>
                </>
              )}

              {isStoreOwner && (
                <>
                  <NavLink to="/store-owner/dashboard" className={navLinkClass}>
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </NavLink>
                </>
              )}
            </div>
          </div>

          {/* User Profile Dropdown & Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-semibold text-slate-800 leading-none truncate max-w-[150px]">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate max-w-[150px] mt-0.5">
                      {user.email}
                    </p>
                  </div>
                  <div className="ml-1">{getRoleBadge(user.role)}</div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                      <div className="mt-2">{getRoleBadge(user.role)}</div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/password"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <KeyRound className="w-4 h-4 text-slate-500" />
                        Update Password
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs shadow-indigo-200 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          {user && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4 border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-base shadow-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                <div className="mt-1">{getRoleBadge(user.role)}</div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {isAdmin && (
              <>
                <NavLink
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </NavLink>
                <NavLink
                  to="/admin/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <Users className="w-5 h-5" />
                  Users
                </NavLink>
                <NavLink
                  to="/admin/stores"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <Building2 className="w-5 h-5" />
                  Stores
                </NavLink>
              </>
            )}

            {isUser && (
              <>
                <NavLink
                  to="/user/stores"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <Building2 className="w-5 h-5" />
                  Stores
                </NavLink>
                <NavLink
                  to="/user/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <Users className="w-5 h-5" />
                  Users
                </NavLink>
              </>
            )}

            {isStoreOwner && (
              <>
                <NavLink
                  to="/store-owner/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileNavLinkClass}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </NavLink>
              </>
            )}

            {user && (
              <NavLink
                to="/password"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                <KeyRound className="w-5 h-5" />
                Update Password
              </NavLink>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200">
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
