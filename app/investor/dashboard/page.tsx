'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { 
  Building2, Bookmark, LayoutGrid, Sparkles, ArrowRight, TrendingUp, Star, Zap, 
  Rocket, DollarSign, Target, SlidersHorizontal, Search, Check, BookmarkCheck, BookmarkPlus, ArrowUpRight, X, Eye
} from 'lucide-react'
import TopBar from '@/components/TopBar'
import KPICard from '@/components/KPICard'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import SectorHeatmap from '@/components/SectorHeatmap'

interface Stats {
  pitchesViewed: number
  watchlistCount: number
  newThisWeek: number
}

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
  readinessScore: { score: number; breakdown?: any }
}

const ReadinessRing = ({ score, size = 32 }: { score: number; size?: number }) => {
  const color = score >= 71 ? 'var(--color-green)' : score >= 41 ? '#FFC300' : 'var(--color-orange)'
  const r = (size / 2) - 3
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={2.5} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={2.5}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <span style={{ position: 'absolute', fontSize: 9, fontWeight: 700, color }}>{score}</span>
    </div>
  )
}

export default function InvestorDashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [allPitches, setAllPitches] = useState<Pitch[]>([])
  const [featured, setFeatured] = useState<Pitch[]>([])
  const [loading, setLoading] = useState(true)
  const [watchlistLoading, setWatchlistLoading] = useState<string | null>(null)

  // Filters state
  const [stageFilter, setStageFilter] = useState('All')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [maxFunding, setMaxFunding] = useState(1000000)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, pitchesRes] = await Promise.all([
          fetch('/api/investor/stats'),
          fetch('/api/investor/deal-flow?limit=100')
        ])
        const statsData = await statsRes.json()
        const pitchesData = await pitchesRes.json()
        
        setStats(statsData)
        const pitches = pitchesData.pitches || []
        setAllPitches(pitches)
        
        // Filter: Last 7 days, top 3 by score
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        
        const top3 = [...pitches]
          .filter((p: Pitch) => new Date(p.createdAt) >= sevenDaysAgo)
          .sort((a: Pitch, b: Pitch) => (b.readinessScore?.score || 0) - (a.readinessScore?.score || 0))
          .slice(0, 3)
          
        setFeatured(top3)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredPitches = useMemo(() => {
    return allPitches.filter(p => {
      const matchStage = stageFilter === 'All' || p.stage.toLowerCase() === stageFilter.toLowerCase()
      const matchIndustry = industryFilter === 'all' || p.industry === industryFilter
      const matchFunding = p.fundingAsk <= maxFunding
      return matchStage && matchIndustry && matchFunding
    })
  }, [allPitches, stageFilter, industryFilter, maxFunding])

  const industries = useMemo(() => {
    const unique = new Set(allPitches.map(p => p.industry).filter(Boolean))
    return ['all', ...Array.from(unique)]
  }, [allPitches])

  const toggleWatchlist = async (pitch: Pitch) => {
    setWatchlistLoading(pitch._id)
    try {
      const method = pitch.isWatchlisted ? 'DELETE' : 'POST'
      const res = await fetch('/api/investor/watchlist', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchId: pitch._id }),
      })
      if (res.ok) {
        setAllPitches(prev => prev.map(p => 
          p._id === pitch._id ? { ...p, isWatchlisted: !p.isWatchlisted } : p
        ))
      }
    } catch (e) { console.error(e) }
    finally { setWatchlistLoading(null) }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <>
      <div className="dashboard-content" style={{ paddingTop: 40 }}>
        
        {/* Personalized Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8, color: 'var(--text-primary)' }}>
            {getGreeting()}, {session?.user?.name?.split(' ')[0] || 'Investor'}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 600, lineHeight: 1.6 }}>
            Here is your executive summary and the latest activity in your targeted sectors.
          </p>
        </div>

        {/* Quick Stats */}
        {loading ? (
          <div style={{ marginBottom: 40 }}><LoadingSkeleton type="card" count={3} /></div>
        ) : (
          <div className="kpi-grid" style={{ marginBottom: 40, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <KPICard icon={Eye} label="Pitches Viewed" value={stats?.pitchesViewed ?? 0} color="var(--color-green)" />
            <KPICard icon={Bookmark} label="Watchlisted" value={stats?.watchlistCount ?? 0} color="var(--color-cyan)" />
            <KPICard icon={Sparkles} label="New This Week" value={stats?.newThisWeek ?? 0} color="var(--color-orange)" trend={stats?.newThisWeek ? 8 : 0} />
          </div>
        )}

        {/* Featured This Week */}
        {!loading && featured.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 4, height: 18, background: '#FFD700', borderRadius: 2 }} />
              <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>FEATURED THIS WEEK</h2>
            </div>
            <div style={{ 
              display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 10, 
              paddingRight: 20, maskImage: 'linear-gradient(to right, black 90%, transparent)' 
            }}>
              {featured.map(pitch => (
                <Link 
                  key={pitch._id} 
                  href={`/investor/startup/${pitch._id}`}
                  style={{ 
                    flex: '0 0 340px', background: 'var(--surface)', border: '1px solid #FFD70040', 
                    borderRadius: 12, padding: '24px', textDecoration: 'none', position: 'relative',
                    boxShadow: '0 0 25px rgba(255, 215, 0, 0.08)', transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{
                    position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', background: 'rgba(255,215,0,0.1)', borderRadius: 20, border: '1px solid #FFD70050'
                  }}>
                    <Star size={10} style={{ color: '#FFD700' }} fill="#FFD700" />
                    <span style={{ fontSize: 9, fontWeight: 800, color: '#FFD700', fontFamily: 'Space Mono' }}>TOP RATED</span>
                  </div>
                  
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: 'var(--elevated)',
                    fontSize: 9, fontFamily: 'Space Mono', color: 'var(--text-muted)', marginBottom: 12, border: '1px solid var(--border)'
                  }}>
                    {pitch.industry || 'STARTUP'}
                  </span>
                  
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>{pitch.startupName}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 20, height: 40, overflow: 'hidden' }}>{pitch.tagline}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                    <div>
                      <p style={{ fontSize: 9, fontFamily: 'Space Mono', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Readiness Score</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ReadinessRing score={pitch.readinessScore.score} size={40} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Level High</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 9, fontFamily: 'Space Mono', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Stage</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-cyan)', textTransform: 'capitalize' }}>{pitch.stage}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Sector Heatmap */}
        {!loading && (
          <SectorHeatmap 
            pitches={allPitches} 
            currentIndustry={industryFilter} 
            onSectorClick={setIndustryFilter} 
          />
        )}

        {/* Live Deal Flow Feed */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <TrendingUp size={18} style={{ color: 'var(--color-green)' }} />
                <h2 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>INVESTMENT FEED</h2>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Showing {filteredPitches.length} startups matches your criteria</p>
            </div>

            {/* Filter Bar */}
            <div style={{ 
              display: 'flex', gap: 16, alignItems: 'center', background: 'var(--surface)', 
              padding: '12px 20px', borderRadius: 12, border: '1px solid var(--border)', flexWrap: 'wrap'
            }}>
              {/* Stage Pills */}
              <div style={{ display: 'flex', background: 'var(--elevated)', p: 4, borderRadius: 8, padding: 3 }}>
                {['All', 'Idea', 'MVP', 'Revenue', 'Scaling'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStageFilter(s)}
                    style={{
                      padding: '6px 14px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background: stageFilter === s ? 'var(--surface)' : 'transparent',
                      color: stageFilter === s ? 'var(--color-green)' : 'var(--text-muted)',
                      border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Space Mono'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

              {/* Industry Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <LayoutGrid size={14} style={{ color: 'var(--text-muted)' }} />
                <select 
                  value={industryFilter} 
                  onChange={e => setIndustryFilter(e.target.value)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer' }}
                >
                  {industries.map(ind => (
                    <option key={ind} value={ind}>{ind === 'all' ? 'All Industries' : ind}</option>
                  ))}
                </select>
              </div>

              <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

              {/* Funding Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 200 }}>
                <DollarSign size={14} style={{ color: 'var(--text-muted)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>FUNDING ASK</span>
                    <span style={{ fontSize: 10, color: 'var(--color-green)', fontWeight: 700 }}>UP TO ${maxFunding === 1000000 ? '1M+' : (maxFunding/1000).toString() + 'k'}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1000000" 
                    step="50000" 
                    value={maxFunding} 
                    onChange={e => setMaxFunding(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--color-green)', height: 4, cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
               {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card" style={{ height: 260 }}><LoadingSkeleton type="text" count={5} /></div>)}
             </div>
          ) : filteredPitches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', borderRadius: 12, border: '1px dashed var(--border)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No startups matched your current filters.</p>
              <button onClick={() => { setStageFilter('All'); setIndustryFilter('all'); setMaxFunding(1000000) }} style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--color-green)', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Reset Filters</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {filteredPitches.map(pitch => (
                <div key={pitch._id} className="investor-card" style={{ animation: 'fadeUp 0.4s ease' }}>
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
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{pitch.startupName}</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ReadinessRing score={pitch.readinessScore?.score || 0} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: 'var(--elevated)', borderRadius: 4, border: '1px solid var(--border)' }}>
                        <Rocket size={12} style={{ color: 'var(--color-cyan)' }} />
                        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{pitch.stage}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16, height: 40, overflow: 'hidden' }}>{pitch.tagline}</p>

                  <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-muted)' }}>ASK</span>
                      <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--color-green)', fontWeight: 700 }}>${pitch.fundingAsk.toLocaleString()}</span>
                    </div>
                    <div style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-muted)' }}>
                      🎯 {pitch.targetMarket.slice(0, 20)}...
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link href={`/investor/startup/${pitch._id}`} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>
                      View Pitch <ArrowUpRight size={14} />
                    </Link>
                    <button
                      onClick={() => toggleWatchlist(pitch)}
                      disabled={watchlistLoading === pitch._id}
                      style={{ 
                        padding: '9px 12px', background: pitch.isWatchlisted ? 'rgba(0,245,160,0.1)' : 'var(--elevated)', 
                        border: `1px solid ${pitch.isWatchlisted ? 'rgba(0,245,160,0.3)' : 'var(--border)'}`, 
                        borderRadius: 4, cursor: 'pointer', color: pitch.isWatchlisted ? 'var(--color-green)' : 'var(--text-muted)' 
                      }}
                    >
                      {pitch.isWatchlisted ? <BookmarkCheck size={16} /> : <BookmarkPlus size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
