import { useState, useEffect, useRef, useCallback } from "react";
import { Check, X, Inbox, Clock, Package, MapPin, Bot, Banknote, AlertTriangle } from "lucide-react";
import { useDelivery } from "@/lib/deliveryStore";
import type { Delivery } from "@/lib/types";
import { AppLayout } from "@/components/AppLayout";
import { toast } from "@/components/ui/feedback/sonner";

// ─── Simulated recipient (matches seed USER_MARIA in deliveryStore) ──────────
const RECIPIENT_ID = "usr-002";
const RECIPIENT_NAME = "Maria Santos";
const RECIPIENT_ROOM = "Room 214, Main Building";

// ─── Status badge config ─────────────────────────────────────────────────────
type BadgeStatus =
  | "pending_approval"
  | "robot_assigned"
  | "in_transit"
  | "arrived"
  | "completed"
  | "rejected"
  | "cancelled";

const STATUS_BADGE: Record<BadgeStatus, { label: string; bg: string; color: string }> = {
  pending_approval: { label: "Pending",    bg: "#fef9c3", color: "#854d0e" },
  robot_assigned:   { label: "Assigned",   bg: "#dbeafe", color: "#1e40af" },
  in_transit:       { label: "In Transit", bg: "#fef9c3", color: "#854d0e" },
  arrived:          { label: "Arrived",    bg: "#dcfce7", color: "#166534" },
  completed:        { label: "Completed",  bg: "#dcfce7", color: "#166534" },
  rejected:         { label: "Rejected",   bg: "#fee2e2", color: "#991b1b" },
  cancelled:        { label: "Cancelled",  bg: "#f3f4f6", color: "#6b7280" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTimestamp(ts: string) {
  try {
    return new Intl.DateTimeFormat("en-PH", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ts));
  } catch {
    return ts;
  }
}

// ─── Decline Confirm Dialog ───────────────────────────────────────────────────
function DeclineDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-gray-100">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1A1A1A] text-sm leading-tight">
              Decline this delivery?
            </h3>
            <p className="text-gray-500 text-xs mt-1 leading-relaxed">
              Are you sure you want to decline this delivery? The sender will be notified.
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Confirm Decline
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function CountdownTimer({
  expiresAt,
  onExpire,
}: {
  expiresAt: string;
  onExpire: () => void;
}) {
  const calcRemaining = useCallback(
    () => Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)),
    [expiresAt]
  );

  const [remaining, setRemaining] = useState(calcRemaining);
  const firedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      const r = calcRemaining();
      setRemaining(r);
      if (r === 0 && !firedRef.current) {
        firedRef.current = true;
        clearInterval(id);
        onExpire();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [calcRemaining, onExpire]);

  const isUrgent = remaining <= 60;

  return (
    <span
      className="flex items-center gap-1 text-xs font-mono font-semibold tabular-nums"
      style={{ color: isUrgent ? "#dc2626" : "#6b7280" }}
    >
      <Clock className="h-3 w-3 shrink-0" />
      {formatTime(remaining)}
    </span>
  );
}

