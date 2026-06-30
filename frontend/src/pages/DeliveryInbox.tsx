import { useState, useCallback, useEffect, useMemo } from "react";
import { CheckCircle, Bot, FileText, Package, Loader2, AlertCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Delivery } from "@/lib/types";
import { AppLayout } from "@/components/AppLayout";
import { toast } from "@/components/ui/feedback/sonner";
import { authAPI, deliveriesAPI} from "@/lib/api";
import { useTimeAgo, formatTimestampStatic } from "@/hooks/useTimeAgo";
import { useQueryClient } from "@tanstack/react-query";

// ─── Brand colors ─────────────────────────────────────────────────────────────
const C = {
  maroon: "#800000",
  gold: "#FFD700",
  maroonBg: "#FFF5F5",
  maroonBorder: "#FECACA",
};

const URGENCY_COLOR: Record<string, string> = {
  high: "#ef4444",
  normal: "#f59e0b",
  low: "#22c55e",
};

function getUrgency(arrivedAt: string): "high" | "normal" | "low" {
  const diffMinutes = (Date.now() - new Date(arrivedAt).getTime()) / 60000;
  if (diffMinutes > 60) return "high";
  if (diffMinutes > 20) return "normal";
  return "low";
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          padding: 20,
          width: 320,
          margin: "0 16px",
        }}
      >
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: C.maroonBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CheckCircle size={16} style={{ color: C.maroon }} />
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 13, color: "#1a1a1a" }}>
              Confirm Receipt
            </p>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4, lineHeight: 1.6 }}>
              By confirming, you acknowledge that you have physically received
              the package and reviewed the delivery documents from the robot.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 12,
              color: "#374151",
              fontWeight: 500,
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 8,
              border: "none",
              fontSize: 12,
              fontWeight: 600,
              background: C.maroon,
              color: C.gold,
              cursor: "pointer",
            }}
          >
            Confirm Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Row ──────────────────────────────────────────────────────────────
function SidebarRow({
  delivery,
  isSelected,
  onClick,
}: {
  delivery: Delivery;
  isSelected: boolean;
  onClick: () => void;
}) {
  const urgency = getUrgency(delivery.arrivedAt ?? new Date().toISOString());
  const relativeTime = useTimeAgo(delivery.arrivedAt);

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: "8px 14px",
        cursor: "pointer",
        borderBottom: "0.5px solid #f3f4f6",
        background: isSelected ? C.maroonBg : "#fff",
        position: "relative",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "#fafafa";
      }}
      onMouseLeave={(e) => {
        if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "#fff";
      }}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: C.maroon,
            borderRadius: "0 2px 2px 0",
          }}
        />
      )}

      {/* Urgency dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: URGENCY_COLOR[urgency],
          flexShrink: 0,
          marginTop: 5,
        }}
      />

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: C.maroon,
            marginBottom: 1,
          }}
        >
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "#1a1a1a",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {delivery.item.name}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#9ca3af",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {delivery.sender.name} &bull; {delivery.sender.room}
        </div>
        {urgency === "high" && (
          <span
            style={{
              display: "inline-block",
              marginTop: 4,
              background: "#fee2e2",
              color: "#991b1b",
              fontSize: 9,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              padding: "2px 5px",
              borderRadius: 4,
            }}
          >
            Needs attention
          </span>
        )}
      </div>

      {/* Time */}
      <div style={{ fontSize: 10, color: "#9ca3af", flexShrink: 0 }}>
        {delivery.arrivedAt ? relativeTime : ""}
      </div>
    </div>
  );
}

