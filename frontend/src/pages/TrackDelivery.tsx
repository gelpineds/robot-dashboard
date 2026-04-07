import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Package, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TrackingStep {
  label: string;
  time: string;
  done: boolean;
  icon: React.ElementType;
}

const mockSteps: TrackingStep[] = [
  { label: "Request Submitted", time: "10:32 AM", done: true, icon: Clock },
  { label: "Picked Up by DocBot-A1", time: "10:35 AM", done: true, icon: Package },
  { label: "In Transit — Nantes Bldg → Main Bldg", time: "10:37 AM", done: true, icon: MapPin },
  { label: "Delivered to Room 203", time: "—", done: false, icon: CheckCircle },
];

export default function TrackDelivery() {
  const [trackingId, setTrackingId] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) setSearched(true);
  };

  return (
    <AppLayout title="Track Delivery" subtitle="Enter a tracking ID to see live status">
      <div className="max-w-xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. PUP-2406-001"
                  className="pl-9"
                />
              </div>
              <Button type="submit">Track</Button>
            </form>
          </Card>
        </motion.div>

        <AnimatePresence>
          {searched && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Tracking ID</p>
                    <p className="text-sm font-mono font-semibold text-primary">
                      {trackingId || "PUP-2406-001"}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-gold/15 text-gold-foreground border-gold/30 text-[10px]">
                    In Transit
                  </Badge>
                </div>

                <div className="space-y-0">
                  {mockSteps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            step.done
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <step.icon className="h-3.5 w-3.5" />
                        </div>
                        {i < mockSteps.length - 1 && (
                          <div className={`w-px flex-1 min-h-[24px] ${step.done ? "bg-primary/30" : "bg-border"}`} />
                        )}
                      </div>
                      <div className="pb-5">
                        <p className={`text-sm ${step.done ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-muted-foreground border-t pt-4">
                  Assigned Robot: <span className="font-medium text-foreground">DocBot-A1</span> · Est. arrival: <span className="font-medium text-foreground">~3 min</span>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
