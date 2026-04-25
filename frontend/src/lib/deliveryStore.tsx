import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type {
  Delivery,
  DeliveryStatus,
  DeliveryPriority,
  UserProfile,
  DeliveryItem,
  TimelineEvent,
} from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nowISO(): string {
  return new Date().toISOString()
}

function minutesFromNow(mins: number): string {
  return new Date(Date.now() + mins * 60 * 1000).toISOString()
}

function statusLabel(status: DeliveryStatus): string {
  const labels: Record<DeliveryStatus, string> = {
    pending_approval: 'Delivery request sent',
    rejected: 'Request declined by recipient',
    robot_assigned: 'Robot assigned and heading to pickup',
    in_transit: 'Package picked up — in transit',
    arrived: 'Robot arrived at destination',
    completed: 'Delivery completed',
    cancelled: 'Delivery cancelled or expired',
  }
  return labels[status]
}

let _idCounter = 20254   // seed starts after mock IDs

function generateDeliveryId(): string {
  _idCounter += 1
  return `DEL-${_idCounter}`
}

// ---------------------------------------------------------------------------
// Seed data — realistic PUP Manila room / building names
// ---------------------------------------------------------------------------

const USER_CARLOS: UserProfile = {
  id: 'usr-001',
  name: 'Carlos Reyes',
  room: 'Room 301',
  building: 'Laboratory Building',
  initials: 'CR',
  avatarColor: '#4F46E5',
}

const USER_MARIA: UserProfile = {
  id: 'usr-002',
  name: 'Maria Santos',
  room: 'Room 214',
  building: 'Main Building',
  initials: 'MS',
  avatarColor: '#0891B2',
}

const USER_JOEL: UserProfile = {
  id: 'usr-003',
  name: 'Joel Bautista',
  room: 'Room 105',
  building: 'Engineering Building',
  initials: 'JB',
  avatarColor: '#059669',
}

