import { Card } from "@/components/ui/layout/card";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/inputs/label";
import { Button } from "@/components/ui/buttons/button";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/utilities";
import { Mail, Lock, LogIn, UserPlus, Info } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/lib/api";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    confirmPassword: "",
    room: "",
  });

  const mutation = useMutation({
    mutationFn: (data: any) =>
      authAPI.register({
        username: data.username,
        email: data.email,
        full_name: data.full_name,
        password: data.password,
        role: "user",
        room: data.room || "General",
      }),
    onSuccess: (res) => {
      toast.success("Registration successful!", {
        description: "You can now sign in with your credentials.",
      });
      
      // Redirect to login
      navigate("/login", { replace: true });
    },
    onError: (error: any) => {
      toast.error("Registration failed", {
        description: error.message || "An error occurred during registration.",
      });
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.full_name || !formData.password) {
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

    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mb-4"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <UserPlus className="w-8 h-8 text-primary" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Robot Monitoring</h1>
          <p className="text-slate-400">Create your account</p>
        </div>

        {/* Register Form */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <Label htmlFor="full_name" className="text-sm font-medium text-slate-200">
                Full Name *
              </Label>
              <Input
                id="full_name"
                type="text"
                placeholder="Juan Dela Cruz"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
                disabled={mutation.isPending}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
              />
            </motion.div>

            {/* Username */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-2"
            >
              <Label htmlFor="username" className="text-sm font-medium text-slate-200">
                Username *
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="jdelacruz"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                disabled={mutation.isPending}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
              />
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
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
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jdelacruz@pup.edu.ph"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled={mutation.isPending}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
              />
            </motion.div>

            {/* Room/Department */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
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
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label htmlFor="password" className="text-sm font-medium text-slate-200">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary/70" />
                  Password (min. 6 chars) *
                </div>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                disabled={mutation.isPending}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
              />
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="space-y-2"
            >
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-200">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary/70" />
                  Confirm Password *
                </div>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                disabled={mutation.isPending}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6 pt-6 border-t border-slate-700 text-center"
          >
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign In
              </button>
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
