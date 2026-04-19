'use client'

import { useEffect, useState, useCallback } from 'react'
import { Lightbulb, Plus, Download, AlertCircle, X } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import EmptyState from '@/components/EmptyState'
import StatusBadge from '@/components/StatusBadge'
import { useSelectedProblem } from '@/lib/useSelectedProblem'
import { Target } from 'lucide-react'

const INDUSTRIES = ['SaaS', 'FinTech', 'HealthTech', 'EdTech', 'E-Commerce', 'MarketTech', 'CleanTech', 'AI/ML', 'Web3', 'Other']

interface IdeaValidation {
  _id: string
  ideaTitle: string
  ideaDescription: string
  industry: string
  validationScore: number
  feasibilityScore: number
  trendScore: number
  marketSize: string
  competitionLevel: string
  status: 'pending' | 'analyzing' | 'complete'
  leanCanvas: Record<string, string>
  competitors: Array<{ name: string; funding: string; users: string; weakness: string }>
  createdAt: string
}

function ScoreArc({ score, color = 'var(--color-green)' }: { score: number; color?: string }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <svg width={132} height={132} viewBox="0 0 132 132">
      <circle cx={66} cy={66} r={r} fill="none" stroke="var(--elevated)" strokeWidth={10} />
      <circle cx={66} cy={66} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${circ}`} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 66 66)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x={66} y={63} textAnchor="middle" fill="var(--text-primary)" fontFamily="Syne" fontSize={26} fontWeight={800}>{score}</text>
      <text x={66} y={80} textAnchor="middle" fill="var(--text-muted)" fontFamily="Space Mono" fontSize={9}>/100</text>
    </svg>
  )
}

const CANVAS_FIELDS = [
  { key: 'problem', label: '🚨 Problem' },
  { key: 'solution', label: '✅ Solution' },
  { key: 'uvp', label: '⭐ UVP' },
  { key: 'channels', label: '📢 Channels' },
  { key: 'customerSegments', label: '👥 Customers' },
  { key: 'revenueStreams', label: '💰 Revenue' },
  { key: 'costStructure', label: '📉 Costs' },
  { key: 'keyMetrics', label: '📊 Metrics' },
  { key: 'unfairAdvantage', label: '🏆 Advantage' },
]

export default function IdeaLabPage() {
  const [ideas, setIdeas] = useState<IdeaValidation[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [activeIdea, setActiveIdea] = useState<IdeaValidation | null>(null)
  const [error, setError] = useState('')
  const { problem } = useSelectedProblem()

  const fetchIdeas = useCallback(async () => {
    try {
      const res = await fetch('/api/ideas')
      if (res.ok) {
        const data = await res.json()
        setIdeas(data.ideas || [])
        if (data.ideas?.length > 0 && !activeIdea) setActiveIdea(data.ideas[0])
      }
    } finally {
      setLoading(false)
    }
  }, [activeIdea])

  useEffect(() => { fetchIdeas() }, [fetchIdeas])

  const pollIdea = useCallback(async (id: string) => {
    const poll = async () => {
      const res = await fetch(`/api/ideas/${id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.idea.status === 'complete') {
          setIdeas(prev => prev.map(i => i._id === id ? data.idea : i))
          setActiveIdea(data.idea)
          setAnalyzing(false)
          return
        }
      }
      setTimeout(poll, 1500)
    }
    poll()
  }, [])

  const handleSubmit = async () => {
    setError('')
    setAnalyzing(true)
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemContext: problem ? {
            title: problem.title,
            description: problem.reason,
            opportunity: problem.startupOpportunity,
            domain: problem.domain,
            location: `${problem.location.district}, ${problem.location.state}`
          } : null
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setAnalyzing(false); return }
      setIdeas(prev => [data.idea, ...prev])
      pollIdea(data.idea._id)
    } catch {
      setError('Submission failed'); setAnalyzing(false)
    }
  }

  const exportIdea = (idea: IdeaValidation) => {
    const json = JSON.stringify(idea, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${idea.ideaTitle.replace(/\s+/g, '_')}_validation.json`
    a.click(); URL.revokeObjectURL(url)
  }

  const scoreColor = (s: number) => s >= 80 ? 'var(--color-green)' : s >= 60 ? '#FFC300' : 'var(--color-orange)'

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <TopBar title="Idea Lab" subtitle="Validate your startup ideas with AI" />
        <div className="dashboard-content">
          {problem && (
            <div style={{ background: 'rgba(0,245,160,0.05)', border: '1px solid rgba(0,245,160,0.2)', borderRadius: 4, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: '#00F5A0', color: '#060A0F', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Analyzing idea for problem: <span style={{ color: '#00F5A0' }}>{problem.title}</span></p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Location: {problem.location.district}, {problem.location.state} • Domain: {problem.domain}</p>
              </div>
            </div>
          )}
          {error && (
            <div style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 4, padding: '12px 16px', marginBottom: 20, color: 'var(--color-orange)', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle size={14} />{error}</span>
              <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}><X size={14} /></button>
            </div>
          )}

          {/* Empty State / Select Problem Action */}
          {!problem && ideas.length === 0 && (
            <EmptyState
              icon={Target}
              title="No problem selected"
              description="Please select a problem in the Problem Finder first to begin validation."
              action={{ label: 'Go to Problem Finder', onClick: () => window.location.href = '/dashboard/problem-finder' }}
            />
          )}

          {problem && !analyzing && (
            <div className="card" style={{ padding: '32px', textAlign: 'center', marginBottom: 32, background: 'rgba(0,245,160,0.02)' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Ready to Validate?</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: 24, maxWidth: 600, margin: '0 auto 24px' }}>
                We'll analyze the feasibility, market size, and potential of solving: <br/>
                <strong style={{ color: '#00F5A0' }}>"{problem.title}"</strong>
              </p>
              <button className="btn btn-primary" onClick={handleSubmit} style={{ fontSize: 15, padding: '12px 32px' }}>
                Validate This Problem as a Startup Idea →
              </button>
            </div>
          )}

          {/* Past ideas list */}
          {loading ? (
            <LoadingSkeleton type="row" count={3} />
          ) : ideas.length === 0 && !analyzing && problem ? (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <p style={{ color: 'var(--text-muted)' }}>No validations for this problem yet. Click the button above to start.</p>
            </div>
          ) : ideas.length > 0 && (
            <>
              {/* Ideas list */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {ideas.map(idea => (
                  <button key={idea._id} onClick={() => setActiveIdea(idea)} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                    background: activeIdea?._id === idea._id ? 'rgba(0,245,160,0.08)' : 'var(--surface)',
                    border: `1px solid ${activeIdea?._id === idea._id ? 'rgba(0,245,160,0.3)' : 'var(--border)'}`,
                    borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    <StatusBadge status={
                      idea.status === 'pending' ? 'queued' :
                      idea.status === 'analyzing' ? 'running' :
                      idea.status === 'complete' ? 'completed' : 'queued'
                    } />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{idea.ideaTitle}</span>
                  </button>
                ))}
              </div>

              {/* Active idea results */}
              {activeIdea && activeIdea.status === 'complete' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontSize: 20, fontWeight: 700 }}>{activeIdea.ideaTitle}</h3>
                      <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--color-cyan)' }}>{activeIdea.industry}</span>
                    </div>
                    <button className="btn btn-outline" onClick={() => exportIdea(activeIdea)} style={{ fontSize: 12 }}>
                      <Download size={14} /> Export JSON
                    </button>
                  </div>

                  {/* Score + Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, marginBottom: 20 }}>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 32px' }}>
                      <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Validation Score</p>
                      <ScoreArc score={activeIdea.validationScore} color={scoreColor(activeIdea.validationScore)} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                      {[
                        { label: 'Market Size', value: activeIdea.marketSize || '—', color: 'var(--color-green)' },
                        { label: 'Competition', value: activeIdea.competitionLevel || '—', color: 'var(--color-orange)' },
                        { label: 'Feasibility', value: `${activeIdea.feasibilityScore}/100`, color: 'var(--color-cyan)' },
                        { label: 'Trend Score', value: `${activeIdea.trendScore}/100`, color: 'var(--color-purple)' },
                      ].map(m => (
                        <div key={m.label} className="card" style={{ padding: '16px 20px' }}>
                          <p style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>{m.label}</p>
                          <p style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 800, color: m.color }}>{m.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lean Canvas */}
                  {activeIdea.leanCanvas && Object.keys(activeIdea.leanCanvas).length > 0 && (
                    <div className="card" style={{ marginBottom: 20 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📋 Lean Canvas</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        {CANVAS_FIELDS.map(f => (
                          <div key={f.key} style={{ background: 'var(--elevated)', border: '1px solid var(--border)', borderRadius: 4, padding: '12px 14px' }}>
                            <p style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--color-cyan)', marginBottom: 6 }}>{f.label}</p>
                            <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-muted)' }}>{activeIdea.leanCanvas[f.key] || '—'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Competitors */}
                  {activeIdea.competitors?.length > 0 && (
                    <div className="card">
                      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🏆 Competitive Landscape</h3>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              {['Competitor', 'Funding', 'Users', 'Weakness'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {activeIdea.competitors.map((c, i) => (
                              <tr key={i}>
                                <td style={{ padding: '12px', fontWeight: 500, fontSize: 13 }}>{c.name}</td>
                                <td style={{ padding: '12px', fontFamily: 'Space Mono', fontSize: 12, color: 'var(--color-green)' }}>{c.funding}</td>
                                <td style={{ padding: '12px', fontFamily: 'Space Mono', fontSize: 12, color: 'var(--color-cyan)' }}>{c.users}</td>
                                <td style={{ padding: '12px', fontSize: 12, color: 'var(--text-muted)' }}>{c.weakness}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
