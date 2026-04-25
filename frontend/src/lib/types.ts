export type DeliveryStatus =
  | 'pending_approval'   // waiting for User2 to accept
  | 'rejected'           // User2 declined
  | 'robot_assigned'     // accepted, robot on its way to pickup
  | 'in_transit'         // robot picked up, heading to User2
  | 'arrived'            // robot at User2 door, waiting for receipt confirmation
  | 'completed'          // User2 confirmed receipt
  | 'cancelled'          // expired or manually cancelled

export type DeliveryPriority = 'standard' | 'express'

export interface UserProfile {
  id: string
  name: string
  room: string
  building: string
  initials: string       // e.g. "JD"
  avatarColor: string    // hex color for avatar bg
}

export interface DeliveryItem {
  name: string
  qty: number
  weight: number         // kg
}

export interface Delivery {
  id: string                    // e.g. "DEL-20251"
  sender: UserProfile
  recipient: UserProfile
  item: DeliveryItem
  senderNote: string
  priority: DeliveryPriority
  fee: number                   // in PHP
  status: DeliveryStatus
  robotId: string               // e.g. "RBT-003"
  robotName: string             // e.g. "PUP-BOT Unit 3"
  createdAt: string             // ISO string
  acceptedAt?: string
  pickedUpAt?: string
  arrivedAt?: string
  completedAt?: string
  expiresAt: string             // ISO string — 5 mins after createdAt
  timeline: TimelineEvent[]
}

export interface TimelineEvent {
  status: DeliveryStatus
  label: string
  timestamp: string             // ISO string
}