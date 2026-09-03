import React from "react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

export type StatCardColor =
  | "indigo"
  | "emerald"
  | "amber"
  | "purple"
  | "rose"
  | "sky"
  | "slate";

export interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  color?: StatCardColor;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  trend?: {
    value: string | number;
    label?: string;
    positive?: boolean;
  };
  onClick?: () => void;
  actionText?: string;
  actionLink?: string;
  loading?: boolean;
  className?: string;
  footer?: React.ReactNode;
}

const colorThemeMap: Record<
  StatCardColor,
  {
    bg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    titleColor: string;
    actionText: string;
  }
> = {
  indigo: {
    bg: "bg-white hover:bg-indigo-50/20",
    border: "border-slate-200/80 hover:border-indigo-300",
    badgeBg: "bg-indigo-50 border-indigo-200/70",
    badgeText: "text-indigo-800",
    titleColor: "text-slate-600",
    actionText: "text-indigo-600 hover:text-indigo-700",
  },
  emerald: {
    bg: "bg-white hover:bg-emerald-50/20",
    border: "border-slate-200/80 hover:border-emerald-300",
    badgeBg: "bg-emerald-50 border-emerald-200/70",
    badgeText: "text-emerald-800",
    titleColor: "text-slate-600",
    actionText: "text-emerald-600 hover:text-emerald-700",
  },
  amber: {
    bg: "bg-white hover:bg-amber-50/20",
    border: "border-slate-200/80 hover:border-amber-300",
    badgeBg: "bg-amber-50 border-amber-200/70",
    badgeText: "text-amber-800",
    titleColor: "text-slate-600",
    actionText: "text-amber-600 hover:text-amber-700",
  },
  purple: {
    bg: "bg-white hover:bg-purple-50/20",
    border: "border-slate-200/80 hover:border-purple-300",
    badgeBg: "bg-purple-50 border-purple-200/70",
    badgeText: "text-purple-800",
    titleColor: "text-slate-600",
    actionText: "text-purple-600 hover:text-purple-700",
  },
  rose: {
    bg: "bg-white hover:bg-rose-50/20",
    border: "border-slate-200/80 hover:border-rose-300",
    badgeBg: "bg-rose-50 border-rose-200/70",
    badgeText: "text-rose-800",
    titleColor: "text-slate-600",
    actionText: "text-rose-600 hover:text-rose-700",
  },
  sky: {
    bg: "bg-white hover:bg-sky-50/20",
    border: "border-slate-200/80 hover:border-sky-300",
    badgeBg: "bg-sky-50 border-sky-200/70",
    badgeText: "text-sky-800",
    titleColor: "text-slate-600",
    actionText: "text-sky-600 hover:text-sky-700",
  },
  slate: {
    bg: "bg-white hover:bg-slate-50",
    border: "border-slate-200/80 hover:border-slate-300",
    badgeBg: "bg-slate-100 border-slate-200",
    badgeText: "text-slate-800",
    titleColor: "text-slate-600",
    actionText: "text-slate-700 hover:text-slate-900",
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color = "indigo",
  subtitle,
  badge,
  trend,
  onClick,
  actionText,
  actionLink,
  loading = false,
  className = "",
  footer,
}) => {
  const theme = colorThemeMap[color] || colorThemeMap.indigo;

  if (loading) {
    return (
      <div
        className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-pulse space-y-4 ${className}`}
      >
        <div className="h-4 bg-slate-200 rounded-md w-28" />
        <div className="h-9 bg-slate-200 rounded-md w-20" />
        <div className="pt-3 border-t border-slate-100 h-4 bg-slate-200 rounded-md w-32" />
      </div>
    );
  }

  const CardContent = (
    <>
      {/* Header: Title and optional badge/trend */}
      <div className="flex items-center justify-between gap-3">
        <span className={`text-xs font-bold uppercase tracking-wider ${theme.titleColor}`}>
          {title}
        </span>
        {badge ? (
          <div>{badge}</div>
        ) : trend ? (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${
              trend.positive !== false
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {trend.value}
            {trend.label && <span className="opacity-80 font-normal ml-1">{trend.label}</span>}
          </span>
        ) : Icon ? (
          <Icon className="w-4 h-4 text-slate-400" />
        ) : null}
      </div>

      {/* Value */}
      <div className="mt-3">
        {typeof value === "string" || typeof value === "number" ? (
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </div>
        ) : (
          <div className="w-full">{value}</div>
        )}
      </div>

      {/* Subtitle / Descriptive Text */}
      {subtitle && (
        <div className="text-xs text-slate-500 mt-2 font-medium leading-relaxed">
          {subtitle}
        </div>
      )}

      {/* Footer / Action */}
      {footer ? (
        <div className="mt-4 pt-3 border-t border-slate-100">{footer}</div>
      ) : actionLink && actionText ? (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <Link
            to={actionLink}
            className={`text-xs font-bold ${theme.actionText} inline-flex items-center gap-1 transition-colors`}
          >
            <span>{actionText} →</span>
          </Link>
        </div>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <div
        onClick={onClick}
        role="button"
        tabIndex={0}
        className={`rounded-2xl p-6 border ${theme.border} ${theme.bg} shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer ${className}`}
      >
        {CardContent}
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl p-6 border ${theme.border} ${theme.bg} shadow-sm hover:shadow-md transition-all duration-150 ${className}`}
    >
      {CardContent}
    </div>
  );
};

export default StatCard;