import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, Bot, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { authAPI } from "../lib/api";
import { useUser } from "../hooks/useUser";

export default function Login() {
  const navigate = useNavigate();
  const { setUserData } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError("");

    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem("token", data.access_token || "");
      
      // Store user data if returned from login
      if (data.user) {
        setUserData(data.user);
      }
      
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#f8f3f0]" onKeyDown={handleKeyDown}>
      {/* LEFT PANEL — Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-[#800000] via-[#5a0000] to-[#3a0000]">
        {/* Decorative circles */}
        {/* eslint-disable-next-line */}
        <div className="absolute w-72 h-72 bg-[#FFD700] rounded-full opacity-[0.07] -top-20 -right-20 pointer-events-none" />
        {/* eslint-disable-next-line */}
        <div className="absolute w-48 h-48 bg-[#FFD700] rounded-full opacity-[0.05] -bottom-10 -left-10 pointer-events-none" />
        {/* eslint-disable-next-line */}
        <div className="absolute w-32 h-32 bg-white rounded-full opacity-[0.04] top-1/2 -right-16 pointer-events-none" />

        {/* Logo Row */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-full bg-[#FFD700] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-[#800000]">PD</span>
          </div>
          <div>
            <p className="text-white font-medium text-base">PUP Deliver</p>
            <p className="text-[#FFD700]/70 text-xs">Autonomous Robot Delivery</p>
          </div>
        </div>

        {/* Hero Content */}
        <div className="flex flex-col items-start relative z-10">
          {/* Robot Ring */}
          <div className="w-40 h-40 rounded-full border-[1.5px] border-[rgba(255,215,0,0.2)] bg-[rgba(255,215,0,0.08)] flex items-center justify-center mb-7">
            <Bot size={64} strokeWidth={1.5} color="#FFD700" opacity={0.9} />
          </div>

          {/* Headline */}
          <h2 className="text-white text-2xl font-medium leading-snug">
            Delivering smarter,<br />one robot at a time.
          </h2>

          {/* Subtext */}
          <p className="text-white/55 text-sm leading-relaxed mt-3 max-w-xs">
            Autonomous robot delivery system for Institute Technology (ITECH) - Polytechnic University of the Philippines.
          </p>
        </div>

        {/* Copyright */}
        <p className="text-white/25 text-xs relative z-10">© 2026 PUP Deliver · All rights reserved</p>
      </div>

      {/* RIGHT PANEL — Form Panel */}
      <div className="w-full lg:w-[55%] bg-white flex items-center justify-center p-6 lg:p-16 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[rgba(255,215,0,0.06)] to-transparent rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-[#FFD700] flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-[#800000]">PD</span>
              </div>
              <div>
                <p className="text-[#800000] font-medium text-base">PUP Deliver</p>
                <p className="text-[#800000]/60 text-xs">Autonomous Robot Delivery</p>
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-8">
            <p className="text-[#800000] text-xs font-medium uppercase tracking-widest mb-2">Welcome back</p>
            <h1 className="text-gray-900 text-2xl font-medium mb-2">Sign in to your account</h1>
            <p className="text-gray-500 text-sm">Enter your credentials to access PUP Deliver</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email/Username Field */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Email or Username</label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus-within:border-[#800000] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#800000]/10 transition-all">
                <Mail size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  autoComplete="email"
                  placeholder="you@pup.edu.ph or username"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus-within:border-[#800000] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#800000]/10 transition-all">
                <Lock size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-[#800000] hover:bg-[#660000] disabled:opacity-60 disabled:cursor-not-allowed text-[#FFD700] py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                "Sign in to PUP Deliver"
              )}
            </button>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl"
              >
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <hr className="flex-1 border-t border-gray-200" />
              <span className="text-gray-400 text-xs">or</span>
              <hr className="flex-1 border-t border-gray-200" />
            </div>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#800000] font-medium hover:underline">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}