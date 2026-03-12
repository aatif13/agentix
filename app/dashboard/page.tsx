'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  Zap, Bot, CheckCircle2, TrendingUp, Lightbulb,
  MessageSquare, Play, BarChart3, ArrowRight,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import KPICard from '@/components/KPICard'
import StatusBadge from '@/components/StatusBadge'
import LoadingSkeleton from '@/components/LoadingSkeleton'

interface Stats {
  totalTasks: number
  completedTasks: number
  activeChats: number
  totalIdeas: number
  recentActivity: Array<{
    id: string
    type: string
    label: string
    agent: string
    emoji: string
    status: string
    date: string
  }>
  weeklyActivity: Array<{ day: string; tasks: number }>
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--elevated)', border: '1px solid var(--border)', borderRadius: 4, padding: '8px 12px' }}>
        <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)' }}>{label}</p>
        <p style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, color: 'var(--color-green)' }}>{payload[0].value} tasks</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats')
      if (!res.ok) throw new Error('Failed to load stats')
      const data = await res.json()
      setStats(data)
    } catch {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  const health = stats
    ? Math.round(
        (stats.completedTasks / Math.max(stats.totalTasks, 1)) * 40 +
        Math.min(stats.activeChats * 10, 30) +
        Math.min(stats.totalIdeas * 5, 30)
      )
    : 0

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <TopBar title="Overview" subtitle={`Welcome back, ${session?.user?.name?.split(' ')[0] || 'Founder'} 👋`} />
        <div className="dashboard-content">
          {error && (
            <div style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 4, padding: '12px 16px', marginBottom: 20, color: 'var(--color-orange)', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {error}
              <button className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }} onClick={fetchStats}>Retry</button>
            </div>
          )}

          {/* KPI Cards */}
          {loading ? (
            <LoadingSkeleton type="card" count={4} />
          ) : (
            <div className="kpi-grid" style={{ marginBottom: 28 }}>
              <KPICard icon={Zap} label="Total Agent Runs" value={stats?.totalTasks ?? 0} color="var(--color-green)" />
              <KPICard icon={Bot} label="Active Chats" value={stats?.activeChats ?? 0} color="var(--color-cyan)" />
              <KPICard icon={CheckCircle2} label="Tasks Completed" value={`${stats?.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%`} color="var(--color-purple)" />
              <KPICard icon={TrendingUp} label="Startup Health" value={`${health}/100`} color="var(--color-orange)" />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 24 }}>
            {/* Chart */}
            <div className="card">
              <div className="section-header">
                <h2 className="section-title">Agent Activity This Week</h2>
                <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)' }}>Last 7 days</span>
              </div>
              {loading ? (
                <LoadingSkeleton type="chart" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats?.weeklyActivity || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="day" stroke="var(--text-muted)" tick={{ fontFamily: 'Space Mono', fontSize: 10, fill: 'var(--text-muted)' }} />
                    <YAxis stroke="var(--text-muted)" tick={{ fontFamily: 'Space Mono', fontSize: 10, fill: 'var(--text-muted)' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="tasks" stroke="var(--color-green)" strokeWidth={2} dot={{ fill: 'var(--color-green)', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h2 className="section-title" style={{ marginBottom: 16 }}>Quick Actions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Validate Idea', emoji: '💡', href: '/dashboard/idea-lab', color: 'var(--color-green)' },
                  { label: 'New AI Chat', emoji: '💬', href: '/dashboard/chat', color: 'var(--color-cyan)' },
                  { label: 'Run Agent Task', emoji: '⚡', href: '/dashboard/tasks', color: 'var(--color-purple)' },
                  { label: 'View Analytics', emoji: '📊', href: '/dashboard/tasks', color: 'var(--color-orange)' },
                ].map(a => (
                  <Link key={a.label} href={a.href} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 14px', background: 'var(--elevated)', borderRadius: 4,
                    textDecoration: 'none', border: '1px solid var(--border)', transition: 'border-color 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = a.color + '40'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
                  >
                    <span style={{ fontSize: 18 }}>{a.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{a.label}</span>
                    <ArrowRight size={14} style={{ color: a.color }} />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <div className="section-header">
              <h2 className="section-title">Recent Activity</h2>
              <Link href="/dashboard/tasks" className="section-link">View all →</Link>
            </div>
            {loading ? (
              <LoadingSkeleton type="row" count={5} />
            ) : stats?.recentActivity?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <Play size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                <p style={{ fontSize: 14 }}>No activity yet. Start by validating an idea or running an agent task.</p>
              </div>
            ) : (
              <div>
                {(stats?.recentActivity || []).map((item, i) => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 0',
                    borderBottom: i < (stats?.recentActivity?.length || 1) - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <span style={{ fontSize: 20, width: 32, textAlign: 'center' }}>{item.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</p>
                      <p style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-muted)' }}>{item.agent} · {item.type}</p>
                    </div>
                    <StatusBadge status={item.status as 'queued' | 'running' | 'completed' | 'failed'} />
                    <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>{timeAgo(item.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
