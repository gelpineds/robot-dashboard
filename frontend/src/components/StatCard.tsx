import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ label, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <Card className="p-5 flex items-start justify-between">
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-display font-semibold text-foreground mt-1">
          {value}
        </p>
        {trend && (
          <p className={`text-[11px] mt-1 font-medium ${trendUp ? "text-success" : "text-destructive"}`}>
            {trend}
          </p>
        )}
      </div>
      <div className="w-10 h-10 rounded-lg bg-maroon-light flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </Card>
  );
}
