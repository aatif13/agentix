'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  CheckCircle2, Circle, Lock, ChevronRight,
  Target, BarChart3, Rocket, Loader2, ArrowRight
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

interface JourneyStep {
  id: string
  label: string
  status: 'completed' | 'in-progress' | 'locked'
  summary: string
  cta: string
  ctaLabel: string
}

interface DashboardStats {
  activeProblem: string
  latestIdeaScore: number
  pitchStatus: string
  viewCount: number
  interestCount: number
  journey: JourneyStep[]
}

const T = {
  card: { background: '#0C1018', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 },
  accent: '#00ff88',
  dim: '#6B7A91',
  syne: { fontFamily: "'Syne', sans-serif" },
  mono: { fontFamily: "'Space Mono', monospace" },
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pendingIntros, setPendingIntros] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = async () => {
    try {
      const [statsRes, notifsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/notifications?status=pending&type=investor_interest')
      ])
      
      if (!statsRes.ok) throw new Error('Failed to load stats')
      const statsData = await statsRes.json()
      setStats(statsData)

      if (notifsRes.ok) {
        const notifsData = await notifsRes.json()
        setPendingIntros(notifsData.notifications || [])
      }
    } catch {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  const handleOpenNotifs = () => {
    window.dispatchEvent(new Event('open-notifications'))
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main">
          <TopBar title="Overview" subtitle="Loading your startup journey..." />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <Loader2 className="animate-spin" size={32} style={{ color: T.accent }} />
          </div>
        </div>
      </div>
    )
  }

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <TopBar title="Overview" subtitle={`Welcome back, ${session?.user?.name?.split(' ')[0] || 'Founder'} 👋`} />
        <div className="dashboard-content" style={{ padding: '32px' }}>
          
          {/* Journey Tracker */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ ...T.syne, fontSize: '20px', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.02em' }}>
              Founder Journey Progress
            </h2>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {stats?.journey.map((step, idx) => (
                <div key={idx} style={{ 
                  ...T.card, 
                  minWidth: '280px', 
                  flex: 1, 
                  padding: '24px',
                  position: 'relative',
                  background: step.status === 'in-progress' ? 'rgba(0, 255, 136, 0.03)' : '#0C1018',
                  borderColor: step.status === 'in-progress' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255,255,255,0.07)',
                  opacity: step.status === 'locked' ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    {step.status === 'completed' && <CheckCircle2 size={18} style={{ color: T.accent }} />}
                    {step.status === 'in-progress' && <Circle size={18} style={{ color: T.accent, animation: 'pulse 2s infinite' }} />}
                    {step.status === 'locked' && <Lock size={18} style={{ color: T.dim }} />}
                    <span style={{ 
                      ...T.mono, 
                      fontSize: '11px', 
                      letterSpacing: '0.05em', 
                      textTransform: 'uppercase',
                      color: step.status === 'locked' ? T.dim : T.accent,
                      fontWeight: 700 
                    }}>
                      Step {idx + 1}
                    </span>
                  </div>

                  <h3 style={{ ...T.syne, fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{step.label}</h3>
                  <p style={{ fontSize: '13px', color: T.dim, marginBottom: '20px', lineHeight: '1.5', minHeight: '40px' }}>
                    {step.summary}
                  </p>

                  <Link href={step.status === 'locked' ? '#' : step.cta} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    color: step.status === 'locked' ? T.dim : '#fff',
                    pointerEvents: step.status === 'locked' ? 'none' : 'auto',
                    ...T.mono
                  }}>
                    {step.ctaLabel} <ChevronRight size={14} />
                  </Link>

                  {/* Connector arrow for non-last items */}
                  {idx < (stats?.journey.length || 0) - 1 && (
                    <div style={{ position: 'absolute', right: '-12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, display: 'none' }}>
                       <ChevronRight size={24} style={{ color: 'rgba(255,255,255,0.05)' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Investor Activity Card */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ ...T.syne, fontSize: '20px', fontWeight: 800, marginBottom: '24px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
              Investor Activity
              {pendingIntros.length > 0 && (
                <span style={{ background: 'rgba(255, 184, 0, 0.1)', color: '#FFB800', border: '1px solid rgba(255, 184, 0, 0.3)', padding: '2px 8px', borderRadius: 20, fontSize: 10, ...T.mono }}>
                  {pendingIntros.length} PENDING
                </span>
              )}
            </h2>

            <div style={{
              ...T.card,
              padding: '24px',
              borderLeft: pendingIntros.length > 0 ? '4px solid #FFB800' : '1px solid rgba(255,255,255,0.07)',
              background: pendingIntros.length > 0 ? 'linear-gradient(90deg, rgba(255, 184, 0, 0.05) 0%, #0C1018 100%)' : '#0C1018'
            }}>
              {pendingIntros.length > 0 ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFB800', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: 13, color: '#E8EDF5', fontWeight: 600 }}>
                      You have {pendingIntros.length} pending investor introduction{pendingIntros.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {pendingIntros.slice(0, 3).map((notif: any) => (
                      <div key={notif._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ flex: 1, paddingRight: 20 }}>
                          <p style={{ fontSize: 14, color: '#fff', fontWeight: 600, marginBottom: 4 }}>
                            {notif.fromName} {notif.firmName ? `from ${notif.firmName}` : ''}
                          </p>
                          <p style={{ fontSize: 12, color: T.accent, fontStyle: 'italic', marginBottom: 8, background: 'rgba(0, 255, 136, 0.05)', padding: '6px 10px', borderRadius: 6, borderLeft: `2px solid ${T.accent}` }}>
                            "{notif.message}"
                          </p>
                          <p style={{ fontSize: 10, color: T.dim, ...T.mono }}>
                            {getTimeAgo(notif.createdAt)}
                          </p>
                        </div>
                        <button onClick={handleOpenNotifs} style={{ 
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', 
                          padding: '8px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' 
                        }}>
                          Respond →
                        </button>
                      </div>
                    ))}
                    {pendingIntros.length > 3 && (
                      <button onClick={handleOpenNotifs} style={{ background: 'none', border: 'none', color: T.dim, fontSize: 12, cursor: 'pointer', textAlign: 'left', fontWeight: 500 }}>
                        + View {pendingIntros.length - 3} more pending requests
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ color: T.dim, fontSize: 13, marginBottom: 8 }}>No pending investor introductions at the moment.</p>
                  <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, ...T.mono }}>Keep building your startup to attract deal flow.</p>
                </div>
              )}
            </div>
          </section>

          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            
            {/* Active Problem */}
            <div style={{ ...T.card, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0, 255, 136, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={20} style={{ color: T.accent }} />
                </div>
                <div>
                  <span style={{ ...T.mono, fontSize: '10px', color: T.dim, textTransform: 'uppercase' }}>Active Problem</span>
                  <div style={{ ...T.syne, fontSize: '16px', fontWeight: 700 }}>{stats?.activeProblem}</div>
                </div>
              </div>
              <Link href="/dashboard/problem-finder" style={{ fontSize: '11px', color: T.accent, textDecoration: 'none', fontWeight: 600 }}>
                View all problems →
              </Link>
            </div>

            {/* Idea Lab Score */}
            <div style={{ ...T.card, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0, 217, 232, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart3 size={20} style={{ color: '#00D9E8' }} />
                </div>
                <div>
                  <span style={{ ...T.mono, fontSize: '10px', color: T.dim, textTransform: 'uppercase' }}>Validation Score</span>
                  <div style={{ ...T.syne, fontSize: '16px', fontWeight: 700 }}>{stats?.latestIdeaScore}/100</div>
                </div>
              </div>
              <Link href="/dashboard/idea-lab" style={{ fontSize: '11px', color: '#00D9E8', textDecoration: 'none', fontWeight: 600 }}>
                View validation details →
              </Link>
            </div>

            {/* Pitch Activity */}
            <div style={{ 
              ...T.card, 
              padding: '24px',
              border: stats?.pitchStatus === 'Published' ? '1px solid rgba(0, 255, 136, 0.2)' : '1px solid rgba(255,255,255,0.07)',
              background: stats?.pitchStatus === 'Published' ? 'rgba(0, 255, 136, 0.02)' : '#0C1018'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '10px', 
                  background: stats?.pitchStatus === 'Published' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(123, 92, 255, 0.1)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <Rocket size={20} style={{ color: stats?.pitchStatus === 'Published' ? T.accent : '#7B5CFF' }} />
                </div>
                <div>
                  <span style={{ ...T.mono, fontSize: '10px', color: T.dim, textTransform: 'uppercase' }}>Pitch Activity</span>
                  <div style={{ ...T.syne, fontSize: '16px', fontWeight: 700 }}>
                    {stats?.pitchStatus === 'Published' ? 'Public Profile' : 'Draft Mode'}
                  </div>
                </div>
              </div>
              
              {stats?.pitchStatus === 'Published' ? (
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{stats?.viewCount}</div>
                    <div style={{ fontSize: '10px', color: T.dim, ...T.mono }}>VIEWS</div>
                  </div>
                  <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: T.accent }}>{stats?.interestCount}</div>
                    <div style={{ fontSize: '10px', color: T.dim, ...T.mono }}>INTEREST</div>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '12px', color: T.dim, marginBottom: '16px', lineHeight: '1.4' }}>
                  Publish your pitch to attract investors and track views.
                </p>
              )}

              <Link href="/dashboard/pitch-room" style={{ fontSize: '11px', color: stats?.pitchStatus === 'Published' ? T.accent : '#7B5CFF', textDecoration: 'none', fontWeight: 600 }}>
                {stats?.pitchStatus === 'Published' ? 'View analytics →' : 'Publish pitch now →'}
              </Link>
            </div>

          </div>

          {/* Simple Recent Activity Placeholder or CTA */}
          <div style={{ 
            marginTop: '32px', 
            ...T.card, 
            padding: '32px', 
            textAlign: 'center',
            background: 'linear-gradient(180deg, #0C1018 0%, rgba(12, 16, 24, 0.5) 100%)'
          }}>
             <h3 style={{ ...T.syne, fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>What's next?</h3>
             <p style={{ color: T.dim, fontSize: '14px', marginBottom: '24px' }}>
                Your startup journey is tracked stage by stage. Follow the roadmap above to progress.
             </p>
             <Link href="/dashboard/chat" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: T.accent,
                color: '#000',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 700,
                ...T.syne
             }}>
                Talk to AI Advisor <ArrowRight size={16} />
             </Link>
          </div>

        </div>
      </div>
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
