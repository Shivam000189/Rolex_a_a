import React from "react";
import { AlertCircle } from "lucide-react";

export interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  name?: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
  required?: boolean;
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  helperText?: string;
  maxLength?: number;
  className?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  required = false,
  placeholder,
  icon: Icon,
  disabled = false,
  helperText,
  maxLength,
  className = "",
  ...props
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={name}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
        >
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
        {maxLength && (
          <span className="text-[11px] text-slate-400">
            {String(value || "").length}/{maxLength} max
          </span>
        )}
      </div>

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
          className={`w-full ${
            Icon ? "pl-10" : "pl-3.5"
          } pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border ${
            error
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15"
              : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/15"
          } rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:ring-3 focus:outline-hidden disabled:bg-slate-100 disabled:cursor-not-allowed transition-all`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-400 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};

export default FormInput;
