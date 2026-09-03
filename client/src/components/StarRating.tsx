import React, { useState } from "react";
import { Star } from "lucide-react";

export interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg" | "xl";
  readOnly?: boolean;
  showValue?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  size = "md",
  readOnly = false,
  showValue = false,
  className = "",
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const isInteractive = Boolean(onChange) && !readOnly;
  const numericValue = typeof value === "number" && !isNaN(value) ? value : 0;
  const displayValue = hoverValue !== null ? hoverValue : numericValue;

  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4.5 h-4.5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  return (
    <div className={`inline-flex items-center gap-2 shrink-0 whitespace-nowrap ${className}`}>
      <div
        className="inline-flex items-center gap-0.5 shrink-0 whitespace-nowrap"
        onMouseLeave={() => isInteractive && setHoverValue(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = displayValue >= star;
          const isHalfFilled = !isFilled && displayValue >= star - 0.5;

          if (isInteractive) {
            return (
              <button
                key={star}
                type="button"
                onClick={() => onChange && onChange(star)}
                onMouseEnter={() => setHoverValue(star)}
                className="p-1 rounded-lg transition-transform hover:scale-110 focus:outline-hidden focus:ring-2 focus:ring-amber-400/40 cursor-pointer shrink-0"
                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <Star
                  className={`${sizeClasses[size]} shrink-0 transition-colors duration-150 ${
                    isFilled
                      ? "text-amber-500 fill-amber-400"
                      : "text-slate-300 fill-slate-100 hover:text-amber-400"
                  }`}
                />
              </button>
            );
          }

          return (
            <Star
              key={star}
              className={`${sizeClasses[size]} shrink-0 ${
                isFilled
                  ? "text-amber-500 fill-amber-400"
                  : isHalfFilled
                  ? "text-amber-400 fill-amber-200"
                  : "text-slate-200 fill-slate-100"
              }`}
            />
          );
        })}
      </div>

      {showValue && (
        <span className="text-xs font-bold text-slate-700 shrink-0 whitespace-nowrap">
          {numericValue.toFixed(1)} / 5.0
        </span>
      )}
    </div>
  );
};

export default StarRating;
