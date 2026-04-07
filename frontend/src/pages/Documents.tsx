import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, User } from "lucide-react";
import { motion } from "framer-motion";

const documents = [
  { name: "Faculty Evaluation Form", type: "Administrative", pages: 4, lastSent: "Today, 10:32 AM", sentBy: "Dean's Office" },
  { name: "Research Proposal", type: "Academic", pages: 12, lastSent: "Today, 10:15 AM", sentBy: "Dr. Santos" },
  { name: "Grade Sheets", type: "Academic", pages: 3, lastSent: "Today, 10:10 AM", sentBy: "Registrar" },
  { name: "Memorandum: Semester Schedule", type: "Administrative", pages: 2, lastSent: "Today, 09:45 AM", sentBy: "OVPAA" },
  { name: "Curriculum Revision Draft", type: "Academic", pages: 18, lastSent: "Yesterday", sentBy: "CCIS Faculty" },
  { name: "Leave Application", type: "HR", pages: 1, lastSent: "Yesterday", sentBy: "HR Office" },
];

const typeColor: Record<string, string> = {
  Administrative: "bg-primary/10 text-primary border-primary/20",
  Academic: "bg-gold/15 text-gold-foreground border-gold/30",
  HR: "bg-muted text-muted-foreground border-border",
};

export default function Documents() {
  return (
    <AppLayout title="Documents" subtitle="View document records handled by the system">
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
        {documents.map((doc, i) => (
          <motion.div
            key={doc.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <h3 className="text-sm font-semibold text-foreground leading-tight">{doc.name}</h3>
                </div>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${typeColor[doc.type] || ""}`}>
                  {doc.type}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{doc.pages} page{doc.pages > 1 ? "s" : ""}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {doc.lastSent}</span>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" /> {doc.sentBy}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </AppLayout>
  );
}