// ─── History Row ──────────────────────────────────────────────────────────────
function HistoryRow({ delivery, isSelected, onClick }: { delivery: Delivery; isSelected: boolean; onClick: () => void }) {
  const isCompleted = delivery.status === "completed";
  const relativeTime = useTimeAgo(delivery.completedAt ?? delivery.createdAt);
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: "8px 14px",
        borderBottom: "0.5px solid #f3f4f6",
        cursor: "pointer",
        background: isSelected ? C.maroonBg : "#fff",
        transition: "background 0.1s",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "#fafafa";
      }}
      onMouseLeave={(e) => {
        if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "#fff";
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{ fontFamily: "monospace", fontSize: 10, color: C.maroon, marginBottom: 1 }}
        >
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "#1a1a1a",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {delivery.item.name}
          <span style={{ fontSize: 11, fontWeight: 400, color: "#9ca3af" }}>
            {" "}from {delivery.sender.name}
          </span>
        </div>
        <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>
          {formatTimestampStatic(delivery.completedAt ?? delivery.createdAt)}
        </div>
      </div>
      <span
        style={{
          flexShrink: 0,
          padding: "2px 8px",
          borderRadius: 999,
          fontSize: 10,
          fontWeight: 600,
          background: isCompleted ? "#dcfce7" : "#f3f4f6",
          color: isCompleted ? "#166534" : "#6b7280",
          marginTop: 2,
        }}
      >
        {isCompleted ? "Completed" : "Cancelled"}
      </span>
    </div>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function DetailPanel({
  delivery,
  onConfirm,
  confirmMutation,
}: {
  delivery: Delivery;
  onConfirm: (id: string) => void;
  confirmMutation: any;
}) {
  const [showDialog, setShowDialog] = useState(false);
  const isCompleted = delivery.status === "completed";
  const isArrived = delivery.status === "arrived" && !isCompleted;
  const isPending = (delivery.status === "robot_assigned" || delivery.status === "pending_request") && !isCompleted;
  const relativeTime = useTimeAgo(delivery.arrivedAt);

  const getStatusDisplay = () => {
    if (isCompleted) return "Completed";
    if (delivery.status === "pending_request") return "Pending Robot Assignment";
    if (delivery.status === "robot_assigned") return "Robot Assigned";
    if (isArrived) return "Robot Delivered";
    return delivery.status;
  };

  const getStatusColor = () => {
    if (isCompleted) return "#16a34a";
    if (isPending) return "#9ca3af";
    if (isArrived) return C.gold;
    return "#9ca3af";
  };

  const getStatusBgColor = () => {
    if (isCompleted) return "rgba(22,163,74,0.12)";
    if (isPending) return "#f3f4f6";
    if (isArrived) return C.gold;
    return "#f3f4f6";
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        position: "relative",
      }}
    >
      {showDialog && (
        <ConfirmDialog
          onCancel={() => setShowDialog(false)}
          onConfirm={() => {
            setShowDialog(false);
            onConfirm(delivery.id);
          }}
        />
      )}

      {/* Detail header */}
      <div
        style={{
          background: C.maroon,
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 500, color: C.gold }}>
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 10px",
            borderRadius: 999,
            background: getStatusBgColor(),
            color: getStatusColor(),
            fontSize: 10,
            fontWeight: 600,
          }}
        >
          <CheckCircle size={10} />
          {getStatusDisplay()}
        </span>
      </div>

      {/* Detail body — scrollable */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Completed status notice — fix #3 */}
        {isCompleted && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              background: "#f0fdf4",
              border: "0.5px solid #bbf7d0",
              borderRadius: 8,
              padding: "10px 12px",
            }}
          >
            <CheckCircle size={13} style={{ color: "#16a34a", flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: "#166534", lineHeight: 1.6 }}>
              <p style={{ fontWeight: 600, marginBottom: 2 }}>Delivery Successful</p>
              <p>This package has been confirmed as received. No further action is needed.</p>
            </div>
          </div>
        )}

        {/* Pending status notice */}
        {isPending && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              background: "#f0f9ff",
              border: "0.5px solid #bae6fd",
              borderRadius: 8,
              padding: "10px 12px",
            }}
          >
            <AlertCircle size={13} style={{ color: "#0284c7", flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: "#0c4a6e", lineHeight: 1.6 }}>
              <p style={{ fontWeight: 600, marginBottom: 2 }}>Awaiting Robot Assignment</p>
              <p>This delivery request is pending. A robot will be assigned soon. You'll be notified when it arrives.</p>
            </div>
          </div>
        )}

        {/* Sender block — unchanged */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: C.maroonBg,
            border: `0.5px solid ${C.maroonBorder}`,
            borderRadius: 8,
            padding: "10px 12px",
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: C.maroon,
              color: C.gold,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {delivery.sender.initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>Sent by</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>{delivery.sender.name}</p>
            <p style={{ fontSize: 11, color: "#6b7280" }}>
              {delivery.sender.room}, {delivery.sender.building}
            </p>
          </div>
          {delivery.arrivedAt && (
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: 10, color: "#9ca3af" }}>Arrived</p>
              <p style={{ fontSize: 11, fontWeight: 500, color: "#374151" }}>{relativeTime}</p>
            </div>
          )}
        </div>

        {/* Package details — unchanged */}
        <div style={{ border: "0.5px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ background: C.maroon, padding: "7px 12px", display: "flex", alignItems: "center", gap: 6 }}>
            <Package size={12} style={{ color: "rgba(255,255,255,0.8)" }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Package Details
            </span>
          </div>
          {[
            { label: "Item", value: delivery.item.name },
            { label: "Qty", value: String(delivery.item.qty) },
          ].map((row, i) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "7px 12px",
                fontSize: 12,
                borderTop: i === 0 ? "none" : "0.5px solid #f3f4f6",
                background: i % 2 === 0 ? "#fff" : "#fafafa",
              }}
            >
              <span style={{ color: "#9ca3af" }}>{row.label}</span>
              <span style={{ fontWeight: 500, color: "#1a1a1a" }}>{row.value}</span>
            </div>
          ))}
          {delivery.senderNote && (
            <div style={{ padding: "7px 12px", fontSize: 12, borderTop: "0.5px solid #f3f4f6", background: "#fafafa" }}>
              <span style={{ color: "#9ca3af", display: "block", marginBottom: 2 }}>Sender note</span>
              <span style={{ color: "#4b5563", fontStyle: "italic" }}>&ldquo;{delivery.senderNote}&rdquo;</span>
            </div>
          )}
        </div>

        {/* Documents notice — only for arrived (not yet confirmed) deliveries */}
        {isArrived && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              background: "#fffbeb",
              border: "0.5px solid #fde68a",
              borderRadius: 8,
              padding: "10px 12px",
            }}
          >
            <FileText size={13} style={{ color: "#d97706", flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
              <p style={{ fontWeight: 600, marginBottom: 2 }}>Check your delivery documents</p>
              <p>Please check the physical delivery documents received with this package before confirming.</p>
            </div>
          </div>
        )}
      </div>

      {/* Confirm button — fix #1: explicitly excluded for completed */}
      {(isArrived || isPending) && delivery.status !== "completed" && (
        <div style={{ padding: "12px 20px", borderTop: "0.5px solid #e5e7eb", flexShrink: 0 }}>
          <button
            onClick={() => setShowDialog(true)}
            disabled={confirmMutation.isPending}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 8,
              border: "none",
              background: confirmMutation.isPending ? "#d1d5db" : C.maroon,
              color: confirmMutation.isPending ? "#9ca3af" : C.gold,
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: confirmMutation.isPending ? "not-allowed" : "pointer",
            }}
          >
            <CheckCircle size={15} />
            {confirmMutation.isPending ? "Confirming..." : "I have received this package"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Empty States ─────────────────────────────────────────────────────────────
function EmptyInbox() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        color: "#9ca3af",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: C.maroonBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
        }}
      >
        <Bot size={24} style={{ color: C.maroon, opacity: 0.4 }} />
      </div>
      <p style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>
        No packages awaiting confirmation
      </p>
      <p style={{ fontSize: 12 }}>You&apos;re all caught up!</p>
    </div>
  );
}

