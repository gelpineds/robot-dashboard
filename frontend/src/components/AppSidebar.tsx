import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  PackageSearch,
  Bot,
  PlusCircle,
  Inbox,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react'
import { NavLink } from '@/components/NavLink'
import { useUser } from '@/hooks/useUser'
import { useSidebar } from '@/context/SidebarContext'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',        to: '/',               end: true  },
  { icon: PackageSearch,   label: 'Deliveries',       to: '/history'                    },
  { icon: Bot,             label: 'Robot Fleet',      to: '/robots'                     },
  { icon: PlusCircle,      label: 'Request Delivery', to: '/request'                    },
  { icon: Inbox,           label: 'Delivery Inbox',   to: '/delivery-inbox'             },
  { icon: FileText,        label: 'Documents',        to: '/documents'                  },
  { icon: Settings,        label: 'Settings',         to: '/settings'                   },
]

export function AppSidebar() {
  const navigate = useNavigate()
  const { user, getInitials } = useUser()

  // isExpanded lives in SidebarProvider (above the router) — state survives
  // route changes and never resets because SidebarProvider never unmounts.
  const { isExpanded, setIsExpanded } = useSidebar()

  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // useEffect runs AFTER mount, so sidebarRef.current is guaranteed non-null here.
    // This was the root cause of the bug in the previous approach:
    // the listeners were being attached in SidebarProvider's useEffect before
    // AppSidebar had mounted and attached its ref.
    const el = sidebarRef.current
    if (!el) return

    const onEnter = () => setIsExpanded(true)
    const onLeave = () => setIsExpanded(false)

    el.addEventListener('mouseenter', onEnter)
    el.addEventListener('mouseleave', onLeave)

    return () => {
      el.removeEventListener('mouseenter', onEnter)
      el.removeEventListener('mouseleave', onLeave)
    }
    // Empty deps — attaches once after first mount.
    // AppSidebar lives in AppLayout which is a persistent layout wrapper,
    // so it does NOT unmount on route changes — this is safe.
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Applied to every text/label element.
  // pointerEvents: 'none' is critical — labels must never receive mouseenter/mouseleave
  // or they will bubble up and falsely trigger the sidebar's own listeners.
  const labelStyle: React.CSSProperties = {
    opacity: isExpanded ? 1 : 0,
    maxWidth: isExpanded ? '180px' : '0px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    transition: 'opacity 200ms ease, max-width 220ms ease',
    pointerEvents: 'none',
    userSelect: 'none',
    flexShrink: 0,
  }

  // Margin on the label wrapper so the icon doesn't jump
  const marginStyle: React.CSSProperties = {
    marginLeft: isExpanded ? '10px' : '0px',
    transition: 'margin 220ms ease',
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user_data')
    navigate('/login', { replace: true })
  }

  return (
    <aside
      ref={sidebarRef as React.RefObject<HTMLElement>}
      style={{
        width: isExpanded ? '240px' : '64px',
        transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'width',
      }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col bg-[#800000] overflow-hidden shrink-0"
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center h-16 px-3 border-b border-white/10 shrink-0"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
          style={{ background: '#FFD700', color: '#800000' }}
        >
          PD
        </div>
        <div style={{ ...labelStyle, ...marginStyle }}>
          <p className="text-white font-semibold text-sm leading-tight tracking-wide whitespace-nowrap">
            PUP Deliver
          </p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav
        className="flex-1 py-4 overflow-y-auto"
        style={{ overflowX: 'hidden' }}
      >
        <div className="flex flex-col gap-0.5 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              end={item.end}
              isExpanded={isExpanded}
            />
          ))}
        </div>
      </nav>

      {/* ── Profile footer ── */}
      <div
        className="border-t border-white/10 p-3 flex items-center shrink-0 cursor-pointer hover:bg-white/5"
        onClick={() => navigate('/settings')}
        title={isExpanded ? undefined : 'Profile settings'}
      >
        {/* Avatar — always visible */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
          style={{ background: '#600000', color: '#FFD700', pointerEvents: 'none' }}
        >
          {getInitials()}
        </div>

        {/* Name + role — fades in on expand */}
        <div
          className="flex items-center gap-2 flex-1 min-w-0"
          style={{
            ...labelStyle,
            ...marginStyle,
            maxWidth: isExpanded ? '200px' : '0px',
          }}
        >
          <div className="flex-1 min-w-0" style={{ pointerEvents: 'none' }}>
            <p className="text-white text-[12.5px] font-medium leading-tight truncate">
              {user?.full_name || 'User'}
            </p>
            <p className="text-white/50 text-[10px] truncate mt-0.5">
              {user?.email || 'user@pup.edu.ph'}
            </p>
          </div>

          {/* Logout — only interactive when expanded */}
          <button
            onClick={(e) => { e.stopPropagation(); handleLogout() }}
            className="shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Log out"
            title="Log out"
            style={{ pointerEvents: isExpanded ? 'auto' : 'none' }}
          >
            <LogOut
              className="h-4 w-4"
              style={{ color: '#FFD700', pointerEvents: 'none' }}
            />
          </button>
        </div>
      </div>
    </aside>
  )
}