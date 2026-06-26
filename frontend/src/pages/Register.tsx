//Register.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, AtSign, MapPin, Eye, EyeOff, Loader2, AlertCircle, Bot, CheckCircle2, KeyRound, Circle } from "lucide-react";
import { motion } from "framer-motion";
import { authAPI } from "../lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/inputs/select";

interface FieldErrors {
  [key: string]: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    registration_code: "",
    full_name: "",
    username: "",
    email: "",
    floor: "",
    room: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);

  const passwordMismatch = formData.confirmPassword.length > 0 && formData.confirmPassword !== formData.password;

  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>_\-+=~`[\];'/\\]/.test(formData.password),
  };

  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);

  const passwordRequirements = [
    { key: "length", label: "At least 8 characters" },
    { key: "uppercase", label: "One uppercase letter" },
    { key: "lowercase", label: "One lowercase letter" },
    { key: "number", label: "One number" },
    { key: "special", label: "One special character" },
  ] as const;

  const isFormValid =
    formData.registration_code.trim() &&
    formData.full_name.trim() &&
    formData.username.trim() &&
    formData.email.trim() &&
    formData.floor.trim() &&
    formData.room.trim() &&
    formData.password.trim() &&
    formData.confirmPassword.trim() &&
    !passwordMismatch &&
    isPasswordStrong;

  // Room options by floor
  const roomsByFloor: { [key: string]: string[] } = {
    "1": ["103", "104", "105"],
    "2": ["206", "214"],
    "3": ["Registrar", "Dean Office", "Library", "AVR"],
  };

  const handleChange = (field: string, value: string) => {
    if (field === "floor") {
      // Reset room when floor changes
      setFormData((prev) => ({ ...prev, [field]: value, room: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      await authAPI.register({
        registration_code: formData.registration_code,
        full_name: formData.full_name,
        username: formData.username,
        email: formData.email,
        floor: formData.floor,
        room: formData.room,
        password: formData.password,
      });

      setSuccess(true);
      setTimeout(() => navigate("/login"), 4000);
    } catch (err: any) {
      const errorMsg = err.message || "Registration failed.";
      if (errorMsg.toLowerCase().includes("registration code")) {
        setFieldErrors({ registration_code: errorMsg });
      } else if (errorMsg.toLowerCase().includes("username")) {
        setFieldErrors({ username: errorMsg });
      } else if (errorMsg.toLowerCase().includes("email")) {
        setFieldErrors({ email: errorMsg });
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isFormValid && !isLoading) {
      handleSubmit(e as any);
    }
  };

  // Success State
  if (success) {
    return (
      <div className="min-h-screen flex overflow-hidden bg-[#f8f3f0]">
        {/* LEFT PANEL — Brand Panel (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-[#800000] via-[#5a0000] to-[#3a0000]">
<div className="absolute w-72 h-72 bg-[#FFD700] rounded-full opacity-[0.07] -top-20 -right-20 pointer-events-none" />
        <div className="absolute w-48 h-48 bg-[#FFD700] rounded-full opacity-[0.05] -bottom-10 -left-10 pointer-events-none" />
        <div className="absolute w-32 h-32 bg-white rounded-full opacity-[0.04] top-1/2 -right-16 pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-full bg-[#FFD700] flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-[#800000]">PD</span>
            </div>
            <div>
              <p className="text-white font-medium text-base">PUP Deliver</p>
              <p className="text-[#FFD700]/70 text-xs">Autonomous Robot Delivery</p>
            </div>
          </div>

          <div className="flex flex-col items-start relative z-10">
            <div className="w-40 h-40 rounded-full border-[1.5px] border-[rgba(255,215,0,0.2)] bg-[rgba(255,215,0,0.08)] flex items-center justify-center mb-7">
              <Bot size={64} strokeWidth={1.5} color="#FFD700" opacity={0.9} />
            </div>
            <h2 className="text-white text-2xl font-medium leading-snug">
              Delivering smarter,<br />one robot at a time.
            </h2>
            <p className="text-white/55 text-sm leading-relaxed mt-3 max-w-xs">
              Autonomous robot delivery system for Institute Technology (ITECH) - Polytechnic University of the Philippines.
            </p>
          </div>
          <p className="text-white/25 text-xs relative z-10">© 2025 PUP Deliver · All rights reserved</p>
        </div>

        {/* RIGHT PANEL — Form Panel */}
        <div className="w-full lg:w-[55%] bg-white flex items-center justify-center p-6 lg:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[rgba(255,215,0,0.06)] to-transparent rounded-full pointer-events-none" />

          <div className="w-full max-w-md relative z-10 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-6">
              <CheckCircle2 size={36} className="text-green-500" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Account created!</h2>
            <p className="text-gray-500 text-sm mb-4">Your account is ready. You can sign in now.</p>
            <Loader2 size={20} className="animate-spin text-[#800000]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#f8f3f0]" onKeyDown={handleKeyDown}>
      {/* LEFT PANEL — Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-[#800000] via-[#5a0000] to-[#3a0000]">
        <div className="absolute w-72 h-72 bg-[#FFD700] rounded-full opacity-[0.07] -top-20 -right-20 pointer-events-none" />
        <div className="absolute w-48 h-48 bg-[#FFD700] rounded-full opacity-[0.05] -bottom-10 -left-10 pointer-events-none" />
        <div className="absolute w-32 h-32 bg-white rounded-full opacity-[0.04] top-1/2 -right-16 pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-full bg-[#FFD700] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-[#800000]">PD</span>
          </div>
          <div>
            <p className="text-white font-medium text-base">PUP Deliver</p>
            <p className="text-[#FFD700]/70 text-xs">Autonomous Robot Delivery</p>
          </div>
        </div>

        <div className="flex flex-col items-start relative z-10">
          <div className="w-40 h-40 rounded-full border-[1.5px] border-[rgba(255,215,0,0.2)] bg-[rgba(255,215,0,0.08)] flex items-center justify-center mb-7">
            <Bot size={64} strokeWidth={1.5} color="#FFD700" opacity={0.9} />
          </div>
          <h2 className="text-white text-2xl font-medium leading-snug">
            Delivering smarter,<br />one robot at a time.
          </h2>
          <p className="text-white/55 text-sm leading-relaxed mt-3 max-w-xs">
            Autonomous robot delivery system for Institute Technology (ITECH) - Polytechnic University of the Philippines.
          </p>
        </div>

        <p className="text-white/25 text-xs relative z-10">© 2026 PUP Deliver · All rights reserved</p>
      </div>

      {/* RIGHT PANEL — Form Panel */}
      <div className="w-full lg:w-[55%] bg-white flex items-center justify-center p-4 lg:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[rgba(255,215,0,0.06)] to-transparent rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10 overflow-y-auto max-h-screen">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-full bg-[#FFD700] flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-[#800000]">PD</span>
              </div>
              <div>
                <p className="text-[#800000] font-medium text-sm">PUP Deliver</p>
                <p className="text-[#800000]/60 text-xs">Autonomous Robot Delivery</p>
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-4">
            <p className="text-[#800000] text-xs font-medium uppercase tracking-widest mb-1">Get started</p>
            <h1 className="text-gray-900 text-xl font-medium mb-1">Create your account</h1>
            <p className="text-gray-500 text-xs">Fill in your details to join PUP Deliver</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Registration Code */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Registration Code</label>
              <div className={`flex items-center gap-3 border rounded-xl px-4 py-2.5 bg-gray-50 focus-within:border-[#800000] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#800000]/10 transition-all ${fieldErrors.registration_code ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
                <KeyRound size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  type={showCode ? "text" : "password"}
                  autoComplete="off"
                  placeholder="Enter the code from your administrator"
                  value={formData.registration_code}
                  onChange={(e) => handleChange("registration_code", e.target.value)}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.registration_code && (
                <p className="text-red-600 text-xs mt-0.5">{fieldErrors.registration_code}</p>
              )}
            </div>

            {/* Full Name & Username */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Full Name</label>
                <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus-within:border-[#800000] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#800000]/10 transition-all">
                  <User size={16} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Juan Dela Cruz"
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    disabled={isLoading}
                    className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Username</label>
                <div className={`flex items-center gap-3 border rounded-xl px-4 py-2.5 bg-gray-50 focus-within:border-[#800000] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#800000]/10 transition-all ${fieldErrors.username ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
                  <AtSign size={16} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder="juandc"
                    value={formData.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    disabled={isLoading}
                    className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 disabled:opacity-50"
                  />
                </div>
                {fieldErrors.username && (
                  <p className="text-red-600 text-xs mt-0.5">{fieldErrors.username}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Email</label>
              <div className={`flex items-center gap-3 border rounded-xl px-4 py-2.5 bg-gray-50 focus-within:border-[#800000] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#800000]/10 transition-all ${fieldErrors.email ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
                <Mail size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 disabled:opacity-50"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-red-600 text-xs mt-0.5">{fieldErrors.email}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Floor</label>
                <Select value={formData.floor} onValueChange={(value) => handleChange("floor", value)} disabled={isLoading}>
                  <SelectTrigger className={`bg-gray-50 border-gray-200 focus:border-[#800000] focus:ring-[#800000]/10 py-2.5 text-sm ${formData.floor && "text-gray-900"}`}>
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Floor</SelectItem>
                    <SelectItem value="2">2nd Floor</SelectItem>
                    <SelectItem value="3">3rd Floor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Room Number</label>
                <Select value={formData.room} onValueChange={(value) => handleChange("room", value)} disabled={isLoading || !formData.floor}>
                  <SelectTrigger className={`bg-gray-50 border-gray-200 focus:border-[#800000] focus:ring-[#800000]/10 py-2.5 text-sm ${formData.room && "text-gray-900"}`}>
                    <SelectValue placeholder={formData.floor ? "Select room" : "Select floor first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.floor && roomsByFloor[formData.floor]?.map((roomNum) => (
                      <SelectItem key={roomNum} value={roomNum}>
                        {roomNum}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Password</label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus-within:border-[#800000] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#800000]/10 transition-all">
                <Lock size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password requirements checklist */}
              {formData.password.length > 0 && (
                <div className="grid grid-cols-2 gap-1 mt-2 px-1">
                  {passwordRequirements.map(({ key, label }) => {
                    const met = passwordChecks[key];
                    return (
                      <div key={key} className="flex items-center gap-1.5">
                        {met ? (
                          <CheckCircle2 size={12} style={{ color: "#16a34a" }} className="flex-shrink-0" />
                        ) : (
                          <Circle size={12} className="text-gray-300 flex-shrink-0" />
                        )}
                        <span className={`text-[10px] transition-colors ${met ? "text-green-600 font-medium" : "text-gray-400"}`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Confirm Password</label>
              <div className={`flex items-center gap-3 border rounded-xl px-4 py-2.5 bg-gray-50 focus-within:border-[#800000] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#800000]/10 transition-all ${passwordMismatch || fieldErrors.confirmPassword ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
                <Lock size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {(passwordMismatch || fieldErrors.confirmPassword) && (
                <p className="text-red-600 text-xs mt-0.5">{fieldErrors.confirmPassword || "Passwords do not match."}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full bg-[#800000] hover:bg-[#660000] disabled:opacity-60 disabled:cursor-not-allowed text-[#FFD700] py-3 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 mt-3"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                "Create my account"
              )}
            </button>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-xl"
              >
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <hr className="flex-1 border-t border-gray-200" />
              <span className="text-gray-400 text-xs">or</span>
              <hr className="flex-1 border-t border-gray-200" />
            </div>

            {/* Login Link */}
            <p className="text-center text-xs text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-[#800000] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </form>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-gray-100">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <p className="text-gray-400 text-xs">Secured · Local network access only</p>
          </div>
        </div>
      </div>
    </div>
  );
}