import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { toast } from "sonner";
import { deliveriesAPI, usersAPI, robotsAPI, authAPI } from "@/lib/api";

import {
  User, Package, MessageSquare, Clock,
  Send, CheckCircle2, AlertCircle, Loader2,
  MapPin, Phone, Bot, FileText, X, Loader,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserData {
  id:        number;
  username:  string;
  email:     string;
  full_name: string;
  role:      string;
  room?:     string | null;
}

// ─── Robot status badge styles ────────────────────────────────────────────────
const ROBOT_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Online:        { bg: "rgba(22,163,74,0.1)", color: "#15803d" },
  "On Delivery": { bg: "#FFD700",             color: "#800000" },
  Offline:       { bg: "#F3F4F6",             color: "#9CA3AF" },
};

// ─── Floor → room map ─────────────────────────────────────────────────────────
const roomsByFloor: Record<string, string[]> = {
  "1st Floor": ["101", "102", "103", "104"],
  "2nd Floor": ["201", "202", "203", "204"],
  "3rd Floor": ["301", "302", "303", "304"],
};

const PRESET_TIMES = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayDate() {
  return new Date().toISOString().split("T")[0];
}

function formatDateTime(date: string, time: string) {
  if (!date) return "—";
  try {
    // Convert preset time string to 24h for Date parsing
    const [timePart, meridiem] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);
    if (meridiem === "PM" && hours !== 12) hours += 12;
    if (meridiem === "AM" && hours === 12) hours = 0;
    const paddedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    return new Date(`${date}T${paddedTime}`).toLocaleString("en-PH", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  } catch { return `${date} ${time}`; }
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getAvatarColor(id: number) {
  const colors = ["#800000", "#0891B2", "#059669", "#7C3AED", "#D97706", "#BE185D", "#0F766E", "#1F2937"];
  return colors[id % colors.length];
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Avatar({ user, size = 36 }: { user: UserData; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{ width: size, height: size, background: getAvatarColor(user.id), fontSize: size * 0.33 }}
    >
      {getInitials(user.full_name)}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
      {children}
    </p>
  );
}

function SectionTitle({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-4">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#800000" }}>
        <Icon className="h-3.5 w-3.5 text-white" />
      </div>
      <span className="text-[13px] font-semibold text-[#1A1A1A]">{label}</span>
    </div>
  );
}

