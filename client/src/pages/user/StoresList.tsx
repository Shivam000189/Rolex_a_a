import React, { useEffect, useState, useCallback } from "react";
import { userAPI } from "../../services/api";
import type { Store } from "../../types";
import { DataTable } from "../../components/DataTable";
import type { Column, SortConfig } from "../../components/DataTable";
import { Modal } from "../../components/Modal";
import { StarRating } from "../../components/StarRating";
import { SkeletonTable } from "../../components/Skeleton";
import { useToast } from "../../context/ToastContext";
import { useDebounce } from "../../hooks/useDebounce";
import { formatStoreName } from "../../utils/formatters";

export const StoresList: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search and Sort
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 350);

  const [sortConfig, setSortConfig] = useState<SortConfig | null>({
    key: "name",
    direction: "asc",
  });

  // Rating Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(0);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userAPI.getAllStores({
        search: debouncedSearch || undefined,
        name: debouncedSearch || undefined,
        sortBy: sortConfig?.key,
        sortOrder: sortConfig?.direction,
      });
      setStores(res.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load stores";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sortConfig, toastError]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortConfig({ key, direction });
  };

  const openRatingModal = (store: Store) => {
    setSelectedStore(store);
    setRatingScore(store.userRating ?? 0);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore || ratingScore < 1 || ratingScore > 5) {
      setModalError("Please select a rating score between 1 and 5 stars");
      return;
    }

    try {
      setModalLoading(true);
      setModalError(null);

      const hasExistingRating = Boolean(selectedStore.userRating);

      if (hasExistingRating) {
        await userAPI.modifyRating({
          storeId: selectedStore.id,
          value: ratingScore,
        });
        success(`Updated rating for "${selectedStore.name}" to ${ratingScore} Stars`);
      } else {
        await userAPI.submitRating({
          storeId: selectedStore.id,
          value: ratingScore,
        });
        success(`Submitted ${ratingScore} Star rating for "${selectedStore.name}"`);
      }

      setIsModalOpen(false);
      await fetchStores();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to submit rating";
      setModalError(msg);
      toastError(msg);
    } finally {
      setModalLoading(false);
    }
  };

  const getRatingDescriptor = (score: number) => {
    switch (score) {
      case 5:
        return "5 - Excellent (5 Stars)";
      case 4:
        return "4 - Very Good (4 Stars)";
      case 3:
        return "3 - Average (3 Stars)";
      case 2:
        return "2 - Fair (2 Stars)";
      case 1:
        return "1 - Poor (1 Star)";
      default:
        return "Click stars to select rating";
    }
  };

  const columns: Column<Store>[] = [
    {
      key: "name",
      label: "Store Name",
      sortable: true,
      render: (row) => {
        const displayName = formatStoreName(row.name);
        return (
          <div>
            <p className="font-bold text-slate-900 leading-tight" title={row.name}>
              {displayName}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Store ID #{row.id}</p>
          </div>
        );
      },
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
      label: "Overall Rating",
      sortable: true,
      render: (row) => {
        const ratingVal = row.rating ? Number(row.rating) : 0;
        return (
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap min-w-[130px]">
            <StarRating value={ratingVal} size="sm" readOnly />
            <span className="font-bold text-slate-800 text-xs shrink-0 whitespace-nowrap">
              {ratingVal.toFixed(1)} / 5.0
            </span>
          </div>
        );
      },
    },
    {
      key: "userRating",
      label: "Your Rating",
      sortable: false,
      render: (row) => {
        if (row.userRating) {
          return (
            <span className="inline-block px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold shrink-0 whitespace-nowrap">
              {row.userRating} / 5.0 Stars
            </span>
          );
        }
        return (
          <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-medium shrink-0 whitespace-nowrap">
            Not rated
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Action",
      sortable: false,
      headerClassName: "text-right",
      className: "text-right",
      render: (row) => (
        <button
          onClick={() => openRatingModal(row)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
            row.userRating
              ? "text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200"
              : "text-white bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {row.userRating ? "Edit Rating" : "Rate Store"}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Stores Directory
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Explore registered stores, view ratings, and submit your personal feedback
        </p>
      </div>

      {/* Search Bar with Debounce */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="w-full sm:w-96">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search stores by name or address..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {searchInput && (
          <button
            type="button"
            onClick={() => setSearchInput("")}
            className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Stores Table */}
      {loading ? (
        <SkeletonTable rows={5} columns={5} />
      ) : (
        <DataTable
          columns={columns}
          data={stores}
          onSort={handleSort}
          sortConfig={sortConfig}
          loading={false}
          emptyMessage="No stores found matching your search criteria"
        />
      )}

      {/* Rating Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedStore ? `Rate "${formatStoreName(selectedStore.name)}"` : "Rate Store"}
        maxWidth="max-w-md"
      >
        {modalError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {modalError}
          </div>
        )}

        <form onSubmit={handleRatingSubmit} className="space-y-6 text-center py-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Your Rating (1 to 5 Stars)
            </p>
            <div className="flex justify-center py-2">
              <StarRating
                value={ratingScore}
                onChange={(newScore) => setRatingScore(newScore)}
                size="xl"
              />
            </div>
            <p className="text-sm font-bold text-slate-700 mt-2">
              {getRatingDescriptor(ratingScore)}
            </p>
          </div>

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
              disabled={modalLoading || ratingScore === 0}
              className="btn-primary"
            >
              {modalLoading
                ? "Saving..."
                : selectedStore?.userRating
                ? "Update Rating"
                : "Submit Rating"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StoresList;
