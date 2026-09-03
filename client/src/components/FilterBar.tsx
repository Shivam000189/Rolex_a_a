import React from "react";
import { RotateCcw } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterItemConfig {
  key: string;
  placeholder?: string;
  type: "text" | "select";
  options?: FilterOption[];
  icon?: React.ComponentType<{ className?: string }>;
  value: string;
}

interface FilterBarProps {
  filters: FilterItemConfig[];
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
  showClear?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onClear,
  showClear,
}) => {
  const hasActiveFilters =
    showClear !== undefined
      ? showClear
      : filters.some((f) => f.value && f.value.trim() !== "");

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
      {filters.map((filter) => {
        const Icon = filter.icon;

        if (filter.type === "select") {
          return (
            <div key={filter.key} className="relative min-w-[160px] flex-1 sm:flex-initial">
              {Icon && (
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Icon className="w-4 h-4" />
                </div>
              )}
              <select
                value={filter.value}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className={`w-full ${
                  Icon ? "pl-10" : "pl-3.5"
                } pr-8 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all`}
              >
                {filter.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        return (
          <div key={filter.key} className="relative min-w-[200px] flex-1 sm:flex-initial">
            {Icon && (
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <input
              type="text"
              value={filter.value}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              placeholder={filter.placeholder}
              className={`w-full ${
                Icon ? "pl-10" : "pl-3.5"
              } pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all`}
            />
          </div>
        );
      })}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-hidden focus:ring-2 focus:ring-slate-300"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default FilterBar;
