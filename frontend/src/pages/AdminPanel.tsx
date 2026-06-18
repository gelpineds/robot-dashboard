import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { usersAPI, robotsAPI, deliveriesAPI } from "@/lib/api";
import { useUser } from "@/hooks/useUser";
import {
  Shield,
  Users,
  MapPin,
  Bot,
  RefreshCcw,
  Pencil,
  Trash2,
  X,
  Check,
  Activity,
  Clock3,
} from "lucide-react";

type UserRecord = {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  floor?: string | null;
  room?: string | null;
  is_active?: boolean;
};

type RobotRecord = {
  id: number;
  name: string;
  status?: string;
  battery_level?: number;
  location?: string;
  updated_at?: string | null;
};

type DeliveryRecord = {
  id: number;
  document_name: string;
  sender: string;
  recipient: string;
  status: string;
  pickup_location?: string;
  dropoff_location?: string;
  created_at?: string;
};

type UserFormState = {
  id: number | null;
  username: string;
  email: string;
  full_name: string;
  role: string;
  floor: string;
  room: string;
  is_active: boolean;
};

const defaultForm: UserFormState = {
  id: null,
  username: "",
  email: "",
  full_name: "",
  role: "user",
  floor: "",
  room: "",
  is_active: true,
};

const floorLabels: Record<string, string> = {
  "1": "1st Floor",
  "2": "2nd Floor",
  "3": "3rd Floor",
};

const activeQueueStatuses = new Set(["pending_request", "robot_assigned", "in_transit", "arrived"]);

function formatFloor(floor?: string | null) {
  if (!floor) return "No floor set";
  return floorLabels[floor] || `${floor} Floor`;
}

function badgeColor(status?: string) {
  const value = (status || "").toLowerCase();
  if (["online", "arrived", "completed"].includes(value)) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (["in_transit", "robot_assigned", "pending_request"].includes(value)) return "bg-amber-50 text-amber-700 border-amber-200";
  if (["offline", "cancelled", "failed"].includes(value)) return "bg-gray-100 text-gray-600 border-gray-200";
  return "bg-[#800000]/10 text-[#800000] border-[#800000]/20";
}

