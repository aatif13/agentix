'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { 
  LayoutDashboard,
  Lightbulb,
  Code2,
  TrendingUp,
  MessageSquare,
  Settings,
  LogOut,
  Zap,
  ChevronRight,
  Search,
  FlaskConical,
  FileText,
  Rocket,
  Send,
  Loader2,
  Circle
} from 'lucide-react'
import { useSelectedProblem } from '@/lib/useSelectedProblem'

const navItems = [
  { href: '/dashboard/problem-finder', label: 'Problem Finder', icon: Search },
  { href: '/dashboard/idea-lab', label: 'Idea Lab', icon: Lightbulb },
  { href: '/dashboard/build-studio', label: 'Build Studio', icon: Code2 },
  { href: '/dashboard/growth', label: 'Growth Engine', icon: TrendingUp },
  { href: '/dashboard/growth/experiments', label: 'Experiments', icon: FlaskConical, parent: 'growth' },
  { href: '/dashboard/growth/viral-hooks', label: 'Viral Hooks', icon: Zap, parent: 'growth' },
  { href: '/dashboard/growth/outreach', label: 'Outreach', icon: Send, parent: 'growth' },
  { href: '/dashboard/growth/weekly-report', label: 'Weekly Report', icon: FileText, parent: 'growth' },
  { href: '/dashboard/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
  { href: '/dashboard/pitch-room', label: 'Pitch Room', icon: Rocket },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

const planColors: Record<string, string> = {
  starter: 'var(--color-cyan)',
  growth: 'var(--color-purple)',
  enterprise: 'var(--color-green)',
}

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { problem, isLoading: problemLoading } = useSelectedProblem()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetch('/api/messages/unread-count')
      .then(r => r.json())
      .then(data => setUnreadCount(data.count || 0))
      .catch(console.error)
  }, [])

  const plan = (session?.user as { plan?: string })?.plan || 'starter'
  const name = session?.user?.name || 'User'
  const email = session?.user?.email || ''

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, cursor: 'pointer' }}>
          <Zap size={20} style={{ color: 'var(--color-green)' }} />
          <span className="logo-text">AGENTIX</span>
        </Link>

        {/* Active Context Badge */}
        <div style={{
          margin: '0 12px 24px',
          padding: '12px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          borderRadius: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-green)', boxShadow: '0 0 8px var(--color-green)' }} />
            <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'Space Mono', color: 'var(--color-green)', letterSpacing: '0.05em' }}>ACTIVE CONTEXT</span>
          </div>
          {problemLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Loader2 size={12} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Loading...</span>
            </div>
          ) : problem ? (
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
              {problem.title}
            </p>
          ) : (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>No problem selected</p>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" style={{ flex: 1 }}>
          {navItems.map((item, idx) => {
            const Icon = item.icon
            const isSubmenu = item.parent === 'growth'
            const isSettings = item.label === 'Settings'
            
            // Submenu logic: only show if path starts with parent or if it's growth
            if (isSubmenu && !pathname.startsWith('/dashboard/growth')) return null

            const isActive = pathname === item.href || (!isSubmenu && item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <div key={item.label}>
                {isSettings && <div style={{ height: 1, background: 'var(--border)', margin: '16px 12px' }} />}
                <Link
                  href={item.href}
                  className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                  style={{
                    ...(isSubmenu ? { paddingLeft: 32, fontSize: '0.8rem', opacity: 0.8 } : {})
                  }}
                >
                  <Icon size={isSubmenu ? 16 : 18} />
                  <span>{item.label}</span>
                  {item.label === 'Messages' && unreadCount > 0 && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-green)', marginLeft: 'auto' }} />
                  )}
                  {isActive && !isSubmenu && <ChevronRight size={14} style={{ marginLeft: item.label === 'Messages' && unreadCount > 0 ? 8 : 'auto', opacity: 0.6 }} />}
                </Link>
              </div>
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
          <span
            className="plan-badge"
            style={{ color: planColors[plan] || planColors.starter }}
          >
            {plan.toUpperCase()}
          </span>
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
          { href: '/dashboard/problem-finder', icon: Search, label: 'Finder' },
          { href: '/dashboard/idea-lab', icon: Lightbulb, label: 'Idea' },
          { href: '/dashboard/build-studio', icon: Code2, label: 'Build' },
          { href: '/dashboard/growth', icon: TrendingUp, label: 'Growth' },
          { href: '/dashboard/pitch-room', icon: Rocket, label: 'Pitch' },
        ].map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} className={`mobile-nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
