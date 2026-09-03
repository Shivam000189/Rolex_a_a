import React from "react";
import { Loader2 } from "lucide-react";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  overlay?: boolean;
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  overlay = false,
  text,
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
    xl: "w-14 h-14",
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-indigo-600 animate-spin`} />
      {text && <p className="text-sm font-medium text-slate-600">{text}</p>}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center gap-3">
          <Loader2 className={`${sizeClasses[size]} text-indigo-600 animate-spin`} />
          {text && <p className="text-sm font-bold text-slate-800">{text}</p>}
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
