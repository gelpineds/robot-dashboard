import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Mail, Lock, UserPlus, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/lib/api";

// --- Validation Helper ---
function getFieldError(name: string, value: string, password?: string): string {
  if (!value || !value.trim()) return `${name} is required`;
  if (name === "Email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format";
  if (name === "Password" && value.length < 6) return "Min. 6 characters required";
  if (name === "Confirm Password" && value !== password) return "Passwords do not match";
  return "";
}

// --- Password Strength ---
function getStrength(pass: string) {
  let score = 0;
  if (pass.length >= 6) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return score;
}

function FieldError({ message }: { message: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-1.5 mt-1">
          <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
          <span className="text-[11px] text-red-400 font-medium tracking-tight">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    registration_code: "",
    username: "",
    email: "",
    full_name: "",
    password: "",
    confirmPassword: "",
    floor: "",
    room_number: "",
  });
  const [codeError, setCodeError] = useState("");

  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setErrors({
      full_name: touched.full_name ? getFieldError("Full Name", formData.full_name) : "",
      username: touched.username ? getFieldError("Username", formData.username) : "",
      email: touched.email ? getFieldError("Email", formData.email) : "",
      floor: touched.floor ? getFieldError("Floor", formData.floor) : "",
      room_number: touched.room_number ? getFieldError("Room Number", formData.room_number) : "",
      password: touched.password ? getFieldError("Password", formData.password) : "",
      confirmPassword: touched.confirmPassword ? getFieldError("Confirm Password", formData.confirmPassword, formData.password) : "",
    });
  }, [formData, touched]);

  const strength = getStrength(formData.password);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const combinedRoom = `${data.floor} - Room ${data.room_number}`;
      return authAPI.register({
        registration_code: data.registration_code,
        username: data.username,
        email: data.email,
        full_name: data.full_name,
        password: data.password,
        room: combinedRoom || "General",
      });
    },
    onSuccess: (res) => {
      toast.success("Registration successful!", {
        description: "You can now sign in with your credentials.",
      });

      // Redirect to login
      navigate("/login", { replace: true });
    },
    onError: (error: any) => {
      const message: string = error.message || "";

      if (message.includes("Registration code is required")) {
        setCodeError("Please enter the registration code.");
      } else if (message.includes("Invalid registration code")) {
        setCodeError("Invalid registration code. Please contact your administrator.");
      } else {
        setCodeError("");
        toast.error("Registration failed", {
          description: message || "An error occurred during registration.",
        });
      }
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === "registration_code") setCodeError("");
  };

  // Combine floor and room before submitting
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Registration code — inline validation before hitting the API
    if (!formData.registration_code.trim()) {
      setCodeError("Registration code is required.");
      return;
    }

    if (!formData.username || !formData.email || !formData.full_name || !formData.password || !formData.floor || !formData.room_number) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setCodeError("");
    mutation.mutate(formData);
  };

  const isFormValid = !getFieldError("Full Name", formData.full_name) &&
                      !getFieldError("Username", formData.username) &&
                      !getFieldError("Email", formData.email) &&
                      !getFieldError("Floor", formData.floor) &&
                      !getFieldError("Room Number", formData.room_number) &&
                      !getFieldError("Password", formData.password) &&
                      formData.password === formData.confirmPassword;

  const inputGlowClasses = "bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-white/40 focus:ring-2 focus:ring-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all duration-300";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#600000] via-[#4a0000] to-[#0a0f1e]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)] mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Robot Monitoring</h1>
          <p className="text-slate-300">Create your account</p>
        </div>

        <Card className="p-6 bg-black/40 backdrop-blur-md border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
          <form onSubmit={handleSubmit} className="space-y-4">
