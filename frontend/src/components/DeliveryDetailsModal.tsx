import { X, MapPin, User, Package, Clock, Bot } from "lucide-react";
import { HistoryRow } from "@/components/DeliveryTable";

interface DeliveryDetailsModalProps {
  open: boolean;
  onClose: () => void;
  delivery: HistoryRow | null;
}

export function DeliveryDetailsModal({ open, onClose, delivery }: DeliveryDetailsModalProps) {
  if (!open || !delivery) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
            style={{ background: "#800000" }}
          >
            <div>
              <h2 className="text-white font-bold text-lg">{delivery.id}</h2>
              <p className="text-white/70 text-sm mt-1">{delivery.datetime}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Status
              </p>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{
                  background:
                    delivery.status === "Delivered"
                      ? "rgba(22,163,74,0.1)"
                      : delivery.status === "In Transit"
                      ? "rgba(217,119,6,0.1)"
                      : delivery.status === "Pending"
                      ? "#F3F4F6"
                      : "rgba(239,68,68,0.1)",
                  color:
                    delivery.status === "Delivered"
                      ? "#15803d"
                      : delivery.status === "In Transit"
                      ? "#92400e"
                      : delivery.status === "Pending"
                      ? "#6B7280"
                      : "#dc2626",
                }}
              >
                {delivery.status}
              </div>
            </div>

            {/* Document */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "#800000" }}
                >
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                    Document
                  </p>
                  <p className="text-sm font-semibold text-[#1A1A1A] break-words">{delivery.id}</p>
                </div>
              </div>
            </div>

            {/* Sender */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4" style={{ color: "#800000" }} />
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Sender
                </p>
              </div>
              <p className="text-sm font-medium text-[#1A1A1A] ml-6">{delivery.customer}</p>
            </div>

            {/* Route */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-100">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                Route
              </p>
              <div className="space-y-3 ml-4">
                <div className="flex gap-3 items-start">
                  <div
                    className="w-2.5 h-2.5 rounded-full mt-2 shrink-0"
                    style={{ background: "#FFD700" }}
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">PICKUP</p>
                    <p className="text-sm font-medium text-[#1A1A1A]">{delivery.from}</p>
                  </div>
                </div>
                <div className="h-8 border-l-2 border-gray-200 ml-1" />
                <div className="flex gap-3 items-start">
                  <div
                    className="w-2.5 h-2.5 rounded-full mt-2 shrink-0"
                    style={{ background: "#800000" }}
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">DROP-OFF</p>
                    <p className="text-sm font-medium text-[#1A1A1A]">{delivery.to}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Robot & Fee */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4" style={{ color: "#800000" }} />
                  <p className="text-[10px] font-semibold text-gray-500 uppercase">Robot</p>
                </div>
                <p className="text-sm font-semibold text-[#1A1A1A]">{delivery.robot}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-[10px] font-semibold text-gray-500 uppercase mb-2">Fee</p>
                <p className="text-sm font-semibold text-[#1A1A1A]">₱{delivery.fee.toFixed(2)}</p>
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-2 text-[11px] text-gray-500 pt-4 border-t border-gray-100">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
