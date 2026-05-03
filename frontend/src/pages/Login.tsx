import { Card } from "@/components/ui/layout/card";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/inputs/label";
import { Button } from "@/components/ui/buttons/button";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/utilities";
import { Mail, Lock, LogIn, Info } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/lib/api";
import { useUser } from "@/hooks/useUser";

// ─── Simple Validation ────────────────────────────────────────────────────────
function validateField(name: string, value: string): string {
  if (!value.trim()) return `${name} is required`;
  return "";
}

// ─── Enhanced Field Error ─────────────────────────────────────────────────────
function FieldError({ message }: { message: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-1.5 mt-1"
        >
          <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
          <span className="text-[11px] text-red-400 font-medium tracking-tight">
            {message}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { setUserData } = useUser();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [touched, setTouched] = useState({ username: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [shake, setShake] = useState(false);

  // ─── Real-time Validation Effect ────────────────────────────────────────────
  useEffect(() => {
    setErrors({
      username: touched.username ? validateField("Username", formData.username) : "",
      password: touched.password ? validateField("Password", formData.password) : "",
    });
  }, [formData, touched]);

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => authAPI.login(data.username, data.password),
    onSuccess: (res) => {
      // Save auth token
      localStorage.setItem("token", res.access_token);
      
      // Save user data
      setUserData(res.user);
      toast.success("Login successful!", { description: `Welcome back, ${res.user.full_name}!` });
      navigate("/");
    },
    onError: (error: any) => {
      setLoginError(error.message || "Invalid username or password.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    },
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (loginError) setLoginError("");
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const uErr = validateField("Username", formData.username);
    const pErr = validateField("Password", formData.password);
    
    if (uErr || pErr) {
      setTouched({ username: true, password: true });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    mutation.mutate(formData);
  };

  const isFormValid = formData.username.trim() !== "" && formData.password.trim() !== "";

  return (
    // Background consistent with registration
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#800000] via-[#4a0000] to-[#1a0505]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ 
          opacity: 1, 
          y: 0,
          x: shake ? [-10, 10, -10, 10, 0] : 0 
        }} 
        transition={{ duration: shake ? 0.4 : 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Robot Monitoring</h1>
          <p className="text-white/60 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Card changed to glassmorphism style (semi-transparent) */}
        <Card className="p-7 bg-black/20 backdrop-blur-xl border-white/10 shadow-2xl relative overflow-hidden">
          {mutation.isPending && (
            <motion.div 
              className="absolute top-0 left-0 h-1 bg-red-500"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2 }}
            />
          )}

          <AnimatePresence>
            {loginError && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="flex items-center gap-2.5 rounded-lg px-4 py-3 mb-5 bg-red-500/20 border border-red-500/50"
              >
                <AlertCircle className="w-4 h-4 text-red-200 shrink-0" />
                <p className="text-xs text-red-100 font-medium">{loginError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
<<<<<<< HEAD
            {/* Username */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Label htmlFor="username" className="text-sm font-medium text-slate-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <Mail className="h-4 w-4 text-primary/70" />
                  Username
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 text-xs">
                      <p>Enter the username you registered with</p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </Label>
=======
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-white/70 uppercase tracking-wider ml-1">Username</Label>
>>>>>>> origin/stephen-side
              <Input
                placeholder="Enter your username"
                value={formData.username}
                onBlur={() => handleBlur("username")}
                onChange={(e) => handleChange("username", e.target.value)}
                disabled={mutation.isPending}
                // Input matches the lighter/semi-transparent style
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
              />
              <FieldError message={errors.username} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-white/70 uppercase tracking-wider ml-1">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onBlur={() => handleBlur("password")}
                  onChange={(e) => handleChange("password", e.target.value)}
                  disabled={mutation.isPending}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:ring-red-500/50 focus:border-red-500/50 transition-all pr-10"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FieldError message={errors.password} />
            </div>

            <Button 
              type="submit" 
              disabled={mutation.isPending || (Object.values(touched).some(v => v) && !isFormValid)} 
              className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all active:scale-[0.98] font-semibold"
            >
<<<<<<< HEAD
              <Label htmlFor="password" className="text-sm font-medium text-slate-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <Lock className="h-4 w-4 text-primary/70" />
                  Password
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 text-xs">
                      <p>Your password should be kept confidential and secure</p>
                    </HoverCardContent>
                  </HoverCard>
=======
              {mutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Verifying...</span>
>>>>>>> origin/stephen-side
                </div>
              ) : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 pt-5 text-center border-t border-white/10">
            <p className="text-sm text-white/50">
              Don't have an account?{" "}
              <button 
                onClick={() => navigate("/register")} 
                 className="text-white hover:underline font-medium transition-colors drop-shadow-sm"> Sign Up
              </button>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}