import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/layout/card";
import { Label } from "@/components/ui/inputs/label";
import { Input } from "@/components/ui/inputs/input";
import { Switch } from "@/components/ui/inputs/switch";
import { Button } from "@/components/ui/buttons/button";
import { Separator } from "@/components/ui/layout/separator";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/utilities";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";
import { User, Mail, Badge, Briefcase, Info } from "lucide-react";

export default function SettingsPage() {
  const { user, getInitials } = useUser();

  return (
    <AppLayout title="Settings">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-gradient-to-r from-[#800000] to-[#600000] rounded-xl p-6 shadow-sm overflow-hidden relative">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: "#FFD700" }} />
            
            <div className="relative z-10 flex items-center gap-6">
              {/* Avatar */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-[#800000] shrink-0 shadow-lg border-4 border-white"
                style={{ background: "#FFD700" }}
              >
                {getInitials()}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{user?.full_name || "User"}</h2>
                <p className="text-[#FFD700] font-semibold text-sm mt-1">{user?.role?.toUpperCase() || "STAFF"}</p>
                <p className="text-white/70 text-sm mt-2">{user?.email || "user@pup.edu.ph"}</p>
              </div>

              {/* Status Badge */}
              <div className="text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-white text-sm font-semibold">Active</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings Section */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 space-y-6">
            {/* Profile Details */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#800000" }}>
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Profile Information</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Your account details</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name</Label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{user?.full_name || "Loading..."}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Role</Label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <Badge className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{user?.role || "N/A"}</span>
                </div>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Email</Label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{user?.email || "Loading..."}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Room</Label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{user?.room || "N/A"}</span>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Save Button */}
            <div className="flex gap-3">
              <Button 
                onClick={() => toast.success("Settings saved successfully!")}
                className="text-white font-semibold"
                style={{ background: "#800000" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#660000")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#800000")}
              >
                Save Changes
              </Button>
              <Button variant="outline" className="text-gray-600">
                Cancel
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
