import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useToast } from "../context/ToastContext";
import {
  Store as StoreIcon,
  User,
  Mail,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Check,
} from "lucide-react";

export const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    address: false,
    password: false,
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  // Field Validations matching backend logic
  const validateName = (val: string): string | null => {
    if (!val) return "Name is required";
    if (val.length < 20 || val.length > 60) {
      return "20-60 characters required";
    }
    return null;
  };

  const validateEmail = (val: string): string | null => {
    if (!val) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      return "Invalid email address";
    }
    return null;
  };

  const validateAddress = (val: string): string | null => {
    if (!val) return "Address is required";
    if (val.length > 400) {
      return "Max 400 characters allowed";
    }
    return null;
  };

  const validatePassword = (val: string): string | null => {
    if (!val) return "Password is required";
    if (val.length < 8 || val.length > 16) {
      return "Must be 8-16 characters";
    }
    const hasUpperCase = /[A-Z]/.test(val);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val);

    if (!hasUpperCase) {
      return "Must contain 1 uppercase (A-Z)";
    }
    if (!hasSpecialChar) {
      return "Must contain 1 special char (!@#...)";
    }
    return null;
  };

  const nameError = validateName(name);
  const emailError = validateEmail(email);
  const addressError = validateAddress(address);
  const passwordError = validatePassword(password);

  const isFormValid = !nameError && !emailError && !addressError && !passwordError;

  // Password rules checks for real-time pills
  const ruleLength = password.length >= 8 && password.length <= 16;
  const ruleUpper = /[A-Z]/.test(password);
  const ruleSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, address: true, password: true });
    setServerError(null);

    if (!isFormValid) return;

    try {
      setLoading(true);
      await authAPI.register({ name, email, address, password });
      setSuccessMsg("Registration successful! Redirecting to login...");
      success("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please check your details and try again.";
      setServerError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/20 to-slate-100 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl my-auto">
        {/* Compact Header Branding */}
        <div className="text-center mb-3.5">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-linear-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200 mb-1.5">
            <StoreIcon className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Create an Account
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Join StoreRating to discover, rate, and manage stores
          </p>
        </div>

        {/* Compact Card Container */}
        <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl p-4 sm:p-6 border border-slate-100">
          {successMsg && (
            <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {serverError && (
            <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-2.5 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* 2-Column Grid for Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Full Name */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {name.length}/60 (min 20)
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Johnathan Alexander Doe"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border ${
                      touched.name && nameError
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/15"
                    } focus:ring-2 rounded-xl text-xs sm:text-sm transition-all outline-hidden`}
                  />
                </div>
                {touched.name && nameError && (
                  <p className="text-[11px] text-rose-600 mt-0.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    {nameError}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border ${
                      touched.email && emailError
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/15"
                    } focus:ring-2 rounded-xl text-xs sm:text-sm transition-all outline-hidden`}
                  />
                </div>
                {touched.email && emailError && (
                  <p className="text-[11px] text-rose-600 mt-0.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    {emailError}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Residential Address <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {address.length}/400 max
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute top-2.5 left-3 pointer-events-none text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onBlur={() => setTouched((prev) => ({ ...prev, address: true }))}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main Street, Suite 4B, City"
                    className={`w-full pl-9 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border ${
                      touched.address && addressError
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/15"
                    } focus:ring-2 rounded-xl text-xs sm:text-sm transition-all outline-hidden resize-none`}
                  />
                </div>
                {touched.address && addressError && (
                  <p className="text-[11px] text-rose-600 mt-0.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    {addressError}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">8–16 chars</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-9 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border ${
                      touched.password && passwordError
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/15"
                    } focus:ring-2 rounded-xl text-xs sm:text-sm transition-all outline-hidden`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {touched.password && passwordError && (
                  <p className="text-[11px] text-rose-600 mt-0.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3" />
                    {passwordError}
                  </p>
                )}

                {/* Compact Password Live Rule Indicators */}
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                      ruleLength
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-400 border-slate-200"
                    }`}
                  >
                    {ruleLength && <Check className="w-2.5 h-2.5" />} 8-16 chars
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                      ruleUpper
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-400 border-slate-200"
                    }`}
                  >
                    {ruleUpper && <Check className="w-2.5 h-2.5" />} 1 uppercase
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                      ruleSpecial
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-400 border-slate-200"
                    }`}
                  >
                    {ruleSpecial && <Check className="w-2.5 h-2.5" />} 1 special
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading || Boolean(successMsg)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/20 shadow-md shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Compact Footer Login Link */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
