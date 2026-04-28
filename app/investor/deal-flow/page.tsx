'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, BookmarkPlus, BookmarkCheck, ArrowUpRight, TrendingUp, Rocket, DollarSign, Sparkles, Loader2 } from 'lucide-react'
import TopBar from '@/components/TopBar'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import DealFlowPanel from '@/components/deal-flow/DealFlowPanel'

interface Pitch {
  _id: string
  startupName: string
  tagline: string
  industry: string
  stage: string
  targetMarket: string
  fundingAsk: number
  traction: string
  createdAt: string
  founder: { name: string; email: string; avatar?: string } | null
  isWatchlisted: boolean
  readinessScore: { score: number; breakdown: any }
}

const INDUSTRIES = ['all', 'SaaS', 'FinTech', 'HealthTech', 'EdTech', 'E-Commerce', 'AI/ML', 'Climate Tech', 'Web3', 'Developer Tools', 'Consumer Apps', 'Other']

const ReadinessRing = ({ score }: { score: number }) => {
  const color = score >= 71 ? 'var(--color-green)' : score >= 41 ? '#FFC300' : 'var(--color-orange)'
  const size = 36
  const r = 16
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={`Readiness: ${score}/100`}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={3} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color}40)`, transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <span style={{ position: 'absolute', fontSize: 10, fontWeight: 700, color }}>{score}</span>
    </div>
  )
}

export default function DealFlowPage() {
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('all')
  const [sort, setSort] = useState<'newest' | 'score'>('newest')
  const [watchlistLoading, setWatchlistLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // AI Agent State
  const [showDealFlow, setShowDealFlow] = useState<string | null>(null)
  const [investorProfile, setInvestorProfile] = useState<any>(null)
  const [fullStartupData, setFullStartupData] = useState<any>(null)
  const [fetchingFull, setFetchingFull] = useState(false)
  const [compareStartup, setCompareStartup] = useState<any | null>(null)

  const fetchPitches = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ industry, sort })
      const res = await fetch(`/api/investor/deal-flow?${params}`)
      const data = await res.json()
      setPitches(data.pitches || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [industry, sort])

  useEffect(() => { fetchPitches() }, [fetchPitches])

  // Fetch Investor Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/investor/settings')
        if (res.ok) {
          const data = await res.json()
          setInvestorProfile(data.profile)
        }
      } catch (e) {
        console.error('Failed to fetch investor profile:', e)
      }
    }
    fetchProfile()
  }, [])

  // Fetch Full Startup Data when agent is opened
  useEffect(() => {
    if (!showDealFlow) {
      setFullStartupData(null)
      return
    }
    const fetchFullData = async () => {
      setFetchingFull(true)
      try {
        const res = await fetch(`/api/investor/startup/${showDealFlow}`)
        if (res.ok) {
          const data = await res.json()
          setFullStartupData(data)
        }
      } catch (e) {
        console.error('Failed to fetch full startup data:', e)
      } finally {
        setFetchingFull(false)
      }
    }
    fetchFullData()
  }, [showDealFlow])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const toggleWatchlist = async (pitch: Pitch) => {
    setWatchlistLoading(pitch._id)
    try {
      const method = pitch.isWatchlisted ? 'DELETE' : 'POST'
      const res = await fetch('/api/investor/watchlist', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchId: pitch._id }),
      })
      const data = await res.json()
      
      if (res.ok) {
        setPitches(prev => prev.map(p =>
          p._id === pitch._id ? { ...p, isWatchlisted: !p.isWatchlisted } : p
        ))
        showToast(pitch.isWatchlisted ? 'Removed from watchlist' : 'Added to watchlist')
      } else {
        showToast(data.error || 'Failed to update watchlist', 'error')
      }
    } catch (e) {
      console.error(e)
      showToast('Something went wrong', 'error')
    } finally {
      setWatchlistLoading(null)
    }
  }

  const filtered = pitches.filter(p =>
    !search || p.startupName.toLowerCase().includes(search.toLowerCase()) ||
    p.tagline.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <TopBar title="Deal Flow" subtitle="Finalized pitches from AI-validated startups" />
      <div className="dashboard-content">

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 100,
            padding: '12px 20px', borderRadius: 8, background: toast.type === 'success' ? 'var(--color-green)' : 'var(--color-orange)',
            color: '#000', fontWeight: 700, fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', gap: 10, animation: 'slideUp 0.3s ease-out'
          }}>
            {toast.type === 'success' ? <BookmarkCheck size={16} /> : <TrendingUp size={16} />}
            {toast.message}
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '8px 14px', flex: '1 1 220px',
          }}>
            <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search pitches..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 13, width: '100%',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as 'newest' | 'score')}
              className="select"
              style={{ width: 'auto', padding: '8px 12px', fontSize: 13 }}
            >
              <option value="newest">Newest First</option>
              <option value="score">Readiness Score</option>
            </select>
          </div>
        </div>

        {/* Industry Filter Chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {INDUSTRIES.map(ind => (
            <button
              key={ind}
              onClick={() => setIndustry(ind)}
              style={{
                padding: '5px 14px', borderRadius: 20, fontSize: 12,
                fontFamily: 'Space Mono', cursor: 'pointer', border: '1px solid',
                borderColor: industry === ind ? 'var(--color-green)' : 'var(--border)',
                background: industry === ind ? 'rgba(0,245,160,0.1)' : 'var(--elevated)',
                color: industry === ind ? 'var(--color-green)' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              {ind === 'all' ? 'All Sectors' : ind}
            </button>
          ))}
        </div>

        {/* Compare Banner */}
        {compareStartup && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            marginBottom: 20,
            borderRadius: 8,
            background: 'rgba(0,217,232,0.05)',
            border: '1px solid rgba(0,217,232,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#00D9E8',
                boxShadow: '0 0 8px #00D9E8'
              }} />
              <span style={{ fontSize: 13, color: '#00D9E8' }}>
                <strong>{compareStartup.startupName}</strong> selected for 
                comparison — open any startup&apos;s AI Analysis and 
                click the Compare tab
              </span>
            </div>
            <button
              onClick={() => setCompareStartup(null)}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 6,
                color: '#6B7A91',
                cursor: 'pointer',
                fontSize: 11,
                padding: '4px 10px',
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Cards Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card" style={{ height: 220 }}>
                <LoadingSkeleton type="text" count={5} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
            <TrendingUp size={48} style={{ opacity: 0.2, margin: '0 auto 16px', display: 'block' }} />
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>No pitches found</p>
            <p style={{ fontSize: 13 }}>Founders haven&apos;t published any finalized pitches yet, or try adjusting your filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filtered.map(pitch => (
              <div
                key={pitch._id}
                className="investor-card"
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                      background: 'rgba(0,245,160,0.08)', border: '1px solid rgba(0,245,160,0.2)',
                      fontFamily: 'Space Mono', fontSize: 9, color: 'var(--color-green)',
                      fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8,
                    }}>
                      {pitch.industry || 'STARTUP'}
                    </span>
                    <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pitch.startupName}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 8, fontFamily: 'Space Mono', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Readiness</p>
                      <ReadinessRing score={pitch.readinessScore?.score || 0} />
                    </div>
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: 4, 
                      padding: '4px 8px', background: 'var(--elevated)', 
                      borderRadius: 4, border: '1px solid var(--border)' 
                    }}>
                      <Rocket size={12} style={{ color: 'var(--color-cyan)' }} />
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{pitch.stage}</span>
                    </div>
                  </div>
                </div>

                {/* Tagline */}
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {pitch.tagline}
                </p>

                {/* Meta */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                  {pitch.fundingAsk > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-muted)' }}>ASK</span>
                      <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--color-green)', fontWeight: 700 }}>${pitch.fundingAsk.toLocaleString()}</span>
                    </div>
                  )}
                  {pitch.targetMarket && (
                    <div style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-muted)' }}>
                      🎯 {pitch.targetMarket.slice(0, 30)}{pitch.targetMarket.length > 30 ? '…' : ''}
                    </div>
                  )}
                </div>

                {/* Founder */}
                {pitch.founder && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 3,
                      background: 'rgba(0,245,160,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: 'var(--color-green)',
                    }}>
                      {pitch.founder.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pitch.founder.name}</span>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link
                    href={`/investor/startup/${pitch._id}`}
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center', padding: '9px 0', fontSize: 12, gap: 6 }}
                  >
                    View Pitch <ArrowUpRight size={13} />
                  </Link>
                  <button
                    onClick={() => toggleWatchlist(pitch)}
                    disabled={watchlistLoading === pitch._id}
                    style={{
                      padding: '9px 12px',
                      background: pitch.isWatchlisted ? 'rgba(0,245,160,0.1)' : 'var(--elevated)',
                      border: `1px solid ${pitch.isWatchlisted ? 'rgba(0,245,160,0.3)' : 'var(--border)'}`,
                      borderRadius: 4, cursor: 'pointer',
                      color: pitch.isWatchlisted ? 'var(--color-green)' : 'var(--text-muted)',
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center',
                    }}
                    title={pitch.isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
                  >
                    {pitch.isWatchlisted ? <BookmarkCheck size={16} /> : <BookmarkPlus size={16} />}
                  </button>
                  <button
                    onClick={() => setShowDealFlow(pitch._id)}
                    style={{
                      padding: '9px 12px',
                      background: 'rgba(123,92,255,0.15)',
                      border: '1px solid #7B5CFF',
                      borderRadius: 4,
                      cursor: 'pointer',
                      color: '#A78BFA',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      transition: 'all 0.2s',
                    }}
                    title="AI Analysis"
                  >
                    <Sparkles size={13} /> AI Analysis
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCompareStartup(prev =>
                        prev?._id === pitch._id ? null : pitch
                      );
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 14px',
                      borderRadius: 7,
                      border: compareStartup?._id === pitch._id
                        ? '1px solid rgba(0,217,232,0.5)'
                        : '1px solid rgba(255,255,255,0.1)',
                      background: compareStartup?._id === pitch._id
                        ? 'rgba(0,217,232,0.12)'
                        : 'rgba(255,255,255,0.04)',
                      color: compareStartup?._id === pitch._id ? '#00D9E8' : '#6B7A91',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: "'Space Mono', monospace",
                      letterSpacing: '0.04em',
                      transition: 'all 0.2s',
                    }}
                  >
                    {compareStartup?._id === pitch._id ? '✓ Selected' : '+ Compare'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDealFlow && (() => {
        const pitch = pitches.find(s => s._id === showDealFlow)
        if (!pitch) return null
        return (
          <div 
            onClick={() => setShowDealFlow(null)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.65)',
              zIndex: 50,
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <div 
              onClick={e => e.stopPropagation()}
              style={{ width: 580, height: '100%', animation: 'slideInFromRight 0.22s ease' }}
            >
              <DealFlowPanel
                startupData={fullStartupData || pitch}
                investorProfile={investorProfile}
                secondStartup={
                  compareStartup && compareStartup._id !== (fullStartupData?._id || pitch._id)
                    ? compareStartup
                    : undefined
                }
                onClose={() => setShowDealFlow(null)}
              />
            </div>
          </div>
        )
      })()}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInFromRight { 
          from { transform: translateX(100%); } 
          to { transform: translateX(0); } 
        }
      `}</style>
    </>
  )
}
