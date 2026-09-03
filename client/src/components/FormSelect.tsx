import React from "react";
import { AlertCircle } from "lucide-react";

export interface FormSelectOption {
  value: string | number;
  label: string;
}

export interface FormSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label: string;
  name?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: FormSelectOption[];
  error?: string | null;
  required?: boolean;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  className?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  placeholder,
  icon: Icon,
  disabled = false,
  className = "",
  ...props
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={name}
        className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
      >
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full ${
            Icon ? "pl-10" : "pl-3.5"
          } pr-8 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border ${
            error
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15"
              : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/15"
          } rounded-xl text-sm font-medium text-slate-700 focus:ring-3 focus:outline-hidden disabled:bg-slate-100 disabled:cursor-not-allowed transition-all`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};

export default FormSelect;