<<<<<<< HEAD

            {/* Registration Code — FIRST field */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <Label htmlFor="registration_code" className="text-sm font-medium text-slate-200">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-primary/70" />
                  Registration Code *
                </div>
              </Label>
              <Input
                id="registration_code"
                type="password"
                placeholder="Enter the code provided by your administrator"
                value={formData.registration_code}
                onChange={(e) => handleChange("registration_code", e.target.value)}
                disabled={mutation.isPending}
                className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary ${codeError ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {codeError && (
                <p className="text-xs text-red-400 mt-1">{codeError}</p>
              )}
            </motion.div>

            {/* Full Name */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-2"
            >
              <Label htmlFor="full_name" className="text-sm font-medium text-slate-200">
                Full Name *
              </Label>
=======
            
            {/* Full Name */}
            <div className="space-y-1">
              <Label className="text-white/90">Full Name *</Label>
>>>>>>> origin/stephen-side
              <Input
                placeholder="Juan Dela Cruz"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                className={inputGlowClasses}
              />
              <FieldError message={errors.full_name} />
            </div>

            {/* Username */}
<<<<<<< HEAD
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Label htmlFor="username" className="text-sm font-medium text-slate-200">
                Username *
              </Label>
=======
            <div className="space-y-1">
              <Label className="text-white/90">Username *</Label>
>>>>>>> origin/stephen-side
              <Input
                placeholder="jdelacruz"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className={inputGlowClasses}
              />
              <FieldError message={errors.username} />
            </div>

            {/* Email */}
<<<<<<< HEAD
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-2"
            >
              <Label htmlFor="email" className="text-sm font-medium text-slate-200">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary/70" />
                  Email *
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 text-xs">
                      <p>Use your institutional email for account verification</p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
=======
            <div className="space-y-1">
              <Label className="text-white/90 flex items-center gap-2">
                <Mail className="h-4 w-4 text-white/70" /> Email *
>>>>>>> origin/stephen-side
              </Label>
              <Input
                type="email"
                placeholder="jdelacruz@pup.edu.ph"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={inputGlowClasses}
              />
              <FieldError message={errors.email} />
            </div>

<<<<<<< HEAD
            {/* Room/Department */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="room" className="text-sm font-medium text-slate-200">
                Department/Room (Optional)
              </Label>
              <Input
                id="room"
                type="text"
                placeholder="CCIS, Main Building, etc."
                value={formData.room}
                onChange={(e) => handleChange("room", e.target.value)}
                disabled={mutation.isPending}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
              />
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-2"
            >
              <Label htmlFor="password" className="text-sm font-medium text-slate-200">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary/70" />
                  Password (min. 6 chars) *
                </div>
=======
            {/* === BAGONG FLOOR AT ROOM DROPDOWNS === */}
            <div className="grid grid-cols-2 gap-4">
              {/* Floor */}
              <div className="space-y-1">
                <Label className="text-white/90">Floors *</Label>
                <Select 
                  onValueChange={(val) => handleChange("floor", val)} 
                  value={formData.floor}
                >
                  <SelectTrigger className={inputGlowClasses}>
                    <SelectValue placeholder="Select Floor" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a0000] border-white/10 text-white">
                    <SelectItem value="1st Floor">1st Floor</SelectItem>
                    <SelectItem value="2nd Floor">2nd Floor</SelectItem>
                    <SelectItem value="3rd Floor">3rd Floor</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError message={errors.floor} />
              </div>

              {/* Room Number */}
              <div className="space-y-1">
                <Label className="text-white/90">Room Number *</Label>
                <Select 
                  onValueChange={(val) => handleChange("room_number", val)} 
                  value={formData.room_number}
                >
                  <SelectTrigger className={inputGlowClasses}>
                    <SelectValue placeholder="Select Room" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a0000] border-white/10 text-white">
                    <SelectItem value="101">Room 101</SelectItem>
                    <SelectItem value="102">Room 102</SelectItem>
                    <SelectItem value="201">Room 201</SelectItem>
                    <SelectItem value="202">Room 202</SelectItem>
                    <SelectItem value="CCIS Lab">CCIS Lab</SelectItem>
                    <SelectItem value="Admin Office">Admin Office</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError message={errors.room_number} />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label className="text-white/90 flex items-center gap-2">
                <Lock className="h-4 w-4 text-white/70" /> Password *
>>>>>>> origin/stephen-side
              </Label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={inputGlowClasses}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formData.password && (
                <div className="flex gap-1 mt-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? (strength <= 2 ? 'bg-orange-500' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]') : 'bg-white/10'}`} />
                  ))}
                </div>
              )}
              <FieldError message={errors.password} />
            </div>

            {/* Confirm Password */}
<<<<<<< HEAD
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-200">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary/70" />
                  Confirm Password *
                </div>
=======
            <div className="space-y-1">
              <Label className="text-white/90 flex items-center gap-2">
                <Lock className="h-4 w-4 text-white/70" /> Confirm Password *
>>>>>>> origin/stephen-side
              </Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className={inputGlowClasses}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError message={errors.confirmPassword} />
            </div>

<<<<<<< HEAD
            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="pt-2"
            >
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
              >
                {mutation.isPending ? "Creating account..." : "Create Account"}
              </Button>
            </motion.div>
          </form>

          {/* Sign In Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="mt-6 pt-6 border-t border-slate-700 text-center"
          >
            <p className="text-sm text-slate-400">
=======
            <Button type="submit" disabled={mutation.isPending || !isFormValid} className="w-full bg-[#800000] hover:bg-[#a00000] text-white font-bold mt-2 shadow-[0_0_15px_rgba(128,0,0,0.4)] border border-white/10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(128,0,0,0.6)]">
              {mutation.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-slate-300">
>>>>>>> origin/stephen-side
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="text-white hover:underline font-medium transition-colors drop-shadow-sm">Sign In</button>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}