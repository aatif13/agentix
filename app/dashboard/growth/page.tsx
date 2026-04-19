'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { Target, TrendingUp, Plus, Calendar, Search, Mail, FileText, Zap, FlaskConical, Download, CheckSquare, Square, ChevronRight, BarChart3, Clock, ArrowRight, Share2, MessageSquare, AlertCircle, X, ChevronDown, ChevronUp, Globe, Hash, Rocket, BarChart2 } from 'lucide-react'
import { useSelectedProblem } from '@/lib/useSelectedProblem'
import EmptyState from '@/components/EmptyState'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Post { day: string; platform: string; topic: string; hook: string; cta: string }
interface CalendarWeek { week: number; theme: string; posts: Post[] }
interface Keyword { keyword: string; difficulty: 'Low' | 'Medium' | 'High'; intent: string; suggestedTitle: string }
interface ContentIdea { title: string; outline: string; targetKeyword: string }
interface EmailItem { emailNumber: number; subject: string; preview: string; goal: string; body: string; cta: string }
interface ProductHunt { tagline: string; description: string; topics: string[]; launchDayChecklist: string[] }
interface GrowthMetric { metric: string; target: string; howToTrack: string; frequency: string }
interface GrowthPlanData {
  contentCalendar: CalendarWeek[]
  seoStrategy: { primaryKeywords: Keyword[]; contentIdeas: ContentIdea[]; quickWins: string[] }
  emailSequence: EmailItem[]
  launchPlan: { productHunt: ProductHunt; week1Actions: string[]; week2Actions: string[]; week3Actions: string[]; week4Actions: string[] }
  growthMetrics: GrowthMetric[]
}
interface SavedPlan {
  _id: string
  productName: string
  targetAudience: string
  growthGoal: string
  channels: string[]
  plan: GrowthPlanData
  createdAt: string
}

// ── Constants ─────────────────────────────────────────────────────────────────
const GOALS = ['Get First 100 Users', 'Increase MRR', 'Launch on ProductHunt', 'Build SEO Traffic', 'Grow Email List']
const CHANNELS = ['Twitter', 'LinkedIn', 'Reddit', 'ProductHunt', 'Email', 'SEO/Blog', 'Instagram', 'YouTube']
const TABS = [
  { id: 'calendar', label: '📅 Content Calendar' },
  { id: 'seo', label: '🔍 SEO Strategy' },
  { id: 'email', label: '📧 Email Sequence' },
  { id: 'launch', label: '🚀 Launch Plan' },
  { id: 'metrics', label: '📊 Metrics' },
]

const PLATFORM_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Twitter: { bg: 'rgba(0,217,232,0.12)', color: '#00D9E8', border: 'rgba(0,217,232,0.25)' },
  LinkedIn: { bg: 'rgba(99,102,241,0.12)', color: '#818CF8', border: 'rgba(99,102,241,0.25)' },
  Reddit: { bg: 'rgba(255,107,53,0.12)', color: '#FF6B35', border: 'rgba(255,107,53,0.25)' },
  ProductHunt: { bg: 'rgba(255,184,0,0.12)', color: '#FFB800', border: 'rgba(255,184,0,0.25)' },
  Email: { bg: 'rgba(0,245,160,0.12)', color: '#00F5A0', border: 'rgba(0,245,160,0.25)' },
  default: { bg: 'rgba(255,255,255,0.06)', color: '#A0ADBF', border: 'rgba(255,255,255,0.1)' },
}
const DIFFICULTY_COLORS: Record<string, { bg: string; color: string }> = {
  Low: { bg: 'rgba(0,245,160,0.12)', color: '#00F5A0' },
  Medium: { bg: 'rgba(255,184,0,0.12)', color: '#FFB800' },
  High: { bg: 'rgba(255,107,53,0.12)', color: '#FF6B35' },
}

