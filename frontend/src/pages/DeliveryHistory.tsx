import { AppLayout } from "@/components/AppLayout";
import { DeliveryTable, DeliveryRow } from "@/components/DeliveryTable";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const allDeliveries: DeliveryRow[] = [
  { id: "PUP-2406-001", document: "Faculty Evaluation Form", from: "Dean's Office · CCIS", to: "Room 401 · Nantes Bldg", status: "In Transit", time: "2 min ago", robot: "DocBot-A1" },
  { id: "PUP-2406-002", document: "Research Proposal", from: "Research Office", to: "Room 203 · Main Bldg", status: "Delivered", time: "15 min ago", robot: "DocBot-B2" },
  { id: "PUP-2406-003", document: "Grade Sheets (3)", from: "Registrar", to: "Faculty Room · CHK", status: "Pending", time: "18 min ago", robot: "DocBot-A1" },
  { id: "PUP-2406-004", document: "Memo: Sem Schedule", from: "OVPAA", to: "All Dept Heads", status: "Delivered", time: "1 hr ago", robot: "DocBot-C3" },
  { id: "PUP-2406-005", document: "Curriculum Revision", from: "CCIS Faculty", to: "Dean's Office", status: "Delivered", time: "2 hr ago", robot: "DocBot-B2" },
  { id: "PUP-2406-006", document: "Leave Application", from: "HR Office", to: "Room 102 · Main Bldg", status: "Delivered", time: "3 hr ago", robot: "DocBot-A1" },
  { id: "PUP-2406-007", document: "Budget Proposal", from: "Accounting", to: "President's Office", status: "Delivered", time: "Yesterday", robot: "DocBot-C3" },
];

export default function DeliveryHistory() {
  const [search, setSearch] = useState("");
  const filtered = allDeliveries.filter(
    (d) =>
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.document.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Delivery History" subtitle="Browse all past and ongoing deliveries">
      <div className="max-w-5xl mx-auto space-y-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID or document..."
              className="pl-9"
            />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5">
            <DeliveryTable data={filtered} />
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
