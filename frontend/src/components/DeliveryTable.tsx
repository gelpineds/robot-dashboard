import { useNavigate } from "react-router-dom";
import { Eye, MapPin, Bot, XCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { deliveriesAPI } from "@/lib/api";

// ─── Shared status config ─────────────────────────────────────────────────────
export const STATUS_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  "Completed":  { bg: "rgba(22,163,74,0.1)",  color: "#15803d", dot: "#16a34a" },
  "Delivered":  { bg: "rgba(22,163,74,0.1)",  color: "#15803d", dot: "#16a34a" },
  "In Transit": { bg: "rgba(255,215,0,0.18)", color: "#92400e", dot: "#d97706" },
  "Pending":    { bg: "#F3F4F6",              color: "#6B7280", dot: "#9CA3AF" },
  "Failed":     { bg: "rgba(239,68,68,0.1)",  color: "#dc2626", dot: "#ef4444" },
};

// ─── Standard delivery row (legacy / dashboard mode) ─────────────────────────
export interface DeliveryRow {
  id: string;
  document: string;
  from: string;
  to: string;
  status: string;
  time: string;
  robot: string;
}

export function DeliveryTable({ data }: { data: DeliveryRow[] }) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ background: "#800000" }}>
            {["Tracking ID", "Document", "From", "To", "Status", "Robot", "Time"].map((h) => (
              <th key={h} className="text-left px-3 py-2.5 text-[11px] font-semibold text-white tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const s = STATUS_STYLES[row.status] ?? STATUS_STYLES["Pending"];
            return (
              <tr key={row.id} style={{ background: i % 2 === 0 ? "#fff" : "#F9FAFB" }} className="hover:bg-[#FFF5F5] transition-colors">
                <td className="px-3 py-2.5 font-mono text-[11px] font-semibold" style={{ color: "#800000" }}>{row.id}</td>
                <td className="px-3 py-2.5 text-[12px] font-medium text-[#1A1A1A]">{row.document}</td>
                <td className="px-3 py-2.5 text-[12px] text-gray-500">{row.from}</td>
                <td className="px-3 py-2.5 text-[12px] text-gray-500">{row.to}</td>
                <td className="px-3 py-2.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: s.bg, color: s.color }}>{row.status}</span>
                </td>
                <td className="px-3 py-2.5 text-[12px] text-gray-500">{row.robot}</td>
                <td className="px-3 py-2.5 text-[11px] text-gray-400">{row.time}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── History row (full delivery history mode) ─────────────────────────────────
export interface HistoryRow {
  id: string;
  customer: string;
  robot: string;
  from: string;
  to: string;
  datetime: string;
  status: string;
}

interface HistoryTableProps {
  data: HistoryRow[];
  onView?: (row: HistoryRow) => void;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = ["#800000", "#4f46e5", "#0369a1", "#15803d", "#b45309", "#7c3aed"];
function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function HistoryTable({ data, onView }: HistoryTableProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Cancel Delivery mutation (per row)
  const cancelMutation = useMutation({
    mutationFn: async (deliveryId: string) => {
      await deliveriesAPI.updateDelivery(Number(deliveryId), { status: "cancelled" });
    },
    onSuccess: (_, deliveryId) => {
      queryClient.invalidateQueries({ queryKey: ["delivery", deliveryId] });
      queryClient.invalidateQueries({ queryKey: ["deliveries-all"] });
      toast({
        title: "Delivery Cancelled",
        description: "The delivery has been cancelled successfully.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Failed to cancel delivery",
        description: err?.message || "An error occurred.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ background: "#800000" }}>
            {["Order ID", "Customer", "Robot", "Route", "Date & Time", "Status", "Actions"].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-white tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const s = STATUS_STYLES[row.status] ?? STATUS_STYLES["Pending"];
            const bg = avatarColor(row.customer);
            const numericId = row.id.replace(/\D/g, '');
            // Only allow cancel for eligible statuses
            const canCancel = ["Pending", "In Transit", "pending_request", "in_transit"].includes(row.status);
            return (
              <tr key={row.id} style={{ background: i % 2 === 0 ? "#fff" : "#F9FAFB" }} className="hover:bg-[#FFF5F5] transition-colors">
                {/* Order ID */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      navigate(`/track/${numericId}`);
                    }}
                    className="font-mono text-[11px] font-bold hover:underline underline-offset-2"
                    style={{ color: "#800000" }}
                  >
                    {row.id}
                  </button>
                </td>
                {/* Customer */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: bg }}>
                      {initials(row.customer)}
                    </div>
                    <span className="text-[12px] font-medium text-[#1A1A1A] whitespace-nowrap">{row.customer}</span>
                  </div>
                </td>
                {/* Robot */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-[12px] text-gray-600">
                    <Bot className="h-3.5 w-3.5 shrink-0" style={{ color: "#800000" }} />
                    <span className="whitespace-nowrap">{row.robot}</span>
                  </div>
                </td>
                {/* Route */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 whitespace-nowrap">
                    <span className="max-w-[90px] truncate">{row.from}</span>
                    <span className="text-gray-300">→</span>
                    <span className="max-w-[90px] truncate">{row.to}</span>
                  </div>
                </td>
                {/* Date */}
                <td className="px-4 py-3 text-[11px] text-gray-500 whitespace-nowrap">{row.datetime}</td>
                {/* Status */}
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold w-fit" style={{ background: s.bg, color: s.color }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
                    {row.status}
                  </span>
                </td>
                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onView?.(row)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-red-50 transition-colors"
                      title="View details"
                    >
                      <Eye className="h-3.5 w-3.5" style={{ color: "#800000" }} />
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/track/${numericId}`);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-yellow-50 transition-colors"
                      title="Track delivery"
                    >
                      <MapPin className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                    {/* Cancel Delivery quick action */}
                    {canCancel && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-red-50 transition-colors"
                            title="Cancel delivery"
                            disabled={cancelMutation.isPending}
                          >
                            <XCircle className="h-3.5 w-3.5 text-red-600" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Delivery?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this delivery? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={cancelMutation.isPending}>No, keep delivery</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => cancelMutation.mutate(numericId)}
                              disabled={cancelMutation.isPending}
                            >
                              Yes, cancel it
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Order items table (for TrackDelivery) ────────────────────────────────────
export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export function OrderItemsTable({ items, deliveryFee = 30 }: { items: OrderItem[]; deliveryFee?: number }) {
  const subtotal = items.reduce((sum, it) => sum + it.qty * it.price, 0);
  const total    = subtotal + deliveryFee;
  const fmt = (n: number) => `₱${n.toFixed(2)}`;

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ background: "#800000" }}>
            {["Item", "Qty", "Price", "Total Price"].map((h) => (
              <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-white tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.name} style={{ background: i % 2 === 0 ? "#fff" : "#F9FAFB" }}>
              <td className="px-4 py-2.5 text-[12px] font-medium text-[#1A1A1A]">{item.name}</td>
              <td className="px-4 py-2.5 text-[12px] text-gray-500">{item.qty}</td>
              <td className="px-4 py-2.5 text-[12px] text-gray-500">{fmt(item.price)}</td>
              <td className="px-4 py-2.5 text-[12px] font-medium text-[#1A1A1A]">{fmt(item.qty * item.price)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200" style={{ background: "#F9FAFB" }}>
            <td colSpan={3} className="px-4 py-2 text-[11px] text-gray-500 text-right">Subtotal</td>
            <td className="px-4 py-2 text-[12px] text-[#1A1A1A]">{fmt(subtotal)}</td>
          </tr>
          <tr style={{ background: "#F9FAFB" }}>
            <td colSpan={3} className="px-4 py-2 text-[11px] text-gray-500 text-right">Delivery Fee</td>
            <td className="px-4 py-2 text-[12px] text-[#1A1A1A]">{fmt(deliveryFee)}</td>
          </tr>
          <tr className="border-t border-gray-200" style={{ background: "#fff" }}>
            <td colSpan={3} className="px-4 py-3 text-[12px] font-bold text-[#800000] text-right">Total</td>
            <td className="px-4 py-3 text-[13px] font-bold text-[#800000]">{fmt(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}