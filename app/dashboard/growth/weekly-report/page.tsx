'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import {
  FileText, Target, Zap, Clock, Trophy, AlertTriangle,
  ChevronRight, Send, CheckCircle2, Loader2, Sparkles,
  BarChart3, Bot,
} from 'lucide-react'
import { useSelectedProblem } from '@/lib/useSelectedProblem'

const T = {
  page: { display: 'flex', minHeight: '100vh', background: '#060A0F', color: '#E8EDF5', fontFamily: "'DM Sans', sans-serif" } as React.CSSProperties,
  main: { flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', marginLeft: 'var(--sidebar-w)' },
  body: { flex: 1, overflowY: 'auto' as const, padding: '32px' },
  card: { background: '#0C1018', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8 } as React.CSSProperties,
  innerCard: { background: '#060A0F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6 } as React.CSSProperties,
  label: { display: 'block', fontSize: 11, color: '#6B7A91', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 8 },
  btn: { padding: '10px 22px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
  btnGreen: { background: '#00F5A0', color: '#060A0F' },
  btnOutline: { background: 'transparent', color: '#A0ADBF', border: '1px solid rgba(255,255,255,0.12)' },
  tag: { fontFamily: "'Space Mono', monospace", fontSize: 10, padding: '3px 10px', borderRadius: 4, letterSpacing: '0.06em', fontWeight: 700, display: 'inline-block' } as React.CSSProperties,
  syne: { fontFamily: "'Syne', sans-serif" },
  mono: { fontFamily: "'Space Mono', monospace" },
}

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 26, circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  return (
    <div style={{ ...T.card, padding: '20px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={64} height={64} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={32} cy={32} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={5} fill="none" />
        <circle cx={32} cy={32} r={r} stroke={color} strokeWidth={5} fill="none"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease', filter: `drop-shadow(0 0 4px ${color}60)` }}
        />
        <text x={32} y={36} textAnchor="middle" style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 800, fill: '#E8EDF5', transform: 'rotate(90deg)', transformOrigin: '32px 32px' }}>
          {score}
        </text>
      </svg>
      <span style={{ ...T.label, marginBottom: 0, fontSize: 10 }}>{label}</span>
    </div>
  )
}

export default function WeeklyReportPage() {
  useSession()
  const { problem } = useSelectedProblem()
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [activeReport, setActiveReport] = useState<any>(null)
  const [pitchSaving, setPitchSaving] = useState(false)
  const [pitchSent, setPitchSent] = useState(false)

  const fetchReports = () => {
    fetch('/api/growth/weekly-report')
      .then(r => r.json())
      .then(d => {
        if (d.reports) {
          setHistory(d.reports)
          if (d.reports.length > 0 && !activeReport) setActiveReport(d.reports[0])
        }
      })
  }

  useEffect(() => { fetchReports() }, [])

  const generateReport = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/growth/weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemContext: problem ? { title: problem.title, reason: problem.reason, opportunity: problem.startupOpportunity } : null
        }),
      })
      const data = await res.json()
      if (data.report) {
        fetchReports()
        setActiveReport({ report: data.report, _id: data._id, createdAt: new Date().toISOString(), weekOf: new Date().toISOString() })
        setPitchSent(false)
      }
    } catch { /* silent */ }
    setLoading(false)
  }

  // Send investor update snippet to PitchRoom traction field
  const sendToPitchRoom = async () => {
    if (!activeReport?.report?.investorUpdateSnippet) return
    setPitchSaving(true)
    try {
      const snippet = `[Weekly Update ${new Date(activeReport.weekOf || activeReport.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}] ${activeReport.report.investorUpdateSnippet}`
      const pitchRes = await fetch('/api/pitch-room')
      const pitchData = await pitchRes.json()
      const existing = pitchData.pitch?.traction || ''
      const updated = existing ? `${existing}\n\n${snippet}` : snippet
      await fetch('/api/pitch-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traction: updated }),
      })
      setPitchSent(true)
    } catch { /* silent */ }
    setPitchSaving(false)
  }

  const getScoreColor = (s: number) => s >= 70 ? '#00F5A0' : s >= 50 ? '#FFB800' : '#FF6B35'

  return (
    <div style={T.page}>
      <Sidebar />
      <div style={T.main}>
        <TopBar title="Weekly Report" subtitle="AI-generated startup progress brief" />
        <div style={T.body}>

          {problem && (
            <div style={{ background: 'rgba(0,245,160,0.04)', border: '1px solid rgba(0,245,160,0.18)', borderRadius: 8, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ background: '#00F5A0', color: '#060A0F', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Target size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700 }}>Report context: <span style={{ color: '#00F5A0' }}>{problem.title}</span></p>
                <p style={{ fontSize: 11, color: '#6B7A91', marginTop: 2 }}>Report auto-pulls your active milestones and completed experiments. Investor snippet can be sent directly to Pitch Room.</p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>

            {/* Left column */}
            <div style={{ width: 240, flexShrink: 0 }}>
              <button
                onClick={generateReport}
                disabled={loading}
                style={{ ...T.btn, ...T.btnGreen, width: '100%', justifyContent: 'center', marginBottom: 20, padding: '12px 16px', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? <Loader2 size={15} style={{ animation: 'spin 2s linear infinite' }} /> : <Zap size={15} />}
                {loading ? 'Analyzing…' : 'Generate Report'}
              </button>

              {history.length > 0 && (
                <div>
                  <div style={{ ...T.label, marginBottom: 12 }}>Past Reports</div>
                  {history.map(r => (
                    <button key={r._id} onClick={() => { setActiveReport(r); setPitchSent(false) }}
                      style={{ ...T.card, width: '100%', textAlign: 'left', padding: '14px 16px', marginBottom: 10, cursor: 'pointer', border: activeReport?._id === r._id ? '1px solid rgba(0,245,160,0.3)' : '1px solid rgba(255,255,255,0.07)', transition: 'all 0.2s', background: activeReport?._id === r._id ? 'rgba(0,245,160,0.03)' : '#0C1018' }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                        Week of {new Date(r.weekOf).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6B7A91', ...T.mono }}>
                        <BarChart3 size={11} style={{ color: getScoreColor(r.report?.score?.overall || 0) }} />
                        Score: {r.report?.score?.overall || 0}/100
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right content */}
            <div style={{ flex: 1, minWidth: 0, maxWidth: 820 }}>
              {activeReport ? (() => {
                const r = activeReport.report
                if (!r) return null
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 64, animation: 'fadeUp 0.4s ease both' }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ ...T.syne, fontSize: 30, fontWeight: 800, marginBottom: 8 }}>Weekly Progress Brief</div>
                      <div style={{ fontSize: 14, color: '#A0ADBF' }}>
                        {new Date(activeReport.createdAt || activeReport.weekOf).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>

                    {/* Score rings */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                      <ScoreRing score={r.score?.overall || 0} label="Overall" color={getScoreColor(r.score?.overall || 0)} />
                      <ScoreRing score={r.score?.execution || 0} label="Execution" color="#00D9E8" />
                      <ScoreRing score={r.score?.consistency || 0} label="Consistency" color="#7B5CFF" />
                      <ScoreRing score={r.score?.momentum || 0} label="Momentum" color="#FFB800" />
                    </div>

                    {/* Executive Summary */}
                    <div style={{ ...T.card, padding: 28, borderLeft: '3px solid #00F5A0', background: 'rgba(0,245,160,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Sparkles size={16} style={{ color: '#00F5A0' }} />
                        <span style={{ ...T.syne, fontSize: 16, fontWeight: 700 }}>Executive Summary</span>
                      </div>
                      <p style={{ fontSize: 14, color: '#E8EDF5', lineHeight: 1.8 }}>{r.executiveSummary}</p>
                    </div>

                    {/* Key Wins & Blockers */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                          <Trophy size={16} style={{ color: '#00F5A0' }} />
                          <span style={{ ...T.syne, fontSize: 16, fontWeight: 700, color: '#00F5A0' }}>Key Wins</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {(r.keyWins || r.wins || []).map((w: string, i: number) => (
                            <div key={i} style={{ ...T.innerCard, padding: '14px 18px', borderLeft: '3px solid #00F5A0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                              <CheckCircle2 size={14} style={{ color: '#00F5A0', marginTop: 2, flexShrink: 0 }} />
                              <span style={{ fontSize: 13, color: '#E8EDF5', lineHeight: 1.5 }}>{w}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                          <AlertTriangle size={16} style={{ color: '#FF6B35' }} />
                          <span style={{ ...T.syne, fontSize: 16, fontWeight: 700, color: '#FF6B35' }}>Blockers</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {(r.blockers || r.improvements || []).map((b: string, i: number) => (
                            <div key={i} style={{ ...T.innerCard, padding: '14px 18px', borderLeft: '3px solid #FF6B35', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                              <AlertTriangle size={14} style={{ color: '#FF6B35', marginTop: 2, flexShrink: 0 }} />
                              <span style={{ fontSize: 13, color: '#E8EDF5', lineHeight: 1.5 }}>{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Next Week Focus */}
                    <div style={T.card}>
                      <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Target size={17} style={{ color: '#00D9E8' }} />
                        <span style={{ ...T.syne, fontSize: 17, fontWeight: 700 }}>Next Week's Focus</span>
                      </div>
                      <div style={{ padding: '6px 24px 20px' }}>
                        {(r.nextWeekFocus || r.focusNextWeek || []).map((f: any, i: number) => (
                          <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: i < (r.nextWeekFocus || r.focusNextWeek || []).length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'flex-start' }}>
                            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(0,217,232,0.1)', color: '#00D9E8', display: 'flex', alignItems: 'center', justifyContent: 'center', ...T.mono, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                              {f.priority || (i + 1)}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{f.action}</div>
                                <span style={{ ...T.tag, background: 'rgba(255,255,255,0.05)', color: f.effort === 'High' ? '#FF6B35' : f.effort === 'Medium' ? '#FFB800' : '#00F5A0', fontSize: 9, padding: '2px 7px' }}>
                                  {f.effort}
                                </span>
                              </div>
                              <div style={{ fontSize: 12, color: '#6B7A91', lineHeight: 1.5 }}>{f.reason}</div>
                            </div>
                            <ChevronRight size={14} style={{ color: '#3A4A5E', flexShrink: 0, marginTop: 4 }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Investor Update Snippet */}
                    {(r.investorUpdateSnippet) && (
                      <div style={{ ...T.card, padding: 28, background: 'rgba(123,92,255,0.03)', border: '1px solid rgba(123,92,255,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Bot size={17} style={{ color: '#7B5CFF' }} />
                            <span style={{ ...T.syne, fontSize: 16, fontWeight: 700 }}>Investor Update Snippet</span>
                          </div>
                          <button
                            onClick={sendToPitchRoom}
                            disabled={pitchSaving || pitchSent}
                            style={{
                              ...T.btn, padding: '8px 16px', fontSize: 11,
                              background: pitchSent ? 'rgba(0,245,160,0.1)' : 'rgba(123,92,255,0.12)',
                              color: pitchSent ? '#00F5A0' : '#7B5CFF',
                              border: `1px solid ${pitchSent ? 'rgba(0,245,160,0.3)' : 'rgba(123,92,255,0.3)'}`,
                              opacity: pitchSaving ? 0.7 : 1,
                            }}
                          >
                            {pitchSent
                              ? <><CheckCircle2 size={13} /> Sent to Pitch Room!</>
                              : pitchSaving
                                ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                                : <><Send size={13} /> Send to Pitch Room</>
                            }
                          </button>
                        </div>
                        <div style={{ ...T.innerCard, padding: '18px 22px', fontSize: 14, color: '#A0ADBF', lineHeight: 1.8, fontStyle: 'italic', borderLeft: '3px solid #7B5CFF' }}>
                          "{r.investorUpdateSnippet}"
                        </div>
                        <p style={{ fontSize: 11, color: '#3A4A5E', marginTop: 10, ...T.mono }}>
                          Click "Send to Pitch Room" to append this snippet to your Pitch Room traction field.
                        </p>
                      </div>
                    )}

                  </div>
                )
              })() : (
                <div style={{ ...T.card, height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(0,245,160,0.06)', border: '1px solid rgba(0,245,160,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                    <FileText size={30} style={{ color: 'rgba(0,245,160,0.4)' }} />
                  </div>
                  <div style={{ ...T.syne, fontSize: 20, fontWeight: 700 }}>No report yet</div>
                  <div style={{ fontSize: 14, color: '#6B7A91', maxWidth: 300 }}>We auto-pull your milestones and experiments to generate a data-backed weekly brief.</div>
                  <button disabled={loading} onClick={generateReport} style={{ ...T.btn, ...T.btnGreen, marginTop: 8, opacity: loading ? 0.7 : 1 }}>
                    {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={14} />}
                    {loading ? 'Generating…' : 'Generate First Report'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&family=Space+Mono&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(0,245,160,0.2); border-radius: 2px; }
      `}</style>
    </div>
  )
}
