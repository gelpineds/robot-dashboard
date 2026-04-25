# Delivery Transaction System Implementation Guide

## Overview
This implements a 3-step user-to-user delivery transaction system with real-time notifications.

**Transaction States:**
```
Pending Approval → Accepted → Robot Assigned → In Transit → Arrived → Confirmed → Completed
(or Pending Approval → Rejected → Cancelled)
```

---

## PART 1: BACKEND CHANGES

### 1.1 Update Delivery Model
Add a field to track when recipient accepts:

```python
# app/models/delivery.py
class Delivery(db.Model):
    __tablename__ = "deliveries"
    
    id = db.Column(db.Integer, primary_key=True)
    document_name = db.Column(db.String(150), nullable=False)
    sender = db.Column(db.String(100), nullable=False)
    recipient = db.Column(db.String(100), nullable=False)
    pickup_location = db.Column(db.String(150), nullable=False)
    dropoff_location = db.Column(db.String(150), nullable=False)
    
    # Transaction status
    status = db.Column(db.String(30), default="pending_approval")  # pending_approval, accepted, rejected, robot_assigned, in_transit, arrived, confirmed, completed
    
    robot_id = db.Column(db.Integer, db.ForeignKey("robots.id"), nullable=True)
    
    # User tracking
    requested_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    received_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    
    # Timestamps
    accepted_at = db.Column(db.DateTime, nullable=True)  # When recipient accepts
    rejected_reason = db.Column(db.String(255), nullable=True)  # Why recipient rejected
    received_confirmed = db.Column(db.Boolean, default=False)
    received_at = db.Column(db.DateTime, nullable=True)  # When recipient confirms
    arrived_at = db.Column(db.DateTime, nullable=True)  # When robot arrives
    completed_at = db.Column(db.DateTime, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### 1.2 Add Backend Routes
Add to `app/routes/deliveries.py`:

```python
# 1. Search for recipient by room
@deliveries_bp.get("/search-recipient")
@jwt_required()
def search_recipient():
    room = request.args.get('room', '').strip()
    if not room or len(room) < 2:
        return {"error": "Room number required"}, 400
    
    user = User.query.filter(
        (User.room.ilike(f"%{room}%")) | 
        (User.full_name.ilike(f"%{room}%"))
    ).first()
    
    if not user:
        return {"error": "Recipient not found"}, 404
    
    return {
        "id": user.id,
        "room": user.room,
        "full_name": user.full_name,
        "username": user.username
    }, 200


# 2. Get pending deliveries for current user (as recipient)
@deliveries_bp.get("/pending-inbox")
@jwt_required()
def get_pending_inbox():
    """Returns deliveries waiting for recipient approval"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    # Find deliveries where dropoff_location matches user's room
    deliveries = Delivery.query.filter(
        Delivery.dropoff_location == user.room,
        Delivery.status == "pending_approval"
    ).order_by(Delivery.created_at.desc()).all()
    
    return [{
        "id": d.id,
        "document_name": d.document_name,
        "sender": d.sender,
        "sender_user_id": d.requested_by_user_id,
        "pickup_location": d.pickup_location,
        "dropoff_location": d.dropoff_location,
        "status": d.status,
        "created_at": d.created_at.isoformat()
    } for d in deliveries], 200


# 3. Accept delivery (Recipient accepts)
@deliveries_bp.put("/<int:delivery_id>/accept")
@jwt_required()
def accept_delivery(delivery_id):
    """Recipient accepts the delivery request"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    delivery = Delivery.query.get_or_404(delivery_id)
    
    # Verify this user is the recipient (match by room)
    if delivery.dropoff_location != user.room:
        return {"error": "Not authorized to accept this delivery"}, 403
    
    if delivery.status != "pending_approval":
        return {"error": f"Delivery already {delivery.status}"}, 400
    
    delivery.status = "accepted"
    delivery.received_by_user_id = user_id
    delivery.accepted_at = datetime.utcnow()
    
    db.session.commit()
    
    # Emit socket event for real-time update
    from app.extensions import socketio
    socketio.emit('delivery_accepted', {
        'delivery_id': delivery.id,
        'recipient_name': user.full_name,
        'status': 'accepted'
    }, room=f"user_{delivery.requested_by_user_id}")
    
    return {"message": "Delivery accepted successfully"}, 200


