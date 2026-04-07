import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Battery, MapPin } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RobotCardProps {
  name: string;
  status: "Active" | "Idle" | "Charging" | "Maintenance";
  battery: number;
  location: string;
  deliveriesToday: number;
}

const statusColor: Record<string, string> = {
  Active: "bg-success/15 text-success border-success/30",
  Idle: "bg-muted text-muted-foreground border-border",
  Charging: "bg-gold/15 text-gold-foreground border-gold/30",
  Maintenance: "bg-destructive/10 text-destructive border-destructive/30",
};

export function RobotCard({ name, status, battery, location, deliveriesToday }: RobotCardProps) {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{name}</h3>
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {location}
          </div>
        </div>
        <Badge variant="outline" className={`text-[10px] ${statusColor[status]}`}>
          {status}
        </Badge>
      </div>
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground flex items-center gap-1">
            <Battery className="h-3 w-3" /> Battery
          </span>
          <span className="font-medium">{battery}%</span>
        </div>
        <Progress value={battery} className="h-1.5" />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Deliveries today</span>
        <span className="font-semibold text-foreground">{deliveriesToday}</span>
      </div>
    </Card>
  );
}