function NoSelectionPlaceholder() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#9ca3af",
        fontSize: 13,
      }}
    >
      Select a delivery to view details
    </div>
  );
}

// ─── Group Label ──────────────────────────────────────────────────────────────
function GroupLabel({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "8px 14px 4px",
        fontSize: 10,
        fontWeight: 600,
        color: "#9ca3af",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        position: "sticky",
        top: 0,
        background: "#fff",
        zIndex: 1,
        borderBottom: "0.5px solid #f3f4f6",
      }}
    >
      {label}
    </div>
  );
}

// ─── Urgency Legend ───────────────────────────────────────────────────────────
function UrgencyLegend() {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "6px 14px",
        borderTop: "0.5px solid #f3f4f6",
        background: "#fafafa",
        flexShrink: 0,
      }}
    >
      {[
        { color: URGENCY_COLOR.high, label: "Over 1 hr" },
        { color: URGENCY_COLOR.normal, label: "20–60 mins" },
        { color: URGENCY_COLOR.low, label: "Under 20 mins" },
      ].map(({ color, label }) => (
        <span
          key={label}
          style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#9ca3af" }}
        >
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: color,
            }}
          />
          {label}
        </span>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DeliveryInbox() {
  // Fetch current user
  const { data: currentUser, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => authAPI.getCurrentUser(),
  });

  // Fetch all deliveries
  const { data: allDeliveries = [], isLoading: deliveriesLoading, refetch: refetchDeliveries } = useQuery({
    queryKey: ["myInbox"],
    queryFn: () => deliveriesAPI.getMyInbox(),
    enabled: !!currentUser,
    refetchInterval: 5000,   
  });

  const queryClient = useQueryClient();
  // Confirm receipt mutation
  const confirmMutation = useMutation({
  mutationFn: (deliveryId: number) => deliveriesAPI.confirmReceived(deliveryId),
  onSuccess: () => {
    toast.success("Receipt confirmed! Tray unlocked.");
    queryClient.invalidateQueries({ queryKey: ["myInbox"] });
    setSelectedId(null);
  },
  onError: (error: any) => {
    toast.error(error.message || "Failed to confirm receipt");
  },
});

  // Filter deliveries: inbox = status "pending_request", "robot_assigned" or "arrived", history = completed or cancelled
  const arrivedDeliveries = useMemo(() => (allDeliveries as any[])
    .filter((d) => d.status === "pending_request" || d.status === "robot_assigned" || d.status === "arrived")
    .map((d) => ({
      id: d.id?.toString() || `DEL-${Math.random()}`,
      sender: {
        id: d.sender_id?.toString() || "unknown",
        name: d.sender || "Unknown",
        room: d.pickup_location || "Unknown Location",
        building: "PUP Manila",
        initials: (d.sender || "?").split(" ").map((s: string) => s[0]).join("").toUpperCase().slice(0, 2),
        avatarColor: "#800000",
      },
      recipient: {
        id: currentUser?.id?.toString() || "unknown",
        name: currentUser?.full_name || "You",
        room: currentUser?.room || "Unknown",
        building: "PUP Manila",
        initials: (currentUser?.full_name || "?").split(" ").map((s: string) => s[0]).join("").toUpperCase().slice(0, 2),
        avatarColor: "#800000",
      },
      item: {
        name: d.document_name || "Package",
        qty: Number(d.quantity) || 1,
        weight: 0,
      },
      senderNote: d.notes || "",
      priority: "standard" as const,
      fee: 0,
      status: d.status,
      robotId: d.robot_id?.toString() || "RBT-001",
      robotName: `PUP-BOT Unit ${d.robot_id || 1}`,
      createdAt: d.created_at || new Date().toISOString(),
      arrivedAt: d.arrived_at || new Date().toISOString(),
      completedAt: d.completed_at,
      timeline: [
        { status: "robot_assigned" as const, label: "Robot Assigned", timestamp: d.created_at || new Date().toISOString() },
        ...(d.arrived_at ? [{ status: "arrived" as const, label: "Arrived", timestamp: d.arrived_at }] : []),
      ],
      estimatedArrival: "Arrived",
      distance: "—",
    })), [allDeliveries, currentUser]);

  const historyDeliveries = useMemo(() => (allDeliveries as any[])
    .filter((d) => d.status === "completed" || d.status === "cancelled")
    .sort((a, b) => new Date(b.completed_at || b.created_at).getTime() - new Date(a.completed_at || a.created_at).getTime())
    .map((d) => ({
      id: d.id?.toString() || `DEL-${Math.random()}`,
      sender: {
        id: d.sender_id?.toString() || "unknown",
        name: d.sender || "Unknown",
        room: d.pickup_location || "Unknown Location",
        building: "PUP Manila",
        initials: (d.sender || "?").split(" ").map((s: string) => s[0]).join("").toUpperCase().slice(0, 2),
        avatarColor: "#800000",
      },
      recipient: {
        id: currentUser?.id?.toString() || "unknown",
        name: currentUser?.full_name || "You",
        room: currentUser?.room || "Unknown",
        building: "PUP Manila",
        initials: (currentUser?.full_name || "?").split(" ").map((s: string) => s[0]).join("").toUpperCase().slice(0, 2),
        avatarColor: "#800000",
      },
      item: {
        name: d.document_name || "Package",
        qty: Number(d.quantity) || 1,
        weight: 0,
      },
      senderNote: d.notes || "",
      priority: "standard" as const,
      fee: 0,
      status: d.status,
      robotId: d.robot_id?.toString() || "RBT-001",
      robotName: `PUP-BOT Unit ${d.robot_id || 1}`,
      createdAt: d.created_at || new Date().toISOString(),
      arrivedAt: d.arrived_at || new Date().toISOString(),
      completedAt: d.completed_at,
      timeline: [
        { status: "robot_assigned" as const, label: "Robot Assigned", timestamp: d.created_at || new Date().toISOString() },
        ...(d.arrived_at ? [{ status: "arrived" as const, label: "Arrived", timestamp: d.arrived_at }] : []),
        ...(d.completed_at ? [{ status: "completed" as const, label: "Completed", timestamp: d.completed_at }] : d.status === "cancelled" ? [{ status: "cancelled" as const, label: "Cancelled", timestamp: d.updated_at || d.created_at }] : []),
      ],
      estimatedArrival: d.status === "completed" ? "Delivered" : "Cancelled",
      distance: "—",
    })), [allDeliveries, currentUser]);

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return (
      arrivedDeliveries.find((d) => d.id === selectedId) ??
      historyDeliveries.find((d) => d.id === selectedId) ??
      null
    );
  }, [selectedId, arrivedDeliveries, historyDeliveries]);

  const [activeTab, setActiveTab] = useState<"inbox" | "history">("inbox");

  // Auto-select first on mount
  useEffect(() => {
    if (arrivedDeliveries.length > 0 && !selectedId) {
      setSelectedId(arrivedDeliveries[0].id);
    }
  }, [arrivedDeliveries, selectedId]);

  const filteredDeliveries = arrivedDeliveries.filter(
    (d) =>
      d.item.name.toLowerCase().includes(query.toLowerCase()) ||
      d.sender.name.toLowerCase().includes(query.toLowerCase()) ||
      d.id.toLowerCase().includes(query.toLowerCase())
  );

  const grouped: Record<"high" | "normal" | "low", Delivery[]> = {
    high: [],
    normal: [],
    low: [],
  };
  filteredDeliveries.forEach((d) => {
    grouped[getUrgency(d.arrivedAt ?? new Date().toISOString())].push(d);
  });

  const handleConfirm = useCallback(
    (id: string) => {
      const numId = parseInt(id.split("-")[1] || id, 10);
      confirmMutation.mutate(numId);
    },
    [confirmMutation]
  );

  const groupDefs: { key: "high" | "normal" | "low"; label: string }[] = [
    { key: "high", label: "🔥 Urgent — over 1 hour" },
    { key: "normal", label: "⏳ Soon — 20–60 minutes" },
    { key: "low", label: "🆕 New — under 20 minutes" },
  ];

  // Loading state
  if (userLoading || deliveriesLoading) {
    return (
      <AppLayout title="Delivery Inbox">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 400,
            gap: 10,
          }}
        >
          <Loader2 className="animate-spin" size={20} style={{ color: C.maroon }} />
          <span style={{ color: "#6b7280" }}>Loading your deliveries...</span>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (userError) {
    return (
      <AppLayout title="Delivery Inbox">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 400,
            gap: 8,
            color: "#dc2626",
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 500 }}>Unable to load inbox</p>
          <p style={{ fontSize: 12, color: "#9ca3af" }}>
            {(userError as Error)?.message || "Please refresh and try again"}
          </p>
        </div>
      </AppLayout>
    );
  }

  const recipientName = currentUser?.full_name || "User";
  const recipientRoom = currentUser?.room || "Unknown Location";
  

  return (
    <AppLayout title="Delivery Inbox">
      {/* Page header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a1a" }}>
          Delivery Inbox
        </h2>
        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
          Logged in as{" "}
          <span style={{ fontWeight: 500, color: C.maroon }}>{recipientName}</span>
          {" "}— {recipientRoom}
        </p>
      </div>

      {/* Gmail-style shell */}
      <div
        style={{
          display: "flex",
          height: "calc(100vh - 160px)",
          minHeight: 480,
          border: "0.5px solid #e5e7eb",
          borderRadius: 12,
          overflow: "hidden",
          background: "#fff",
          position: "relative",
        }}
      >
        {/* ── LEFT SIDEBAR ── */}
        <div
          style={{
            width: 300,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            borderRight: "0.5px solid #e5e7eb",
            background: "#fff",
          }}
        >
          {/* Sidebar header */}
          <div
            style={{
              padding: "12px 14px 8px",
              borderBottom: "0.5px solid #f3f4f6",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>
                Packages
              </span>
              {arrivedDeliveries.length > 0 && (
                <span
                  style={{
                    background: C.maroon,
                    color: C.gold,
                    fontSize: 10,
                    fontWeight: 500,
                    padding: "2px 8px",
                    borderRadius: 999,
                  }}
                >
                  {arrivedDeliveries.length} waiting
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="Search packages..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "7px 10px",
                border: "0.5px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 12,
                background: "#fafafa",
                color: "#1a1a1a",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = C.maroon;
                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(128,0,0,0.12)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "0.5px solid #f3f4f6",
              flexShrink: 0,
            }}
          >
            {(["inbox", "history"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  fontSize: 11,
                  textAlign: "center",
                  cursor: "pointer",
                  border: "none",
                  background: "transparent",
                  color: activeTab === tab ? C.maroon : "#9ca3af",
                  fontWeight: activeTab === tab ? 600 : 400,
                  borderBottom: `2px solid ${activeTab === tab ? C.maroon : "transparent"}`,
                  transition: "all 0.15s",
                  textTransform: "capitalize",
                }}
              >
                {tab === "inbox" ? "Inbox" : "History"}
              </button>
            ))}
          </div>

          {/* Scrollable list */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "#e5e7eb transparent",
            }}
          >
            {activeTab === "inbox" ? (
              arrivedDeliveries.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#9ca3af",
                    gap: 6,
                    padding: 24,
                  }}
                >
                  <Bot size={24} style={{ color: C.maroon, opacity: 0.3 }} />
                  <p style={{ fontSize: 12, textAlign: "center" }}>
                    No packages awaiting confirmation
                  </p>
                </div>
              ) : filteredDeliveries.length === 0 ? (
                <div
                  style={{
                    padding: "16px 14px",
                    fontSize: 12,
                    color: "#9ca3af",
                  }}
                >
                  No results for &ldquo;{query}&rdquo;
                </div>
              ) : (
                groupDefs.map(({ key, label }) =>
                  grouped[key].length > 0 ? (
                    <div key={key}>
                      <GroupLabel label={label} />
                      {grouped[key].map((d) => (
                        <SidebarRow
                          key={d.id}
                          delivery={d}
                          isSelected={selected?.id === d.id}
                          onClick={() => setSelectedId(d.id)}
                        />
                      ))}
                    </div>
                  ) : null
                )
              )
            ) : historyDeliveries.length === 0 ? (
              <div
                style={{
                  padding: "16px 14px",
                  fontSize: 12,
                  color: "#9ca3af",
                }}
              >
                No past deliveries yet.
              </div>
            ) : (
              historyDeliveries.map((d) => <HistoryRow key={d.id} delivery={d} isSelected={selected?.id === d.id} onClick={() => setSelectedId(d.id)} />)
            )}
          </div>

          {/* Urgency legend — only on inbox tab */}
          {activeTab === "inbox" && arrivedDeliveries.length > 0 && <UrgencyLegend />}
        </div>

        {/* ── RIGHT DETAIL PANEL ── */}
        {activeTab === "history" ? (
          selected ? (
            <DetailPanel delivery={selected} onConfirm={handleConfirm} confirmMutation={confirmMutation} />
          ) : (
            <NoSelectionPlaceholder />
          )
        ) : arrivedDeliveries.length === 0 ? (
          <EmptyInbox />
        ) : selected ? (
          <DetailPanel delivery={selected} onConfirm={handleConfirm} confirmMutation={confirmMutation} />
        ) : (
          <NoSelectionPlaceholder />
        )}
      </div>
    </AppLayout>
  );
}