# 4. Reject delivery (Recipient rejects)
@deliveries_bp.put("/<int:delivery_id>/reject")
@jwt_required()
def reject_delivery(delivery_id):
    """Recipient rejects the delivery request"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    delivery = Delivery.query.get_or_404(delivery_id)
    
    if delivery.dropoff_location != user.room:
        return {"error": "Not authorized to reject this delivery"}, 403
    
    if delivery.status != "pending_approval":
        return {"error": "Can only reject pending deliveries"}, 400
    
    reason = request.json.get('reason', 'No reason provided')
    
    delivery.status = "rejected"
    delivery.rejected_reason = reason
    delivery.received_by_user_id = user_id
    
    db.session.commit()
    
    # Notify sender
    from app.extensions import socketio
    socketio.emit('delivery_rejected', {
        'delivery_id': delivery.id,
        'reason': reason
    }, room=f"user_{delivery.requested_by_user_id}")
    
    return {"message": "Delivery rejected"}, 200


# 5. Confirm receipt (Final confirmation when robot arrives)
@deliveries_bp.put("/<int:delivery_id>/confirm-receipt")
@jwt_required()
def confirm_receipt(delivery_id):
    """Recipient confirms they received the delivery"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    delivery = Delivery.query.get_or_404(delivery_id)
    
    if delivery.received_by_user_id != user_id:
        return {"error": "Only recipient can confirm receipt"}, 403
    
    if delivery.status != "arrived":
        return {"error": f"Cannot confirm receipt, status is {delivery.status}"}, 400
    
    delivery.status = "completed"
    delivery.received_confirmed = True
    delivery.received_at = datetime.utcnow()
    
    db.session.commit()
    
    # Notify sender
    from app.extensions import socketio
    socketio.emit('delivery_completed', {
        'delivery_id': delivery.id,
        'recipient': delivery.recipient
    }, room=f"user_{delivery.requested_by_user_id}")
    
    return {"message": "Delivery completed successfully"}, 200
```

---

## PART 2: FRONTEND CHANGES

### 2.1 Update API Client
Add to `frontend/src/lib/api.ts`:

```typescript
// Add these methods to deliveriesAPI object

