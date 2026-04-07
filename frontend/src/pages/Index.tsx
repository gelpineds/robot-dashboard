import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { DeliveryTable, DeliveryRow } from "@/components/DeliveryTable";
import { RobotCard } from "@/components/RobotCard";
import { Card } from "@/components/ui/card";
import { Send, Package, CheckCircle, Bot, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const recentDeliveries: DeliveryRow[] = [
  { id: "PUP-2406-001", document: "Faculty Evaluation Form", from: "Dean's Office · CCIS", to: "Room 401 · Nantes Bldg", status: "In Transit", time: "2 min ago", robot: "DocBot-A1" },
  { id: "PUP-2406-002", document: "Research Proposal", from: "Research Office", to: "Room 203 · Main Bldg", status: "Delivered", time: "15 min ago", robot: "DocBot-B2" },
  { id: "PUP-2406-003", document: "Grade Sheets (3)", from: "Registrar", to: "Faculty Room · CHK", status: "Pending", time: "18 min ago", robot: "DocBot-A1" },
  { id: "PUP-2406-004", document: "Memo: Sem Schedule", from: "OVPAA", to: "All Dept Heads", status: "Delivered", time: "1 hr ago", robot: "DocBot-C3" },
];

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35 } }),
};

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Dashboard" subtitle="Document delivery overview">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden"
          animate="show"
        >
          {[
            { label: "Active Deliveries", value: 4, icon: Send, trend: "+2 from yesterday", trendUp: true },
            { label: "Total Today", value: 23, icon: Package, trend: "+18% this week", trendUp: true },
            { label: "Completed", value: 19, icon: CheckCircle },
            { label: "Robots Online", value: "3/4", icon: Bot },
          ].map((s, i) => (
            <motion.div key={s.label} custom={i} variants={fade}>
              <StatCard {...s} />
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent deliveries */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center justify-between p-5 pb-0">
                <h2 className="text-sm font-semibold text-foreground">Recent Deliveries</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary gap-1"
                  onClick={() => navigate("/history")}
                >
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
              <div className="p-5 pt-4">
                <DeliveryTable data={recentDeliveries} />
              </div>
            </Card>
          </motion.div>

          {/* Robot fleet mini */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Robot Fleet</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary gap-1"
                onClick={() => navigate("/robots")}
              >
                Manage <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <RobotCard name="DocBot-A1" status="Active" battery={78} location="Nantes Bldg, 3F" deliveriesToday={8} />
            <RobotCard name="DocBot-B2" status="Idle" battery={92} location="Main Bldg Lobby" deliveriesToday={6} />
            <RobotCard name="DocBot-C3" status="Charging" battery={34} location="Charging Bay 1" deliveriesToday={5} />
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
