import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, FileText, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const buildings = [
  "Main Building",
  "Nantes Building",
  "CHK Building",
  "Mabini Campus",
  "Sta. Mesa Campus",
  "Laboratory Bldg",
];

const docTypes = [
  "Faculty Evaluation Form",
  "Grade Sheets",
  "Memorandum",
  "Research Proposal",
  "Administrative Letter",
  "Student Records",
  "Other",
];

export default function RequestDelivery() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Delivery request submitted!", {
        description: "A robot will pick up your document shortly.",
      });
    }, 1200);
  };

  return (
    <AppLayout title="Request Delivery" subtitle="Submit a new document delivery request">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Document Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <FileText className="h-4 w-4 text-primary" />
                  Document Information
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Document Type</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {docTypes.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Number of Pages</Label>
                    <Input type="number" placeholder="e.g. 5" min={1} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Description / Notes</Label>
                  <Textarea placeholder="Any special handling instructions..." rows={3} />
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-4 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground pt-4">
                  <MapPin className="h-4 w-4 text-primary" />
                  Pickup & Destination
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Pickup Building</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select building" /></SelectTrigger>
                      <SelectContent>
                        {buildings.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Pickup Room</Label>
                    <Input placeholder="e.g. Room 401" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Destination Building</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select building" /></SelectTrigger>
                      <SelectContent>
                        {buildings.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Destination Room</Label>
                    <Input placeholder="e.g. Faculty Room" />
                  </div>
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-4 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground pt-4">
                  <Clock className="h-4 w-4 text-primary" />
                  Priority
                </div>
                <Select>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full sm:w-auto gap-2" disabled={loading}>
                  <Send className="h-4 w-4" />
                  {loading ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