function FieldWrapper({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-500 mt-1 font-medium">
          <AlertCircle className="h-3 w-3 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

const inputBase =
  "w-full px-3 py-2.5 text-sm bg-gray-50 border rounded-lg outline-none placeholder:text-gray-400 text-[#1A1A1A] transition-colors focus:bg-white focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/10";

function TextInput({ icon: Icon, placeholder, value, onChange, error, type = "text", min, step, suffix }: {
  icon?: React.ElementType; placeholder?: string; value: string;
  onChange: (v: string) => void; error?: boolean;
  type?: string; min?: number; step?: string; suffix?: string;
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
          style={{ color: error ? "#ef4444" : "#800000" }}
        />
      )}
      <input
        type={type} value={value} placeholder={placeholder} min={min} step={step}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} ${Icon ? "pl-9" : ""} ${suffix ? "pr-10" : ""}`}
        style={{ borderColor: error ? "#fca5a5" : "#e5e7eb" }}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-400 pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

function SelectInput({
  options, value, onChange, placeholder, error, disabled,
}: {
  options: string[]; value: string; onChange: (v: string) => void;
  placeholder: string; error?: boolean; disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`${inputBase} appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}
      style={{ borderColor: error ? "#fca5a5" : "#e5e7eb" }}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-[11.5px] text-gray-400 font-medium shrink-0">{label}</p>
      <div className="text-right">{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RequestDelivery() {
  const navigate = useNavigate();

  // ── Recipient search state ────────────────────────────────────────────────
  const [recipientQuery, setRecipientQuery] = useState("");
  const [recipient,      setRecipient]      = useState<UserData | null>(null);
  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Package & delivery state ──────────────────────────────────────────────
  const [itemName,     setItemName]     = useState("");
  const [qty,          setQty]          = useState("1");
  const [weight,       setWeight]       = useState("");
  const [note,         setNote]         = useState("");
  const [schedDate,    setSchedDate]    = useState(todayDate());
  const [schedTime,    setSchedTime]    = useState("");
  const [robotId,      setRobotId]      = useState("");
  const [instructions, setInstructions] = useState("");

  // ── Floor/room state ──────────────────────────────────────────────────────
  const [pickupFloor,   setPickupFloor]   = useState("");
  const [pickupRoom,    setPickupRoom]    = useState("");
  const [pickupContact, setPickupContact] = useState("");
  const [pickupPhone,   setPickupPhone]   = useState("");
  const [dropoffFloor,  setDropoffFloor]  = useState("");
  const [dropoffRoom,   setDropoffRoom]   = useState("");

  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // ── Fetch logged-in user ──────────────────────────────────────────────────
  const {
    data:    currentUser,
    isLoading: userLoading,
    error:   userError,
  } = useQuery<UserData>({
    queryKey: ["currentUser"],
    queryFn:  () => authAPI.getCurrentUser(),
  });

  // Pre-fill pickup contact with logged-in user's name
  useEffect(() => {
    if (currentUser && !pickupContact) {
      setPickupContact(currentUser.full_name);
    }
  }, [currentUser]);

  // ── Fetch all users for search ────────────────────────────────────────────
  const { data: allUsers = [], isLoading: usersLoading } = useQuery<UserData[]>({
    queryKey: ["allUsers"],
    queryFn:  () => usersAPI.getAll(),
  });

  // ── Filter users by search query (client-side) ──────────────────────────────
  const searchResults = (allUsers ?? []).filter((user: UserData) => {
    if (currentUser && user.id === currentUser.id) return false;
    const q = recipientQuery.toLowerCase();
    return (
      user.full_name.toLowerCase().includes(q) ||
      user.room?.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  });
  const searchLoading = usersLoading;

  // ── Fetch robots ──────────────────────────────────────────────────────────
  const { data: robotsData, isLoading: robotsLoading } = useQuery({
    queryKey: ["robots"],
    queryFn:  () => robotsAPI.getAll(),
  });

  const robots: { id: string; name: string; status: string }[] =
    (robotsData ?? []).map((r: any) => ({
      id:     String(r.id),
      name:   r.name,
      status: r.status ?? "Offline",
    }));

  // ── Submit mutation ───────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: () => {
      if (!currentUser || !recipient) throw new Error("Missing required user information");
      return deliveriesAPI.createRequest({
        document_name:    itemName.trim(),
        sender:           currentUser.full_name,
        recipient:        recipient.full_name,
        pickup_location:  pickupRoom ? `Room ${pickupRoom}` : currentUser.room || "Main Building",
        dropoff_location: dropoffRoom ? `Room ${dropoffRoom}` : recipient.room || "Main Building",
      });
    },
    onSuccess: () => {
      toast.success("Delivery request submitted!", {
        description: "Your request has been sent. A robot will be dispatched shortly.",
      });
      handleClear();
      setTimeout(() => navigate("/history"), 2000);
    },
    onError: (error: any) => {
      toast.error("Failed to submit request", {
        description: error.message || "Please try again.",
      });
    },
  });

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Inline error helper (real-time feedback on clear) ─────────────────────
  function setField<T extends string>(
    setter: (v: T) => void,
    fieldKey: string,
    label: string,
  ) {
    return (v: T) => {
      setter(v);
      if (!v.toString().trim()) {
        setErrors((prev) => ({ ...prev, [fieldKey]: `${label} is required` }));
      } else {
        setErrors((prev) => ({ ...prev, [fieldKey]: "" }));
      }
    };
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const isFormValid = !!(recipient && itemName.trim() && weight.trim() && parseFloat(weight) > 0);

  function validate() {
    const e: Record<string, string> = {};
    if (!recipient)                                  e.recipient   = "Please select a recipient.";
    if (!itemName.trim())                            e.itemName    = "Item name is required.";
    if (!weight.trim() || parseFloat(weight) <= 0)  e.weight      = "Valid weight is required.";
    if (!pickupContact.trim())                       e.pickupContact = "Contact name is required.";
    if (!pickupPhone.trim())                         e.pickupPhone   = "Contact number is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSelectRecipient(user: UserData) {
    setRecipient(user);
    setRecipientQuery(user.full_name);
    setDropdownOpen(false);
    setErrors((prev) => ({ ...prev, recipient: "" }));
  }

  function handleRecipientInput(v: string) {
    setRecipientQuery(v);
    setRecipient(null);
    setDropdownOpen(true);
    if (errors.recipient) setErrors((prev) => ({ ...prev, recipient: "" }));
  }

  function handleClear() {
    setRecipient(null); setRecipientQuery("");
    setItemName(""); setQty("1"); setWeight(""); setNote("");
    setSchedDate(todayDate()); setSchedTime(""); setRobotId(""); setInstructions("");
    setPickupFloor(""); setPickupRoom(""); setPickupContact(currentUser?.full_name ?? ""); setPickupPhone("");
    setDropoffFloor(""); setDropoffRoom("");
    setErrors({}); setSubmitted(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!validate()) return;
    createMutation.mutate();
  }

  // ─── Loading / error states ────────────────────────────────────────────────
  if (userLoading) {
    return (
      <AppLayout title="Send a Delivery">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#800000]" />
            <p className="text-gray-500">Loading delivery form...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (userError || !currentUser) {
    return (
      <AppLayout title="Send a Delivery">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3 text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-800">Unable to load delivery form</h3>
            <p className="text-gray-500 text-sm">
              {(userError as Error)?.message || "Please refresh the page and try again."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#800000] text-white rounded-lg font-medium hover:bg-[#660000]"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <AppLayout title="Send a Delivery">
      <p className="text-[13px] text-gray-500 mb-4">
        Fill in the details to send a package to another room via robot.
      </p>

      {/* Loading banner */}
      {createMutation.isPending && (
        <div className="mb-5 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse inline-flex" />
          <p className="text-[13px] font-semibold text-blue-700">Submitting your delivery request...</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex gap-6 items-start">

          {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
          <div className="flex-[3] min-w-0 space-y-4">

            {/* Section 1: Sender Info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <SectionHeading>Your Info (Sender)</SectionHeading>
              <div className="flex items-center gap-3 bg-[#800000]/5 border border-[#800000]/15 rounded-lg px-4 py-3 mb-4">
                <Avatar user={currentUser} size={38} />
                <div>
                  <p className="text-[13.5px] font-semibold text-[#1A1A1A]">{currentUser.full_name}</p>
                  <p className="text-[11.5px] text-gray-500 mt-0.5">
                    {currentUser.room || "No room set"} · PUP Manila
                  </p>
                </div>
                <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#800000]/10 text-[#800000]">
                  You
                </span>
              </div>

              {/* Pickup floor + room */}
              <div className="space-y-3">
                <SectionTitle icon={MapPin} label="Pickup Location" />
                <div className="grid grid-cols-2 gap-3">
                  <FieldWrapper label="Pickup Floor">
                    <SelectInput
                      value={pickupFloor}
                      onChange={(v) => { setPickupFloor(v); setPickupRoom(""); }}
                      placeholder="Select Floor"
                      options={Object.keys(roomsByFloor)}
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Pickup Room" required error={errors.pickupRoom}>
                    <SelectInput
                      value={pickupRoom}
                      onChange={setField(setPickupRoom, "pickupRoom", "Pickup room")}
                      placeholder={pickupFloor ? "Select Room" : "Select floor first"}
                      options={pickupFloor ? roomsByFloor[pickupFloor] : []}
                      error={!!errors.pickupRoom}
                      disabled={!pickupFloor}
                    />
                  </FieldWrapper>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FieldWrapper label="Contact Name" required error={errors.pickupContact}>
                    <TextInput
                      icon={User}
                      placeholder="e.g. Juan Dela Cruz"
                      value={pickupContact}
                      onChange={setField(setPickupContact, "pickupContact", "Contact name")}
                      error={!!errors.pickupContact}
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Contact Number" required error={errors.pickupPhone}>
                    <TextInput
                      icon={Phone}
                      placeholder="e.g. 0917-000-0000"
                      value={pickupPhone}
                      onChange={setField(setPickupPhone, "pickupPhone", "Contact number")}
                      error={!!errors.pickupPhone}
                    />
                  </FieldWrapper>
                </div>
              </div>
            </div>

            {/* Section 2: Recipient */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <SectionTitle icon={User} label="Recipient" />
              <div className="space-y-3">
                <FieldWrapper label="Search Recipient" required error={errors.recipient}>
                  <div ref={dropdownRef} className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                      style={{ color: errors.recipient ? "#ef4444" : "#800000" }}
                    />
                    <input
                      type="text"
                      value={recipientQuery}
                      onChange={(e) => handleRecipientInput(e.target.value)}
                      onFocus={() => recipientQuery && !recipient && setDropdownOpen(true)}
                      placeholder="Search by name or room..."
                      className={`${inputBase} pl-9 pr-4`}
                      style={{ borderColor: errors.recipient ? "#fca5a5" : "#e5e7eb" }}
                      autoComplete="off"
                    />
                    {dropdownOpen && recipientQuery.trim().length > 0 && !recipient && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                        {searchLoading ? (
                          <div className="flex items-center gap-2 px-4 py-3 text-[12.5px] text-gray-400">
                            <Loader2 className="h-4 w-4 animate-spin text-[#800000]" />
                            Searching...
                          </div>
                        ) : searchResults.length > 0 ? (
                          searchResults.map((u: UserData) => (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => handleSelectRecipient(u)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#800000]/5 transition-colors text-left"
                            >
                              <Avatar user={u} size={30} />
                              <div>
                                <p className="text-[13px] font-medium text-[#1A1A1A]">{u.full_name}</p>
                                <p className="text-[11px] text-gray-400">
                                  {u.room || "No room set"} · PUP Manila
                                </p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-3 text-[12.5px] text-gray-400">
                            <AlertCircle className="h-4 w-4 text-amber-400" />
                            No users found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </FieldWrapper>

                {recipient && (
                  <div className="flex gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium bg-[#800000]/8 text-[#800000] border border-[#800000]/15 px-2.5 py-1 rounded-full">
                      <MapPin className="h-3 w-3" />
                      {recipient.room || "No room set"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full">
                      PUP Manila
                    </span>
                  </div>
                )}

                {/* Drop-off floor + room */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <FieldWrapper label="Drop-off Floor">
                    <SelectInput
                      value={dropoffFloor}
                      onChange={(v) => { setDropoffFloor(v); setDropoffRoom(""); }}
                      placeholder="Select Floor"
                      options={Object.keys(roomsByFloor)}
                    />
                  </FieldWrapper>
                  <FieldWrapper label="Drop-off Room" error={errors.dropoffRoom}>
                    <SelectInput
                      value={dropoffRoom}
                      onChange={setField(setDropoffRoom, "dropoffRoom", "Drop-off room")}
                      placeholder={dropoffFloor ? "Select Room" : "Select floor first"}
                      options={dropoffFloor ? roomsByFloor[dropoffFloor] : []}
                      error={!!errors.dropoffRoom}
                      disabled={!dropoffFloor}
                    />
                  </FieldWrapper>
                </div>
              </div>
            </div>

            {/* Section 3: Package Details */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <SectionTitle icon={Package} label="Package Details" />
              <div className="space-y-3.5">
                <FieldWrapper label="Item / Package Name" required error={errors.itemName}>
                  <TextInput
                    icon={Package}
                    placeholder="e.g. Laptop Charger, Module Printouts…"
                    value={itemName}
                    onChange={setField(setItemName, "itemName", "Item name")}
                    error={!!errors.itemName}
                  />
                </FieldWrapper>

                <FieldWrapper label="Package Description">
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 pointer-events-none text-[#800000]" />
                    <textarea
                      rows={2}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Describe the documents or package contents…"
                      className={`${inputBase} pl-9 resize-none`}
                    />
                  </div>
                </FieldWrapper>

                <div className="grid grid-cols-2 gap-3">
                  <FieldWrapper label="Quantity">
                    <TextInput type="number" min={1} placeholder="1" value={qty} onChange={setQty} />
                  </FieldWrapper>
                  <FieldWrapper label="Weight" required error={errors.weight}>
                    <TextInput
                      type="number" min={0.01} step="0.01" placeholder="0.00"
                      suffix="kg" value={weight}
                      onChange={setField(setWeight, "weight", "Weight")}
                      error={!!errors.weight}
                    />
                  </FieldWrapper>
                </div>

                <FieldWrapper label="Note for Recipient">
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 pointer-events-none text-[#800000]" />
                    <textarea
                      rows={2} value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add a note for the recipient…"
                      className={`${inputBase} pl-9 resize-none`}
                    />
                  </div>
                </FieldWrapper>
              </div>
            </div>

            {/* Section 4: Delivery Options */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <SectionTitle icon={Clock} label="Delivery Options" />
              <div className="space-y-4">

                {/* Schedule */}
                <div className="grid grid-cols-2 gap-3">
                  <FieldWrapper label="Date">
                    <input
                      type="date" value={schedDate}
                      onChange={(e) => setSchedDate(e.target.value)}
                      className={inputBase}
                    />
                  </FieldWrapper>
                  {/* Preset time slots */}
                  <FieldWrapper label="Time">
                    <SelectInput
                      value={schedTime}
                      onChange={setSchedTime}
                      placeholder="Select Time"
                      options={PRESET_TIMES}
                    />
                  </FieldWrapper>
                </div>

              </div>
            </div>

            {/* Section 5: Robot Assignment */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <SectionTitle icon={Bot} label="Robot Assignment" />
              <div className="space-y-3">
                <FieldWrapper label="Assign Robot">
                  <select
                    value={robotId}
                    onChange={(e) => setRobotId(e.target.value)}
                    disabled={robotsLoading}
                    className={`${inputBase} appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">
                      {robotsLoading ? "Loading robots…" : "Auto-assign best available robot"}
                    </option>
                    {robots.map((r) => {
                      const style = ROBOT_STATUS_STYLE[r.status] ?? ROBOT_STATUS_STYLE["Offline"];
                      return (
                        <option
                          key={r.id}
                          value={r.id}
                          disabled={r.status === "Offline"}
                          style={{ color: style.color }}
                        >
                          {r.name} — {r.status}
                        </option>
                      );
                    })}
                  </select>
                </FieldWrapper>
                <FieldWrapper label="Special Instructions (optional)">
                  <textarea
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Any special handling notes for the robot…"
                    className={`${inputBase} resize-none`}
                  />
                </FieldWrapper>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-bold transition-all"
                style={{
                  background: "#800000",
                  color: "#FFD700",
                  opacity: createMutation.isPending ? 0.7 : 1,
                  cursor: createMutation.isPending ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => { if (!createMutation.isPending) e.currentTarget.style.background = "#660000"; }}
                onMouseLeave={(e) => { if (!createMutation.isPending) e.currentTarget.style.background = "#800000"; }}
              >
                {createMutation.isPending ? (
                  <><Loader className="h-4 w-4 animate-spin" />Submitting...</>
                ) : (
                  <><Send className="h-4 w-4" />Send Delivery Request</>
                )}
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={createMutation.isPending}
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-[14px] font-bold border transition-all hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ borderColor: "#800000", color: "#800000" }}
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>

          {/* ── RIGHT COLUMN (summary) ───────────────────────────────────────── */}
          <div className="flex-[2] min-w-0 sticky top-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <p className="text-[13px] font-bold text-[#1A1A1A] mb-4">Delivery Summary</p>
              <div className="space-y-3.5">

                {/* From */}
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">From</p>
                  <div className="flex items-center gap-2.5">
                    <Avatar user={currentUser} size={28} />
                    <div>
                      <p className="text-[12.5px] font-semibold text-[#1A1A1A]">{currentUser.full_name}</p>
                      <p className="text-[11px] text-gray-400">
                        {pickupRoom ? `Room ${pickupRoom}` : currentUser.room || "No room set"} · PUP Manila
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* To */}
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">To</p>
                  {recipient ? (
                    <div className="flex items-center gap-2.5">
                      <Avatar user={recipient} size={28} />
                      <div>
                        <p className="text-[12.5px] font-semibold text-[#1A1A1A]">{recipient.full_name}</p>
                        <p className="text-[11px] text-gray-400">
                          {dropoffRoom ? `Room ${dropoffRoom}` : recipient.room || "No room set"} · PUP Manila
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[12.5px] text-gray-300 italic">—</p>
                  )}
                </div>

                <div className="h-px bg-gray-100" />

                <SummaryRow label="Item">
                  {itemName.trim()
                    ? <span className="text-[12.5px] font-medium text-[#1A1A1A]">{itemName}</span>
                    : <span className="text-[12.5px] text-gray-300 italic">—</span>}
                </SummaryRow>

                <div className="grid grid-cols-2 gap-2">
                  <SummaryRow label="Qty">
                    <span className="text-[12.5px] font-medium text-[#1A1A1A]">{qty || "—"}</span>
                  </SummaryRow>
                  <SummaryRow label="Weight">
                    {weight
                      ? <span className="text-[12.5px] font-medium text-[#1A1A1A]">{weight} kg</span>
                      : <span className="text-[12.5px] text-gray-300 italic">—</span>}
                  </SummaryRow>
                </div>

                <div className="h-px bg-gray-100" />

                <SummaryRow label="Schedule">
                  <span className="text-[12px] text-[#1A1A1A] font-medium text-right leading-snug">
                    {schedTime ? formatDateTime(schedDate, schedTime) : schedDate || "—"}
                  </span>
                </SummaryRow>

                {robotId && (
                  <SummaryRow label="Robot">
                    <span className="text-[12px] font-medium text-[#1A1A1A]">
                      {robots.find((r) => r.id === robotId)?.name ?? "—"}
                    </span>
                  </SummaryRow>
                )}

                <div className="h-px bg-gray-100" />

                {isFormValid ? (
                  <div className="flex items-center justify-center gap-1.5 py-2 rounded-lg"
                    style={{ background: "rgba(22,163,74,0.08)" }}>
                    <CheckCircle2 className="h-4 w-4" style={{ color: "#16a34a" }} />
                    <span className="text-[12px] font-semibold" style={{ color: "#16a34a" }}>Ready to send</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 py-2 rounded-lg"
                    style={{ background: "rgba(245,158,11,0.08)" }}>
                    <AlertCircle className="h-4 w-4" style={{ color: "#D97706" }} />
                    <span className="text-[12px] font-semibold" style={{ color: "#D97706" }}>Incomplete</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </form>
    </AppLayout>
  );
}