import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { adminAPI } from "../../services/api";
import { UserRole } from "../../types";
import type { User } from "../../types";
import { StarRating } from "../../components/StarRating";
import {
  User as UserIcon,
  Mail,
  MapPin,
  Calendar,
  ArrowLeft,
  ShieldCheck,
  ShoppingBag,
  Store,
  ShieldAlert,
} from "lucide-react";

export const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await adminAPI.getUserDetails(id);
        setUser(res.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load user details"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [id]);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Administrator
          </span>
        );
      case UserRole.STORE_OWNER:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
            <ShoppingBag className="w-3.5 h-3.5" /> Store Owner
          </span>
        );
      case UserRole.USER:
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <UserIcon className="w-3.5 h-3.5" /> Normal User
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded-md animate-pulse" />
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 space-y-6 animate-pulse">
          <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
            <div className="w-20 h-20 rounded-2xl bg-slate-200" />
            <div className="space-y-2 flex-1">
              <div className="h-7 w-48 bg-slate-200 rounded-md" />
              <div className="h-4 w-32 bg-slate-200 rounded-md" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-16 bg-slate-100 rounded-xl" />
            <div className="h-16 bg-slate-100 rounded-xl" />
            <div className="h-16 bg-slate-100 rounded-xl md:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </Link>
        <div className="p-6 bg-white rounded-2xl border border-rose-200 shadow-sm text-rose-700 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-bold text-base">User Not Found</p>
            <p className="text-sm text-rose-600 mt-0.5">
              {error || "The requested user profile does not exist or could not be loaded."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <div>
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </Link>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 sm:p-8 space-y-8">
        {/* User Identity Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-linear-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-md shadow-indigo-200">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {user.name}
                </h1>
                {getRoleBadge(user.role)}
              </div>
              <p className="text-slate-500 text-sm mt-1">User Identifier: #{user.id}</p>
            </div>
          </div>
        </div>

        {/* Profile Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Email Address
              </p>
              <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                {user.email}
              </p>
            </div>
          </div>

          {/* Joined Date */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Member Since
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-3.5 md:col-span-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Residential Address
              </p>
              <p className="text-sm font-semibold text-slate-800 mt-0.5 whitespace-pre-line">
                {user.address}
              </p>
            </div>
          </div>
        </div>

        {/* Conditional Store Information (Only for STORE_OWNER with ownedStore) */}
        {user.role === UserRole.STORE_OWNER && user.ownedStore && (
          <div className="pt-2">
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/50">
              {/* Background ambient light */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-3">
                    <Store className="w-3.5 h-3.5 text-indigo-400" /> Managed Store
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {user.ownedStore.name}
                  </h3>

                  <div className="mt-4 space-y-2 text-xs text-indigo-200/80">
                    {(user.ownedStore as any).email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>{(user.ownedStore as any).email}</span>
                      </div>
                    )}
                    {(user.ownedStore as any).address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{(user.ownedStore as any).address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Prominent Average Rating Display */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center min-w-[200px] shrink-0">
                  <span className="text-xs uppercase font-bold tracking-widest text-indigo-200">
                    Average Rating
                  </span>
                  <div className="mt-2 flex items-baseline justify-center gap-1.5">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                      {user.ownedStore.rating ? Number(user.ownedStore.rating).toFixed(1) : "0.0"}
                    </span>
                    <span className="text-sm font-semibold text-indigo-300">/ 5.0</span>
                  </div>

                  <div className="mt-3 flex justify-center">
                    <StarRating
                      value={user.ownedStore.rating ? Number(user.ownedStore.rating) : 0}
                      size="md"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
