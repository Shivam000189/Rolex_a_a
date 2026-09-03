import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastCard: React.FC<{
  toast: ToastItem;
  onClose: () => void;
}> = ({ toast, onClose }) => {
  const { type, message } = toast;

  const styles: Record<
    ToastType,
    {
      bg: string;
      border: string;
      icon: React.ReactNode;
      text: string;
      progress: string;
    }
  > = {
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      text: "text-emerald-900",
      progress: "bg-emerald-500",
    },
    error: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
      text: "text-rose-900",
      progress: "bg-rose-500",
    },
    info: {
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      icon: <Info className="w-5 h-5 text-indigo-600 shrink-0" />,
      text: "text-indigo-900",
      progress: "bg-indigo-500",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      text: "text-amber-900",
      progress: "bg-amber-500",
    },
  };

  const currentStyle = styles[type];

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden w-full max-w-sm rounded-2xl border ${currentStyle.border} ${currentStyle.bg} p-4 shadow-xl shadow-slate-900/10 transform transition-all duration-300 animate-in slide-in-from-top-4 fade-in`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {currentStyle.icon}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className={`text-sm font-semibold ${currentStyle.text} leading-snug break-words`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-black/5 transition-colors shrink-0"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Auto-dismiss progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
        <div
          className={`h-full ${currentStyle.progress} transition-all`}
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastItem = { id, message, type, duration };

      setToasts((prev) => {
        const next = [newToast, ...prev];
        // Keep max 3 toasts
        return next.slice(0, 3);
      });

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => showToast(message, "success", duration),
    [showToast]
  );
  const error = useCallback(
    (message: string, duration?: number) => showToast(message, "error", duration),
    [showToast]
  );
  const info = useCallback(
    (message: string, duration?: number) => showToast(message, "info", duration),
    [showToast]
  );
  const warning = useCallback(
    (message: string, duration?: number) => showToast(message, "warning", duration),
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ showToast, success, error, info, warning, removeToast }}
    >
      {children}

      {/* Fixed Toast Container in Top Right */}
      <div
        className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