const SEED_DELIVERIES: Delivery[] = [
  // 1 — pending_approval: Carlos → Maria
  {
    id: 'DEL-20251',
    sender: USER_CARLOS,
    recipient: USER_MARIA,
    item: { name: 'Engineering Module Printouts', qty: 3, weight: 0.4 },
    senderNote: 'Please handle with care — freshly printed.',
    priority: 'standard',
    fee: 25,
    status: 'pending_approval',
    robotId: 'RBT-001',
    robotName: 'PUP-BOT Unit 1',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
    timeline: [
      {
        status: 'pending_approval',
        label: 'Delivery request sent',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      },
    ],
  },

  // 2 — in_transit: Maria → Joel
  {
    id: 'DEL-20252',
    sender: USER_MARIA,
    recipient: USER_JOEL,
    item: { name: 'Laptop Charger', qty: 1, weight: 0.3 },
    senderNote: 'Borrowed this last week — finally returning it!',
    priority: 'express',
    fee: 45,
    status: 'in_transit',
    robotId: 'RBT-002',
    robotName: 'PUP-BOT Unit 2',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    acceptedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    pickedUpAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    timeline: [
      {
        status: 'pending_approval',
        label: 'Delivery request sent',
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      },
      {
        status: 'robot_assigned',
        label: 'Robot assigned and heading to pickup',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        status: 'in_transit',
        label: 'Package picked up — in transit',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
    ],
  },

  // 3 — completed: Joel → Carlos
  {
    id: 'DEL-20253',
    sender: USER_JOEL,
    recipient: USER_CARLOS,
    item: { name: 'USB Flash Drive (32 GB)', qty: 1, weight: 0.02 },
    senderNote: 'Contains the CAD files you asked for.',
    priority: 'standard',
    fee: 25,
    status: 'completed',
    robotId: 'RBT-003',
    robotName: 'PUP-BOT Unit 3',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    acceptedAt: new Date(Date.now() - 58 * 60 * 1000).toISOString(),
    pickedUpAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    arrivedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    timeline: [
      {
        status: 'pending_approval',
        label: 'Delivery request sent',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
      {
        status: 'robot_assigned',
        label: 'Robot assigned and heading to pickup',
        timestamp: new Date(Date.now() - 58 * 60 * 1000).toISOString(),
      },
      {
        status: 'in_transit',
        label: 'Package picked up — in transit',
        timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      },
      {
        status: 'arrived',
        label: 'Robot arrived at destination',
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      },
      {
        status: 'completed',
        label: 'Delivery completed',
        timestamp: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface DeliveryContextValue {
  deliveries: Delivery[]
  createDelivery: (data: {
    sender: UserProfile
    recipient: UserProfile
    item: DeliveryItem
    senderNote: string
    priority: DeliveryPriority
    fee: number
    robotId: string
    robotName: string
  }) => Delivery
  acceptDelivery: (id: string) => void
  rejectDelivery: (id: string) => void
  confirmReceipt: (id: string) => void
  cancelExpired: () => void
  getDeliveryById: (id: string) => Delivery | undefined
  getPendingForRecipient: (recipientId: string) => Delivery[]
  getDeliveriesForSender: (senderId: string) => Delivery[]
}

// ---------------------------------------------------------------------------
// Context + Provider
// ---------------------------------------------------------------------------

export const DeliveryContext = createContext<DeliveryContextValue | null>(null)

export function DeliveryProvider({ children }: { children: ReactNode }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>(SEED_DELIVERIES)

  // Mutate helper — update a single delivery by id
  const updateDelivery = useCallback(
    (id: string, patch: Partial<Delivery>, newEvent: TimelineEvent) => {
      setDeliveries(prev =>
        prev.map(d =>
          d.id === id
            ? { ...d, ...patch, timeline: [...d.timeline, newEvent] }
            : d
        )
      )
    },
    []
  )

  // ------------------------------------------------------------------
  // createDelivery
  // ------------------------------------------------------------------
  const createDelivery = useCallback(
    (data: {
      sender: UserProfile
      recipient: UserProfile
      item: DeliveryItem
      senderNote: string
      priority: DeliveryPriority
      fee: number
      robotId: string
      robotName: string
    }): Delivery => {
      const ts = nowISO()
      const event: TimelineEvent = {
        status: 'pending_approval',
        label: statusLabel('pending_approval'),
        timestamp: ts,
      }
      const delivery: Delivery = {
        id: generateDeliveryId(),
        ...data,
        status: 'pending_approval',
        createdAt: ts,
        expiresAt: minutesFromNow(5),
        timeline: [event],
      }
      setDeliveries(prev => [delivery, ...prev])
      return delivery
    },
    []
  )

  // ------------------------------------------------------------------
  // acceptDelivery
  // ------------------------------------------------------------------
  const acceptDelivery = useCallback(
    (id: string) => {
      const ts = nowISO()
      updateDelivery(
        id,
        { status: 'robot_assigned', acceptedAt: ts },
        { status: 'robot_assigned', label: statusLabel('robot_assigned'), timestamp: ts }
      )
    },
    [updateDelivery]
  )

  // ------------------------------------------------------------------
  // rejectDelivery
  // ------------------------------------------------------------------
  const rejectDelivery = useCallback(
    (id: string) => {
      const ts = nowISO()
      updateDelivery(
        id,
        { status: 'rejected' },
        { status: 'rejected', label: statusLabel('rejected'), timestamp: ts }
      )
    },
    [updateDelivery]
  )

  // ------------------------------------------------------------------
  // confirmReceipt
  // ------------------------------------------------------------------
  const confirmReceipt = useCallback(
    (id: string) => {
      const ts = nowISO()
      updateDelivery(
        id,
        { status: 'completed', completedAt: ts },
        { status: 'completed', label: statusLabel('completed'), timestamp: ts }
      )
    },
    [updateDelivery]
  )

  // ------------------------------------------------------------------
  // cancelExpired — call periodically from a useEffect in your UI
  // ------------------------------------------------------------------
  const cancelExpired = useCallback(() => {
    const now = Date.now()
    const ts = nowISO()
    setDeliveries(prev =>
      prev.map(d => {
        if (d.status === 'pending_approval' && new Date(d.expiresAt).getTime() <= now) {
          return {
            ...d,
            status: 'cancelled' as DeliveryStatus,
            timeline: [
              ...d.timeline,
              { status: 'cancelled' as DeliveryStatus, label: statusLabel('cancelled'), timestamp: ts },
            ],
          }
        }
        return d
      })
    )
  }, [])

  // ------------------------------------------------------------------
  // Selectors
  // ------------------------------------------------------------------
  const getDeliveryById = useCallback(
    (id: string) => deliveries.find(d => d.id === id),
    [deliveries]
  )

  const getPendingForRecipient = useCallback(
    (recipientId: string) =>
      deliveries.filter(
        d => d.status === 'pending_approval' && d.recipient.id === recipientId
      ),
    [deliveries]
  )

  const getDeliveriesForSender = useCallback(
    (senderId: string) => deliveries.filter(d => d.sender.id === senderId),
    [deliveries]
  )

  // ------------------------------------------------------------------
  // Context value
  // ------------------------------------------------------------------
  const value: DeliveryContextValue = {
    deliveries,
    createDelivery,
    acceptDelivery,
    rejectDelivery,
    confirmReceipt,
    cancelExpired,
    getDeliveryById,
    getPendingForRecipient,
    getDeliveriesForSender,
  }

  return (
    <DeliveryContext.Provider value={value}>
      {children}
    </DeliveryContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// useDelivery hook
// ---------------------------------------------------------------------------

export function useDelivery(): DeliveryContextValue {
  const ctx = useContext(DeliveryContext)
  if (!ctx) {
    throw new Error('useDelivery must be used inside <DeliveryProvider>')
  }
  return ctx
}