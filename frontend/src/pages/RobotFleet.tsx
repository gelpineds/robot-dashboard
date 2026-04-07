import { AppLayout } from "@/components/AppLayout";
import { RobotCard } from "@/components/RobotCard";
import { motion } from "framer-motion";

const robots = [
  { name: "DocBot-A1", status: "Active" as const, battery: 78, location: "Nantes Bldg, 3F Corridor", deliveriesToday: 8 },
  { name: "DocBot-B2", status: "Idle" as const, battery: 92, location: "Main Bldg Lobby", deliveriesToday: 6 },
  { name: "DocBot-C3", status: "Charging" as const, battery: 34, location: "Charging Bay 1", deliveriesToday: 5 },
  { name: "DocBot-D4", status: "Maintenance" as const, battery: 15, location: "Service Room", deliveriesToday: 0 },
];

export default function RobotFleet() {
  return (
    <AppLayout title="Robot Fleet" subtitle="Monitor autonomous delivery robots">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {robots.map((robot, i) => (
            <motion.div
              key={robot.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <RobotCard {...robot} />
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
