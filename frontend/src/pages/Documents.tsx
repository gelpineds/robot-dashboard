import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/layout/card";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/utilities";
import { FileText, Clock, User, Loader, Info } from "lucide-react";
import { motion } from "framer-motion";
import { deliveriesAPI } from "@/lib/api";
import { formatDateOnly } from "@/hooks/useTimeAgo";

const typeColor: Record<string, string> = {
  Administrative: "bg-primary/10 text-primary border-primary/20",
  Academic: "bg-gold/15 text-gold-foreground border-gold/30",
  HR: "bg-muted text-muted-foreground border-border",
};

export default function Documents() {
  const { data: deliveries, isLoading, error } = useQuery({
    queryKey: ['deliveriesHistory'],
    queryFn: deliveriesAPI.getMyHistory,
  });

  if (isLoading) {
    return (
      <AppLayout title="Documents">
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Documents">
        <div className="text-center text-destructive py-8">
          <p>Failed to load documents. Please try again.</p>
        </div>
      </AppLayout>
    );
  }

  const documents = (deliveries || []).map((delivery: any) => ({
    name: delivery.document_name,
    type: "Administrative", // Dynamic based on backend data
    pages: 1, // Placeholder
    lastSent: formatDateOnly(delivery.created_at),
    sentBy: delivery.is_sender
      ? `Sent to ${delivery.recipient}`
      : delivery.is_recipient
      ? `Received from ${delivery.sender}`
      : delivery.sender,   // fallback, shouldn't normally happen
  }));

  return (
    <AppLayout title="Documents">
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
        {documents.length === 0 ? (
          <p className="text-muted-foreground">No documents found</p>
        ) : (
          documents.map((doc, i) => (
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
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <div className={`text-[10px] shrink-0 px-2 py-1 rounded border cursor-help ${typeColor[doc.type] || ""}`}>
                        {doc.type}
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-64 text-xs">
                      <p>Document Type: {doc.type}</p>
                    </HoverCardContent>
                  </HoverCard>
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
          ))
        )}
      </div>
    </AppLayout>
  );
}