'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Lightbulb,
  Code2,
  TrendingUp,
  DollarSign,
  Scale,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  Zap,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/idea-lab', label: 'Idea Lab', icon: Lightbulb },
  { href: '/dashboard/tasks', label: 'Build Studio', icon: Code2 },
  { href: '/dashboard/tasks', label: 'Growth Engine', icon: TrendingUp, disabled: true },
  { href: '/dashboard/tasks', label: 'Funding Hub', icon: DollarSign, disabled: true },
  { href: '/dashboard/tasks', label: 'Legal Desk', icon: Scale, disabled: true },
  { href: '/dashboard/tasks', label: 'Analytics', icon: BarChart3, disabled: true },
  { href: '/dashboard/chat', label: 'AI Chat', icon: MessageSquare },
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

  const plan = (session?.user as { plan?: string })?.plan || 'starter'
  const name = session?.user?.name || 'User'
  const email = session?.user?.email || ''

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <Zap size={20} style={{ color: 'var(--color-green)' }} />
          <span className="logo-text">AGENTIX</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            if (item.disabled) return null
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
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
          { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
          { href: '/dashboard/idea-lab', icon: Lightbulb, label: 'Ideas' },
          { href: '/dashboard/tasks', icon: Code2, label: 'Tasks' },
          { href: '/dashboard/chat', icon: MessageSquare, label: 'Chat' },
          { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
        ].map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
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
