import { createContext, useContext, useState } from 'react'

interface SidebarContextValue {
  isExpanded: boolean
  setIsExpanded: (v: boolean) => void
}

const SidebarContext = createContext<SidebarContextValue>({
  isExpanded: false,
  setIsExpanded: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <SidebarContext.Provider value={{ isExpanded, setIsExpanded }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}