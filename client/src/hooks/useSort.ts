import { useState, useCallback } from "react";
import type { SortConfig } from "../components/DataTable";

export function useSort(
  defaultKey: string = "name",
  defaultDirection: "asc" | "desc" = "asc"
) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({
    key: defaultKey,
    direction: defaultDirection,
  });

  const toggleSort = useCallback((key: string) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return {
        key,
        direction: "asc",
      };
    });
  }, []);

  return {
    sortConfig,
    toggleSort,
    setSortConfig,
  };
}

export default useSort;