// ─── Pending Card ─────────────────────────────────────────────────────────────
function PendingCard({
  delivery,
  onAccept,
  onDecline,
  onExpire,
}: {
  delivery: Delivery;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onExpire: (id: string) => void;
}) {
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);

  const handleExpire = useCallback(
    () => onExpire(delivery.id),
    [delivery.id, onExpire]
  );

  return (
    <>
      {showDeclineDialog && (
        <DeclineDialog
          onCancel={() => setShowDeclineDialog(false)}
          onConfirm={() => {
            setShowDeclineDialog(false);
            onDecline(delivery.id);
          }}
        />
      )}

      <div className="bg-white rounded-xl border-l-4 border-[#800000] shadow-sm overflow-hidden">
        {/* Top row */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
            Incoming Delivery
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-400 font-mono">{delivery.id}</span>
            <CountdownTimer expiresAt={delivery.expiresAt} onExpire={handleExpire} />
          </div>
        </div>

        <div className="px-4 pb-4 space-y-3">
          {/* Sender info */}
          <div className="flex items-center gap-3 py-2 border-b border-gray-100">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: delivery.sender.avatarColor ?? "#800000", color: "#fff" }}
            >
              {delivery.sender.initials}
            </div>
            <div>
              <p className="text-[11px] text-gray-400 leading-none mb-0.5">Sent by</p>
              <p className="text-sm font-semibold text-[#1A1A1A] leading-tight">
                {delivery.sender.name}
              </p>
              <p className="text-xs text-gray-500">
                {delivery.sender.room}, {delivery.sender.building}
              </p>
            </div>
          </div>

          {/* Package Details */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div
              className="px-3 py-1.5 flex items-center gap-1.5"
              style={{ background: "#800000" }}
            >
              <Package className="h-3 w-3 text-white/80" />
              <span className="text-[11px] font-semibold text-white uppercase tracking-wider">
                Package Details
              </span>
            </div>
            <div className="px-3 py-2.5 grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-gray-400 mb-0.5">Item</p>
                <p className="font-medium text-[#1A1A1A] truncate">{delivery.item.name}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">Qty</p>
                <p className="font-medium text-[#1A1A1A]">{delivery.item.qty}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">Weight</p>
                <p className="font-medium text-[#1A1A1A]">{delivery.item.weight} kg</p>
              </div>
              {delivery.senderNote && (
                <div className="col-span-3 mt-1 pt-2 border-t border-gray-100">
                  <p className="text-gray-400 mb-0.5">Note from sender</p>
                  <p className="text-[#1A1A1A] italic">"{delivery.senderNote}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div
              className="px-3 py-1.5 flex items-center gap-1.5"
              style={{ background: "#800000" }}
            >
              <MapPin className="h-3 w-3 text-white/80" />
              <span className="text-[11px] font-semibold text-white uppercase tracking-wider">
                Delivery Info
              </span>
            </div>
            <div className="px-3 py-2.5 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-400 mb-0.5">Drop-off</p>
                <p className="font-medium text-[#1A1A1A]">
                  {delivery.recipient.room}, {delivery.recipient.building}
                </p>
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">Robot assigned</p>
                <p className="font-medium text-[#1A1A1A] flex items-center gap-1">
                  <Bot className="h-3 w-3 text-[#800000]" />
                  {delivery.robotName ?? delivery.robotId ?? "Pending"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">Est. arrival</p>
                <p className="font-medium text-[#1A1A1A]">~5 min after acceptance</p>
              </div>
              <div>
                <p className="text-gray-400 mb-0.5">Fee</p>
                <p className="font-medium text-[#1A1A1A] flex items-center gap-1">
                  <Banknote className="h-3 w-3 text-[#800000]" />
                  ₱{delivery.fee.toFixed(2)}
                  <span className="text-gray-400 font-normal">(paid by sender)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
            By accepting, you confirm you are available to receive this delivery.
          </p>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setShowDeclineDialog(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Decline
            </button>
            <button
              onClick={() => onAccept(delivery.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{ background: "#800000", color: "#FFD700" }}
            >
              <Check className="h-4 w-4" />
              Accept
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Recent Row ───────────────────────────────────────────────────────────────
function RecentRow({ delivery }: { delivery: Delivery }) {
  const badge = STATUS_BADGE[delivery.status as BadgeStatus] ?? STATUS_BADGE.cancelled;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-xs font-mono text-gray-400">{delivery.id}</span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ background: badge.bg, color: badge.color }}
          >
            {badge.label}
          </span>
        </div>
        <p className="text-sm font-medium text-[#1A1A1A] truncate">
          {delivery.item.name}{" "}
          <span className="text-gray-400 font-normal text-xs">
            from {delivery.sender.name}
          </span>
        </p>
      </div>
      <span className="text-[11px] text-gray-400 shrink-0">
        {formatTimestamp(delivery.createdAt)}
      </span>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "#fdf2f2" }}
      >
        <Inbox className="h-8 w-8" style={{ color: "#800000", opacity: 0.4 }} />
      </div>
      <h3 className="text-base font-semibold text-[#1A1A1A] mb-1">No incoming deliveries</h3>
      <p className="text-sm text-gray-400">You're all caught up!</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DeliveryInbox() {
  const {
    deliveries,
    acceptDelivery,
    rejectDelivery,
    cancelExpired,
    getPendingForRecipient,
  } = useDelivery();

  // Pending deliveries for Maria (usr-002)
  const pendingDeliveries = getPendingForRecipient(RECIPIENT_ID);

  // Recent: all non-pending deliveries where Maria is recipient, newest first, max 5
  const recentDeliveries = deliveries
    .filter((d) => d.recipient.id === RECIPIENT_ID && d.status !== "pending_approval")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const handleAccept = useCallback(
    (id: string) => {
      acceptDelivery(id);
      toast.success("Delivery accepted! Robot is being dispatched.");
    },
    [acceptDelivery]
  );

  const handleDecline = useCallback(
    (id: string) => {
      rejectDelivery(id);
      toast.error("Delivery declined.");
    },
    [rejectDelivery]
  );

  // cancelExpired() takes no args — it scans all expired pending deliveries at once
  const handleExpire = useCallback(
    (_id: string) => {
      cancelExpired();
      toast.warning("Delivery request expired.");
    },
    [cancelExpired]
  );

  const isEmpty = pendingDeliveries.length === 0 && recentDeliveries.length === 0;

  return (
    <AppLayout title="Delivery Inbox">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2
            className="text-xl font-semibold text-[#1A1A1A] leading-tight"
            style={{ fontFamily: "var(--font-display, 'DM Serif Display', serif)" }}
          >
            Delivery Inbox
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Incoming delivery requests for your room.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Logged in as{" "}
            <span className="font-medium text-[#800000]">{RECIPIENT_NAME}</span>{" "}
            — {RECIPIENT_ROOM}
          </p>
        </div>

        {pendingDeliveries.length > 0 && (
          <span
            className="shrink-0 px-3 py-1 rounded-full text-sm font-semibold"
            style={{ background: "#FFD700", color: "#800000" }}
          >
            {pendingDeliveries.length} pending
          </span>
        )}
      </div>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="space-y-8 max-w-2xl">
          {/* Section 1 — Pending Approval */}
          {pendingDeliveries.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                Pending Approval
              </h3>
              <div className="space-y-4">
                {pendingDeliveries.map((d) => (
                  <PendingCard
                    key={d.id}
                    delivery={d}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    onExpire={handleExpire}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Section 2 — Recent */}
          {recentDeliveries.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                Recent
              </h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4">
                {recentDeliveries.map((d) => (
                  <RecentRow key={d.id} delivery={d} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </AppLayout>
  );
}