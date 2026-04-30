import { Card } from "@/components/ui/layout/card";
import { Input } from "@/components/ui/inputs/input";
import { Label } from "@/components/ui/inputs/label";
import { Button } from "@/components/ui/buttons/button";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/utilities";
import { Mail, Lock, LogIn, Info } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/lib/api";
import { useUser } from "@/hooks/useUser";

export default function Login() {
  const navigate = useNavigate();
  const { setUserData } = useUser();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const mutation = useMutation({
    mutationFn: (data: typeof formData) =>
      authAPI.login(data.username, data.password),
    onSuccess: (res) => {
      // Save auth token
      localStorage.setItem("token", res.access_token);
      
      // Save user data
      setUserData(res.user);
      
      toast.success("Login successful!", {
        description: `Welcome, ${res.user.full_name}!`,
      });
      
      // Redirect to dashboard
      navigate("/");
    },
    onError: (error: any) => {
      toast.error("Login failed", {
        description: error.message || "Invalid username or password.",
      });
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error("Please fill in all fields");
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
              <LogIn className="w-8 h-8 text-primary" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Robot Monitoring</h1>
          <p className="text-slate-400">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <Card className="p-6 bg-slate-800/50 border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-5">
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
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
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

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
              >
                {mutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </motion.div>
          </form>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6 pt-6 border-t border-slate-700 text-center"
          >
            <p className="text-sm text-slate-400">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign Up
              </button>
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
