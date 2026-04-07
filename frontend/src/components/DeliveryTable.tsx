import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const statusStyles: Record<string, string> = {
  "In Transit": "bg-gold/15 text-gold-foreground border-gold/30",
  Delivered: "bg-success/10 text-success border-success/30",
  Pending: "bg-muted text-muted-foreground border-border",
  Picked_Up: "bg-primary/10 text-primary border-primary/20",
};

export interface DeliveryRow {
  id: string;
  document: string;
  from: string;
  to: string;
  status: string;
  time: string;
  robot: string;
}

interface DeliveryTableProps {
  data: DeliveryRow[];
}

export function DeliveryTable({ data }: DeliveryTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs font-medium">Tracking ID</TableHead>
            <TableHead className="text-xs font-medium">Document</TableHead>
            <TableHead className="text-xs font-medium">From</TableHead>
            <TableHead className="text-xs font-medium">To</TableHead>
            <TableHead className="text-xs font-medium">Status</TableHead>
            <TableHead className="text-xs font-medium">Robot</TableHead>
            <TableHead className="text-xs font-medium">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id} className="hover:bg-muted/30">
              <TableCell className="text-xs font-mono text-primary font-medium">
                {row.id}
              </TableCell>
              <TableCell className="text-sm">{row.document}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{row.from}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{row.to}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-medium ${statusStyles[row.status.replace(" ", "_")] || statusStyles[row.status] || ""}`}
                >
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{row.robot}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{row.time}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
