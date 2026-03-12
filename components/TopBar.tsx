'use client'

import { Bell, Search } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface TopBarProps {
  title: string
  subtitle?: string
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const { data: session } = useSession()
  const name = session?.user?.name || 'User'

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>
      <div className="topbar-right">
        <div className="search-box">
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="notif-dot" />
        </button>
        <div className="topbar-avatar" title={name}>
          {name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