// ── Inline style tokens ───────────────────────────────────────────────────────
const T = {
  page: { display: 'flex', minHeight: '100vh', background: '#060A0F', color: '#E8EDF5', fontFamily: "'DM Sans', sans-serif" } as React.CSSProperties,
  main: { flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden', marginLeft: 'var(--sidebar-w)' },
  body: { flex: 1, overflowY: 'auto' as const, padding: '32px' },
  card: { background: '#0C1018', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6 } as React.CSSProperties,
  innerCard: { background: '#060A0F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 5 } as React.CSSProperties,
  input: { width: '100%', background: '#060A0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '10px 14px', color: '#E8EDF5', fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' as const, transition: 'border-color 0.2s' },
  label: { display: 'block', fontSize: 11, color: '#6B7A91', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 8 },
  btn: { padding: '10px 22px', borderRadius: 4, border: 'none', cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
  btnGreen: { background: '#00F5A0', color: '#060A0F' },
  btnOutline: { background: 'transparent', color: '#6B7A91', border: '1px solid rgba(255,255,255,0.12)' },
  tag: { fontFamily: "'Space Mono', monospace", fontSize: 10, padding: '3px 10px', borderRadius: 3, letterSpacing: '0.06em', fontWeight: 700, display: 'inline-block' } as React.CSSProperties,
  mono: { fontFamily: "'Space Mono', monospace" },
  syne: { fontFamily: "'Syne', sans-serif" },
}

// ── Helper Sub-components ─────────────────────────────────────────────────────
function PlatformBadge({ platform }: { platform: string }) {
  const c = PLATFORM_COLORS[platform] || PLATFORM_COLORS.default
  return (
    <span style={{ ...T.tag, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {platform}
    </span>
  )
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const c = DIFFICULTY_COLORS[difficulty] || { bg: 'rgba(255,255,255,0.06)', color: '#A0ADBF' }
  return <span style={{ ...T.tag, background: c.bg, color: c.color }}>{difficulty}</span>
}

function EmailCard({ email }: { email: EmailItem }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{ ...T.card, padding: 24, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span style={{ ...T.tag, background: 'rgba(0,217,232,0.12)', color: '#00D9E8', border: '1px solid rgba(0,217,232,0.2)' }}>
              Email #{email.emailNumber}
            </span>
            <span style={{ ...T.tag, background: 'rgba(0,245,160,0.08)', color: '#00F5A0', border: '1px solid rgba(0,245,160,0.15)' }}>
              {email.goal}
            </span>
          </div>
          <div style={{ ...T.syne, fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{email.subject}</div>
          <div style={{ fontSize: 13, color: '#6B7A91', fontStyle: 'italic', marginBottom: 12 }}>{email.preview}</div>
          {expanded && (
            <div style={{ ...T.innerCard, padding: 16, fontSize: 13, color: '#A0ADBF', lineHeight: 1.8, whiteSpace: 'pre-line', marginBottom: 12 }}>
              {email.body}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{ ...T.btn, ...T.btnOutline, padding: '6px 14px', fontSize: 11 }}
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {expanded ? 'Collapse' : 'View Body'}
            </button>
            <span style={{ ...T.tag, background: 'rgba(255,184,0,0.1)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.2)' }}>
              CTA: {email.cta}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckItem({ text }: { text: string }) {
  const [checked, setChecked] = useState(false)
  return (
    <div
      onClick={() => setChecked(!checked)}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'opacity 0.2s', opacity: checked ? 0.45 : 1 }}
    >
      <div style={{ flexShrink: 0, marginTop: 1 }}>
        {checked
          ? <CheckSquare size={16} style={{ color: '#00F5A0' }} />
          : <Square size={16} style={{ color: '#6B7A91' }} />}
      </div>
      <span style={{ fontSize: 13, lineHeight: 1.6, textDecoration: checked ? 'line-through' : 'none', color: checked ? '#6B7A91' : '#E8EDF5' }}>{text}</span>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function GrowthEnginePage() {
  useSession()

  // Form state
  const [productName, setProductName] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [growthGoal, setGrowthGoal] = useState(GOALS[0])
  const [channels, setChannels] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState('')
  const [strategy, setStrategy] = useState('')

  // Results state
  const [activePlan, setActivePlan] = useState<GrowthPlanData | null>(null)
  const [activePlanMeta, setActivePlanMeta] = useState<{ productName: string; growthGoal: string; channels: string[] } | null>(null)
  const { problem } = useSelectedProblem()
  const [activeTab, setActiveTab] = useState('calendar')
  const [showForm, setShowForm] = useState(false)

  // Past plans
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([])

  useEffect(() => {
    fetch('/api/growth/plans')
      .then(r => r.json())
      .then(d => {
        const plans = d.plans || []
        setSavedPlans(plans)
        if (plans.length > 0 && !activePlan) {
          setActivePlan(plans[0].plan)
          setActivePlanMeta({ productName: plans[0].productName, growthGoal: plans[0].growthGoal, channels: plans[0].channels })
        }
      })
      .catch(() => { })
  }, [])

  const toggleChannel = (ch: string) =>
    setChannels(prev => prev.includes(ch) ? prev.filter(x => x !== ch) : [...prev, ch])

  const handleGenerate = async () => {
    if (!problem) return
    setLoading(true)
    setError('')
    setStrategy('')
    try {
      const res = await fetch('/api/growth/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemStatement: problem.title })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setStrategy(data.strategy)
    } catch (err) {
      setError('Failed to generate strategy. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isFormView = !activePlan || showForm

  return (
    <div style={T.page}>
      <Sidebar />
      <div style={T.main}>
        <TopBar title="Growth Engine" subtitle="AI-powered growth strategy" />
        <div style={T.body}>
          {problem && (
            <div style={{ background: 'rgba(0,245,160,0.05)', border: '1px solid rgba(0,245,160,0.2)', borderRadius: 4, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ background: '#00F5A0', color: '#060A0F', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#E8EDF5' }}>Growth Strategy for problem: <span style={{ color: '#00F5A0' }}>{problem.title}</span></p>
                <p style={{ fontSize: 11, color: '#6B7A91', marginTop: 2 }}>Contextual growth tactics will be tailored to this specific problem and audience.</p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

            {/* ── LEFT SIDEBAR ── */}
            <div style={{ width: 240, flexShrink: 0 }}>
              <button
                onClick={() => { setShowForm(true); setError('') }}
                style={{ ...T.btn, ...T.btnGreen, width: '100%', justifyContent: 'center', marginBottom: 20, padding: '12px 16px' }}
              >
                <Plus size={15} />
                New Plan
              </button>

              {savedPlans.length > 0 && (
                <div>
                  <div style={{ ...T.label, marginBottom: 12 }}>Saved Plans</div>
                  {savedPlans.map(p => (
                    <button
                      key={p._id}
                      onClick={() => { setActivePlan(p.plan); setActivePlanMeta({ productName: p.productName, growthGoal: p.growthGoal, channels: p.channels }); setShowForm(false); setActiveTab('calendar') }}
                      style={{
                        ...T.card,
                        width: '100%', textAlign: 'left', padding: '14px 16px', marginBottom: 10,
                        cursor: 'pointer', border: activePlanMeta?.productName === p.productName ? '1px solid rgba(0,245,160,0.35)' : '1px solid rgba(255,255,255,0.07)',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#E8EDF5', marginBottom: 6, lineHeight: 1.4 }}>{p.productName}</div>
                      <div style={{ ...T.tag, background: 'rgba(0,245,160,0.08)', color: '#00F5A0', border: '1px solid rgba(0,245,160,0.15)', marginBottom: 8, fontSize: 9 }}>
                        {p.growthGoal}
                      </div>
                      <div style={{ fontSize: 11, color: '#6B7A91', marginTop: 4 }}>
                        {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

              {/* ── MAIN AREA ── */}
              <div style={{ flex: 1, minWidth: 0 }}>

                {/* ── FORM/EMPTY STATE ── */}
                {isFormView && (
                  <div style={{ ...T.card, padding: 40, width: '100%' }}>
                    {!problem ? (
                      <EmptyState
                        icon={Target}
                        title="No problem selected"
                        description="Please select a problem in the Problem Finder first to generate a growth strategy."
                        action={{ label: 'Go to Problem Finder', onClick: () => window.location.href = '/dashboard/problem-finder' }}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
                        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(0,245,160,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,245,160,0.2)', margin: '0 auto 24px' }}>
                          <TrendingUp size={32} style={{ color: '#00F5A0' }} />
                        </div>
                        <h2 style={{ ...T.syne, fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Build Your Growth Plan</h2>
                        <p style={{ fontSize: 14, color: '#6B7A91', lineHeight: 1.6, marginBottom: 32 }}>
                          We will generate a multi-channel growth strategy, content calendar, and SEO playbook tailored for: <br/>
                          <strong style={{ color: '#00F5A0' }}>"{problem.title}"</strong>
                        </p>

                        {loading ? (
                          <div style={{ padding: '16px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 }}>
                              <Zap size={14} style={{ color: '#00F5A0', animation: 'pulse 1s ease-in-out infinite' }} />
                              <span style={{ fontSize: 13, color: '#00F5A0', ...T.mono }}>Generating Strategy…</span>
                            </div>
                            <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ height: '100%', background: 'linear-gradient(90deg, #00F5A0, #00D9E8)', borderRadius: 2, animation: 'growProgress 2s linear infinite' }} />
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={handleGenerate}
                            style={{ ...T.btn, ...T.btnGreen, width: '100%', justifyContent: 'center', padding: '16px 24px', fontSize: 14 }}
                          >
                            <Zap size={18} />
                            Generate Growth Strategy ⚡
                          </button>
                        )}

                        {error && (
                          <div style={{ marginTop: 20, padding: 12, background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 6, color: '#FF6B35', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                             <AlertCircle size={15} /> {error}
                          </div>
                        )}

                        {strategy && (
                          <div style={{ marginTop: 32, textAlign: 'left' }}>
                            <div style={{ ...T.label, marginBottom: 12 }}>Your Growth Strategy</div>
                            <div style={{ ...T.card, background: 'rgba(0,245,160,0.03)', border: '1px solid rgba(0,245,160,0.15)', padding: 24 }}>
                               <pre style={{ whiteSpace: 'pre-wrap', fontSize: 14, color: '#A0ADBF', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                                 {strategy}
                               </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

              {/* ── RESULTS STATE ── */}
              {!isFormView && activePlan && activePlanMeta && (
                <div>
                  {/* Results Header */}
                  <div style={{ ...T.card, padding: '20px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ ...T.syne, fontSize: 22, fontWeight: 800 }}>{activePlanMeta.productName}</div>
                        <span style={{ ...T.tag, background: 'rgba(0,245,160,0.1)', color: '#00F5A0', border: '1px solid rgba(0,245,160,0.2)' }}>
                          {activePlanMeta.growthGoal}
                        </span>
                      </div>
                      {activePlanMeta.channels.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                          {activePlanMeta.channels.map(ch => (
                            <PlatformBadge key={ch} platform={ch} />
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => { setShowForm(true); setError('') }}
                      style={{ ...T.btn, ...T.btnOutline, flexShrink: 0 }}
                    >
                      <Plus size={14} />
                      New Plan
                    </button>
                  </div>

                  {/* Tabs */}
                  <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 0 }}>
                    {TABS.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                          padding: '12px 18px', background: 'none', border: 'none',
                          borderBottom: `2px solid ${activeTab === tab.id ? '#00F5A0' : 'transparent'}`,
                          color: activeTab === tab.id ? '#00F5A0' : '#6B7A91',
                          fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                          fontFamily: "'DM Sans', sans-serif", fontWeight: activeTab === tab.id ? 600 : 400,
                          marginBottom: -1, whiteSpace: 'nowrap',
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* ── TAB 1: Content Calendar ── */}
                  {activeTab === 'calendar' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                      {(activePlan.contentCalendar || []).map(week => (
                        <div key={week.week} style={T.card}>
                          <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,245,160,0.12)', border: '1px solid rgba(0,245,160,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#00F5A0', fontFamily: "'Space Mono', monospace", flexShrink: 0 }}>
                              W{week.week}
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: '#6B7A91', ...T.mono, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Week {week.week}</div>
                              <div style={{ ...T.syne, fontSize: 16, fontWeight: 700, marginTop: 2 }}>{week.theme}</div>
                            </div>
                          </div>
                          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {(week.posts || []).map((post, i) => (
                              <div key={i} style={{ ...T.innerCard, padding: '16px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                  <span style={{ ...T.tag, background: 'rgba(255,255,255,0.06)', color: '#A0ADBF', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    {post.day}
                                  </span>
                                  <PlatformBadge platform={post.platform} />
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#E8EDF5', marginBottom: 8 }}>{post.topic}</div>
                                <div style={{ fontSize: 13, color: '#A0ADBF', lineHeight: 1.7, marginBottom: 10, fontStyle: 'italic' }}>"{post.hook}"</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontSize: 11, color: '#6B7A91', ...T.mono }}>CTA:</span>
                                  <span style={{ fontSize: 12, color: '#00D9E8' }}>{post.cta}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── TAB 2: SEO Strategy ── */}
                  {activeTab === 'seo' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                      {/* Primary Keywords */}
                      <div style={T.card}>
                        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Search size={16} style={{ color: '#00D9E8' }} />
                          <span style={{ ...T.syne, fontSize: 16, fontWeight: 700 }}>Primary Keywords</span>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                {['Keyword', 'Difficulty', 'Intent', 'Suggested Title'].map(h => (
                                  <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 10, color: '#6B7A91', ...T.mono, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(activePlan.seoStrategy?.primaryKeywords || []).map((kw, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                  <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#E8EDF5' }}>{kw.keyword}</td>
                                  <td style={{ padding: '14px 20px' }}><DifficultyBadge difficulty={kw.difficulty} /></td>
                                  <td style={{ padding: '14px 20px', fontSize: 12, color: '#A0ADBF' }}>{kw.intent}</td>
                                  <td style={{ padding: '14px 20px', fontSize: 12, color: '#6B7A91', maxWidth: 320 }}>{kw.suggestedTitle}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Content Ideas */}
                      <div style={T.card}>
                        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Globe size={16} style={{ color: '#00F5A0' }} />
                          <span style={{ ...T.syne, fontSize: 16, fontWeight: 700 }}>Content Ideas</span>
                        </div>
                        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                          {(activePlan.seoStrategy?.contentIdeas || []).map((idea, i) => (
                            <div key={i} style={{ ...T.innerCard, padding: '18px 20px' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                                <div style={{ ...T.syne, fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>{idea.title}</div>
                                <span style={{ ...T.tag, background: 'rgba(0,217,232,0.1)', color: '#00D9E8', border: '1px solid rgba(0,217,232,0.2)', flexShrink: 0 }}>
                                  {idea.targetKeyword}
                                </span>
                              </div>
                              <div style={{ fontSize: 13, color: '#6B7A91', lineHeight: 1.7 }}>{idea.outline}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quick Wins */}
                      <div style={T.card}>
                        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Zap size={16} style={{ color: '#FFB800' }} />
                          <span style={{ ...T.syne, fontSize: 16, fontWeight: 700 }}>Quick Wins</span>
                        </div>
                        <div style={{ padding: '12px 24px 20px' }}>
                          {(activePlan.seoStrategy?.quickWins || []).map((win, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: i < (activePlan.seoStrategy?.quickWins?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,184,0,0.12)', border: '1px solid rgba(255,184,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#FFB800', ...T.mono, flexShrink: 0, marginTop: 1 }}>
                                {i + 1}
                              </div>
                              <span style={{ fontSize: 13, lineHeight: 1.7, color: '#E8EDF5' }}>{win}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── TAB 3: Email Sequence ── */}
                  {activeTab === 'email' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <Mail size={16} style={{ color: '#00F5A0' }} />
                        <span style={{ fontSize: 14, color: '#6B7A91' }}>
                          {activePlan.emailSequence?.length || 0}-email automated nurture sequence — click any card to expand the body
                        </span>
                      </div>
                      {(activePlan.emailSequence || []).map(email => (
                        <EmailCard key={email.emailNumber} email={email} />
                      ))}
                    </div>
                  )}

                  {/* ── TAB 4: Launch Plan ── */}
                  {activeTab === 'launch' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {/* ProductHunt Card */}
                      <div style={T.card}>
                        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Rocket size={16} style={{ color: '#FF6B35' }} />
                          <span style={{ ...T.syne, fontSize: 16, fontWeight: 700 }}>ProductHunt Strategy</span>
                          <span style={{ ...T.tag, background: 'rgba(255,107,53,0.1)', color: '#FF6B35', border: '1px solid rgba(255,107,53,0.2)', marginLeft: 4 }}>PH</span>
                        </div>
                        <div style={{ padding: 24 }}>
                          <div style={{ marginBottom: 20 }}>
                            <div style={{ ...T.label, marginBottom: 6 }}>Tagline</div>
                            <div style={{ ...T.syne, fontSize: 18, fontWeight: 700, color: '#E8EDF5' }}>{activePlan.launchPlan?.productHunt?.tagline}</div>
                          </div>
                          <div style={{ marginBottom: 20 }}>
                            <div style={{ ...T.label, marginBottom: 8 }}>Description</div>
                            <div style={{ fontSize: 13, color: '#A0ADBF', lineHeight: 1.8 }}>{activePlan.launchPlan?.productHunt?.description}</div>
                          </div>
                          <div style={{ marginBottom: 24 }}>
                            <div style={{ ...T.label, marginBottom: 10 }}>Topics</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {(activePlan.launchPlan?.productHunt?.topics || []).map(t => (
                                <span key={t} style={{ ...T.tag, background: 'rgba(99,102,241,0.1)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.2)' }}>#{t}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div style={{ ...T.label, marginBottom: 12 }}>Launch Day Checklist</div>
                            <div style={{ ...T.innerCard, padding: '4px 16px' }}>
                              {(activePlan.launchPlan?.productHunt?.launchDayChecklist || []).map((item, i) => (
                                <CheckItem key={i} text={item} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Week-by-week actions */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                        {[
                          { label: 'Week 1', color: '#00F5A0', bg: 'rgba(0,245,160,0.08)', actions: activePlan.launchPlan?.week1Actions },
                          { label: 'Week 2', color: '#00D9E8', bg: 'rgba(0,217,232,0.08)', actions: activePlan.launchPlan?.week2Actions },
                          { label: 'Week 3', color: '#FFB800', bg: 'rgba(255,184,0,0.08)', actions: activePlan.launchPlan?.week3Actions },
                          { label: 'Week 4', color: '#818CF8', bg: 'rgba(129,140,248,0.08)', actions: activePlan.launchPlan?.week4Actions },
                        ].map(({ label, color, bg, actions }) => (
                          <div key={label} style={{ ...T.card, padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                              <span style={{ ...T.syne, fontSize: 15, fontWeight: 700, color }}>{label}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                              {(actions || []).map((action, i) => (
                                <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < (actions?.length ?? 0) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                  <div style={{ width: 20, height: 20, borderRadius: 4, background: bg, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color, fontWeight: 700, ...T.mono, flexShrink: 0 }}>
                                    {i + 1}
                                  </div>
                                  <span style={{ fontSize: 13, lineHeight: 1.6, color: '#A0ADBF' }}>{action}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── TAB 5: Metrics ── */}
                  {activeTab === 'metrics' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <BarChart2 size={16} style={{ color: '#818CF8' }} />
                        <span style={{ fontSize: 14, color: '#6B7A91' }}>Track these metrics to measure growth systematically</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                        {(activePlan.growthMetrics || []).map((m, i) => (
                          <div key={i} style={{ ...T.card, padding: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                              <div style={{ ...T.syne, fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: '#E8EDF5' }}>{m.metric}</div>
                              <span style={{ ...T.tag, background: 'rgba(129,140,248,0.1)', color: '#818CF8', border: '1px solid rgba(129,140,248,0.2)', flexShrink: 0 }}>
                                {m.frequency}
                              </span>
                            </div>
                            <div style={{ ...T.innerCard, padding: '10px 14px', marginBottom: 12 }}>
                              <div style={{ fontSize: 10, color: '#6B7A91', ...T.mono, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Target</div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#00F5A0' }}>{m.target}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 10, color: '#6B7A91', ...T.mono, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>How to Track</div>
                              <div style={{ fontSize: 13, color: '#A0ADBF', lineHeight: 1.6 }}>{m.howToTrack}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        select option { background: #0C1018; color: #E8EDF5; }
        @keyframes growProgress { from { width: 0% } to { width: 100% } }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #060A0F; }
        ::-webkit-scrollbar-thumb { background: rgba(0,245,160,0.25); border-radius: 2px; }
        textarea { resize: vertical; }
      `}</style>
    </div>
  )
}
