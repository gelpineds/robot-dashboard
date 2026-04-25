import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { toast } from "sonner";
import { deliveriesAPI } from "@/lib/api";
import { SectionTitle, Field, InputWithIcon, SelectInput, SummaryRow } from "@/components/ui/form-fields";
import { HoverCard, HoverCardTrigger, HoverCardContent, Popover, PopoverTrigger, PopoverContent } from "@/components/ui/utilities";
import {
  MapPin, User, Phone, Package, Send, X, Loader,
  Clock, Bot, FileText, Zap,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const ROBOTS = [
  { id: "PUPBOT-001", name: "PUP-BOT Unit 1", status: "Online"      },
  { id: "PUPBOT-002", name: "PUP-BOT Unit 2", status: "On Delivery" },
  { id: "PUPBOT-003", name: "PUP-BOT Unit 3", status: "Online"      },
  { id: "PUPBOT-005", name: "PUP-BOT Unit 5", status: "Offline"     },
  { id: "PUPBOT-006", name: "PUP-BOT Unit 6", status: "Online"      },
];

const ROBOT_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Online:        { bg: "rgba(22,163,74,0.1)", color: "#15803d" },
  "On Delivery": { bg: "#FFD700",             color: "#800000" },
  Offline:       { bg: "#F3F4F6",             color: "#9CA3AF" },
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormState {
  pickupRoom: string;
  pickupContact: string;
  pickupPhone: string;
  dropoffRoom: string;
  recipientName: string;
  recipientPhone: string;
  packageDesc: string;
  packageWeight: string;
  priority: "Standard" | "Express";
  robotId: string;
  scheduleDate: string;
  scheduleTime: string;
  instructions: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const EMPTY: FormState = {
  pickupRoom: "", pickupContact: "", pickupPhone: "",
  dropoffRoom: "", recipientName: "", recipientPhone: "",
  packageDesc: "", packageWeight: "",
  priority: "Standard",
  robotId: "", scheduleDate: "", scheduleTime: "",
  instructions: "",
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function RequestDelivery() {
  const navigate = useNavigate();
  const [form,      setForm]      = useState<FormState>(EMPTY);
  const [errors,    setErrors]    = useState<Errors>({});

  const createMutation = useMutation({
    mutationFn: () => {
      // Map form fields to API request format
      return deliveriesAPI.createRequest({
        document_name: form.packageDesc,
        sender: form.pickupContact,
        recipient: form.recipientName,
        pickup_location: `Room ${form.pickupRoom}`,
        dropoff_location: `Room ${form.dropoffRoom}`,
      });
    },
    onSuccess: () => {
      toast.success("Delivery request submitted!", {
        description: "Your request has been sent. A robot will be dispatched shortly.",
      });
      setForm(EMPTY);
      setErrors({});
      // Redirect to delivery history after 2 seconds
      setTimeout(() => navigate("/history"), 2000);
    },
    onError: (error: any) => {
      toast.error("Failed to submit request", {
        description: error.message || "Please try again.",
      });
    },
  });

  const set = (field: keyof FormState) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const requiredFields: (keyof FormState)[] = [
    "pickupRoom", "pickupContact", "pickupPhone",
    "dropoffRoom", "recipientName", "recipientPhone",
    "packageDesc",
  ];

  const isValid = requiredFields.every((f) => form[f].toString().trim() !== "");

  function validate(): boolean {
    const newErrors: Errors = {};
    const labels: Partial<Record<keyof FormState, string>> = {
      pickupRoom:     "Pickup room",
      pickupContact:  "Contact name",
      pickupPhone:    "Contact number",
      dropoffRoom:    "Drop-off room",
      recipientName:  "Recipient name",
      recipientPhone: "Recipient number",
      packageDesc:    "Package description",
    };
    requiredFields.forEach((f) => {
      if (!form[f].toString().trim()) newErrors[f] = `${labels[f]} is required.`;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    createMutation.mutate();
  }

  function handleClear() {
    setForm(EMPTY);
    setErrors({});
  }

  const selectedRobot = ROBOTS.find((r) => r.id === form.robotId);
  const estimatedFee  = form.priority === "Express" ? 75 : 45;

  const inputClass = "w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none placeholder:text-gray-400 text-[#1A1A1A]";

  return (
    <AppLayout title="Request Delivery">
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <p className="text-[13px] text-gray-500 mb-5">Schedule a new autonomous robot delivery</p>

          {/* Success banner */}
          {createMutation.isPending && (
            <div className="mb-5 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse inline-flex" />
              <p className="text-[13px] font-semibold text-blue-700">Submitting your delivery request...</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">

              {/* Section 1: Pickup */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <SectionTitle icon={MapPin} label="Pickup Details" />
                <div className="space-y-4">
                  <Field label="Pickup Room Number" error={errors.pickupRoom} required>
                    <InputWithIcon icon={MapPin} placeholder="e.g. 202" value={form.pickupRoom} onChange={set("pickupRoom")} error={!!errors.pickupRoom} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Contact Name" error={errors.pickupContact} required>
                      <InputWithIcon icon={User}  placeholder="e.g. Juan Dela Cruz"  value={form.pickupContact} onChange={set("pickupContact")} error={!!errors.pickupContact} />
                    </Field>
                    <Field label="Contact Number" error={errors.pickupPhone} required>
                      <InputWithIcon icon={Phone} placeholder="e.g. 0917-000-0000"   value={form.pickupPhone}   onChange={set("pickupPhone")}   error={!!errors.pickupPhone} />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Section 2: Drop-off */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <SectionTitle icon={MapPin} label="Drop-off Details" />
                <div className="space-y-4">
                  <Field label="Drop-off Room Number" error={errors.dropoffRoom} required>
                    <InputWithIcon icon={MapPin} placeholder="e.g. 206" value={form.dropoffRoom} onChange={set("dropoffRoom")} error={!!errors.dropoffRoom} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Recipient Name" error={errors.recipientName} required>
                      <InputWithIcon icon={User}  placeholder="e.g. Maria Santos"    value={form.recipientName}  onChange={set("recipientName")}  error={!!errors.recipientName} />
                    </Field>
                    <Field label="Recipient Number" error={errors.recipientPhone} required>
                      <InputWithIcon icon={Phone} placeholder="e.g. 0917-111-2222"   value={form.recipientPhone} onChange={set("recipientPhone")} error={!!errors.recipientPhone} />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Section 3: Package */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <SectionTitle icon={Package} label="Package Info" />
                <div className="space-y-4">
                  <Field label="Package Description" error={errors.packageDesc} required>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 pointer-events-none" style={{ color: errors.packageDesc ? "#dc2626" : "#800000" }} />
                      <textarea
                        rows={3}
                        value={form.packageDesc}
                        onChange={(e) => set("packageDesc")(e.target.value)}
                        placeholder="Describe the documents or package contents…"
                        className={`${inputClass} pl-9 resize-none`}
                        style={{ borderColor: errors.packageDesc ? "#fca5a5" : "#E5E7EB" }}
                      />
                    </div>
                    {errors.packageDesc && <p className="text-[11px] text-red-500 font-medium">{errors.packageDesc}</p>}
                  </Field>
                </div>
              </div>

              {/* Section 4: Robot Assignment */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <SectionTitle icon={Bot} label="Robot Assignment" />
                <div className="space-y-4">
                  <Field label="Assign Robot">
                    <select
                      value={form.robotId}
                      onChange={(e) => set("robotId")(e.target.value)}
                      className={`${inputClass} appearance-none`}
                    >
                      <option value="">Auto-assign best available robot</option>
                      {ROBOTS.map((r) => (
                        <option key={r.id} value={r.id} disabled={r.status === "Offline"}>
                          {r.name} — {r.status}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Scheduled Date">
                      <input
                        type="date"
                        value={form.scheduleDate}
                        onChange={(e) => set("scheduleDate")(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Scheduled Time">
                      <input
                        type="time"
                        value={form.scheduleTime}
                        onChange={(e) => set("scheduleTime")(e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field label="Special Instructions (optional)">
                    <textarea
                      rows={2}
                      value={form.instructions}
                      onChange={(e) => set("instructions")(e.target.value)}
                      placeholder="Any special handling notes for the robot…"
                      className={`${inputClass} resize-none`}
                    />
                  </Field>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[13px] font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "#800000", color: "#FFD700" }}
                  onMouseEnter={(e) => { if (!createMutation.isPending) e.currentTarget.style.background = "#660000"; }}
                  onMouseLeave={(e) => { if (!createMutation.isPending) e.currentTarget.style.background = "#800000"; }}
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Request
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={createMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[13px] font-semibold border transition-colors hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ borderColor: "#800000", color: "#800000" }}
                >
                  <X className="h-4 w-4" />
                  Clear Form
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}