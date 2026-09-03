import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, SearchX, Loader2 } from "lucide-react";

export interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  onSort?: (key: string, direction: "asc" | "desc") => void;
  sortConfig?: SortConfig | null;
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export function DataTable<T = any>({
  columns,
  data,
  onSort,
  sortConfig,
  loading = false,
  emptyMessage = "No data found",
  emptyIcon,
}: DataTableProps<T>) {
  const handleHeaderClick = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;

    let newDirection: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === column.key) {
      newDirection = sortConfig.direction === "asc" ? "desc" : "asc";
    }
    onSort(column.key, newDirection);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-200">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 select-none">
            <tr>
              {columns.map((col) => {
                const isSorted = sortConfig?.key === col.key;
                const isAsc = isSorted && sortConfig?.direction === "asc";
                const isDesc = isSorted && sortConfig?.direction === "desc";

                return (
                  <th
                    key={col.key}
                    scope="col"
                    onClick={() => handleHeaderClick(col)}
                    className={`px-6 py-4 transition-colors ${
                      col.sortable ? "cursor-pointer hover:bg-slate-100/80" : ""
                    } ${col.headerClassName || ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{col.label}</span>
                      {col.sortable && (
                        <span className="text-slate-400">
                          {isAsc ? (
                            <ArrowUp className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
                          ) : isDesc ? (
                            <ArrowDown className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-normal">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-sm font-medium">Loading data...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    {emptyIcon || <SearchX className="w-12 h-12 mb-3 stroke-[1.5] text-slate-300" />}
                    <p className="text-base font-semibold text-slate-700">{emptyMessage}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try clearing or adjusting your filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={(row as any).id ?? rowIndex}
                  className={`${
                    rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                  } hover:bg-indigo-50/40 transition-colors duration-100`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 text-slate-700 ${col.className || ""}`}
                    >
                      {col.render
                        ? col.render(row, rowIndex)
                        : (row as any)[col.key] !== undefined && (row as any)[col.key] !== null
                        ? String((row as any)[col.key])
                        : "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