export default function AdminPanel() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<UserFormState>(defaultForm);
  const [editOpen, setEditOpen] = useState(false);
  const [savingMessage, setSavingMessage] = useState("");

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: usersAPI.getAll,
    refetchInterval: 15000,
  });

  const robotsQuery = useQuery({
    queryKey: ["admin-robots"],
    queryFn: robotsAPI.getAll,
    refetchInterval: 5000,
  });

  const deliveriesQuery = useQuery({
    queryKey: ["admin-deliveries"],
    queryFn: deliveriesAPI.getAllDeliveries,
    refetchInterval: 5000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserFormState> }) => usersAPI.update(id, data),
    onSuccess: async () => {
      setEditOpen(false);
      setSavingMessage("User updated successfully.");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setTimeout(() => setSavingMessage(""), 2500);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersAPI.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const users = (usersQuery.data as UserRecord[] | undefined) || [];
  const robots = (robotsQuery.data as RobotRecord[] | undefined) || [];
  const deliveries = (deliveriesQuery.data as DeliveryRecord[] | undefined) || [];

  const floorGroups = (() => {
    const grouped = new Map<string, UserRecord[]>();

    users.forEach((item) => {
      const key = formatFloor(item.floor);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(item);
    });

    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  })();

  const queueItems = deliveries.filter((delivery) => activeQueueStatuses.has(delivery.status));
  const onlineRobots = robots.filter((robot) => (robot.status || "").toLowerCase() === "online").length;
  const activeUsers = users.filter((item) => item.is_active !== false).length;

  useEffect(() => {
    document.title = "Admin Panel | PUP Deliver";
  }, []);

  const openEditor = (item: UserRecord) => {
    setEditingUser({
      id: item.id,
      username: item.username,
      email: item.email,
      full_name: item.full_name,
      role: item.role,
      floor: item.floor || "",
      room: item.room || "",
      is_active: item.is_active !== false,
    });
    setEditOpen(true);
  };

  const handleSave = () => {
    if (!editingUser.id) return;

    updateMutation.mutate({
      id: editingUser.id,
      data: {
        username: editingUser.username.trim(),
        email: editingUser.email.trim(),
        full_name: editingUser.full_name.trim(),
        role: editingUser.role,
        floor: editingUser.floor.trim(),
        room: editingUser.room.trim(),
        is_active: editingUser.is_active,
      },
    });
  };

  const handleDelete = (item: UserRecord) => {
    if (user?.id === item.id) {
      window.alert("You cannot delete your own admin account.");
      return;
    }

    if (!window.confirm(`Delete ${item.full_name}? This cannot be undone.`)) return;
    deleteMutation.mutate(item.id);
  };

  return (
    <AppLayout title="Admin Panel">
      <div className="space-y-6">
        <div className="rounded-3xl bg-gradient-to-br from-[#800000] via-[#5a0000] to-[#2e0000] text-white p-6 shadow-xl relative overflow-hidden">
          <div className="admin-hero-overlay absolute inset-0 opacity-20" />
          <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
                <Shield className="h-3.5 w-3.5" /> Admin access
              </div>
              <h1 className="mt-4 text-3xl font-bold">Operations Control Center</h1>
              <p className="mt-2 max-w-2xl text-white/75 text-sm">
                Review users by floor and room, edit account details, remove users, and monitor live robot and delivery queues.
              </p>
            </div>
            <button
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["admin-users"] });
                queryClient.invalidateQueries({ queryKey: ["admin-robots"] });
                queryClient.invalidateQueries({ queryKey: ["admin-deliveries"] });
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-white text-[#800000] px-4 py-2.5 text-sm font-semibold shadow-lg transition-transform hover:scale-[1.01]"
            >
              <RefreshCcw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </div>

        {savingMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {savingMessage}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatBox icon={Users} label="Users" value={String(users.length)} hint={`${activeUsers} active`} />
          <StatBox icon={MapPin} label="Floors" value={String(floorGroups.length)} hint="Grouped by floor" />
          <StatBox icon={Bot} label="Robots online" value={String(onlineRobots)} hint={`${robots.length} total robots`} />
          <StatBox icon={Clock3} label="Queue items" value={String(queueItems.length)} hint="Pending or in progress" />
        </div>

        <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-[#1A1A1A]">Users by floor and room</h2>
                <p className="text-xs text-gray-500">Edit usernames, names, roles, floor, room, and active state.</p>
              </div>
              <span className="text-xs text-gray-500">{users.length} users</span>
            </div>

            <div className="divide-y divide-gray-100">
              {floorGroups.map(([floor, items]) => (
                <div key={floor} className="px-5 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#1A1A1A]">{floor}</h3>
                    <span className="text-xs text-gray-500">{items.length} account{items.length === 1 ? "" : "s"}</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">User</th>
                          <th className="px-4 py-3 text-left font-semibold">Room</th>
                          <th className="px-4 py-3 text-left font-semibold">Role</th>
                          <th className="px-4 py-3 text-left font-semibold">Status</th>
                          <th className="px-4 py-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {items.map((item) => (
                          <tr key={item.id} className="align-top">
                            <td className="px-4 py-3">
                              <div className="font-medium text-[#1A1A1A]">{item.full_name}</div>
                              <div className="text-xs text-gray-500">@{item.username} · {item.email}</div>
                            </td>
                            <td className="px-4 py-3 text-gray-700">{item.room || "No room set"}</td>
                            <td className="px-4 py-3 text-gray-700">{item.role}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${item.is_active === false ? "bg-gray-100 text-gray-600 border-gray-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                                {item.is_active === false ? "Inactive" : "Active"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openEditor(item)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                  <Pencil className="h-3.5 w-3.5" /> Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(item)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              {!users.length && (
                <div className="px-5 py-12 text-center text-sm text-gray-500">No users available.</div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-[#1A1A1A]">Robot status</h2>
                  <p className="text-xs text-gray-500">Live fleet overview.</p>
                </div>
                <Activity className="h-4 w-4 text-[#800000]" />
              </div>
              <div className="max-h-[360px] overflow-auto p-4 space-y-3">
                {robots.map((robot) => (
                  <div key={robot.id} className="rounded-xl border border-gray-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#1A1A1A]">{robot.name}</p>
                        <p className="text-xs text-gray-500">{robot.location || "No location set"}</p>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeColor(robot.status)}`}>
                        {robot.status || "Unknown"}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Battery: {typeof robot.battery_level === "number" ? `${robot.battery_level}%` : "N/A"}
                    </div>
                  </div>
                ))}
                {!robots.length && <div className="py-8 text-center text-sm text-gray-500">No robots found.</div>}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-[#1A1A1A]">Queueing</h2>
                  <p className="text-xs text-gray-500">Pending and active deliveries.</p>
                </div>
                <Clock3 className="h-4 w-4 text-[#800000]" />
              </div>
              <div className="max-h-[360px] overflow-auto p-4 space-y-3">
                {queueItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-gray-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#1A1A1A]">{item.document_name}</p>
                        <p className="text-xs text-gray-500">{item.sender} → {item.recipient}</p>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {item.pickup_location || "Unknown pickup"} → {item.dropoff_location || "Unknown dropoff"}
                    </p>
                  </div>
                ))}
                {!queueItems.length && <div className="py-8 text-center text-sm text-gray-500">No active queue items.</div>}
              </div>
            </div>
          </div>
        </section>
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-[60] bg-black/45 px-4 py-8 overflow-auto">
          <div className="mx-auto w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A]">Edit user</h3>
                <p className="text-xs text-gray-500">Update account and location details.</p>
              </div>
              <button onClick={() => setEditOpen(false)} title="Close editor" aria-label="Close editor" className="rounded-full p-2 hover:bg-gray-100">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <Field label="Full Name">
                <input className="admin-input" placeholder="Full name" title="Full name" value={editingUser.full_name} onChange={(e) => setEditingUser((prev) => ({ ...prev, full_name: e.target.value }))} />
              </Field>
              <Field label="Username">
                <input className="admin-input" placeholder="Username" title="Username" value={editingUser.username} onChange={(e) => setEditingUser((prev) => ({ ...prev, username: e.target.value }))} />
              </Field>
              <Field label="Email">
                <input className="admin-input" placeholder="Email" title="Email" value={editingUser.email} onChange={(e) => setEditingUser((prev) => ({ ...prev, email: e.target.value }))} />
              </Field>
              <Field label="Role">
                <select className="admin-input" title="Role" value={editingUser.role} onChange={(e) => setEditingUser((prev) => ({ ...prev, role: e.target.value }))}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
              <Field label="Floor">
                <select className="admin-input" title="Floor" value={editingUser.floor} onChange={(e) => setEditingUser((prev) => ({ ...prev, floor: e.target.value }))}>
                  <option value="">No floor</option>
                  <option value="1">1st Floor</option>
                  <option value="2">2nd Floor</option>
                  <option value="3">3rd Floor</option>
                </select>
              </Field>
              <Field label="Room">
                <input className="admin-input" placeholder="Room number" title="Room" value={editingUser.room} onChange={(e) => setEditingUser((prev) => ({ ...prev, room: e.target.value }))} />
              </Field>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-gray-100 px-6 py-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={editingUser.is_active}
                  onChange={(e) => setEditingUser((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-[#800000] focus:ring-[#800000]"
                />
                Active account
              </label>

              <div className="flex items-center gap-3">
                <button onClick={() => setEditOpen(false)} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#800000] px-4 py-2.5 text-sm font-semibold text-[#FFD700] hover:bg-[#660000] disabled:opacity-60"
                >
                  <Check className="h-4 w-4" /> Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function StatBox({ icon: Icon, label, value, hint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
          <div className="mt-2 text-3xl font-bold text-[#1A1A1A]">{value}</div>
          <p className="mt-1 text-xs text-gray-500">{hint}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#800000]/10 text-[#800000]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      {children}
    </label>
  );
}
