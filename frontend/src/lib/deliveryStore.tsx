import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type {
  Delivery,
  DeliveryStatus,
  UserProfile,
  DeliveryItem,
  DeliveryPriority,
  TimelineEvent,
} from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nowISO(): string {
  return new Date().toISOString()
}

function statusLabel(status: DeliveryStatus): string {
  const labels: Record<DeliveryStatus, string> = {
    robot_assigned: 'Robot dispatched to pickup',
    in_transit:     'Package picked up, robot en route',
    arrived:        'Robot arrived at destination',
    completed:      'Delivery confirmed by recipient',
    cancelled:      'Delivery cancelled',
  }
  return labels[status]
}

let _idCounter = 20254

function generateDeliveryId(): string {
  _idCounter += 1
  return `DEL-${_idCounter}`
}

// ---------------------------------------------------------------------------
// Seed users
// ---------------------------------------------------------------------------

const USER_JUAN: UserProfile = {
  id: 'usr-001',
  name: 'Juan dela Cruz',
  room: 'Room 204',
  building: 'Engineering Building',
  initials: 'JC',
  avatarColor: '#4F46E5',
}

const USER_MARIA: UserProfile = {
  id: 'usr-002',
  name: 'Maria Santos',
  room: 'Room 301',
  building: 'Main Building',
  initials: 'MS',
  avatarColor: '#0891B2',
}

const USER_CARLO: UserProfile = {
  id: 'usr-003',
  name: 'Carlo Reyes',
  room: 'Room 102',
  building: 'IT Building',
  initials: 'CR',
  avatarColor: '#059669',
}

// ---------------------------------------------------------------------------
// Seed deliveries
// ---------------------------------------------------------------------------

