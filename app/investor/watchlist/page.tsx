'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bookmark, BookmarkCheck, ArrowUpRight, TrendingUp, DollarSign, Rocket } from 'lucide-react'
import TopBar from '@/components/TopBar'
import LoadingSkeleton from '@/components/LoadingSkeleton'

interface Pitch {
  _id: string
  startupName: string
  tagline: string
  industry: string
  stage: string
  fundingAsk: number
  traction: string
  createdAt: string
  founder: { name: string; email: string } | null
  isWatchlisted: boolean
  savedAt: string
}

export default function WatchlistPage() {
  const [pitches, setPitches] = useState<Pitch[]>([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const fetchWatchlist = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/investor/watchlist')
      const data = await res.json()
      setPitches(data.pitches || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWatchlist() }, [])

  const removeFromWatchlist = async (pitchId: string) => {
    setRemovingId(pitchId)
    try {
      await fetch('/api/investor/watchlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchId }),
      })
      setPitches(prev => prev.filter(p => p._id !== pitchId))
    } catch (e) {
      console.error(e)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <>
      <TopBar title="Watchlist" subtitle="Pitches you have saved for later" />
      <div className="dashboard-content">

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card" style={{ height: 200 }}>
                <LoadingSkeleton type="text" count={4} />
              </div>
            ))}
          </div>
        ) : pitches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
            <Bookmark size={56} style={{ opacity: 0.15, margin: '0 auto 20px', display: 'block' }} />
            <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>Your watchlist is empty</p>
            <p style={{ fontSize: 14, marginBottom: 24 }}>Browse deal flow and bookmark pitches that interest you.</p>
            <Link href="/investor/deal-flow" className="btn btn-primary">
              Browse Deal Flow
            </Link>
          </div>
        ) : (
          <>
            <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)', marginBottom: 20 }}>
              {pitches.length} saved pitch{pitches.length !== 1 ? 'es' : ''}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {pitches.map(pitch => (
                <div key={pitch._id} className="investor-card">
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
                    <div style={{ 
                      display: 'flex', alignItems: 'center', gap: 4, 
                      padding: '4px 8px', background: 'var(--elevated)', 
                      borderRadius: 4, border: '1px solid var(--border)' 
                    }}>
                      <Rocket size={12} style={{ color: 'var(--color-cyan)' }} />
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{pitch.stage}</span>
                    </div>
                  </div>

                  <p style={{
                    fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {pitch.tagline}
                  </p>

                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    {pitch.fundingAsk > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <DollarSign size={12} style={{ color: 'var(--color-green)' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Space Mono' }}>${pitch.fundingAsk.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

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

                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link
                      href={`/investor/startup/${pitch._id}`}
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: 'center', padding: '9px 0', fontSize: 12, gap: 6 }}
                    >
                      View Pitch <ArrowUpRight size={13} />
                    </Link>
                    <button
                      onClick={() => removeFromWatchlist(pitch._id)}
                      disabled={removingId === pitch._id}
                      style={{
                        padding: '9px 12px',
                        background: 'rgba(255,107,53,0.08)',
                        border: '1px solid rgba(255,107,53,0.2)',
                        borderRadius: 4, cursor: 'pointer',
                        color: 'var(--color-orange)',
                        transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center',
                        opacity: removingId === pitch._id ? 0.5 : 1,
                      }}
                      title="Remove from watchlist"
                    >
                      <BookmarkCheck size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && pitches.length > 0 && (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link href="/investor/deal-flow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-cyan)', textDecoration: 'none' }}>
              <TrendingUp size={14} /> Browse more pitches
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
