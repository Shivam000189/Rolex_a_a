import React, { useEffect, useState, useMemo, useCallback } from "react";
import { storeOwnerAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import type { StoreOwnerDashboard as DashboardData } from "../../types";
import { DataTable } from "../../components/DataTable";
import type { Column, SortConfig } from "../../components/DataTable";
import { StarRating } from "../../components/StarRating";
import { StatCard } from "../../components/StatCard";
import { EmptyState } from "../../components/EmptyState";
import { formatStoreName } from "../../utils/formatters";

interface RaterRow {
  userId: number;
  name: string;
  email: string;
  address: string;
  rating: number;
  ratedAt: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // View switch: "grid" or "table"
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStarFilter, setSelectedStarFilter] = useState<number | "ALL">("ALL");
  const [sortOption, setSortOption] = useState<string>("newest");

  // Sorting for Raters table
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({
    key: "ratedAt",
    direction: "desc",
  });

  // Copied chip state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (isManual = false) => {
    try {
      if (isManual) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const res = await storeOwnerAPI.getDashboard();
      setData(res.data);

      if (isManual) {
        success("Store statistics refreshed successfully");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to load store owner dashboard";
      setError(msg);
      if (isManual) {
        toastError(msg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [success, toastError]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Copy to clipboard helper
  const handleCopyToClipboard = (text: string, label: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    success(`Copied ${label} to clipboard!`);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortConfig({ key, direction });
  };

  // Filter and sort raters
  const filteredAndSortedRaters = useMemo(() => {
    if (!data?.raters) return [];

    let list = [...data.raters];

    // Filter by search query (name, email, address)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          (r.name && r.name.toLowerCase().includes(q)) ||
          (r.email && r.email.toLowerCase().includes(q)) ||
          (r.address && r.address.toLowerCase().includes(q))
      );
    }

    // Filter by star score
    if (selectedStarFilter !== "ALL") {
      list = list.filter((r) => Math.round(r.rating) === selectedStarFilter);
    }

    // Sort based on sortOption or sortConfig
    list.sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.ratedAt).getTime() - new Date(a.ratedAt).getTime();
      }
      if (sortOption === "oldest") {
        return new Date(a.ratedAt).getTime() - new Date(b.ratedAt).getTime();
      }
      if (sortOption === "highest") {
        return b.rating - a.rating;
      }
      if (sortOption === "lowest") {
        return a.rating - b.rating;
      }

      // Default fallback using sortConfig
      if (sortConfig) {
        let aVal = (a as any)[sortConfig.key];
        let bVal = (b as any)[sortConfig.key];

        if (sortConfig.key === "ratedAt") {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        } else if (typeof aVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = (bVal || "").toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return list;
  }, [data?.raters, searchQuery, selectedStarFilter, sortOption, sortConfig]);

  // Performance calculations
  const totalReviews = data?.raters?.length || 0;
  const averageRatingNum = Number(data?.store?.averageRating || 0);

  // Rating Distribution breakdown
  const ratingBreakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (data?.raters) {
      data.raters.forEach((r) => {
        const score = Math.min(5, Math.max(1, Math.round(r.rating)));
        counts[score as keyof typeof counts]++;
      });
    }

    const total = totalReviews || 1;
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star as keyof typeof counts],
      percentage: totalReviews > 0 ? Math.round((counts[star as keyof typeof counts] / total) * 100) : 0,
    }));
  }, [data?.raters, totalReviews]);

  // Customer Satisfaction Sentiment Index (% of 4★ and 5★ ratings)
  const satisfactionIndex = useMemo(() => {
    if (!totalReviews) return 0;
    const highRatings = (data?.raters || []).filter((r) => r.rating >= 4).length;
    return Math.round((highRatings / totalReviews) * 100);
  }, [data?.raters, totalReviews]);

  // Review Milestone Calculation (milestones: 10, 25, 50, 100, 250, 500, 1000)
  const milestoneInfo = useMemo(() => {
    const milestones = [10, 25, 50, 100, 250, 500, 1000];
    const nextMilestone = milestones.find((m) => m > totalReviews) || totalReviews + 100;
    const prevMilestone = [...milestones].reverse().find((m) => m <= totalReviews) || 0;
    const progress = Math.min(
      100,
      Math.round(((totalReviews - prevMilestone) / (nextMilestone - prevMilestone)) * 100)
    );
    const needed = nextMilestone - totalReviews;

    return {
      nextMilestone,
      progress,
      needed,
    };
  }, [totalReviews]);

  const columns: Column<RaterRow>[] = [
    {
      key: "name",
      label: "Customer Name",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 leading-tight">{row.name}</p>
          <span className="text-[11px] text-emerald-700 font-semibold">Verified Reviewer</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (row) => (
        <span className="text-slate-600 text-xs font-medium">{row.email}</span>
      ),
    },
    {
      key: "address",
      label: "Address",
      sortable: true,
      render: (row) => (
        <div className="max-w-xs text-xs">
          <span className="truncate block text-slate-600 font-medium" title={row.address}>
            {row.address}
          </span>
        </div>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2 shrink-0 whitespace-nowrap min-w-[130px]">
          <StarRating value={row.rating} size="sm" readOnly />
          <span className="font-extrabold text-slate-800 text-xs shrink-0 whitespace-nowrap">
            {row.rating} / 5
          </span>
        </div>
      ),
    },
    {
      key: "ratedAt",
      label: "Date",
      sortable: true,
      render: (row) => (
        <span className="text-slate-500 text-xs font-medium shrink-0 whitespace-nowrap">
          {new Date(row.ratedAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-44 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
        </div>
        <div className="h-72 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="p-8 bg-white rounded-3xl border border-rose-200 text-rose-800 shadow-sm">
          <h2 className="font-extrabold text-lg text-slate-900">Store Dashboard Unavailable</h2>
          <p className="text-sm text-rose-600 mt-1">
            {error || "No store information is currently linked to your Store Owner account."}
          </p>
          <div className="mt-4">
            <button
              onClick={() => fetchDashboard(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { store } = data;
  const ownerName = user?.name || "Store Owner";
  const displayStoreName = formatStoreName(store.name);

  return (
    <div className="space-y-8">
      {/* 1. Header Banner: Clean text-focused store info */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold uppercase tracking-wider">
                Store Owner Portal
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                Verified Business
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-mono">
                Store ID: #{store.id}
              </span>
            </div>

            <div className="pt-1">
              <p className="text-xs text-slate-400 font-medium">Logged in as {ownerName}</p>
              <h1
                className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5"
                title={store.name}
              >
                {displayStoreName}
              </h1>
            </div>

            {/* Interactive text chips with 1-click Copy */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs text-slate-300">
              <button
                type="button"
                onClick={() => handleCopyToClipboard(store.email, "email", "email")}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/15 transition-colors cursor-pointer"
                title="Click to copy email address"
              >
                <span>Email: <strong className="font-semibold text-white">{store.email}</strong></span>
                <span className="ml-1.5 text-indigo-300 font-bold">
                  {copiedKey === "email" ? "[Copied!]" : "[Copy]"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleCopyToClipboard(store.address, "address", "address")}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/15 transition-colors cursor-pointer"
                title="Click to copy physical address"
              >
                <span>Address: <strong className="font-semibold text-white truncate max-w-xs inline-block align-bottom">{store.address}</strong></span>
                <span className="ml-1.5 text-indigo-300 font-bold">
                  {copiedKey === "address" ? "[Copied!]" : "[Copy]"}
                </span>
              </button>
            </div>
          </div>

          {/* Refresh button */}
          <div className="shrink-0 self-start lg:self-center">
            <button
              onClick={() => fetchDashboard(true)}
              disabled={refreshing || loading}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Refresh Stats"}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Store Performance Cockpit (4 Clean Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Average Rating */}
        <StatCard
          title="Average Rating"
          color="amber"
          value={
            <div className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {averageRatingNum ? averageRatingNum.toFixed(1) : "0.0"}
              </span>
              <span className="text-sm font-bold text-slate-400">/ 5.0</span>
            </div>
          }
          subtitle={
            <div className="pt-1 shrink-0 whitespace-nowrap">
              <StarRating value={averageRatingNum} size="sm" readOnly />
            </div>
          }
          footer={
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Customer Rating Tier:</span>
              <span className="text-amber-700 font-bold">
                {averageRatingNum >= 4.5
                  ? "Top Rated (4.5+)"
                  : averageRatingNum >= 4.0
                  ? "Highly Rated (4.0+)"
                  : averageRatingNum >= 3.0
                  ? "Moderate (3.0+)"
                  : "Needs Attention"}
              </span>
            </div>
          }
        />

        {/* Card 2: Total Reviews */}
        <StatCard
          title="Total Ratings"
          color="indigo"
          value={totalReviews}
          trend={{
            value: totalReviews > 0 ? "Active Community Feedback" : "No ratings yet",
            positive: totalReviews > 0,
          }}
          subtitle={
            <div className="text-xs text-slate-500">
              Submitted by verified registered users
            </div>
          }
          footer={
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Total Reviews:</span>
              <span className="text-indigo-600 font-bold">{totalReviews} submissions</span>
            </div>
          }
        />

        {/* Card 3: Satisfaction Sentiment Index */}
        <StatCard
          title="Satisfaction Index"
          color="emerald"
          value={`${satisfactionIndex}%`}
          trend={{
            value: satisfactionIndex >= 75 ? "Positive Sentiment" : "Mixed Sentiment",
            positive: satisfactionIndex >= 70,
          }}
          subtitle={
            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${satisfactionIndex}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 block">
                Percentage of 4 and 5 star ratings
              </span>
            </div>
          }
        />

        {/* Card 4: Review Milestone Target */}
        <StatCard
          title="Milestone Progress"
          color="purple"
          value={
            <div className="flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {totalReviews}
              </span>
              <span className="text-sm font-bold text-slate-400">
                / {milestoneInfo.nextMilestone}
              </span>
            </div>
          }
          subtitle={
            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${milestoneInfo.progress}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 block">
                {milestoneInfo.needed} more reviews needed for {milestoneInfo.nextMilestone} milestone
              </span>
            </div>
          }
        />
      </div>

      {/* 3. Rating Breakdown Visualizer */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Rating Breakdown by Stars
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any star tier to filter the customer reviews list below
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <span>Overall Score:</span>
            <span className="text-indigo-600 font-extrabold">{averageRatingNum.toFixed(1)} / 5.0</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ratingBreakdown.map((item) => {
            const isSelected = selectedStarFilter === item.star;
            return (
              <button
                key={item.star}
                type="button"
                onClick={() =>
                  setSelectedStarFilter((prev) => (prev === item.star ? "ALL" : item.star))
                }
                className={`p-4 rounded-2xl border text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200/70"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sm text-slate-900">
                    {item.star} Stars
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {item.count} {item.count === 1 ? "review" : "reviews"}
                  </span>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${
                      item.star >= 4
                        ? "bg-emerald-500"
                        : item.star === 3
                        ? "bg-amber-400"
                        : "bg-rose-400"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>{item.percentage}%</span>
                  <span className="text-indigo-600 font-bold">
                    {isSelected ? "Active Filter" : "Filter"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Customer Reviews & Raters Feed */}
      <div className="space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Customer Reviews
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredAndSortedRaters.length} of {totalReviews} total customer submission{totalReviews !== 1 ? "s" : ""}
            </p>
          </div>

          {/* View mode toggle */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Card View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Table View
            </button>
          </div>
        </div>

        {/* Filter Bar: Search, Star Rating Pills, Sort Dropdown */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews by customer name, email, or address..."
                className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/10 focus:outline-hidden transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-slate-600">Sort By:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>

          {/* Star Filter Pills Row */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-600 mr-1">Filter by Rating:</span>

            <button
              type="button"
              onClick={() => setSelectedStarFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedStarFilter === "ALL"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              All Reviews ({totalReviews})
            </button>

            {[5, 4, 3, 2, 1].map((star) => {
              const isSelected = selectedStarFilter === star;
              const count =
                ratingBreakdown.find((b) => b.star === star)?.count || 0;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setSelectedStarFilter((prev) => (prev === star ? "ALL" : star))
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-amber-500 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {star} Stars ({count})
                </button>
              );
            })}

            {(searchQuery || selectedStarFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStarFilter("ALL");
                }}
                className="ml-auto text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Reviews Display: Grid View or Table View */}
        {filteredAndSortedRaters.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center">
            <EmptyState
              title={
                searchQuery || selectedStarFilter !== "ALL"
                  ? "No reviews match your filters"
                  : "No reviews submitted yet"
              }
              description={
                searchQuery || selectedStarFilter !== "ALL"
                  ? "Try clearing your search query or choosing a different rating filter."
                  : "Customer ratings and reviews will automatically appear here once submitted by platform users."
              }
            />
            {(searchQuery || selectedStarFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStarFilter("ALL");
                }}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          /* Card Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSortedRaters.map((rater) => (
              <div
                key={`${rater.userId}-${rater.ratedAt}`}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Header: Name and Rating Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{rater.name}</h4>
                      <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                        Verified Customer
                      </span>
                    </div>

                    {/* Star rating pill (unbreakable) */}
                    <div className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl shrink-0 whitespace-nowrap">
                      <span className="font-extrabold text-xs text-amber-900">{rater.rating} / 5.0</span>
                    </div>
                  </div>

                  {/* Star Rating Visualizer */}
                  <div className="pt-0.5 shrink-0 whitespace-nowrap">
                    <StarRating value={rater.rating} size="sm" readOnly />
                  </div>

                  {/* Customer Details */}
                  <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="truncate">
                      Email: <span className="font-medium text-slate-700">{rater.email}</span>
                    </div>
                    <div className="truncate" title={rater.address}>
                      Address: <span className="font-medium text-slate-700">{rater.address}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Date */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Date Submitted:</span>
                  <span className="font-medium text-slate-600">
                    {new Date(rater.ratedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Data Table View */
          <DataTable
            columns={columns}
            data={filteredAndSortedRaters}
            onSort={handleSort}
            sortConfig={sortConfig}
            loading={loading}
            emptyMessage="No reviews match your filters."
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