const SEED_DELIVERIES: Delivery[] = [
  {
    id: 'DEL-20251',
    sender: USER_JUAN,
    recipient: USER_MARIA,
    item: { name: 'Module 3 Notes', qty: 1, weight: 0.2 },
    senderNote: 'Please keep the pages in order.',
    priority: 'standard',
    fee: 0,
    status: 'in_transit',
    robotId: 'RBT-003',
    robotName: 'PUP-BOT Unit 3',
    estimatedArrival: '3 mins',
    distance: '280 m',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    pickedUpAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    timeline: [
      { status: 'robot_assigned', label: 'Robot dispatched to pickup',        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
      { status: 'in_transit',     label: 'Package picked up, robot en route', timestamp: new Date(Date.now() -  5 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'DEL-20252',
    sender: USER_CARLO,
    recipient: USER_MARIA,
    item: { name: 'USB Drive', qty: 1, weight: 0.05 },
    senderNote: 'The project files are already inside.',
    priority: 'express',
    fee: 0,
    status: 'arrived',
    robotId: 'RBT-001',
    robotName: 'PUP-BOT Unit 1',
    estimatedArrival: 'Arrived',
    distance: '320 m',
    createdAt:  new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    pickedUpAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    arrivedAt:  new Date(Date.now() -  5 * 60 * 1000).toISOString(),
    timeline: [
      { status: 'robot_assigned', label: 'Robot dispatched to pickup',        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
      { status: 'in_transit',     label: 'Package picked up, robot en route', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
      { status: 'arrived',        label: 'Robot arrived at destination',       timestamp: new Date(Date.now() -  5 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'DEL-20253',
    sender: USER_JUAN,
    recipient: USER_MARIA,
    item: { name: 'Laboratory Manual', qty: 1, weight: 0.35 },
    senderNote: '',
    priority: 'standard',
    fee: 0,
    status: 'completed',
    robotId: 'RBT-002',
    robotName: 'PUP-BOT Unit 2',
    estimatedArrival: 'Delivered',
    distance: '150 m',
    createdAt:   new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    pickedUpAt:  new Date(Date.now() - 80 * 60 * 1000).toISOString(),
    arrivedAt:   new Date(Date.now() - 70 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    timeline: [
      { status: 'robot_assigned', label: 'Robot dispatched to pickup',        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString() },
      { status: 'in_transit',     label: 'Package picked up, robot en route', timestamp: new Date(Date.now() - 80 * 60 * 1000).toISOString() },
      { status: 'arrived',        label: 'Robot arrived at destination',       timestamp: new Date(Date.now() - 70 * 60 * 1000).toISOString() },
      { status: 'completed',      label: 'Delivery confirmed by recipient',    timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString() },
    ],
  },
]

// ---------------------------------------------------------------------------
// createDelivery input — callers don't need to supply estimatedArrival/distance
// ---------------------------------------------------------------------------

export type CreateDeliveryInput = {
  sender:           UserProfile
  recipient:        UserProfile
  item:             DeliveryItem
  senderNote:       string
  priority:         DeliveryPriority
  fee:              number
  robotId:          string
  robotName:        string
  estimatedArrival?: string
  distance?:         string
}

// ---------------------------------------------------------------------------
// Context value shape
// ---------------------------------------------------------------------------

export interface DeliveryContextValue {
  deliveries:                      Delivery[]
  createDelivery:                  (data: CreateDeliveryInput) => Delivery
  updateStatus:                    (id: string, status: DeliveryStatus) => void
  confirmReceipt:                  (id: string) => void
  cancelDelivery:                  (id: string) => void
  getDeliveryById:                 (id: string) => Delivery | undefined
  getActiveDeliveriesForRecipient: (recipientId: string) => Delivery[]
  getDeliveryHistoryForRecipient:  (recipientId: string) => Delivery[]
  getDeliveriesBySender:           (senderId: string) => Delivery[]
}

// ---------------------------------------------------------------------------
// Context — NOT exported from this file to satisfy Vite Fast Refresh rules.
// Components use the useDelivery() hook exclusively.
// ---------------------------------------------------------------------------

const DeliveryContext = createContext<DeliveryContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider — the only React component exported from this file
// ---------------------------------------------------------------------------

export function DeliveryProvider({ children }: { children: ReactNode }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>(SEED_DELIVERIES)

  const appendEvent = useCallback(
    (id: string, patch: Partial<Delivery>, event: TimelineEvent) => {
      setDeliveries(prev =>
        prev.map(d =>
          d.id === id ? { ...d, ...patch, timeline: [...d.timeline, event] } : d
        )
      )
    },
    []
  )

  const createDelivery = useCallback((data: CreateDeliveryInput): Delivery => {
    const ts = nowISO()
    const firstEvent: TimelineEvent = {
      status:    'robot_assigned',
      label:     statusLabel('robot_assigned'),
      timestamp: ts,
    }
    const delivery: Delivery = {
      sender:           data.sender,
      recipient:        data.recipient,
      item:             data.item,
      senderNote:       data.senderNote,
      priority:         data.priority,
      fee:              data.fee,
      robotId:          data.robotId,
      robotName:        data.robotName,
      estimatedArrival: data.estimatedArrival ?? 'Calculating...',
      distance:         data.distance         ?? '—',
      id:               generateDeliveryId(),
      status:           'robot_assigned',
      createdAt:        ts,
      timeline:         [firstEvent],
    }
    setDeliveries(prev => [delivery, ...prev])
    return delivery
  }, [])

  const updateStatus = useCallback((id: string, status: DeliveryStatus) => {
    const ts = nowISO()
    const patch: Partial<Delivery> = { status }
    if (status === 'in_transit') patch.pickedUpAt  = ts
    if (status === 'arrived')    patch.arrivedAt   = ts
    if (status === 'completed')  patch.completedAt = ts
    appendEvent(id, patch, { status, label: statusLabel(status), timestamp: ts })
  }, [appendEvent])

  const confirmReceipt = useCallback((id: string) => {
    const ts = nowISO()
    appendEvent(
      id,
      { status: 'completed', completedAt: ts },
      { status: 'completed', label: statusLabel('completed'), timestamp: ts }
    )
  }, [appendEvent])

  const cancelDelivery = useCallback((id: string) => {
    const ts = nowISO()
    appendEvent(
      id,
      { status: 'cancelled' },
      { status: 'cancelled', label: statusLabel('cancelled'), timestamp: ts }
    )
  }, [appendEvent])

  const getDeliveryById = useCallback(
    (id: string) => deliveries.find(d => d.id === id),
    [deliveries]
  )

  const getActiveDeliveriesForRecipient = useCallback(
    (recipientId: string) =>
      deliveries.filter(d => d.recipient.id === recipientId && d.status === 'arrived'),
    [deliveries]
  )

  const getDeliveryHistoryForRecipient = useCallback(
    (recipientId: string) =>
      deliveries.filter(
        d => d.recipient.id === recipientId &&
          (d.status === 'completed' || d.status === 'cancelled')
      ),
    [deliveries]
  )

  const getDeliveriesBySender = useCallback(
    (senderId: string) => deliveries.filter(d => d.sender.id === senderId),
    [deliveries]
  )

  const value: DeliveryContextValue = {
    deliveries,
    createDelivery,
    updateStatus,
    confirmReceipt,
    cancelDelivery,
    getDeliveryById,
    getActiveDeliveriesForRecipient,
    getDeliveryHistoryForRecipient,
    getDeliveriesBySender,
  }

  return (
    <DeliveryContext.Provider value={value}>
      {children}
    </DeliveryContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// useDelivery hook — the correct way to consume this store
// ---------------------------------------------------------------------------

export function useDelivery(): DeliveryContextValue {
  const ctx = useContext(DeliveryContext)
  if (!ctx) throw new Error('useDelivery must be used inside <DeliveryProvider>')
  return ctx
}