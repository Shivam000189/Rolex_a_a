import React from "react";
import { Inbox } from "lucide-react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 ${className}`}
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-100/80 border border-slate-200/60 flex items-center justify-center text-slate-400 mb-4 shadow-2xs">
        <Icon className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.5]" />
      </div>
      <h4 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
        {title}
      </h4>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
