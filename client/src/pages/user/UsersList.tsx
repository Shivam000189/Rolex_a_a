import React, { useEffect, useState, useCallback } from "react";
import { userAPI } from "../../services/api";
import { UserRole } from "../../types";
import type { User, UserRole as UserRoleType } from "../../types";
import { DataTable } from "../../components/DataTable";
import type { Column, SortConfig } from "../../components/DataTable";
import {
  Users as UsersIcon,
  Search,
  Mail,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  User as UserIcon,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState("");

  const [sortConfig, setSortConfig] = useState<SortConfig | null>({
    key: "name",
    direction: "asc",
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userAPI.getAllUsers({
        name: search || undefined,
        sortBy: sortConfig?.key,
        sortOrder: sortConfig?.direction,
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }, [search, sortConfig]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortConfig({ key, direction });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const getRoleBadge = (role: UserRoleType) => {
    switch (role) {
      case UserRole.ADMIN:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin
          </span>
        );
      case UserRole.STORE_OWNER:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200">
            <ShoppingBag className="w-3.5 h-3.5" /> Store Owner
          </span>
        );
      case UserRole.USER:
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <UserIcon className="w-3.5 h-3.5" /> User
          </span>
        );
    }
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shadow-2xs">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-tight">{row.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">Member</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 text-slate-600">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-medium">{row.email}</span>
        </div>
      ),
    },
    {
      key: "address",
      label: "Address",
      sortable: true,
      render: (row) => (
        <div className="flex items-start gap-1.5 max-w-sm">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span className="truncate text-slate-600 font-medium" title={row.address}>
            {row.address}
          </span>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (row) => getRoleBadge(row.role),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Community Directory
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          All Users
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Explore and view community members and store owners on StoreRating
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3 justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </form>

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Search
          </button>
        )}
      </div>

      {/* Users DataTable */}
      <DataTable
        columns={columns}
        data={users}
        onSort={handleSort}
        sortConfig={sortConfig}
        loading={loading}
        emptyMessage="No users found matching your search"
        emptyIcon={<UsersIcon className="w-12 h-12 mb-3 stroke-[1.5] text-slate-300" />}
      />
    </div>
  );
};

export default UsersList;
