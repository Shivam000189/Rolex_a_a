import React from "react";

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "h-4 w-full" }) => {
  return <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />;
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div
      className={`bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-md shadow-slate-200/40 animate-pulse space-y-4 ${className}`}
    >
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-200 rounded-md w-28" />
        <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
      </div>
      <div className="h-10 bg-slate-200 rounded-lg w-24" />
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="h-3 bg-slate-200 rounded-md w-36" />
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse">
      {/* Table Header skeleton */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded-md flex-1" />
        ))}
      </div>

      {/* Table Rows skeleton */}
      <div className="divide-y divide-slate-100 p-2">
        {Array.from({ length: rows }).map((_, rIndex) => (
          <div key={rIndex} className="px-6 py-4 flex gap-4 items-center">
            {Array.from({ length: columns }).map((_, cIndex) => (
              <div
                key={cIndex}
                className={`h-4 bg-slate-200 rounded-md flex-1 ${
                  cIndex === 0 ? "w-1/3" : ""
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = "",
}) => {
  return (
    <div className={`space-y-2.5 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-slate-200 rounded-md ${
            i === lines - 1 ? "w-3/4" : "w-full"
          }`}
        />
      ))}
    </div>
  );
};

export default Skeleton;
