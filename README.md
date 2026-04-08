# PUP Deliver - Robot Delivery Management System

A comprehensive autonomous robot delivery management platform for Polytechnic University of the Philippines. Enables staff and professionals to request, track, and manage deliveries across campus rooms with real-time status updates and analytics.

---

## 📋 Frontend Tech Stack

### Core Framework & Build
- **React 18.3.1** - Modern UI library with hooks
- **Vite 5.4.19** - Lightning-fast build tool with instant HMR
- **TypeScript 5.8.3** - Type-safe development environment

### Routing & State Management
- **React Router DOM 6.30.1** - Client-side routing with protected routes
- **TanStack React Query 5.83.0** - Server state management, caching, auto-refetching
- **React Hook Form 7.61.1** - Efficient form state and validation

### UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Shadcn/ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful, consistent SVG icons
- **Framer Motion 11.0.0** - Smooth animations and transitions

### Data Visualization & Notifications
- **Chart.js + React ChartJS** - Interactive charts and dashboards
- **Sonner** - Beautiful toast notifications
- **Recharts 2.15.4** - Advanced charting components

### Development & Testing
- **Vitest 3.2.4** - Unit and component testing
- **Playwright 1.57.0** - End-to-end testing
- **ESLint + TypeScript ESLint** - Code quality and linting

### Design System
- **Color Scheme**: Maroon (#800000) primary, Gold (#FFD700) accent
- **Responsive**: Mobile-first design with Tailwind breakpoints
- **Animations**: Smooth transitions via Framer Motion

---

## 📁 Frontend Project Structure & Key Configuration Files

### Main Pages (`/frontend/src/pages/`)

| File | Purpose | Key Configuration |
|------|---------|-------------------|
| **`Index.tsx`** | Dashboard | Real-time stats, delivery charts, avg delivery time metric, robot utilization |
| **`RequestDelivery.tsx`** | Delivery Request | Room-based input form, API submission, validation |
| **`DeliveryHistory.tsx`** | Delivery Records | Search, filter, pagination, CSV export, details modal |
| **`TrackDelivery.tsx`** | Real-time Tracking | URL parameter tracking, status timeline, live updates |
| **`RobotFleet.tsx`** | Robot Management | Robot status display, online/busy/offline states |
| **`Settings.tsx`** | User Settings | Profile display, notification preferences, account info |
| **`Login.tsx`** | Authentication | JWT token handling, localStorage persistence |

### Core Components (`/frontend/src/components/`)

| File | Purpose |
|------|---------|
| **`AppLayout.tsx`** | Main layout wrapper, header, sidebar, notifications |
| **`AppSidebar.tsx`** | Left navigation with maroon background, user profile footer |
| **`DeliveryDetailsModal.tsx`** | Styled modal for delivery details (maroon/gold theme) |
| **`StatCard.tsx`** | KPI dashboard cards |
| **`DeliveryTable.tsx`** | Reusable delivery table with status colors |

### Hooks & Utilities (`/frontend/src/hooks/` & `/frontend/src/lib/`)

| File | Purpose |
|------|---------|
| **`useUser.ts`** | User auth state, localStorage sync, login/logout |
| **`useNotifications.ts`** | Notification state management |
| **`api.ts`** | Centralized API client, all backend endpoints |
| **`utils.ts`** | Helper functions, formatting, calculations |

### Configuration Files (`/frontend/`)

| File | Purpose |
|------|---------|
| **`vite.config.ts`** | Build config, `@/` path alias |
| **`tsconfig.json`** | TypeScript compiler options |
| **`tailwind.config.ts`** | Theme colors, spacing, breakpoints |
| **`eslint.config.js`** | Code quality rules |
| **`.env.example`** | Environment template (`VITE_API_BASE_URL`) |

---

## 🔑 Key Configuration Points

### 1. **Room-Based Delivery System**
- Location format: `"Room {number}"` (e.g., "Room 202")
- Set in `RequestDelivery.tsx` form submission
- Stored and displayed across all pages

### 2. **Authentication & User State**
- JWT tokens stored in localStorage
- `useUser` hook auto-syncs across tabs
- Protected routes via `App.tsx` wrapper

### 3. **API Integration** (`/frontend/src/lib/api.ts`)
- Base URL: configured via `.env` (`VITE_API_BASE_URL`)
- All endpoints centralized (robots, deliveries, auth, users)
- JWT headers automatically appended
- Error handling with toast notifications

### 4. **Theme & Colors** (`/frontend/tailwind.config.ts`)
- Primary: `#800000` (maroon)
- Accent: `#FFD700` (gold)
- White backgrounds with gray gradients

### 5. **Real Data Flow**
- Dashboard: Calculates metrics from actual database
- RequestDelivery: Submits real data to backend API
- TrackDelivery: Fetches live delivery status
- DeliveryHistory: Displays actual delivery records

### 6. **Notifications & Alerts**
- Sonner toast notifications for user feedback
- Notification panel in header with mark-as-read
- Auto-refetch every 5 seconds via React Query

---

## 🚀 Getting Started

### Install Dependencies
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
# Runs on http://localhost:5173
```

### Production Build
```bash
npm run build
# Output: /dist folder
```

### Testing
```bash
npm run test        # Unit tests
npm run test:e2e    # E2E tests
npm lint            # ESLint
```

### Environment Setup
Create `.env` in frontend folder:
```
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🎯 Features

- ✅ **Real-time Dashboard** - Live delivery metrics and robot status
- ✅ **Room-based Delivery** - Request deliveries between campus rooms
- ✅ **Live Tracking** - Real-time status visualization with timeline
- ✅ **User Authentication** - Secure JWT-based login
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Professional UI** - Maroon/gold theme with smooth animations
- ✅ **Data Management** - Search, filter, export delivery history
- ✅ **Analytics** - Dashboard charts and performance metrics

---

## 🏗️ Backend Overview

- **Language**: Python
- **Framework**: Flask with Flask-SQLAlchemy ORM
- **Database**: SQLite
- **Authentication**: JWT tokens via Flask-JWT-Extended
- **API Format**: RESTful endpoints with JSON responses
- **CORS**: Enabled for frontend requests

### Key Backend Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login (returns JWT)
- `POST /deliveries/request` - Create delivery request
- `GET /deliveries/my-requests` - User's deliveries
- `GET /deliveries/{id}` - Get delivery details
- `GET /robots` - List all robots
- `GET /robots/{id}` - Robot details

---

## 📞 Development Team

Full-stack development with real-time API integration for university delivery management.
