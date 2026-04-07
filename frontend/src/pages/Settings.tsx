import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SettingsPage() {
  return (
    <AppLayout title="Settings" subtitle="System configuration and preferences">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Configure delivery alerts</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Email notifications</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">SMS alerts for urgent deliveries</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Browser push notifications</Label>
                <Switch defaultChecked />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold text-foreground">Profile</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Your account details</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name</Label>
                <Input defaultValue="Juan Dela Cruz" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Department</Label>
                <Input defaultValue="CCIS" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs">Email</Label>
                <Input defaultValue="jdelacruz@pup.edu.ph" />
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={() => toast.success("Settings saved!")}>
                Save Changes
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
