import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../../services/api";
import { UserRole } from "../../types";
import type { DashboardStats, User, Store, UserRole as UserRoleType } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { StatCard } from "../../components/StatCard";
import { StarRating } from "../../components/StarRating";
import { Modal } from "../../components/Modal";
import { FormInput } from "../../components/FormInput";
import { FormSelect } from "../../components/FormSelect";
import { formatStoreName } from "../../utils/formatters";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Quick Action Modal States
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [storeOwners, setStoreOwners] = useState<User[]>([]);
  const [loadingOwners, setLoadingOwners] = useState(false);

  // Add User Form Data
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    role: UserRole.USER as UserRoleType,
  });

  const [userFormTouched, setUserFormTouched] = useState({
    name: false,
    email: false,
    address: false,
    password: false,
  });

  // Add Store Form Data
  const [storeFormData, setStoreFormData] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: "",
  });

  const [storeFormTouched, setStoreFormTouched] = useState({
    name: false,
    email: false,
    address: false,
    ownerId: false,
  });

  // Load Dashboard Data
  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [statsRes, storesRes, usersRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getStores({ sortBy: "rating", sortOrder: "desc" }),
        adminAPI.getUsers({ sortBy: "createdAt", sortOrder: "desc" }),
      ]);

      setStats(statsRes.data);
      setStores(storesRes.data || []);
      setUsers(usersRes.data || []);
      setLastUpdated(new Date());

      if (isManualRefresh) {
        success("Dashboard metrics updated successfully");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to load platform dashboard metrics.";
      setError(msg);
      if (isManualRefresh) {
        toastError(msg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [success, toastError]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Load Store Owners when Add Store modal opens
  const fetchStoreOwners = async () => {
    try {
      setLoadingOwners(true);
      const res = await adminAPI.getUsers({ role: UserRole.STORE_OWNER });
      setStoreOwners(res.data || []);
    } catch (err) {
      console.error("Failed to load store owners", err);
    } finally {
      setLoadingOwners(false);
    }
  };

  const handleOpenAddStore = () => {
    setStoreFormData({ name: "", email: "", address: "", ownerId: "" });
    setStoreFormTouched({ name: false, email: false, address: false, ownerId: false });
    setModalError(null);
    setIsAddStoreOpen(true);
    fetchStoreOwners();
  };

  const handleOpenAddUser = () => {
    setUserFormData({
      name: "",
      email: "",
      address: "",
      password: "",
      role: UserRole.USER,
    });
    setUserFormTouched({
      name: false,
      email: false,
      address: false,
      password: false,
    });
    setModalError(null);
    setShowPassword(false);
    setIsAddUserOpen(true);
  };

  // Form Validations for Add User
  const validateUserName = (name: string) => {
    if (!name.trim()) return "Name is required";
    if (name.length < 20 || name.length > 60) return "Name must be between 20 and 60 characters";
    return null;
  };

  const validateUserEmail = (email: string) => {
    if (!email.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Enter a valid email address";
    return null;
  };

  const validateUserPassword = (password: string) => {
    if (!password) return "Password is required";
    if (password.length < 8 || password.length > 16) return "Password must be 8-16 characters";
    if (!/[A-Z]/.test(password)) return "Must include at least 1 uppercase letter";
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
      return "Must include at least 1 special character";
    return null;
  };

  const validateUserAddress = (address: string) => {
    if (!address.trim()) return "Address is required";
    if (address.length > 400) return "Address cannot exceed 400 characters";
    return null;
  };

  // Form Validations for Add Store
  const validateStoreName = (name: string) => {
    if (!name.trim()) return "Store name is required";
    if (name.length < 20 || name.length > 60) return "Store name must be between 20 and 60 characters";
    return null;
  };

  const validateStoreEmail = (email: string) => {
    if (!email.trim()) return "Store email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Enter a valid email address";
    return null;
  };

  const validateStoreAddress = (address: string) => {
    if (!address.trim()) return "Store address is required";
    if (address.length > 400) return "Store address cannot exceed 400 characters";
    return null;
  };

  const validateStoreOwner = (ownerId: string) => {
    if (!ownerId) return "Please select a Store Owner";
    return null;
  };

  // Submit Add User
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormTouched({ name: true, email: true, address: true, password: true });

    const nErr = validateUserName(userFormData.name);
    const eErr = validateUserEmail(userFormData.email);
    const pErr = validateUserPassword(userFormData.password);
    const aErr = validateUserAddress(userFormData.address);

    if (nErr || eErr || pErr || aErr) {
      setModalError("Please correct the form errors before submitting.");
      return;
    }

    try {
      setModalLoading(true);
      setModalError(null);
      await adminAPI.addUser({
        name: userFormData.name.trim(),
        email: userFormData.email.trim(),
        password: userFormData.password,
        address: userFormData.address.trim(),
        role: userFormData.role,
      });

      success(`User "${userFormData.name}" created successfully!`);
      setIsAddUserOpen(false);
      fetchDashboardData(true);
    } catch (err: any) {
      setModalError(err.response?.data?.message || "Failed to create user. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  // Submit Add Store
  const handleAddStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoreFormTouched({ name: true, email: true, address: true, ownerId: true });

    const nErr = validateStoreName(storeFormData.name);
    const eErr = validateStoreEmail(storeFormData.email);
    const aErr = validateStoreAddress(storeFormData.address);
    const oErr = validateStoreOwner(storeFormData.ownerId);

    if (nErr || eErr || aErr || oErr) {
      setModalError("Please correct the highlighted errors before submitting.");
      return;
    }

    try {
      setModalLoading(true);
      setModalError(null);
      await adminAPI.addStore({
        name: storeFormData.name.trim(),
        email: storeFormData.email.trim(),
        address: storeFormData.address.trim(),
        ownerId: Number(storeFormData.ownerId),
      });

      success(`Store "${storeFormData.name}" created successfully!`);
      setIsAddStoreOpen(false);
      fetchDashboardData(true);
    } catch (err: any) {
      setModalError(err.response?.data?.message || "Failed to create store. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  // Calculations & Aggregations
  const roleCounts = useMemo(() => {
    const counts = { admins: 0, storeOwners: 0, customers: 0 };
    users.forEach((u) => {
      if (u.role === UserRole.ADMIN) counts.admins++;
      else if (u.role === UserRole.STORE_OWNER) counts.storeOwners++;
      else counts.customers++;
    });
    return counts;
  }, [users]);

  const platformAverageRating = useMemo(() => {
    if (!stores.length) return 0;
    const ratedStores = stores.filter((s) => s.rating > 0);
    if (!ratedStores.length) return 0;
    const sum = ratedStores.reduce((acc, s) => acc + Number(s.rating), 0);
    return sum / ratedStores.length;
  }, [stores]);

  const topStores = useMemo(() => {
    return stores.slice(0, 5);
  }, [stores]);

  const ratingDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    stores.forEach((s) => {
      const r = Math.round(Number(s.rating || 0));
      if (r >= 5) dist[5]++;
      else if (r === 4) dist[4]++;
      else if (r === 3) dist[3]++;
      else if (r === 2) dist[2]++;
      else if (r === 1) dist[1]++;
    });
    const total = stores.length || 1;
    return [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: dist[stars as keyof typeof dist],
      percentage: Math.round((dist[stars as keyof typeof dist] / total) * 100),
    }));
  }, [stores]);

  const recentUsers = useMemo(() => {
    return users.slice(0, 6);
  }, [users]);

  // Dynamic greeting based on current hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const adminName = user?.name || "Administrator";

  return (
    <div className="space-y-8">
      {/* 1. Header Banner: Clean text-focused overview */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                SYSTEM OPERATIONAL
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-semibold">
                Live Directory Database
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {greeting}, {adminName}
            </h1>

            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Platform administration console. Monitor live directory metrics, manage store rankings, and oversee user registrations in real time.
            </p>

            <div className="text-xs text-slate-400 pt-1">
              Last synced: {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
          </div>

          {/* Quick Action Buttons Header */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing || loading}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </button>

            <button
              onClick={handleOpenAddUser}
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/40 border border-white/30 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Add User
            </button>

            <button
              onClick={handleOpenAddStore}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-colors cursor-pointer"
            >
              Add Store
            </button>
          </div>
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <div className="flex-1">
            <p className="font-bold">Unable to sync latest platform metrics</p>
            <p className="text-xs text-rose-600 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => fetchDashboardData(true)}
            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. Platform KPI Grid: 4 Text-Focused Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Users */}
        <StatCard
          title="Total Users"
          color="indigo"
          loading={loading}
          value={stats?.totalUsers ?? users.length}
          trend={{
            value: "Registered Accounts",
            positive: true,
          }}
          subtitle={
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-100">
                {roleCounts.admins} Admin{roleCounts.admins !== 1 ? "s" : ""}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-100">
                {roleCounts.storeOwners} Store Owners
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-100">
                {roleCounts.customers} Customers
              </span>
            </div>
          }
          actionText="Manage users"
          actionLink="/admin/users"
        />

        {/* Card 2: Total Stores */}
        <StatCard
          title="Total Stores"
          color="emerald"
          loading={loading}
          value={stats?.totalStores ?? stores.length}
          trend={{
            value: "100% Listed & Active",
            positive: true,
          }}
          subtitle={
            <div className="text-xs text-slate-500">
              Businesses registered and discoverable on platform
            </div>
          }
          actionText="Manage stores"
          actionLink="/admin/stores"
        />

        {/* Card 3: Total Ratings Submitted */}
        <StatCard
          title="Total Ratings"
          color="amber"
          loading={loading}
          value={stats?.totalRatings ?? 0}
          trend={{
            value: "User Reviews",
            positive: true,
          }}
          subtitle={
            <div className="text-xs text-slate-500">
              Total review submissions across all stores
            </div>
          }
          footer={
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Community Sentiment:</span>
              <span className="text-amber-700 font-bold">Active Feedback</span>
            </div>
          }
        />

        {/* Card 4: Platform Average Rating */}
        <StatCard
          title="Average Rating"
          color="purple"
          loading={loading}
          value={
            <div className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {platformAverageRating.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-slate-400">/ 5.0</span>
            </div>
          }
          subtitle={
            <div className="pt-1 shrink-0 whitespace-nowrap">
              <StarRating value={platformAverageRating} size="sm" readOnly />
            </div>
          }
          footer={
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Overall Status:</span>
              <span className="text-purple-700 font-bold">
                {platformAverageRating >= 4 ? "Excellent (4.0+)" : platformAverageRating >= 3 ? "Good (3.0+)" : "Fair"}
              </span>
            </div>
          }
        />
      </div>

      {/* 3. Middle Row: Top Stores Leaderboard & Rating Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Top Stores Leaderboard */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Top-Rated Stores Leaderboard
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Highest rated businesses listed by customer score
              </p>
            </div>

            <Link
              to="/admin/stores"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Manage All Stores →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          ) : topStores.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="font-semibold text-slate-600 text-sm">No stores registered yet</p>
              <button
                onClick={handleOpenAddStore}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
              >
                Add First Store
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {topStores.map((store, index) => {
                const displayName = formatStoreName(store.name);
                const score = Number(store.rating || 0).toFixed(1);

                return (
                  <div
                    key={store.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200/70 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Clean Text Rank Badge */}
                      <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-slate-200 text-slate-800 shrink-0 whitespace-nowrap">
                        Rank {index + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className="font-bold text-slate-900 text-sm truncate max-w-sm"
                            title={store.name}
                          >
                            {displayName}
                          </h3>
                          <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0 whitespace-nowrap">
                            ID #{store.id}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                          {store.owner && (
                            <span className="truncate">
                              Owner: <strong className="font-semibold text-slate-700">{store.owner.name}</strong>
                            </span>
                          )}
                          <span className="truncate max-w-xs" title={store.address}>
                            Address: {store.address}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rating Badge */}
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 whitespace-nowrap bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                      <StarRating value={Number(store.rating || 0)} size="sm" readOnly />
                      <span className="font-extrabold text-slate-900 text-xs shrink-0 whitespace-nowrap">
                        {score} <span className="text-slate-400 font-normal">/ 5.0</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Platform Rating Distribution & Health Visualizer */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-5 border-b border-slate-100 mb-6">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Rating Distribution
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Score breakdown across all businesses</p>
            </div>

            {/* Distribution Bars */}
            <div className="space-y-4">
              {ratingDistribution.map((item) => (
                <div key={item.stars} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">
                      {item.stars} Stars{" "}
                      <span className="text-slate-400 font-normal">
                        ({item.count} {item.count === 1 ? "store" : "stores"})
                      </span>
                    </span>
                    <span className="font-bold text-slate-800">{item.percentage}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.stars >= 4
                          ? "bg-emerald-500"
                          : item.stars === 3
                          ? "bg-amber-400"
                          : "bg-rose-400"
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Overview Box */}
          <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span>Overall Average:</span>
              <span className="text-indigo-600 font-extrabold text-sm">{platformAverageRating.toFixed(1)} / 5.0</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Calculated across {stores.length} total active business profiles.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Live User Activity Stream */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Recent Registrations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest members registered across all account roles
            </p>
          </div>

          <Link
            to="/admin/users"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            Manage Users →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-2xl" />
            ))}
          </div>
        ) : recentUsers.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No users registered yet
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentUsers.map((u) => {
              const roleBadgeConfig = {
                ADMIN: {
                  bg: "bg-purple-50",
                  text: "text-purple-700",
                  border: "border-purple-200",
                  label: "Admin",
                },
                STORE_OWNER: {
                  bg: "bg-amber-50",
                  text: "text-amber-800",
                  border: "border-amber-200",
                  label: "Store Owner",
                },
                USER: {
                  bg: "bg-indigo-50",
                  text: "text-indigo-700",
                  border: "border-indigo-200",
                  label: "Customer",
                },
              }[u.role] || {
                bg: "bg-slate-50",
                text: "text-slate-700",
                border: "border-slate-200",
                label: u.role,
              };

              return (
                <div
                  key={u.id}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-slate-900 text-sm truncate">{u.name}</p>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border shrink-0 ${roleBadgeConfig.bg} ${roleBadgeConfig.text} ${roleBadgeConfig.border}`}
                    >
                      {roleBadgeConfig.label}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mt-1 truncate">
                    Email: {u.email}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-400">
                    <span className="truncate max-w-[150px]">Address: {u.address}</span>
                    <span className="shrink-0 font-medium">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })
                        : "Active"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD USER                                                           */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Add New User"
      >
        <form onSubmit={handleAddUserSubmit} className="space-y-4" noValidate>
          {modalError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {modalError}
            </div>
          )}

          <FormInput
            label="Full Name"
            name="name"
            required
            maxLength={60}
            placeholder="Johnathan Doe (20-60 chars)"
            value={userFormData.name}
            onChange={(e) => {
              setUserFormData({ ...userFormData, name: e.target.value });
              setUserFormTouched({ ...userFormTouched, name: true });
            }}
            error={userFormTouched.name ? validateUserName(userFormData.name) : null}
            helperText="20 to 60 characters in length"
          />

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            required
            placeholder="user@example.com"
            value={userFormData.email}
            onChange={(e) => {
              setUserFormData({ ...userFormData, email: e.target.value });
              setUserFormTouched({ ...userFormTouched, email: true });
            }}
            error={userFormTouched.email ? validateUserEmail(userFormData.email) : null}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Password <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">8-16 chars</span>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                maxLength={16}
                placeholder="••••••••"
                value={userFormData.password}
                onChange={(e) => {
                  setUserFormData({ ...userFormData, password: e.target.value });
                  setUserFormTouched({ ...userFormTouched, password: true });
                }}
                className={`w-full px-3.5 pr-16 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border ${
                  userFormTouched.password && validateUserPassword(userFormData.password)
                    ? "border-rose-300 focus:border-rose-500"
                    : "border-slate-200 focus:border-indigo-500"
                } rounded-xl text-sm text-slate-800 focus:ring-3 focus:outline-hidden transition-all`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {userFormTouched.password && validateUserPassword(userFormData.password) ? (
              <p className="text-xs text-rose-600 font-medium">
                {validateUserPassword(userFormData.password)}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">
                Requires 8-16 chars, 1 uppercase letter, and 1 special character
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Physical Address <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {userFormData.address.length}/400 max
              </span>
            </div>
            <textarea
              name="address"
              rows={2}
              maxLength={400}
              required
              placeholder="123 Main Street, Suite 400..."
              value={userFormData.address}
              onChange={(e) => {
                setUserFormData({ ...userFormData, address: e.target.value });
                setUserFormTouched({ ...userFormTouched, address: true });
              }}
              className={`w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border ${
                userFormTouched.address && validateUserAddress(userFormData.address)
                  ? "border-rose-300 focus:border-rose-500"
                  : "border-slate-200 focus:border-indigo-500"
              } rounded-xl text-sm text-slate-800 focus:ring-3 focus:outline-hidden transition-all`}
            />
            {userFormTouched.address && validateUserAddress(userFormData.address) && (
              <p className="text-xs text-rose-600 font-medium">
                {validateUserAddress(userFormData.address)}
              </p>
            )}
          </div>

          <FormSelect
            label="System Role"
            name="role"
            value={userFormData.role}
            onChange={(e) =>
              setUserFormData({ ...userFormData, role: e.target.value as UserRoleType })
            }
            options={[
              { value: UserRole.USER, label: "Customer (Can rate stores)" },
              { value: UserRole.STORE_OWNER, label: "Store Owner (Can own 1 store & view ratings)" },
              { value: UserRole.ADMIN, label: "Platform Administrator (Full Access)" },
            ]}
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddUserOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {modalLoading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: ADD STORE                                                          */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        title="Register New Store"
      >
        <form onSubmit={handleAddStoreSubmit} className="space-y-4" noValidate>
          {modalError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {modalError}
            </div>
          )}

          <FormInput
            label="Store Name"
            name="name"
            required
            maxLength={60}
            placeholder="Apex Coffee Roasters (20-60 chars)"
            value={storeFormData.name}
            onChange={(e) => {
              setStoreFormData({ ...storeFormData, name: e.target.value });
              setStoreFormTouched({ ...storeFormTouched, name: true });
            }}
            error={storeFormTouched.name ? validateStoreName(storeFormData.name) : null}
            helperText="Must be 20 to 60 characters in length"
          />

          <FormInput
            label="Store Contact Email"
            name="email"
            type="email"
            required
            placeholder="store@business.com"
            value={storeFormData.email}
            onChange={(e) => {
              setStoreFormData({ ...storeFormData, email: e.target.value });
              setStoreFormTouched({ ...storeFormTouched, email: true });
            }}
            error={storeFormTouched.email ? validateStoreEmail(storeFormData.email) : null}
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Store Address <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {storeFormData.address.length}/400 max
              </span>
            </div>
            <textarea
              name="address"
              rows={2}
              maxLength={400}
              required
              placeholder="789 Business Ave, Tech Park, City..."
              value={storeFormData.address}
              onChange={(e) => {
                setStoreFormData({ ...storeFormData, address: e.target.value });
                setStoreFormTouched({ ...storeFormTouched, address: true });
              }}
              className={`w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border ${
                storeFormTouched.address && validateStoreAddress(storeFormData.address)
                  ? "border-rose-300 focus:border-rose-500"
                  : "border-slate-200 focus:border-indigo-500"
              } rounded-xl text-sm text-slate-800 focus:ring-3 focus:outline-hidden transition-all`}
            />
            {storeFormTouched.address && validateStoreAddress(storeFormData.address) && (
              <p className="text-xs text-rose-600 font-medium">
                {validateStoreAddress(storeFormData.address)}
              </p>
            )}
          </div>

          <FormSelect
            label="Assign Store Owner"
            name="ownerId"
            required
            value={storeFormData.ownerId}
            onChange={(e) => {
              setStoreFormData({ ...storeFormData, ownerId: e.target.value });
              setStoreFormTouched({ ...storeFormTouched, ownerId: true });
            }}
            error={storeFormTouched.ownerId ? validateStoreOwner(storeFormData.ownerId) : null}
            disabled={loadingOwners}
            options={[
              { value: "", label: loadingOwners ? "Loading owners..." : "Select a Store Owner" },
              ...storeOwners.map((owner) => ({
                value: String(owner.id),
                label: `${owner.name} (${owner.email})`,
              })),
            ]}
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddStoreOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {modalLoading ? "Creating..." : "Register Store"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
