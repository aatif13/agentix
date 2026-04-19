'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { useSelectedProblem } from '@/lib/useSelectedProblem'
import {
  Rocket, Zap, Building2, Target, DollarSign, Users,
  CheckCircle, ChevronRight, Eye, EyeOff, Sparkles,
  FileText, Globe, Send, AlertCircle, Loader2, Pencil,
  TrendingUp, BarChart3, Lightbulb, ShieldCheck,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface PitchFormData {
  startupName: string
  tagline: string
  stage: 'idea' | 'mvp' | 'revenue' | 'scaling'
  industry: string
  targetMarket: string
  problemStatement: string
  solution: string
  uniqueValueProposition: string
  businessModel: string
  traction: string
  teamDetails: string
  fundingAsk: string
  useOfFunds: string
  founderEmail: string
  investorReport: string
  isPublic: boolean
  viewCount: number
}

const DEFAULT_FORM: PitchFormData = {
  startupName: '',
  tagline: '',
  stage: 'idea',
  industry: '',
  targetMarket: '',
  problemStatement: '',
  solution: '',
  uniqueValueProposition: '',
  businessModel: '',
  traction: '',
  teamDetails: '',
  fundingAsk: '',
  useOfFunds: '',
  founderEmail: '',
  investorReport: '',
  isPublic: false,
  viewCount: 0,
}

const STAGES = [
  { value: 'idea', label: 'Idea', desc: 'Pre-product, validating the concept' },
  { value: 'mvp', label: 'MVP', desc: 'Product built, collecting early feedback' },
  { value: 'revenue', label: 'Revenue', desc: 'Generating first paying customers' },
  { value: 'scaling', label: 'Scaling', desc: 'Growing a proven business model' },
]

const STEPS = [
  { id: 1, label: 'Startup Details', icon: Building2 },
  { id: 2, label: 'Investor Report', icon: FileText },
  { id: 3, label: 'Publish', icon: Rocket },
]

// ── Inline style tokens ────────────────────────────────────────────────────────
const T = {
  page: { display: 'flex', minHeight: '100vh', background: '#060A0F', color: '#E8EDF5', fontFamily: "'DM Sans', sans-serif" } as React.CSSProperties,
  main: { flex: 1, display: 'flex', flexDirection: 'column' as const, marginLeft: 'var(--sidebar-w)', overflow: 'hidden' },
  body: { flex: 1, overflowY: 'auto' as const, padding: '32px', maxWidth: 900, margin: '0 auto', width: '100%' },
  card: { background: '#0C1018', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8 } as React.CSSProperties,
  innerCard: { background: '#060A0F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6 } as React.CSSProperties,
  label: { display: 'block', fontSize: 11, color: '#6B7A91', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 8 },
  input: { width: '100%', background: '#060A0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '11px 14px', color: '#E8EDF5', fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' as const, transition: 'border-color 0.2s' },
  textarea: { width: '100%', background: '#060A0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '11px 14px', color: '#E8EDF5', fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', resize: 'vertical' as const, minHeight: 110, boxSizing: 'border-box' as const, transition: 'border-color 0.2s', lineHeight: 1.6 },
  btn: { padding: '11px 24px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
  btnGreen: { background: '#00F5A0', color: '#060A0F' },
  btnOutline: { background: 'transparent', color: '#6B7A91', border: '1px solid rgba(255,255,255,0.12)' },
  btnDanger: { background: 'rgba(255,107,53,0.1)', color: '#FF6B35', border: '1px solid rgba(255,107,53,0.2)' },
  tag: { fontFamily: "'Space Mono', monospace", fontSize: 10, padding: '3px 10px', borderRadius: 4, letterSpacing: '0.06em', fontWeight: 700, display: 'inline-block' } as React.CSSProperties,
  mono: { fontFamily: "'Space Mono', monospace" },
  syne: { fontFamily: "'Syne', sans-serif" },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 } as React.CSSProperties,
}

// ── Field helper ──────────────────────────────────────────────────────────────
function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={T.label}>
        {label}{required && <span style={{ color: '#00F5A0', marginLeft: 4 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 40 }}>
      {STEPS.map((step, i) => {
        const StepIcon = step.icon
        const isActive = current === step.id
        const isDone = current > step.id
        const color = isDone ? '#00F5A0' : isActive ? '#00F5A0' : '#2A3544'
        const textColor = isActive ? '#00F5A0' : isDone ? '#00F5A0' : '#6B7A91'
        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: isActive ? 'rgba(0,245,160,0.12)' : isDone ? 'rgba(0,245,160,0.08)' : 'rgba(255,255,255,0.04)',
                border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s',
                boxShadow: isActive ? '0 0 20px rgba(0,245,160,0.25)' : 'none',
              }}>
                {isDone
                  ? <CheckCircle size={20} style={{ color: '#00F5A0' }} />
                  : <StepIcon size={20} style={{ color: isActive ? '#00F5A0' : '#6B7A91' }} />
                }
              </div>
              <span style={{ ...T.mono, fontSize: 10, color: textColor, whiteSpace: 'nowrap', letterSpacing: '0.06em', fontWeight: 700 }}>
                STEP {step.id}
              </span>
              <span style={{ fontSize: 12, color: textColor, fontWeight: isActive ? 600 : 400, textAlign: 'center', maxWidth: 90 }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width: 80, height: 2, margin: '0 8px', marginBottom: 36,
                background: current > step.id
                  ? 'linear-gradient(90deg, #00F5A0, rgba(0,245,160,0.3))'
                  : 'rgba(255,255,255,0.06)',
                borderRadius: 1, transition: 'background 0.4s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, color = '#00F5A0' }: { icon: React.ElementType; title: string; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: `${color}14`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={17} style={{ color }} />
      </div>
      <span style={{ ...T.syne, fontSize: 17, fontWeight: 700 }}>{title}</span>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PitchRoomPage() {
  const { data: session } = useSession()
  const { problem } = useSelectedProblem()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<PitchFormData>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [stats, setStats] = useState({ viewCount: 0, watchlistCount: 0, interestCount: 0, recentActivity: [] as any[] })
  const [isPublished, setIsPublished] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [pitchId, setPitchId] = useState('')

  // ── Load existing pitch on mount
  useEffect(() => {
    fetch('/api/pitch-room')
      .then(r => r.json())
      .then(d => {
        if (d.pitch) {
          setPitchId(d.pitch._id)
          setForm(prev => ({
            ...prev,
            startupName: d.pitch.startupName || '',
            tagline: d.pitch.tagline || '',
            stage: d.pitch.stage || 'idea',
            industry: d.pitch.industry || '',
            targetMarket: d.pitch.targetMarket || '',
            problemStatement: d.pitch.problemStatement || '',
            solution: d.pitch.solution || '',
            uniqueValueProposition: d.pitch.uniqueValueProposition || '',
            businessModel: d.pitch.businessModel || '',
            traction: d.pitch.traction || '',
            teamDetails: d.pitch.teamDetails || '',
            fundingAsk: d.pitch.fundingAsk ? String(d.pitch.fundingAsk) : '',
            useOfFunds: d.pitch.useOfFunds || '',
            founderEmail: d.pitch.founderEmail || '',
            investorReport: d.pitch.investorReport || '',
            isPublic: d.pitch.isPublic || false,
            viewCount: d.pitch.viewCount || 0,
          }))
          
          if (d.pitch.isPublic) {
            setIsPublished(true)
            fetchStats() // Fetch detailed stats if public
          } else if (d.pitch.investorReport) {
            setStep(3)
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingData(false))
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/pitch-room/stats')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats', err)
    }
  }

  // ── Auto-fill problem statement from selected problem
  useEffect(() => {
    if (problem && !form.problemStatement) {
      setForm(prev => ({
        ...prev,
        problemStatement: `${problem.title}\n\nAffected Group: ${problem.affectedGroup}\nReason: ${problem.reason}`,
        targetMarket: prev.targetMarket || problem.affectedGroup,
        industry: prev.industry || problem.domain,
      }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem])

  // ── Auto-fill email from session
  useEffect(() => {
    if (session?.user?.email && !form.founderEmail) {
      setForm(prev => ({ ...prev, founderEmail: prev.founderEmail || session.user?.email || '' }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  const set = (key: keyof PitchFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const saveDraft = useCallback(async (data: Partial<PitchFormData>) => {
    setSaving(true)
    try {
      await fetch('/api/pitch-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, fundingAsk: Number(data.fundingAsk) || 0 }),
      })
    } catch { /* silent */ }
    finally { setSaving(false) }
  }, [])

  // ── Step 1 → Step 2: validate & save draft
  const goToStep2 = async () => {
    if (!form.startupName.trim()) { setError('Startup Name is required'); return }
    if (!form.problemStatement.trim()) { setError('Problem Statement is required'); return }
    if (!form.solution.trim()) { setError('Solution is required'); return }
    setError('')
    await saveDraft(form)
    setStep(2)
    window.scrollTo(0, 0)
  }

  // ── Generate AI Investor Report
  const generateReport = async () => {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/pitch-room/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, fundingAsk: Number(form.fundingAsk) || 0 }),
      })
      const data = await res.json()
      if (data.investorReport) {
        setForm(prev => ({ ...prev, investorReport: data.investorReport }))
        // Save report to DB immediately
        await fetch('/api/pitch-room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ investorReport: data.investorReport }),
        })
      } else {
        setError('Failed to generate report. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection.')
    }
    setGenerating(false)
  }

  // ── Step 2 → Step 3
  const goToStep3 = async () => {
    if (!form.investorReport.trim()) { setError('Please generate an investor report first.'); return }
    setError('')
    // Save the (possibly edited) report
    await saveDraft({ investorReport: form.investorReport })
    setStep(3)
    window.scrollTo(0, 0)
  }

  // ── Final publish
  const publish = async () => {
    setPublishing(true)
    setError('')
    try {
      const res = await fetch('/api/pitch-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, fundingAsk: Number(form.fundingAsk) || 0 }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess(true)
        setIsPublished(true)
        setIsEditMode(false)
        if (data.pitch?._id) setPitchId(data.pitch._id)
        fetchStats()
        window.scrollTo(0, 0)
      } else {
        setError('Failed to publish. Please try again.')
      }
    } catch {
      setError('Network error.')
    }
    setPublishing(false)
  }

  const stageBadgeStyle = (s: string) => ({
    ...T.tag,
    background: s === form.stage ? 'rgba(0,245,160,0.15)' : 'rgba(255,255,255,0.04)',
    color: s === form.stage ? '#00F5A0' : '#6B7A91',
    border: `1px solid ${s === form.stage ? 'rgba(0,245,160,0.4)' : 'rgba(255,255,255,0.08)'}`,
    cursor: 'pointer',
    padding: '7px 14px',
    borderRadius: 6,
    fontSize: 12,
    transition: 'all 0.2s',
  })

  if (loadingData) {
    return (
      <div style={T.page}>
        <Sidebar />
        <div style={T.main}>
          <TopBar title="Pitch Room" subtitle="Build your investor-ready profile" />
          <div style={{ ...T.body, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
            <div style={{ textAlign: 'center' }}>
              <Loader2 size={32} style={{ color: '#00F5A0', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ color: '#6B7A91', fontSize: 14 }}>Loading your pitch profile…</p>
            </div>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── Success screen
  if (success) {
    return (
      <div style={T.page}>
        <Sidebar />
        <div style={T.main}>
          <TopBar title="Pitch Room" subtitle="Build your investor-ready profile" />
          <div style={{ ...T.body, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 500 }}>
            <div style={{ textAlign: 'center', maxWidth: 500, animation: 'fadeUp 0.6s ease forwards' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(0,245,160,0.1)', border: '2px solid rgba(0,245,160,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 0 40px rgba(0,245,160,0.15)' }}>
                <CheckCircle size={40} style={{ color: '#00F5A0' }} />
              </div>
              <h2 style={{ ...T.syne, fontSize: 28, fontWeight: 800, marginBottom: 12 }}>✅ Your pitch is LIVE</h2>
              <p style={{ color: '#E8EDF5', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{form.startupName} is now visible to investors</p>
              
              <div style={{ display: 'flex', gap: 24, padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', margin: '24px 0', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                   <p style={{ fontSize: 20, fontWeight: 800, color: '#00F5A0' }}>{stats.viewCount}</p>
                   <p style={{ fontSize: 11, color: '#6B7A91', ...T.mono }}>VIEWS</p>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ textAlign: 'center' }}>
                   <p style={{ fontSize: 20, fontWeight: 800, color: '#FFB800' }}>{stats.watchlistCount}</p>
                   <p style={{ fontSize: 11, color: '#6B7A91', ...T.mono }}>SAVES</p>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ textAlign: 'center' }}>
                   <p style={{ fontSize: 20, fontWeight: 800, color: '#7B5CFF' }}>{stats.interestCount}</p>
                   <p style={{ fontSize: 11, color: '#6B7A91', ...T.mono }}>INTEREST</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => { setSuccess(false); setIsPublished(false); setIsEditMode(true); setStep(1) }} style={{ ...T.btn, ...T.btnGreen }}>
                  <Pencil size={14} /> Edit Pitch
                </button>
              </div>
            </div>
          </div>
        </div>
        <PitchRoomStyles />
      </div>
    )
  }

  // ── Published Dashboard View
  if (isPublished) {
    return (
      <div style={T.page}>
        <Sidebar />
        <div style={T.main}>
          <TopBar title="Pitch Dashboard" subtitle="Manage your public visibility and stats" />
          <div style={T.body}>
            <div style={{ ...T.card, padding: 40, textAlign: 'center', marginBottom: 30, background: 'linear-gradient(135deg, #0C1018 0%, #111827 100%)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
                 <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00F5A0', boxShadow: '0 0 10px #00F5A0' }} />
                 <span style={{ ...T.mono, fontSize: 12, color: '#00F5A0', fontWeight: 700 }}>PITCH IS LIVE</span>
               </div>
               <h1 style={{ ...T.syne, fontSize: 32, fontWeight: 800, marginBottom: 8 }}>{form.startupName}</h1>
               <p style={{ color: '#6B7A91', fontSize: 15, marginBottom: 32 }}>{form.tagline}</p>

               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 600, margin: '0 auto 40px' }}>
                  <div style={{ ...T.innerCard, padding: 24 }}>
                     <Eye size={24} style={{ color: '#00F5A0', marginBottom: 12 }} />
                     <p style={{ fontSize: 24, fontWeight: 800 }}>{stats.viewCount}</p>
                     <p style={{ fontSize: 10, color: '#6B7A91', ...T.mono }}>VIEWS</p>
                  </div>
                  <div style={{ ...T.innerCard, padding: 24 }}>
                     <Zap size={24} style={{ color: '#FFB800', marginBottom: 12 }} />
                     <p style={{ fontSize: 24, fontWeight: 800 }}>{stats.watchlistCount}</p>
                     <p style={{ fontSize: 10, color: '#6B7A91', ...T.mono }}>SAVES</p>
                  </div>
                  <div style={{ ...T.innerCard, padding: 24 }}>
                     <TrendingUp size={24} style={{ color: '#7B5CFF', marginBottom: 12 }} />
                     <p style={{ fontSize: 24, fontWeight: 800 }}>{stats.interestCount}</p>
                     <p style={{ fontSize: 10, color: '#6B7A91', ...T.mono }}>INTEREST</p>
                  </div>
               </div>

               <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                 <button onClick={() => { setIsPublished(false); setIsEditMode(true); setStep(1) }} style={{ ...T.btn, ...T.btnGreen }}>
                    <Pencil size={15} /> Edit Pitch
                 </button>
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
              <div style={{ ...T.card, padding: 32 }}>
                 <SectionHeader icon={TrendingUp} title="Recent Investor Activity" color="#00F5A0" />
                 {stats.recentActivity.length === 0 ? (
                   <p style={{ padding: '20px 0', color: '#6B7A91', textAlign: 'center', fontSize: 14 }}>No activity yet. Keep refining your pitch!</p>
                 ) : (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                     {stats.recentActivity.map((item, i) => (
                       <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 16, borderBottom: i < stats.recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                         <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.type === 'interest' ? '#7B5CFF' : '#00F5A0', marginTop: 5, flexShrink: 0 }} />
                         <div style={{ flex: 1 }}>
                           <p style={{ fontSize: 14, color: '#E8EDF5', marginBottom: 4 }}>
                             {item.type === 'interest' ? (
                               <><strong>{item.investorName}</strong> from {item.firmName} sent you a message</>
                             ) : (
                               <><strong>{item.investorName}</strong> from {item.firmName} viewed your pitch</>
                             )}
                           </p>
                           <p style={{ fontSize: 11, color: '#6B7A91', ...T.mono }}>
                             {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
              </div>

              <div style={{ ...T.card, padding: 32 }}>
                 <SectionHeader icon={ShieldCheck} title="Visibility Settings" color="#00D9E8" />
                 <p style={{ color: '#6B7A91', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
                   Your startup is currently discoverable by investors on the public deal flow feed.
                 </p>
                 <button onClick={() => { setIsPublished(false); setIsEditMode(true); setStep(3) }} style={{ ...T.btn, ...T.btnOutline, width: '100%', justifyContent: 'center' }}>
                   Manage Visibility
                 </button>
              </div>
            </div>
          </div>
        </div>
        <PitchRoomStyles />
      </div>
    )
  }

  return (
    <div style={T.page}>
      <Sidebar />
      <div style={T.main}>
        <TopBar title="Pitch Room" subtitle="Build your investor-ready profile" />
        <div style={{ padding: '32px', overflowY: 'auto' as const, flex: 1 }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>

            {/* Step Indicator */}
            <StepIndicator current={step} />

            {/* Saving indicator */}
            {saving && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: '#6B7A91', fontSize: 12, ...T.mono }}>
                <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
                Saving draft…
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', borderRadius: 6, padding: '12px 16px', marginBottom: 24, color: '#FF6B35', fontSize: 13 }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Problem context banner */}
            {problem && step === 1 && (
              <div style={{ background: 'rgba(0,245,160,0.04)', border: '1px solid rgba(0,245,160,0.18)', borderRadius: 8, padding: '14px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#00F5A0', color: '#060A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Target size={16} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700 }}>Pitching around: <span style={{ color: '#00F5A0' }}>{problem.title}</span></p>
                  <p style={{ fontSize: 11, color: '#6B7A91', marginTop: 2 }}>Problem statement has been auto-filled from your selected problem.</p>
                </div>
              </div>
            )}

            {/* ══════════════ STEP 1: Startup Details ══════════════ */}
            {step === 1 && (
              <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>
                <div style={{ ...T.card, padding: 32, marginBottom: 24 }}>
                  <SectionHeader icon={Building2} title="Core Startup Identity" />
                  <div style={T.grid2}>
                    <Field label="Startup Name" required>
                      <input id="startupName" style={T.input} value={form.startupName} onChange={set('startupName')} placeholder="e.g. Acme AI" className="pitch-input" />
                    </Field>
                    <Field label="Tagline">
                      <input id="tagline" style={T.input} value={form.tagline} onChange={set('tagline')} placeholder="One compelling sentence about your startup" className="pitch-input" />
                    </Field>
                  </div>
                  <Field label="Stage">
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {STAGES.map(s => (
                        <button key={s.value} type="button" onClick={() => setForm(prev => ({ ...prev, stage: s.value as PitchFormData['stage'] }))} style={stageBadgeStyle(s.value)}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize: 12, color: '#6B7A91', marginTop: 8 }}>
                      {STAGES.find(s => s.value === form.stage)?.desc}
                    </p>
                  </Field>
                  <div style={T.grid2}>
                    <Field label="Industry">
                      <input id="industry" style={T.input} value={form.industry} onChange={set('industry')} placeholder="e.g. HealthTech, EdTech, FinTech" className="pitch-input" />
                    </Field>
                    <Field label="Target Market">
                      <input id="targetMarket" style={T.input} value={form.targetMarket} onChange={set('targetMarket')} placeholder="e.g. SMBs in Southeast Asia" className="pitch-input" />
                    </Field>
                  </div>
                </div>

                <div style={{ ...T.card, padding: 32, marginBottom: 24 }}>
                  <SectionHeader icon={Lightbulb} title="Problem & Solution" color="#FFB800" />
                  <Field label="Problem Statement" required>
                    <textarea id="problemStatement" style={{ ...T.textarea, minHeight: 120 }} value={form.problemStatement} onChange={set('problemStatement')} placeholder="Describe the problem your startup solves. What pain point exists? Who suffers from it?" className="pitch-input" />
                  </Field>
                  <Field label="Solution" required>
                    <textarea id="solution" style={{ ...T.textarea, minHeight: 120 }} value={form.solution} onChange={set('solution')} placeholder="How does your product solve this problem? What's unique about your approach?" className="pitch-input" />
                  </Field>
                  <Field label="Unique Value Proposition">
                    <textarea id="uvp" style={T.textarea} value={form.uniqueValueProposition} onChange={set('uniqueValueProposition')} placeholder="Why would customers choose you over alternatives? What's your unfair advantage?" className="pitch-input" />
                  </Field>
                </div>

                <div style={{ ...T.card, padding: 32, marginBottom: 24 }}>
                  <SectionHeader icon={TrendingUp} title="Business & Traction" color="#7B5CFF" />
                  <Field label="Business Model">
                    <textarea id="businessModel" style={T.textarea} value={form.businessModel} onChange={set('businessModel')} placeholder="How do you make money? SaaS, marketplace, freemium, usage-based..." className="pitch-input" />
                  </Field>
                  <Field label="Traction & Metrics">
                    <textarea id="traction" style={T.textarea} value={form.traction} onChange={set('traction')} placeholder="Current numbers: users, MRR, growth rate, key partnerships, milestones..." className="pitch-input" />
                  </Field>
                </div>

                <div style={{ ...T.card, padding: 32, marginBottom: 24 }}>
                  <SectionHeader icon={DollarSign} title="Financials & Team" color="#00D9E8" />
                  <div style={T.grid2}>
                    <Field label="Team Details">
                      <textarea id="teamDetails" style={T.textarea} value={form.teamDetails} onChange={set('teamDetails')} placeholder="Founders, key hires, relevant experience, advisors..." className="pitch-input" />
                    </Field>
                    <div>
                      <Field label="Funding Ask ($)">
                        <input id="fundingAsk" type="number" style={T.input} value={form.fundingAsk} onChange={set('fundingAsk')} placeholder="e.g. 500000" className="pitch-input" />
                      </Field>
                      <Field label="Founder Email">
                        <input id="founderEmail" type="email" style={T.input} value={form.founderEmail} onChange={set('founderEmail')} placeholder="contact@yourstartup.com" className="pitch-input" />
                      </Field>
                    </div>
                  </div>
                  <Field label="Use of Funds">
                    <textarea id="useOfFunds" style={T.textarea} value={form.useOfFunds} onChange={set('useOfFunds')} placeholder="e.g. 40% product development, 35% marketing, 15% hiring, 10% operations" className="pitch-input" />
                  </Field>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={goToStep2} style={{ ...T.btn, ...T.btnGreen, padding: '13px 32px', fontSize: 13 }}>
                    Continue to AI Report <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════ STEP 2: Generate Report ══════════════ */}
            {step === 2 && (
              <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>
                <div style={{ ...T.card, padding: 32, marginBottom: 24 }}>
                  <SectionHeader icon={Sparkles} title="AI Investor Report Generator" color="#7B5CFF" />

                  <p style={{ color: '#6B7A91', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                    Our AI will analyze your startup details and generate a professional investor report structured for VC and angel investors.
                    You can edit the report before publishing.
                  </p>

                  {!form.investorReport && !generating && (
                    <button
                      id="generateReportBtn"
                      onClick={generateReport}
                      style={{ ...T.btn, ...T.btnGreen, width: '100%', justifyContent: 'center', padding: '16px 24px', fontSize: 14, borderRadius: 8 }}
                    >
                      <Sparkles size={18} /> Generate AI Investor Report
                    </button>
                  )}

                  {generating && (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
                        <Loader2 size={20} style={{ color: '#00F5A0', animation: 'spin 1s linear infinite' }} />
                        <span style={{ ...T.mono, fontSize: 13, color: '#00F5A0' }}>Generating your investor report…</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', maxWidth: 400, margin: '0 auto' }}>
                        <div style={{ height: '100%', background: 'linear-gradient(90deg, #00F5A0, #7B5CFF)', borderRadius: 2, animation: 'reportProgress 8s linear forwards' }} />
                      </div>
                      <p style={{ fontSize: 12, color: '#6B7A91', marginTop: 12 }}>This usually takes 8–15 seconds…</p>
                    </div>
                  )}

                  {form.investorReport && !generating && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CheckCircle size={16} style={{ color: '#00F5A0' }} />
                          <span style={{ fontSize: 13, color: '#00F5A0', fontWeight: 600 }}>Report generated! You can edit it below.</span>
                        </div>
                        <button onClick={generateReport} style={{ ...T.btn, ...T.btnOutline, padding: '6px 14px', fontSize: 11 }}>
                          <Sparkles size={12} /> Regenerate
                        </button>
                      </div>

                      <textarea
                        id="investorReport"
                        value={form.investorReport}
                        onChange={set('investorReport')}
                        style={{ ...T.textarea, minHeight: 560, fontSize: 13, lineHeight: 1.8, fontFamily: "'DM Sans', sans-serif" }}
                        className="pitch-input"
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => { setStep(1); setError('') }} style={{ ...T.btn, ...T.btnOutline }}>
                    ← Back to Details
                  </button>
                  <button onClick={goToStep3} style={{ ...T.btn, ...T.btnGreen, padding: '13px 32px', fontSize: 13 }}>
                    Continue to Publish <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════ STEP 3: Publish ══════════════ */}
            {step === 3 && (
              <div style={{ animation: 'fadeUp 0.4s ease forwards' }}>

                {/* Visibility toggle */}
                <div style={{ ...T.card, padding: 32, marginBottom: 24 }}>
                  <SectionHeader icon={Globe} title="Investor Visibility" color="#00D9E8" />

                  <div
                    onClick={() => setForm(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '20px 24px', borderRadius: 8, cursor: 'pointer',
                      background: form.isPublic ? 'rgba(0,245,160,0.05)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${form.isPublic ? 'rgba(0,245,160,0.25)' : 'rgba(255,255,255,0.08)'}`,
                      transition: 'all 0.25s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {form.isPublic
                        ? <Eye size={22} style={{ color: '#00F5A0' }} />
                        : <EyeOff size={22} style={{ color: '#6B7A91' }} />
                      }
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 600, color: form.isPublic ? '#E8EDF5' : '#6B7A91', marginBottom: 4 }}>
                          Make visible to investors
                        </p>
                        <p style={{ fontSize: 12, color: '#6B7A91', lineHeight: 1.5 }}>
                          {form.isPublic
                            ? 'Your startup will appear on the public investor dashboard for discover.'
                            : 'Your pitch is private. Toggle to list it on the investor feed.'}
                        </p>
                      </div>
                    </div>
                    {/* Custom toggle */}
                    <div style={{
                      width: 52, height: 28, borderRadius: 14, transition: 'all 0.25s', flexShrink: 0,
                      background: form.isPublic ? '#00F5A0' : 'rgba(255,255,255,0.1)',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', top: 4, left: form.isPublic ? 28 : 4,
                        width: 20, height: 20, borderRadius: '50%',
                        background: form.isPublic ? '#060A0F' : '#4A5568',
                        transition: 'left 0.25s',
                      }} />
                    </div>
                  </div>

                  {/* Stats Bar & Attention Badge */}
                  <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', gap: 24, padding: '16px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Eye size={16} style={{ color: '#00D9E8' }} />
                        <span style={{ fontSize: 13, color: '#E8EDF5', fontWeight: 600 }}>{form.viewCount}</span>
                        <span style={{ fontSize: 12, color: '#6B7A91' }}>investors viewed your pitch</span>
                      </div>
                      <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', alignSelf: 'center' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Zap size={16} style={{ color: '#FFB800' }} />
                        <span style={{ fontSize: 13, color: '#E8EDF5', fontWeight: 600 }}>{stats.watchlistCount || 0}</span>
                        <span style={{ fontSize: 12, color: '#6B7A91' }}>investors watchlisted your startup</span>
                      </div>
                    </div>

                    {stats.viewCount > 0 && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 16px', borderRadius: 20,
                        background: 'rgba(0,245,160,0.08)', border: '1px solid rgba(0,245,160,0.2)',
                        width: 'fit-content', animation: 'pulseGlow 2s infinite ease-in-out'
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00F5A0', boxShadow: '0 0 10px #00F5A0' }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#00F5A0', ...T.mono }}>YOUR PITCH IS GETTING ATTENTION!</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview card */}
                <div style={{ ...T.card, padding: 32, marginBottom: 24 }}>
                  <SectionHeader icon={BarChart3} title="Investor Card Preview" color="#FFB800" />
                  <p style={{ fontSize: 13, color: '#6B7A91', marginBottom: 20 }}>
                    This is how your startup will appear on the investor dashboard:
                  </p>

                  <div style={{
                    ...T.innerCard, padding: 28,
                    background: 'linear-gradient(135deg, rgba(12,16,24,0.8) 0%, rgba(17,25,38,0.8) 100%)',
                    border: '1px solid rgba(0,245,160,0.15)',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {/* Ambient glow */}
                    <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,245,160,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                          <span style={{ ...T.syne, fontSize: 20, fontWeight: 800 }}>{form.startupName || 'Your Startup Name'}</span>
                          <span style={{ ...T.tag, background: 'rgba(0,245,160,0.1)', color: '#00F5A0', border: '1px solid rgba(0,245,160,0.2)' }}>
                            {form.stage.toUpperCase()}
                          </span>
                          {form.isPublic && (
                            <span style={{ ...T.tag, background: 'rgba(0,217,232,0.1)', color: '#00D9E8', border: '1px solid rgba(0,217,232,0.2)' }}>
                              PUBLIC
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 14, color: '#A0ADBF', marginBottom: 14, fontStyle: 'italic' }}>
                          "{form.tagline || 'Your brilliant tagline goes here'}"
                        </p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {form.industry && (
                            <span style={{ ...T.tag, background: 'rgba(123,92,255,0.1)', color: '#7B5CFF', border: '1px solid rgba(123,92,255,0.2)' }}>
                              {form.industry}
                            </span>
                          )}
                          {form.targetMarket && (
                            <span style={{ ...T.tag, background: 'rgba(255,255,255,0.05)', color: '#6B7A91', border: '1px solid rgba(255,255,255,0.08)' }}>
                              {form.targetMarket.slice(0, 30)}{form.targetMarket.length > 30 ? '…' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      {form.fundingAsk && (
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 11, color: '#6B7A91', ...T.mono, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Raising</div>
                          <div style={{ ...T.syne, fontSize: 22, fontWeight: 800, color: '#00F5A0' }}>
                            ${Number(form.fundingAsk).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>

                    {form.problemStatement && (
                      <div style={{ ...T.innerCard, padding: '14px 18px', borderRadius: 6, background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ fontSize: 10, ...T.mono, color: '#6B7A91', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Problem</div>
                        <p style={{ fontSize: 13, color: '#A0ADBF', lineHeight: 1.6 }}>
                          {form.problemStatement.length > 180 ? form.problemStatement.slice(0, 180) + '…' : form.problemStatement}
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <ShieldCheck size={14} style={{ color: '#00F5A0' }} />
                        <span style={{ fontSize: 12, color: '#6B7A91' }}>Investor-ready profile</span>
                      </div>
                      {form.founderEmail && (
                        <span style={{ fontSize: 12, color: '#6B7A91', ...T.mono }}>
                          {form.founderEmail}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ ...T.card, padding: 24, marginBottom: 24, background: 'rgba(0,245,160,0.03)', border: '1px solid rgba(0,245,160,0.12)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle size={16} style={{ color: '#00F5A0' }} />
                    <span style={{ fontSize: 13, color: '#E8EDF5' }}>
                      Your pitch profile includes a full AI-generated investor report
                      {form.isPublic ? ' and will be listed publicly.' : '.'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button onClick={() => { setStep(2); setError('') }} style={{ ...T.btn, ...T.btnOutline }}>
                    ← Back to Report
                  </button>
                  <button
                    id="publishPitchBtn"
                    onClick={publish}
                    disabled={publishing}
                    style={{ ...T.btn, ...T.btnGreen, padding: '13px 32px', fontSize: 13, opacity: publishing ? 0.7 : 1 }}
                  >
                    {publishing
                      ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> {isEditMode ? 'Updating…' : 'Publishing…'}</>
                      : <><Send size={15} /> {isEditMode ? 'Update Pitch' : 'Publish Pitch'}</>
                    }
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      <PitchRoomStyles />
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
function PitchRoomStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');
      @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes reportProgress { from { width: 0% } to { width: 100% } }
      @keyframes pulseGlow {
        0% { box-shadow: 0 0 0 0 rgba(0,245,160,0.2); transform: scale(1); }
        50% { box-shadow: 0 0 15px 0 rgba(0,245,160,0.4); transform: scale(1.02); }
        100% { box-shadow: 0 0 0 0 rgba(0,245,160,0.2); transform: scale(1); }
      }
      .pitch-input:focus { border-color: rgba(0,245,160,0.5) !important; box-shadow: 0 0 0 3px rgba(0,245,160,0.06); }
      .pitch-input::placeholder { color: #3A4A5E; }
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: #060A0F; }
      ::-webkit-scrollbar-thumb { background: rgba(0,245,160,0.2); border-radius: 2px; }
      textarea { resize: vertical; }
      select option { background: #0C1018; color: #E8EDF5; }
    `}</style>
  )
}