export const deliveriesAPI = {
  // ... existing methods ...
  
  searchRecipient: (room: string) =>
    apiCall(`/deliveries/search-recipient?room=${encodeURIComponent(room)}`),
  
  getPendingInbox: () =>
    apiCall('/deliveries/pending-inbox'),
  
  acceptDelivery: (deliveryId: number) =>
    apiCall(`/deliveries/${deliveryId}/accept`, { method: 'PUT' }),
  
  rejectDelivery: (deliveryId: number, reason: string) =>
    apiCall(`/deliveries/${deliveryId}/reject`, { 
      method: 'PUT', 
      body: JSON.stringify({ reason }) 
    }),
  
  confirmReceipt: (deliveryId: number) =>
    apiCall(`/deliveries/${deliveryId}/confirm-receipt`, { method: 'PUT' }),
};
```

### 2.2 Create DeliveryInbox.tsx (NEW)
Create `frontend/src/pages/DeliveryInbox.tsx`:

```typescript
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { deliveriesAPI } from "@/lib/api";
import { Package, User, MapPin, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface PendingDelivery {
  id: number;
  document_name: string;
  sender: string;
  sender_user_id: number;
  pickup_location: string;
  dropoff_location: string;
  status: string;
  created_at: string;
}

export default function DeliveryInbox() {
  const [selectedDelivery, setSelectedDelivery] = useState<PendingDelivery | null>(null);
  const [processing, setProcessing] = useState(false);

  const { data: deliveries = [], refetch } = useQuery({
    queryKey: ['delivery-inbox'],
    queryFn: () => deliveriesAPI.getPendingInbox(),
  });

  const handleAccept = async () => {
    if (!selectedDelivery) return;
    setProcessing(true);
    try {
      await deliveriesAPI.acceptDelivery(selectedDelivery.id);
      toast.success("Delivery accepted! Waiting for robot assignment...");
      setSelectedDelivery(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDelivery) return;
    setProcessing(true);
    try {
      await deliveriesAPI.rejectDelivery(selectedDelivery.id, "Recipient unable to receive");
      toast.success("Delivery rejected");
      setSelectedDelivery(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AppLayout title="Delivery Inbox">
      <div className="max-w-4xl mx-auto">
        {deliveries.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No pending deliveries</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery: PendingDelivery) => (
              <div
                key={delivery.id}
                onClick={() => setSelectedDelivery(delivery)}
                className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {delivery.document_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>From: {delivery.sender}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(delivery.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{delivery.pickup_location}</span>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="text-gray-600">{delivery.dropoff_location}</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccept();
                    }}
                    disabled={processing}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept Delivery
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject();
                    }}
                    disabled={processing}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
```

### 2.3 Update RequestDelivery.tsx
Update `frontend/src/pages/RequestDelivery.tsx` - Add recipient search:

```typescript
// Add this to the form state and handlers:

const [recipientSearch, setRecipientSearch] = useState("");
const [recipientOptions, setRecipientOptions] = useState<any[]>([]);
const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
const [searching, setSearching] = useState(false);

const handleRecipientSearch = async (query: string) => {
  setRecipientSearch(query);
  if (query.length < 2) {
    setRecipientOptions([]);
    return;
  }
  
  setSearching(true);
  try {
    const result = await deliveriesAPI.searchRecipient(query);
    setRecipientOptions([result]);
  } catch (error) {
    setRecipientOptions([]);
  } finally {
    setSearching(false);
  }
};

// Add this UI section BEFORE "ROBOT ASSIGNMENT":
<SectionTitle icon={User} label="RECIPIENT DETAILS" />
<Field label="Search Recipient by Room" required>
  <div className="relative">
    <User
      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
      style={{ color: "#800000" }}
    />
    <input
      type="text"
      value={recipientSearch}
      onChange={(e) => handleRecipientSearch(e.target.value)}
      placeholder="e.g., Room 101, John Doe"
      className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border rounded-lg outline-none"
    />
    {searching && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
  </div>
  
  {recipientOptions.length > 0 && (
    <div className="mt-2 bg-gray-50 border rounded-lg overflow-hidden">
      {recipientOptions.map((recipient) => (
        <div
          key={recipient.id}
          onClick={() => {
            setSelectedRecipient(recipient);
            setRecipientSearch("");
            setRecipientOptions([]);
          }}
          className="p-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
        >
          <div className="font-semibold text-sm">{recipient.full_name}</div>
          <div className="text-xs text-gray-500">Room: {recipient.room}</div>
        </div>
      ))}
    </div>
  )}
</Field>

{selectedRecipient && (
  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
    <div className="font-semibold text-green-900">{selectedRecipient.full_name}</div>
    <div className="text-sm text-green-700">Room: {selectedRecipient.room}</div>
    <button
      type="button"
      onClick={() => setSelectedRecipient(null)}
      className="mt-2 text-xs text-green-600 hover:text-green-700"
    >
      Change recipient
    </button>
  </div>
)}
```

### 2.4 Update TrackDelivery.tsx
Add the "Confirm Receipt" button when status is "arrived":

```typescript
// Add to the TrackDelivery component, after the status timeline:

const [confirming, setConfirming] = useState(false);

const handleConfirmReceipt = async () => {
  setConfirming(true);
  try {
    await deliveriesAPI.confirmReceipt(delivery.id);
    toast.success("Delivery confirmed! Thank you.");
    // Refetch to update status
    queryClient.invalidateQueries({ queryKey: ['delivery', deliveryId] });
  } catch (error: any) {
    toast.error(error.message);
  } finally {
    setConfirming(false);
  }
};

// Add this section after status timeline:
{delivery.status === 'arrived' && !delivery.received_confirmed && (
  <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-6 text-center">
    <h3 className="text-lg font-bold text-blue-900 mb-2">
      🤖 Robot has arrived!
    </h3>
    <p className="text-blue-700 mb-4">
      Please confirm that you've received the delivery
    </p>
    <button
      onClick={handleConfirmReceipt}
      disabled={confirming}
      className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
    >
      <CheckCircle className="w-5 h-5" />
      {confirming ? 'Confirming...' : 'Confirm Receipt'}
    </button>
  </div>
)}
```

### 2.5 Update Navigation
Add route in `frontend/src/App.tsx`:

```typescript
import DeliveryInbox from "@/pages/DeliveryInbox";

// Add to your routes:
<Route path="/delivery-inbox" element={<DeliveryInbox />} />
```

Add sidebar link in `frontend/src/components/AppSidebar.tsx`:

```typescript
<NavLink 
  to="/delivery-inbox" 
  icon={Package} 
  label="Delivery Inbox"
/>
```

---

## PART 3: TESTING CHECKLIST

- [ ] User 1 searches for recipient by room
- [ ] Recipient search returns correct user
- [ ] User 1 creates delivery request → shows "Awaiting approval"
- [ ] User 2 sees notification in Delivery Inbox
- [ ] User 2 accepts → User 1 gets real-time update
- [ ] Status updates: accepted → robot_assigned → in_transit → arrived
- [ ] User 2 sees "Confirm Receipt" button when status = arrived
- [ ] User 2 confirms → shows "Completed" for both users
- [ ] User 2 can reject with reason

---

## Key Features Implemented

✅ Real-time socket notifications  
✅ Recipient search by room/name  
✅ 7-step transaction workflow  
✅ Accept/Reject mechanism  
✅ Final receipt confirmation  
✅ History tracking  
✅ User-to-user transaction transparency
