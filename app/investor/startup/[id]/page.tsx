'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, BookmarkPlus, BookmarkCheck, Send, X,
  Target, TrendingUp, Users, DollarSign, Zap, BarChart3, Trophy,
  Rocket, FileText, Sparkles
} from 'lucide-react'
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
  problemStatement: string
  solution: string
  uniqueValueProposition: string
  businessModel: string
  teamDetails: string
  investorReport: string
  founder: { name: string; email: string; avatar: string } | null
  isWatchlisted: boolean
  hasExpressedInterest: boolean
  interestStatus: string | null
  createdAt: string
  viewerProfile: { name: string; firm: string; photo: string } | null
}

export default function StartupDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [pitch, setPitch] = useState<Pitch | null>(null)
  const [loading, setLoading] = useState(true)
  const [watchlistLoading, setWatchlistLoading] = useState(false)
  const [interestModal, setInterestModal] = useState(false)
  const [interestMessage, setInterestMessage] = useState('')
  const [interestLoading, setInterestLoading] = useState(false)
  const [interestSent, setInterestSent] = useState(false)
  const [error, setError] = useState('')
  const [showDealFlow, setShowDealFlow] = useState(false)
  const [investorProfile, setInvestorProfile] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/investor/startup/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { router.push('/investor/deal-flow'); return }
        setPitch(data)
      })
      .catch(() => router.push('/investor/deal-flow'))
      .finally(() => setLoading(false))

    // Fetch full investor profile for the agent
    fetch('/api/investor/settings')
      .then(r => r.json())
      .then(data => setInvestorProfile(data.profile))
      .catch(e => console.error('Profile fetch error:', e))
  }, [id, router])

  const toggleWatchlist = async () => {
    if (!pitch) return
    setWatchlistLoading(true)
    try {
      const method = pitch.isWatchlisted ? 'DELETE' : 'POST'
      await fetch('/api/investor/watchlist', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchId: pitch._id }),
      })
      setPitch(prev => prev ? { ...prev, isWatchlisted: !prev.isWatchlisted } : prev)
    } catch (e) { console.error(e) }
    finally { setWatchlistLoading(false) }
  }

  const sendInterest = async () => {
    if (!pitch) return
    setInterestLoading(true)
    setError('')
    try {
      const res = await fetch('/api/investor/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startupId: pitch._id, message: interestMessage }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); return }
      setInterestSent(true)
      setPitch(prev => prev ? { ...prev, hasExpressedInterest: true, interestStatus: 'pending' } : prev)
      setTimeout(() => { setInterestModal(false); setInterestSent(false) }, 2000)
    } catch { setError('Something went wrong') }
    finally { setInterestLoading(false) }
  }

  if (loading) {
    return (
      <>
        <TopBar title="Pitch Profile" />
        <div className="dashboard-content">
          <LoadingSkeleton type="text" count={8} />
        </div>
      </>
    )
  }

  if (!pitch) return null

  return (
    <>
      <TopBar title={pitch.startupName} subtitle={pitch.stage.toUpperCase()} />
      <div className="dashboard-content">

        {/* Back */}
        <Link href="/investor/deal-flow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 24 }}>
          <ArrowLeft size={14} /> Back to Deal Flow
        </Link>

        {/* Hero Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid rgba(0,245,160,0.2)',
          borderRadius: 8,
          padding: 28,
          marginBottom: 24,
          boxShadow: '0 0 40px rgba(0,245,160,0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Glow bg */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(0,245,160,0.04)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <span style={{
                display: 'inline-block', padding: '3px 12px', borderRadius: 20, marginBottom: 12,
                background: 'rgba(0,245,160,0.08)', border: '1px solid rgba(0,245,160,0.2)',
                fontFamily: 'Space Mono', fontSize: 10, color: 'var(--color-green)', fontWeight: 700, letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                {pitch.industry || 'STARTUP'}
              </span>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>{pitch.startupName}</h1>
              <p style={{ fontSize: 15, color: '#E8EDF5', fontWeight: 600, marginBottom: 12, opacity: 0.9 }}>{pitch.tagline}</p>
            </div>

            {/* Stage Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--elevated)', padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border)' }}>
              <Rocket size={18} style={{ color: 'var(--color-cyan)' }} />
              <div>
                <p style={{ fontSize: 9, fontFamily: 'Space Mono', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Stage</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{pitch.stage}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, marginTop: 24, flexWrap: 'wrap' }}>
            {pitch.fundingAsk > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--elevated)', borderRadius: 6, border: '1px solid var(--border)' }}>
                <DollarSign size={14} style={{ color: 'var(--color-green)' }} />
                <span style={{ fontFamily: 'Space Mono', fontSize: 12, color: 'var(--text-primary)', fontWeight: 700 }}>${pitch.fundingAsk.toLocaleString()}</span>
                <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-muted)' }}>funding ask</span>
              </div>
            )}
            {pitch.targetMarket && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--elevated)', borderRadius: 6, border: '1px solid var(--border)' }}>
                <Target size={14} style={{ color: 'var(--color-cyan)' }} />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{pitch.targetMarket}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              onClick={() => !pitch.hasExpressedInterest && setInterestModal(true)}
              disabled={pitch.hasExpressedInterest}
              className="btn btn-primary"
              style={{ gap: 8, padding: '10px 20px', opacity: pitch.hasExpressedInterest ? 0.7 : 1 }}
            >
              <Send size={15} />
              {pitch.hasExpressedInterest ? `Interest Sent (${pitch.interestStatus})` : 'Express Interest'}
            </button>
            <button
              onClick={toggleWatchlist}
              disabled={watchlistLoading}
              className="btn btn-outline"
              style={{ gap: 8, padding: '10px 20px' }}
            >
              {pitch.isWatchlisted ? <BookmarkCheck size={15} style={{ color: 'var(--color-green)' }} /> : <BookmarkPlus size={15} />}
              {pitch.isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}
            </button>
            <button
              onClick={() => setShowDealFlow(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 8,
                border: '1px solid rgba(123,92,255,0.4)',
                background: 'rgba(123,92,255,0.12)',
                color: '#A78BFA',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Space Mono', monospace",
                letterSpacing: '0.04em',
                transition: 'all 0.2s',
              }}
            >
              <Sparkles size={14} />
              AI Analysis
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Problem & Solution */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Zap size={16} style={{ color: 'var(--color-green)' }} />
                <h2 style={{ fontSize: 15, fontWeight: 700 }}>Problem & Solution</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: 'var(--elevated)', borderRadius: 6, padding: '16px', border: '1px solid var(--border)' }}>
                  <p style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8 }}>PROBLEM</p>
                  <p style={{ fontSize: 13, color: '#E8EDF5', lineHeight: 1.6 }}>{pitch.problemStatement}</p>
                </div>
                <div style={{ background: 'var(--elevated)', borderRadius: 6, padding: '16px', border: '1px solid var(--border)' }}>
                  <p style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--color-cyan)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8 }}>SOLUTION</p>
                  <p style={{ fontSize: 13, color: '#E8EDF5', lineHeight: 1.6 }}>{pitch.solution}</p>
                </div>
              </div>
            </div>

            {/* Investor Report */}
            {pitch.investorReport && (
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <FileText size={16} style={{ color: 'var(--color-purple)' }} />
                  <h2 style={{ fontSize: 15, fontWeight: 700 }}>AI Investor Report</h2>
                </div>
                <div style={{ 
                  fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8, 
                  whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.01)', 
                  padding: '20px', borderRadius: 8, border: '1px solid var(--border)' 
                }}>
                  {pitch.investorReport}
                </div>
              </div>
            )}

            {/* Traction */}
            {pitch.traction && (
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <TrendingUp size={16} style={{ color: 'var(--color-cyan)' }} />
                  <h2 style={{ fontSize: 15, fontWeight: 700 }}>Traction</h2>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>{pitch.traction}</p>
              </div>
            )}
          </div>

          {/* Right: Founder Info */}
          <div>
            {pitch.founder && (
              <div className="card" style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Founder</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 6,
                    background: 'rgba(0,245,160,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, fontWeight: 700, color: 'var(--color-green)',
                    fontFamily: 'Syne',
                  }}>
                    {pitch.founder.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600 }}>{pitch.founder.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>{pitch.founder.email}</p>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
                  This founder finalized their pitch on Agentix. Connect to discuss investment opportunities.
                </p>
                <button
                  onClick={() => !pitch.hasExpressedInterest && setInterestModal(true)}
                  disabled={pitch.hasExpressedInterest}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', gap: 8 }}
                >
                  <Send size={14} />
                  {pitch.hasExpressedInterest ? 'Interest Sent' : 'Express Interest'}
                </button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="card">
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Pitch Overview</h2>
              {[
                { label: 'Stage', value: pitch.stage, color: 'var(--color-cyan)' },
                { label: 'Industry', value: pitch.industry || 'N/A', color: 'var(--color-purple)' },
                { label: 'Target Market', value: pitch.targetMarket.slice(0, 20) + '...', color: 'var(--text-muted)' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: item.color, fontFamily: 'Space Mono', textTransform: 'capitalize' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Viewing As Card - Investor Identity */}
        {pitch.viewerProfile && (
          <div style={{ 
            marginTop: 40, padding: '20px 24px', background: 'rgba(255,255,255,0.02)', 
            border: '1px solid var(--border)', borderRadius: 12, display: 'flex', 
            alignItems: 'center', justifyContent: 'space-between', animation: 'fadeUp 0.6s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ 
                width: 40, height: 40, borderRadius: '50%', background: 'var(--elevated)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                border: '1px solid var(--border)', fontSize: 16, fontWeight: 700, color: 'var(--color-green)' 
              }}>
                {pitch.viewerProfile.name.charAt(0)}
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Viewing as</p>
                <p style={{ fontSize: 15, fontWeight: 700 }}>
                  {pitch.viewerProfile.name} 
                  {pitch.viewerProfile.firm && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> from {pitch.viewerProfile.firm}</span>}
                </p>
              </div>
            </div>
            <div style={{ 
              padding: '6px 12px', background: 'rgba(0,245,160,0.08)', borderRadius: 20, 
              border: '1px solid rgba(0,245,160,0.2)', fontSize: 10, fontFamily: 'Space Mono', 
              color: 'var(--color-green)', fontWeight: 700, letterSpacing: '0.05em' 
            }}>
              PROFESSIONAL VIEW
            </div>
          </div>
        )}

        {/* Interest Modal */}
        {interestModal && (
          <div className="modal-backdrop" onClick={() => setInterestModal(false)}>
            <div className="modal-box" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Express Interest</h2>
                <button className="modal-close" onClick={() => setInterestModal(false)}><X size={18} /></button>
              </div>
              <div className="modal-body">
                {interestSent ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ width: 56, height: 56, background: 'rgba(0,245,160,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <Send style={{ color: 'var(--color-green)' }} size={24} />
                    </div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-green)', marginBottom: 8 }}>Interest Sent!</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>The founder will be notified of your interest.</p>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                      Send a message to <strong style={{ color: 'var(--text-primary)' }}>{pitch.founder?.name || 'the founder'}</strong> about <strong style={{ color: 'var(--color-green)' }}>{pitch.startupName}</strong>.
                    </p>
                    {error && (
                      <div style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 4, padding: '10px 14px', marginBottom: 16, color: 'var(--color-orange)', fontSize: 13 }}>
                        {error}
                      </div>
                    )}
                    <div className="form-group">
                      <label className="form-label">Your Message (optional)</label>
                      <textarea
                        className="textarea"
                        placeholder="Hi, I'm interested in your startup..."
                        value={interestMessage}
                        onChange={e => setInterestMessage(e.target.value)}
                        rows={5}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={sendInterest}
                        disabled={interestLoading}
                        className="btn btn-primary"
                        style={{ flex: 1, justifyContent: 'center', gap: 8 }}
                      >
                        {interestLoading ? <><span className="spinner" /> Sending...</> : <><Send size={14} /> Send Interest</>}
                      </button>
                      <button onClick={() => setInterestModal(false)} className="btn btn-outline">Cancel</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {showDealFlow && (
          <div
            onClick={() => setShowDealFlow(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.65)',
              zIndex: 50,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: 580,
                height: '100%',
                animation: 'slideInFromRight 0.22s ease',
              }}
            >
              <DealFlowPanel
                startupData={pitch}
                investorProfile={investorProfile}
                onClose={() => setShowDealFlow(false)}
              />
            </div>
          </div>
        )}

      </div>
      <style jsx>{`
        @keyframes slideInFromRight { 
          from { transform: translateX(100%); } 
          to { transform: translateX(0); } 
        }
      `}</style>
    </>
  )
}
