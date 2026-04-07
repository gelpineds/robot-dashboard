import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { OrderItemsTable, type OrderItem } from "@/components/DeliveryTable";
import {
  ArrowLeft, Bot, MapPin, Phone, CheckCircle,
  Package, Clock, Truck, Star,
} from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────
const orderItems: OrderItem[] = [
  { name: "Faculty Evaluation Form",  qty: 3, price: 15 },
  { name: "Research Proposal Bundle", qty: 1, price: 80 },
  { name: "Grade Sheets",             qty: 5, price: 10 },
];

const steps = [
  { label: "Order Placed",    time: "10:28 AM", done: true,    current: false },
  { label: "Robot Assigned",  time: "10:30 AM", done: true,    current: false },
  { label: "Picked Up",       time: "10:33 AM", done: true,    current: false },
  { label: "In Transit",      time: "10:35 AM", done: false,   current: true  },
  { label: "Delivered",       time: "—",        done: false,   current: false },
];

const historyLog = [
  { time: "10:35 AM", note: "Robot departed from Registrar Office — en route to CCIS" },
  { time: "10:33 AM", note: "Documents picked up by PUP-BOT Unit 3" },
  { time: "10:30 AM", note: "PUP-BOT Unit 3 assigned to this delivery" },
  { time: "10:28 AM", note: "Order #DEL-20251 placed by Juan Dela Cruz" },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function MapCard() {
  return (
    <div
      className="relative rounded-xl overflow-hidden border border-gray-200"
      style={{ height: 280 }}
    >
      {/* Tiled grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#E5E7EB",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* "Track Orders" label */}
      <span className="absolute top-3 left-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest z-10">
        Track Orders
      </span>

      {/* SVG route overlay */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Dashed route line */}
        <line
          x1="28%" y1="65%" x2="72%" y2="35%"
          stroke="#800000" strokeWidth="2.5" strokeDasharray="8 5"
          strokeLinecap="round"
        />
        {/* Pickup pin circle */}
        <circle cx="28%" cy="65%" r="6" fill="#FFD700" stroke="#800000" strokeWidth="2" />
        {/* Drop-off pin circle */}
        <circle cx="72%" cy="35%" r="6" fill="#800000" stroke="#fff" strokeWidth="2" />
      </svg>

      {/* Pickup label */}
      <div
        className="absolute z-10 flex items-center gap-1.5 bg-white rounded-lg px-2 py-1 shadow-sm border border-gray-200"
        style={{ left: "calc(28% - 52px)", top: "calc(65% + 14px)" }}
      >
        <MapPin className="h-3 w-3 shrink-0" style={{ color: "#FFD700" }} />
        <span className="text-[10px] font-semibold text-[#1A1A1A]">Registrar</span>
      </div>

      {/* Drop-off label */}
      <div
        className="absolute z-10 flex items-center gap-1.5 bg-white rounded-lg px-2 py-1 shadow-sm border border-gray-200"
        style={{ left: "calc(72% - 30px)", top: "calc(35% - 36px)" }}
      >
        <MapPin className="h-3 w-3 shrink-0" style={{ color: "#800000" }} />
        <span className="text-[10px] font-semibold text-[#1A1A1A]">CCIS Bldg</span>
      </div>

      {/* Robot icon center */}
      <div
        className="absolute z-10 flex items-center justify-center w-12 h-12 rounded-full shadow-lg border-2 border-white"
        style={{ background: "#800000", left: "calc(50% - 24px)", top: "calc(50% - 24px)" }}
      >
        <Bot className="h-6 w-6 text-white" />
      </div>

      {/* ETA chip */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold shadow"
        style={{ background: "#FFD700", color: "#800000" }}
      >
        <Clock className="h-3 w-3" />
        Estimated arrival: ~4 mins
      </div>
    </div>
  );
}

function StepDot({ done, current }: { done: boolean; current: boolean }) {
  if (current) {
    return (
      <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
        <span
          className="absolute inline-flex h-6 w-6 rounded-full animate-ping opacity-40"
          style={{ background: "#FFD700" }}
        />
        <span
          className="relative inline-flex h-4 w-4 rounded-full border-2 border-white shadow"
          style={{ background: "#FFD700" }}
        />
      </div>
    );
  }
  if (done) {
    return (
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "#800000" }}
      >
        <CheckCircle className="h-3.5 w-3.5 text-white" />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full shrink-0 border-2 border-gray-300 bg-white" />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TrackDelivery() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Track Delivery">
      <div className="max-w-6xl mx-auto space-y-5">

        {/* ── Breadcrumb + header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/history")}
              className="flex items-center gap-1.5 text-[12px] font-medium border rounded-lg px-3 py-1.5 transition-colors hover:bg-red-50"
              style={{ borderColor: "#800000", color: "#800000" }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <span className="text-[12px] text-gray-400">
              Deliveries <span className="mx-1">/</span>
              <span className="text-[#1A1A1A] font-medium">Order Detail</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#1A1A1A]">#DEL-20251</span>
            <span
              className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wide"
              style={{ background: "#FFD700", color: "#800000" }}
            >
              ON ROUTE
            </span>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* ── LEFT (60%) ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Map */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <MapCard />
            </div>

            {/* Robot info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Delivered by
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "#800000" }}
                >
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1A1A1A]">PUP-BOT Unit 3</p>
                  <p className="text-[11px] text-gray-400">ID: PUPBOT-003</p>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="flex items-center gap-1 text-[11px]">
                    <Phone className="h-3.5 w-3.5" />
                    <span>Ext. 312</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Near CHK Bldg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order items */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <p className="text-[13px] font-semibold text-[#1A1A1A] mb-3">Order Items</p>
              <OrderItemsTable items={orderItems} deliveryFee={30} />
            </div>
          </div>

          {/* ── RIGHT (40%) ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Recipient card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
                Recipient
              </p>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                  style={{ background: "#FFD700", color: "#800000" }}
                >
                  JD
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1A1A1A]">Juan Dela Cruz</p>
                  <p className="text-[11px] text-gray-400">Recipient · CCIS Faculty</p>
                </div>
              </div>
              <p className="text-[11.5px] text-gray-500 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
                Awaiting 3 faculty evaluation forms and 1 research proposal bundle. Please deliver to Room 401, Nantes Building.
              </p>
            </div>

            {/* Delivery status stepper */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <p className="text-[13px] font-semibold text-[#1A1A1A] mb-4">Delivery Status</p>
              <div className="space-y-0">
                {steps.map((step, i) => (
                  <div key={step.label} className="flex gap-3">
                    {/* Dot + connector */}
                    <div className="flex flex-col items-center">
                      <StepDot done={step.done} current={step.current} />
                      {i < steps.length - 1 && (
                        <div
                          className="w-0.5 flex-1 min-h-[28px] my-0.5"
                          style={{ background: step.done ? "#800000" : "#E5E7EB" }}
                        />
                      )}
                    </div>
                    {/* Label */}
                    <div className="pb-5 pt-0.5">
                      <p
                        className="text-[12.5px] font-semibold leading-tight"
                        style={{
                          color: step.current
                            ? "#92400e"
                            : step.done
                            ? "#1A1A1A"
                            : "#9CA3AF",
                        }}
                      >
                        {step.label}
                      </p>
                      <p className="text-[10.5px] text-gray-400 mt-0.5">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* History log */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <p className="text-[13px] font-semibold text-[#1A1A1A] mb-4">Activity Log</p>
              <div className="space-y-3.5">
                {historyLog.map((entry, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="mt-1.5 shrink-0">
                      <div className="w-2 h-2 rounded-full" style={{ background: "#800000" }} />
                    </div>
                    <div>
                      <p className="text-[12px] text-[#1A1A1A] leading-snug">{entry.note}</p>
                      <p className="text-[10.5px] text-gray-400 mt-0.5">{entry.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}