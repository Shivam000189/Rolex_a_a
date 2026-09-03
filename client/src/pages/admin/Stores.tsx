import React, { useEffect, useState, useCallback } from "react";
import { adminAPI } from "../../services/api";
import { UserRole } from "../../types";
import type { Store, User } from "../../types";
import { DataTable } from "../../components/DataTable";
import type { Column, SortConfig } from "../../components/DataTable";
import { FilterBar } from "../../components/FilterBar";
import type { FilterItemConfig } from "../../components/FilterBar";
import { Modal } from "../../components/Modal";
import { FormInput } from "../../components/FormInput";
import { FormSelect } from "../../components/FormSelect";
import { StarRating } from "../../components/StarRating";
import { SkeletonTable } from "../../components/Skeleton";
import { useToast } from "../../context/ToastContext";
import { formatStoreName } from "../../utils/formatters";

export const Stores: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<{
    name: string;
    email: string;
    address: string;
  }>({
    name: "",
    email: "",
    address: "",
  });

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({
    key: "name",
    direction: "asc",
  });

  // Add Store Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [storeOwners, setStoreOwners] = useState<User[]>([]);
  const [loadingOwners, setLoadingOwners] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    ownerId: "",
  });

  const [formTouched, setFormTouched] = useState({
    name: false,
    email: false,
    address: false,
    ownerId: false,
  });

  // Store Full Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStoreForDetails, setSelectedStoreForDetails] = useState<Store | null>(null);
  const [isEditingRatingInDetails, setIsEditingRatingInDetails] = useState(false);

  // Edit Rating Modal State
  const [isEditRatingOpen, setIsEditRatingOpen] = useState(false);
  const [selectedStoreForRating, setSelectedStoreForRating] = useState<Store | null>(null);
  const [newRatingValue, setNewRatingValue] = useState<number>(5);
  const [editRatingLoading, setEditRatingLoading] = useState(false);
  const [editRatingError, setEditRatingError] = useState<string | null>(null);

  // Delete Store Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStoreForDelete, setSelectedStoreForDelete] = useState<Store | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch stores
  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getStores({
        name: filters.name || undefined,
        email: filters.email || undefined,
        address: filters.address || undefined,
        sortBy: sortConfig?.key,
        sortOrder: sortConfig?.direction,
      });
      setStores(res.data);

      // Keep selectedStoreForDetails updated if it's currently open
      if (selectedStoreForDetails) {
        const updated = res.data.find((s) => s.id === selectedStoreForDetails.id);
        if (updated) setSelectedStoreForDetails(updated);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load stores";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }, [filters, sortConfig, toastError, selectedStoreForDetails]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Fetch Store Owners for dropdown
  const fetchStoreOwners = async () => {
    try {
      setLoadingOwners(true);
      const res = await adminAPI.getUsers({ role: UserRole.STORE_OWNER });
      const existingOwnerIds = new Set(stores.map((s) => s.ownerId));
      const eligibleOwners = res.data.filter((u) => !existingOwnerIds.has(u.id));
      setStoreOwners(eligibleOwners.length > 0 ? eligibleOwners : res.data);
    } catch (err) {
      console.error("Failed to fetch store owners:", err);
    } finally {
      setLoadingOwners(false);
    }
  };

  const handleOpenAddStoreModal = () => {
    setModalError(null);
    setFormData({ name: "", email: "", address: "", ownerId: "" });
    setFormTouched({ name: false, email: false, address: false, ownerId: false });
    setIsModalOpen(true);
    fetchStoreOwners();
  };

  // Open Full Details Modal for a store
  const handleOpenStoreDetails = (store: Store) => {
    setSelectedStoreForDetails(store);
    setNewRatingValue(Number(store.rating) || 5);
    setIsEditingRatingInDetails(false);
    setIsDetailsModalOpen(true);
  };

  // Open Standalone Edit Rating Modal
  const handleOpenEditRating = (store: Store) => {
    setSelectedStoreForRating(store);
    setNewRatingValue(Number(store.rating) || 5);
    setEditRatingError(null);
    setIsEditRatingOpen(true);
  };

  // Submit Rating Change
  const handleSaveRating = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetStore = selectedStoreForRating || selectedStoreForDetails;
    if (!targetStore) return;

    if (newRatingValue < 1 || newRatingValue > 5) {
      setEditRatingError("Rating must be between 1 and 5 stars");
      return;
    }

    try {
      setEditRatingLoading(true);
      setEditRatingError(null);
      await adminAPI.updateStoreRating(targetStore.id, newRatingValue);
      success(`Updated rating for "${targetStore.name}" to ${newRatingValue.toFixed(1)} Stars`);
      setIsEditRatingOpen(false);
      setIsEditingRatingInDetails(false);

      if (selectedStoreForDetails && selectedStoreForDetails.id === targetStore.id) {
        setSelectedStoreForDetails({
          ...selectedStoreForDetails,
          rating: newRatingValue,
        });
      }

      await fetchStores();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update store rating";
      setEditRatingError(msg);
      toastError(msg);
    } finally {
      setEditRatingLoading(false);
    }
  };

  // Open Delete Store Modal
  const handleOpenDeleteStore = (store: Store) => {
    setSelectedStoreForDelete(store);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  // Submit Store Deletion
  const handleConfirmDelete = async () => {
    if (!selectedStoreForDelete) return;

    try {
      setDeleteLoading(true);
      setDeleteError(null);
      await adminAPI.deleteStore(selectedStoreForDelete.id);
      success(`Store "${selectedStoreForDelete.name}" was removed successfully`);
      setIsDeleteModalOpen(false);
      if (selectedStoreForDetails?.id === selectedStoreForDelete.id) {
        setIsDetailsModalOpen(false);
        setSelectedStoreForDetails(null);
      }
      await fetchStores();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to remove store";
      setDeleteError(msg);
      toastError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter change handler
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ name: "", email: "", address: "" });
  };

  // Sort handler
  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortConfig({ key, direction });
  };

  // Form validations matching backend rules
  const validateName = (val: string) => {
    if (!val || val.trim() === "") return "Store name is required";
    if (val.length < 20 || val.length > 60) return "Store name must be between 20 and 60 characters";
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

  const validateOwnerId = (val: string) => {
    if (!val) return "Please select a Store Owner";
    return null;
  };

  const nameError = validateName(formData.name);
  const emailError = validateEmail(formData.email);
  const addressError = validateAddress(formData.address);
  const ownerIdError = validateOwnerId(formData.ownerId);

  // Submit Add Store
  const handleAddStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormTouched({ name: true, email: true, address: true, ownerId: true });

    if (nameError || emailError || addressError || ownerIdError) {
      return;
    }

    try {
      setModalLoading(true);
      await adminAPI.addStore({
        name: formData.name,
        email: formData.email,
        address: formData.address,
        ownerId: Number(formData.ownerId),
      });

      setIsModalOpen(false);
      success(`Store "${formData.name}" was created successfully!`);
      await fetchStores();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create store";
      setModalError(msg);
      toastError(msg);
    } finally {
      setModalLoading(false);
    }
  };

  // DataTable columns definition
  const columns: Column<Store>[] = [
    {
      key: "name",
      label: "Store Name",
      sortable: true,
      render: (row) => {
        const displayName = formatStoreName(row.name);
        return (
          <button
            type="button"
            onClick={() => handleOpenStoreDetails(row)}
            className="text-left group cursor-pointer"
          >
            <p className="font-bold text-slate-900 group-hover:text-indigo-600 leading-tight transition-colors" title={row.name}>
              {displayName}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Store ID #{row.id} • <span className="text-indigo-600 font-semibold group-hover:underline">Click for full details</span>
            </p>
          </button>
        );
      },
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
      render: (row) => {
        const ratingVal = row.rating ? Number(row.rating) : 0;
        return (
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap min-w-[130px]">
            <StarRating value={ratingVal} size="sm" readOnly />
            <span className="font-extrabold text-slate-800 text-xs shrink-0 whitespace-nowrap">
              {ratingVal.toFixed(1)} / 5.0
            </span>
          </div>
        );
      },
    },
    {
      key: "owner",
      label: "Owner Name",
      sortable: false,
      render: (row) => (
        <span className="text-slate-700 text-xs font-semibold truncate block max-w-[160px]">
          {row.owner?.name || "Assigned Owner"}
        </span>
      ),
    },
    {
      key: "actions" as any,
      label: "Actions",
      sortable: false,
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2 shrink-0 whitespace-nowrap">
          <button
            type="button"
            onClick={() => handleOpenStoreDetails(row)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
          >
            View Details
          </button>
          <button
            type="button"
            onClick={() => handleOpenEditRating(row)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
          >
            Edit Rating
          </button>
          <button
            type="button"
            onClick={() => handleOpenDeleteStore(row)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
          >
            Remove
          </button>
        </div>
      ),
    },
  ];

  // FilterBar configs
  const filterConfigs: FilterItemConfig[] = [
    {
      key: "name",
      placeholder: "Filter by store name...",
      type: "text",
      value: filters.name,
    },
    {
      key: "email",
      placeholder: "Filter by store email...",
      type: "text",
      value: filters.email,
    },
    {
      key: "address",
      placeholder: "Filter by address...",
      type: "text",
      value: filters.address,
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Header with "Add Store" button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Stores Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Click on any store to view full information, modify ratings, or remove listings
          </p>
        </div>

        <button
          onClick={handleOpenAddStoreModal}
          className="btn-primary"
        >
          Add Store
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
        <SkeletonTable rows={6} columns={6} />
      ) : (
        <DataTable
          columns={columns}
          data={stores}
          onSort={handleSort}
          sortConfig={sortConfig}
          loading={false}
          emptyMessage="No stores found matching your filters"
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: FULL STORE INFORMATION & CONTROLS                                  */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setIsEditingRatingInDetails(false);
        }}
        title="Store Information"
        maxWidth="max-w-xl"
      >
        {selectedStoreForDetails && (
          <div className="space-y-6 py-2">
            {/* Header / Identity Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                    Store ID #{selectedStoreForDetails.id}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1.5">
                    {selectedStoreForDetails.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 whitespace-nowrap bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  <StarRating value={Number(selectedStoreForDetails.rating) || 0} size="sm" readOnly />
                  <span className="font-extrabold text-slate-900 text-xs">
                    {(Number(selectedStoreForDetails.rating) || 0).toFixed(1)} / 5.0
                  </span>
                </div>
              </div>
            </div>

            {/* Store Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Contact Email
                </span>
                <p className="font-bold text-slate-900 text-sm break-all">
                  {selectedStoreForDetails.email}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Reviews
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {selectedStoreForDetails._count?.ratings ?? "Active"} Customer Submissions
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Store Physical Address
                </span>
                <p className="font-medium text-slate-800 text-sm leading-relaxed">
                  {selectedStoreForDetails.address}
                </p>
              </div>
            </div>

            {/* Assigned Owner Info Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Assigned Store Owner
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Store Owner Account
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedStoreForDetails.owner?.name || "Assigned Owner"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Email: {selectedStoreForDetails.owner?.email || "N/A"}
                  </p>
                </div>

                {selectedStoreForDetails.owner?.id && (
                  <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    Owner ID #{selectedStoreForDetails.owner.id}
                  </span>
                )}
              </div>
            </div>

            {/* Inline Rating Editor (if toggled) */}
            {isEditingRatingInDetails && (
              <form onSubmit={handleSaveRating} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                {editRatingError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {editRatingError}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Adjust Store Rating (1.0 to 5.0)
                    </p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Select new rating score to publish
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <StarRating
                      value={newRatingValue}
                      onChange={(val) => setNewRatingValue(val)}
                      size="md"
                    />
                    <input
                      type="number"
                      min={1}
                      max={5}
                      step={0.1}
                      value={newRatingValue}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        if (!isNaN(v) && v >= 1 && v <= 5) setNewRatingValue(v);
                      }}
                      className="w-16 px-2 py-1 text-center font-bold text-xs bg-white border border-amber-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/60">
                  <button
                    type="button"
                    onClick={() => setIsEditingRatingInDetails(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-amber-100/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editRatingLoading}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {editRatingLoading ? "Saving..." : "Save New Rating"}
                  </button>
                </div>
              </form>
            )}

            {/* Modal Footer Controls: Edit Rating & Delete Store */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingRatingInDetails(!isEditingRatingInDetails);
                    setNewRatingValue(Number(selectedStoreForDetails.rating) || 5);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors cursor-pointer"
                >
                  {isEditingRatingInDetails ? "Close Rating Editor" : "Edit Store Rating"}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenDeleteStore(selectedStoreForDetails)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                >
                  Delete Store
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setIsEditingRatingInDetails(false);
                }}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: ADD STORE                                                          */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Store"
        maxWidth="max-w-xl"
      >
        {modalError && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {modalError}
          </div>
        )}

        <form onSubmit={handleAddStoreSubmit} className="space-y-4">
          <FormInput
            label="Store Name"
            name="name"
            required
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            onBlur={() => setFormTouched((p) => ({ ...p, name: true }))}
            error={formTouched.name ? nameError : null}
            placeholder="e.g. Apex Hardware Store (20-60 chars)"
          />

          <FormInput
            label="Store Email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            onBlur={() => setFormTouched((p) => ({ ...p, email: true }))}
            error={formTouched.email ? emailError : null}
            placeholder="contact@apexstore.com"
          />

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Store Physical Address <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{formData.address.length}/400 max</span>
            </div>
            <textarea
              rows={2}
              required
              value={formData.address}
              onBlur={() => setFormTouched((p) => ({ ...p, address: true }))}
              onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
              placeholder="456 Commerce Boulevard, Retail Plaza #12"
              className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                formTouched.address && addressError ? "border-rose-400" : "border-slate-200"
              } rounded-xl text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20`}
            />
            {formTouched.address && addressError && (
              <p className="text-xs text-rose-600 font-medium">
                {addressError}
              </p>
            )}
          </div>

          <FormSelect
            label="Assign Store Owner"
            name="ownerId"
            required
            value={formData.ownerId}
            onChange={(e) => setFormData((p) => ({ ...p, ownerId: e.target.value }))}
            placeholder={loadingOwners ? "Loading owners..." : "Select a Store Owner..."}
            error={formTouched.ownerId ? ownerIdError : null}
            options={storeOwners.map((owner) => ({
              value: String(owner.id),
              label: `${owner.name} (${owner.email}) — ID #${owner.id}`,
            }))}
          />

          {storeOwners.length === 0 && !loadingOwners && (
            <p className="text-xs text-amber-700">
              No Store Owner users found. Please create a user with the <strong>STORE_OWNER</strong> role first.
            </p>
          )}

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
              disabled={modalLoading || storeOwners.length === 0}
              className="btn-primary"
            >
              {modalLoading ? "Creating..." : "Create Store"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: STANDALONE EDIT STORE RATING                                       */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditRatingOpen}
        onClose={() => setIsEditRatingOpen(false)}
        title={selectedStoreForRating ? `Edit Rating: ${formatStoreName(selectedStoreForRating.name)}` : "Edit Rating"}
        maxWidth="max-w-md"
      >
        {editRatingError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {editRatingError}
          </div>
        )}

        <form onSubmit={handleSaveRating} className="space-y-5 py-1">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Admin Rating Override (1.0 to 5.0 Stars)
            </p>

            <div className="flex justify-center py-1">
              <StarRating
                value={newRatingValue}
                onChange={(val) => setNewRatingValue(val)}
                size="xl"
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Exact Score:</span>
              <input
                type="number"
                min={1}
                max={5}
                step={0.1}
                value={newRatingValue}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (!isNaN(v) && v >= 1 && v <= 5) {
                    setNewRatingValue(v);
                  }
                }}
                className="w-20 px-2 py-1 text-center font-bold text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-indigo-500"
              />
              <span className="text-xs font-bold text-slate-400">/ 5.0</span>
            </div>

            <p className="text-xs text-slate-400">
              This will update the published average score of this store across the platform.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditRatingOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editRatingLoading}
              className="btn-primary"
            >
              {editRatingLoading ? "Saving..." : "Update Store Rating"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: DELETE / REMOVE STORE CONFIRMATION                                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Remove Store Confirmation"
        maxWidth="max-w-md"
      >
        {deleteError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {deleteError}
          </div>
        )}

        <div className="space-y-4 py-1">
          <p className="text-sm text-slate-700 leading-relaxed">
            Are you sure you want to remove <strong className="font-bold text-slate-900">"{selectedStoreForDelete?.name}"</strong> from the directory?
          </p>
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <strong>Notice:</strong> This will delete the store record and remove all associated customer reviews. The assigned store owner account will remain active.
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {deleteLoading ? "Removing..." : "Yes, Remove Store"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Stores;
