import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/lib/api";
import { AppLayout } from "@/components/AppLayout";
import { StatusTimeline } from "@/components/ui/timeline";
import { RouteMap } from "@/components/ui/maps";
import { HoverCardContent, HoverCardTrigger, HoverCard } from "@/components/ui/utilities";
import { deliveriesAPI } from "@/lib/api";
import { formatTimeOnly, formatDateOnly, formatTimestampStatic } from "@/hooks/useTimeAgo";
import {
  ArrowLeft, Bot, MapPin, CheckCircle, Package, AlertCircle, Loader, XCircle, Info,
} from "lucide-react";
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
} from "@/components/ui/dialogs";
import { toast } from "@/hooks/use-toast";

export default function TrackDelivery() {
  const navigate = useNavigate();
  const { deliveryId } = useParams<{ deliveryId: string }>();

  const queryClient = useQueryClient();
  const { data: delivery, isLoading, error } = useQuery({
    queryKey: ['delivery', deliveryId],
    queryFn: () => deliveryId ? deliveriesAPI.getById(Number(deliveryId)) : Promise.reject('No delivery ID'),
    enabled: !!deliveryId,
  });

  // Cancel Delivery mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!deliveryId) throw new Error("No delivery ID");
      // Mark as cancelled (or delete, depending on API)
      await deliveriesAPI.updateDelivery(Number(deliveryId), { status: "cancelled" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery", deliveryId] });
      queryClient.invalidateQueries({ queryKey: ["deliveries-all"] });
      toast({
        title: "Delivery Cancelled",
        description: "The delivery has been cancelled successfully.",
      });
      navigate("/history");
    },
    onError: (err: any) => {
      toast({
        title: "Failed to cancel delivery",
        description: err?.message || "An error occurred.",
        variant: "destructive",
      });
    },
  });

    // Fetch current user to determine whether we should show the "Confirm Receipt" action
    const { data: currentUser } = useQuery({
      queryKey: ["currentUser"],
      queryFn: () => authAPI.getCurrentUser(),
    });

    const confirmMutation = useMutation({
      mutationFn: async () => {
        if (!deliveryId) throw new Error("No delivery ID");
        await deliveriesAPI.confirmReceived(Number(deliveryId));
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["delivery", deliveryId] });
        queryClient.invalidateQueries({ queryKey: ["deliveries-all"] });
        toast({ title: "Receipt confirmed", description: "Thank you. Delivery marked as received." });
        navigate('/history');
      },
      onError: (err: any) => {
        toast({ title: "Failed to confirm receipt", description: err?.message || "An error occurred.", variant: "destructive" });
      },
    });

  if (!deliveryId) {
    return (
      <AppLayout title="Track Delivery">
        <div className="max-w-4xl mx-auto text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 mb-4">Please select a delivery from your history to track.</p>
          <button
            onClick={() => navigate('/history')}
            className="px-4 py-2 rounded-lg text-white font-semibold transition-colors"
            style={{ background: '#800000' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#660000'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#800000'}
          >
            View Delivery History
          </button>
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout title="Track Delivery">
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !delivery) {
    return (
      <AppLayout title="Track Delivery">
        <div className="max-w-4xl mx-auto text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 mb-4">Delivery not found or error loading delivery details.</p>
          <button
            onClick={() => navigate('/history')}
            className="px-4 py-2 rounded-lg text-white font-semibold transition-colors"
            style={{ background: '#800000' }}
          >
            Back to History
          </button>
        </div>
      </AppLayout>
    );
  }

  // Build status timeline
  const getStatusTimeline = (status: string) => {
    const baseSteps = [
      { label: "Delivery Placed", done: true, current: false },
      { label: "Robot Assigned", done: status !== 'pending_request', current: false },
      { label: "Picked Up", done: status === 'in_transit' || status === 'delivered', current: false },
      { label: "In Transit", done: status === 'in_transit' || status === 'delivered', current: status === 'in_transit' },
      { label: "Delivered", done: status === 'delivered', current: status === 'delivered' },
    ];
    return baseSteps;
  };

  const steps = getStatusTimeline(delivery.status);

  // Format status for display
  const displayStatus = delivery.status === 'pending_request' ? 'Pending' 
    : delivery.status === 'in_transit' ? 'In Transit'
    : delivery.status === 'delivered' ? 'Delivered'
    : delivery.status;

  const statusColor = delivery.status === 'delivered' ? '#16a34a'
    : delivery.status === 'in_transit' ? '#d97706'
    : '#6B7280';

  return (
    <AppLayout title="Track Delivery">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header + Quick Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/history')}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-[#1A1A1A]">DEL-{String(delivery.id).padStart(5, '0')}</h1>
              <p className="text-sm text-gray-500">{delivery.document_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="px-4 py-2 rounded-full font-semibold text-sm"
              style={{
                background: delivery.status === 'delivered' ? 'rgba(22,163,74,0.1)'
                  : delivery.status === 'in_transit' ? 'rgba(217,119,6,0.1)'
                  : '#F3F4F6',
                color: statusColor,
              }}
            >
              {displayStatus}
            </span>
            {/* Cancel Delivery quick action (show only if not delivered/cancelled/failed) */}
            {['pending_request', 'in_transit'].includes(delivery.status) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="ml-2 flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                    disabled={cancelMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Cancel Delivery
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
                      onClick={() => cancelMutation.mutate()}
                      disabled={cancelMutation.isPending}
                    >
                      Yes, cancel it
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {/* Confirm Receipt — only visible to the recipient when status allows */}
            {currentUser && delivery.recipient_user_id === currentUser.id && ['pending_request', 'robot_assigned', 'arrived', 'in_transit'].includes(delivery.status) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="ml-2 flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    disabled={confirmMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Confirm Receipt
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Receipt?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Confirm that you have received the package and reviewed documents.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={confirmMutation.isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => confirmMutation.mutate()} disabled={confirmMutation.isPending}>
                      Yes, confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {/* Map Card */}
        <div
          className="relative rounded-xl overflow-hidden border border-gray-200"
          style={{ height: 280 }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "#E5E7EB",
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <span className="absolute top-3 left-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest z-10">
            Route Overview
          </span>
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="28%" y1="65%" x2="72%" y2="35%" stroke="#800000" strokeWidth="2.5" strokeDasharray="8 5" strokeLinecap="round" />
            <circle cx="28%" cy="65%" r="6" fill="#FFD700" stroke="#800000" strokeWidth="2" />
            <circle cx="72%" cy="35%" r="6" fill="#800000" stroke="#fff" strokeWidth="2" />
          </svg>
          <div
            className="absolute z-10 flex items-center gap-1.5 bg-white rounded-lg px-2 py-1 shadow-sm border border-gray-200"
            style={{ left: "calc(28% - 52px)", top: "calc(65% + 14px)" }}
          >
            <MapPin className="h-3 w-3 shrink-0" style={{ color: "#FFD700" }} />
            <span className="text-[10px] font-semibold text-[#1A1A1A]">Pickup</span>
          </div>
          <div
            className="absolute z-10 flex items-center gap-1.5 bg-white rounded-lg px-2 py-1 shadow-sm border border-gray-200"
            style={{ right: "calc(28% - 52px)", top: "calc(35% + 14px)" }}
          >
            <MapPin className="h-3 w-3 shrink-0 text-[#800000]" />
            <span className="text-[10px] font-semibold text-[#1A1A1A]">Drop-off</span>
          </div>
        </div>

        {/* Location & Status Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Location Details */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#1A1A1A]">Delivery Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Pickup</p>
                <p className="text-sm font-medium text-[#1A1A1A] mt-1">{delivery.pickup_location}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Drop-off</p>
                <p className="text-sm font-medium text-[#1A1A1A] mt-1">{delivery.dropoff_location}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Recipient</p>
                <p className="text-sm font-medium text-[#1A1A1A] mt-1">{delivery.recipient}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-5">Delivery Progress</h3>
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="flex flex-col items-center gap-2 mt-1">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 transition-all"
                      style={{
                        background: step.done ? '#16a34a' : step.current ? '#FFD700' : '#E5E7EB',
                        color: step.current ? '#800000' : 'white',
                      }}
                    >
                      {step.done ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className="w-0.5 h-10"
                        style={{ background: step.done ? '#16a34a' : '#E5E7EB' }}
                      />
                    )}
                  </div>
                  <div className="pt-1 flex-1">
                    <p className="text-sm font-semibold text-[#1A1A1A]">{step.label}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {step.done ? formatTimeOnly(delivery.created_at) : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Robot & Sender Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Robot Info */}
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#800000' }}>
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1A1A1A]">Assigned Robot</h3>
                    <Info className="h-3 w-3 text-gray-400 mt-1" />
                  </div>
                </div>
                {delivery.robot_id ? (
                  <p className="text-sm font-medium text-gray-700">PUP-BOT Unit {delivery.robot_id}</p>
                ) : (
                  <p className="text-sm text-gray-500">No robot assigned yet</p>
                )}
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Robot Details</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><span className="font-medium">Unit ID:</span> {delivery.robot_id || 'N/A'}</p>
                  <p><span className="font-medium">Model:</span> DelivBot X2</p>
                  <p><span className="font-medium">Status:</span> <span className="text-green-600">Active</span></p>
                  <p><span className="font-medium">Battery:</span> 85%</p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>

          {/* Sender Info */}
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#FFD700' }}>
                    <Package className="h-5 w-5 text-[#800000]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1A1A1A]">Sender</h3>
                    <Info className="h-3 w-3 text-gray-400 mt-1" />
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-700">{delivery.sender}</p>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-64">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Sender Information</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p><span className="font-medium">Name:</span> {delivery.sender}</p>
                  <p><span className="font-medium">Package:</span> {delivery.document_name}</p>
                  <p><span className="font-medium">Status:</span> <span className="text-blue-600">Processing</span></p>
                  <p><span className="font-medium">Date:</span> {formatDateOnly(delivery.created_at)}</p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    </AppLayout>
  );
}
