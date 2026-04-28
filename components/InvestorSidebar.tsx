'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Telescope,
  Bookmark,
  Lightbulb,
  Settings,
  LogOut,
  Zap,
  ChevronRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react'

const navItems = [
  { href: '/investor/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/investor/deal-flow', label: 'Deal Flow', icon: Telescope },
  { href: '/investor/watchlist', label: 'Watchlist', icon: Bookmark },
  { href: '/investor/insights', label: 'AI Insights', icon: Lightbulb },
  { href: '/investor/messages', label: 'Messages', icon: MessageSquare },
  { href: '/investor/settings', label: 'Settings', icon: Settings },
]

export default function InvestorSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetch('/api/messages/unread-count')
      .then(r => r.json())
      .then(data => setUnreadCount(data.count || 0))
      .catch(console.error)
  }, [])

  const name = session?.user?.name || 'Investor'
  const email = session?.user?.email || ''

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <Link href="/investor/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, cursor: 'pointer' }}>
          <Zap size={20} style={{ color: 'var(--color-green)' }} />
          <span className="logo-text">AGENTIX</span>
        </Link>

        {/* Investor Badge */}
        <div style={{
          margin: '0 12px 8px',
          padding: '8px 12px',
          background: 'rgba(0,245,160,0.06)',
          border: '1px solid rgba(0,245,160,0.15)',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <TrendingUp size={14} style={{ color: 'var(--color-green)', flexShrink: 0 }} />
          <div>
            <p style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--color-green)', letterSpacing: '0.08em', fontWeight: 700 }}>INVESTOR PORTAL</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Deal flow & insights</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/investor/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.label === 'Messages' && unreadCount > 0 && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-green)', marginLeft: 'auto' }} />
                )}
                {isActive && <ChevronRight size={14} style={{ marginLeft: item.label === 'Messages' && unreadCount > 0 ? 8 : 'auto', opacity: 0.6 }} />}
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <p className="user-name">{name}</p>
              <p className="user-email">{email.slice(0, 18)}{email.length > 18 ? '…' : ''}</p>
            </div>
          </div>
          <span className="plan-badge" style={{ color: 'var(--color-green)' }}>INVESTOR</span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="logout-btn"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav">
        {[
          { href: '/investor/dashboard', icon: LayoutDashboard, label: 'Home' },
          { href: '/investor/deal-flow', icon: Telescope, label: 'Deals' },
          { href: '/investor/watchlist', icon: Bookmark, label: 'Saved' },
          { href: '/investor/insights', icon: Lightbulb, label: 'Insights' },
          { href: '/investor/settings', icon: Settings, label: 'Settings' },
        ].map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/investor/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} className={`mobile-nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
