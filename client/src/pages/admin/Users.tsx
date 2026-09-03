import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";
import { UserRole } from "../../types";
import type { User, UserRole as UserRoleType } from "../../types";
import { DataTable } from "../../components/DataTable";
import type { Column, SortConfig } from "../../components/DataTable";
import { FilterBar } from "../../components/FilterBar";
import type { FilterItemConfig } from "../../components/FilterBar";
import { Modal } from "../../components/Modal";
import { FormInput } from "../../components/FormInput";
import { FormSelect } from "../../components/FormSelect";
import { SkeletonTable } from "../../components/Skeleton";
import { useToast } from "../../context/ToastContext";
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Mail,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  User as UserIcon,
  Eye,
  Lock,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

export const Users: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<{
    name: string;
    email: string;
    address: string;
    role: string;
  }>({
    name: "",
    email: "",
    address: "",
    role: "",
  });

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({
    key: "name",
    direction: "asc",
  });

  // Add User Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    role: UserRole.USER as UserRoleType,
  });

  const [formTouched, setFormTouched] = useState({
    name: false,
    email: false,
    address: false,
    password: false,
  });

  const navigate = useNavigate();

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getUsers({
        name: filters.name || undefined,
        email: filters.email || undefined,
        address: filters.address || undefined,
        role: (filters.role as UserRoleType) || undefined,
        sortBy: sortConfig?.key,
        sortOrder: sortConfig?.direction,
      });
      setUsers(res.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load users";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }, [filters, sortConfig, toastError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ name: "", email: "", address: "", role: "" });
  };

  // Handle Sort
  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortConfig({ key, direction });
  };

  // Form Validation matching backend
  const validateName = (val: string) => {
    if (!val) return "Name is required";
    if (val.length < 20 || val.length > 60) return "Name must be between 20 and 60 characters";
    return null;
  };

  const validateEmail = (val: string) => {
    if (!val) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Invalid email address format";
    return null;
  };

  const validateAddress = (val: string) => {
    if (!val) return "Address is required";
    if (val.length > 400) return "Address must not exceed 400 characters";
    return null;
  };

  const validatePassword = (val: string) => {
    if (!val) return "Password is required";
    if (val.length < 8 || val.length > 16) return "Password must be between 8 and 16 characters";
    if (!/[A-Z]/.test(val)) return "Password must contain at least 1 uppercase letter";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val))
      return "Password must contain at least 1 special character";
    return null;
  };

  const nameError = validateName(formData.name);
  const emailError = validateEmail(formData.email);
  const addressError = validateAddress(formData.address);
  const passwordError = validatePassword(formData.password);

  const isFormValid = !nameError && !emailError && !addressError && !passwordError;

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormTouched({ name: true, email: true, address: true, password: true });
    setModalError(null);

    if (!isFormValid) return;

    try {
      setModalLoading(true);
      await adminAPI.addUser(formData);

      setIsModalOpen(false);
      setFormData({
        name: "",
        email: "",
        address: "",
        password: "",
        role: UserRole.USER,
      });
      setFormTouched({ name: false, email: false, address: false, password: false });

      success(`User "${formData.name}" added successfully!`);
      await fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create user";
      setModalError(msg);
      toastError(msg);
    } finally {
      setModalLoading(false);
    }
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

  // Table columns definition
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
            <p className="text-xs text-slate-400 mt-0.5">User #{row.id}</p>
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
        <div className="flex items-start gap-1.5 max-w-xs">
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
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <button
          onClick={() => navigate(`/admin/users/${row.id}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-800 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> View
        </button>
      ),
    },
  ];

  // FilterBar configuration
  const filterConfigs: FilterItemConfig[] = [
    {
      key: "name",
      placeholder: "Filter by name...",
      type: "text",
      icon: Search,
      value: filters.name,
    },
    {
      key: "email",
      placeholder: "Filter by email...",
      type: "text",
      icon: Mail,
      value: filters.email,
    },
    {
      key: "address",
      placeholder: "Filter by address...",
      type: "text",
      icon: MapPin,
      value: filters.address,
    },
    {
      key: "role",
      type: "select",
      value: filters.role,
      options: [
        { label: "All Roles", value: "" },
        { label: "Admin", value: UserRole.ADMIN },
        { label: "Store Owner", value: UserRole.STORE_OWNER },
        { label: "Normal User", value: UserRole.USER },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header with "Add User" button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Users Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse, search, sort, and add registered users
          </p>
        </div>

        <button
          onClick={() => {
            setModalError(null);
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filterConfigs}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* DataTable */}
      {loading ? (
        <SkeletonTable rows={6} columns={5} />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          onSort={handleSort}
          sortConfig={sortConfig}
          loading={false}
          emptyMessage="No users found matching your filters"
          emptyIcon={<UsersIcon className="w-12 h-12 mb-3 stroke-[1.5] text-slate-300" />}
        />
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New User"
        maxWidth="max-w-xl"
      >
        {modalError && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{modalError}</span>
          </div>
        )}

        <form onSubmit={handleAddUserSubmit} className="space-y-4">
          <FormInput
            label="Full Name"
            name="name"
            required
            maxLength={60}
            icon={UserIcon}
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            onBlur={() => setFormTouched((p) => ({ ...p, name: true }))}
            error={formTouched.name ? nameError : null}
            placeholder="e.g. Johnathan Alexander Doe"
          />

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            required
            icon={Mail}
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            onBlur={() => setFormTouched((p) => ({ ...p, email: true }))}
            error={formTouched.email ? emailError : null}
            placeholder="user@example.com"
          />

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Address <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{formData.address.length}/400 max</span>
            </div>
            <div className="relative">
              <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <textarea
                rows={2}
                required
                value={formData.address}
                onBlur={() => setFormTouched((p) => ({ ...p, address: true }))}
                onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                placeholder="123 Example Street, City"
                className={`w-full pl-10 pr-4 py-2 bg-slate-50 border ${
                  formTouched.address && addressError ? "border-rose-400" : "border-slate-200"
                } rounded-xl text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none`}
              />
            </div>
            {formTouched.address && addressError && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {addressError}
              </p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Password <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">8–16 chars, 1 uppercase, 1 special</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onBlur={() => setFormTouched((p) => ({ ...p, password: true }))}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className={`w-full pl-10 pr-11 py-2.5 bg-slate-50 border ${
                  formTouched.password && passwordError ? "border-rose-400" : "border-slate-200"
                } rounded-xl text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {formTouched.password && passwordError && (
              <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {passwordError}
              </p>
            )}
          </div>

          <FormSelect
            label="System Role"
            name="role"
            value={formData.role}
            onChange={(e) =>
              setFormData((p) => ({ ...p, role: e.target.value as UserRoleType }))
            }
            options={[
              { value: UserRole.USER, label: "Normal User" },
              { value: UserRole.STORE_OWNER, label: "Store Owner" },
              { value: UserRole.ADMIN, label: "Administrator" },
            ]}
          />

          {/* Modal Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="btn-primary"
            >
              {modalLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Save User <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
