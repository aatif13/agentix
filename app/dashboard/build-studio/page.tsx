'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

// ── Types ──────────────────────────────────────────────────────────────────
interface TechStackItem { layer: string; emoji: string; tool: string; reason: string; isFree: boolean }
interface Schema { name: string; code: string }
interface ApiRoute { method: 'GET' | 'POST' | 'PUT' | 'DELETE'; endpoint: string; description: string; authRequired: boolean }
interface CostService { name: string; freeTier: string; paidStartsAt: string; recommendation: string }
interface SecurityItem { item: string; description: string }
interface Blueprint {
  techStack: TechStackItem[]
  schemas: Schema[]
  apiRoutes: ApiRoute[]
  fileStructure: string
  costEstimate: { services: CostService[]; monthlyTotal: { development: string; smallScale: string; mediumScale: string } }
  securityChecklist: { critical: SecurityItem[]; important: SecurityItem[]; niceToHave: SecurityItem[] }
}
interface PastProject { _id: string; projectName: string; appType: string; createdAt: string; blueprint: Blueprint }
interface FormData {
  projectName: string; description: string; appType: string; targetUsers: string
  expectedUsers: string; teamSize: string; hasBudget: boolean; region: string
  codingExperience: string; features: string[]
}

// ── Constants ──────────────────────────────────────────────────────────────
const FEATURES = [
  'User Authentication', 'Payments / Subscriptions', 'File Uploads',
  'Real-time Features', 'AI/ML Integration', 'Email Notifications',
  'Analytics Dashboard', 'Admin Panel', 'Mobile App', 'Third-party Integrations',
]
const METHOD_COLORS: Record<string, string> = {
  GET: '#00D9E8', POST: '#00F5A0', PUT: '#FFB800', DELETE: '#FF6B35',
}
const STEPS = ['Your Idea', 'Scale & Budget', 'Tech Preferences', 'Review & Generate']

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', minHeight: '100vh', background: '#060A0F', fontFamily: "'DM Sans', sans-serif", color: '#E8EDF5' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginLeft: 'var(--sidebar-w)' },
  body: { flex: 1, overflowY: 'auto', padding: '32px' },
  card: { background: '#0C1018', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4 },
  input: { width: '100%', background: '#060A0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '10px 14px', color: '#E8EDF5', fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' },
  label: { display: 'block', fontSize: 12, color: '#6B7A91', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 8 },
  btn: { padding: '10px 24px', borderRadius: 4, border: 'none', cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', transition: 'all 0.2s' },
  btnGreen: { background: '#00F5A0', color: '#060A0F' },
  btnOutline: { background: 'transparent', color: '#6B7A91', border: '1px solid rgba(255,255,255,0.1)' },
  tag: { fontFamily: "'Space Mono', monospace", fontSize: 10, padding: '3px 10px', borderRadius: 2, letterSpacing: '0.08em', fontWeight: 700 },
  codeBlock: { background: '#060A0F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, padding: 16, fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#00D9E8', overflowX: 'auto' as const, whiteSpace: 'pre' as const },
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function BuildStudioPage() {
  useSession()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null)
  const [activeTab, setActiveTab] = useState('techStack')
  const [pastProjects, setPastProjects] = useState<PastProject[]>([])
  const [projectName, setProjectName] = useState('')
  const [form, setForm] = useState<FormData>({
    projectName: '', description: '', appType: 'Web App', targetUsers: 'B2C (consumers)',
    expectedUsers: 'Less than 1000', teamSize: 'Solo founder', hasBudget: false,
    region: 'India', codingExperience: 'Intermediate', features: [],
  })

  useEffect(() => {
    fetch('/api/build-studio/projects')
      .then(r => r.json())
      .then(d => setPastProjects(d.projects || []))
      .catch(() => { })
  }, [])

  const toggleFeature = (f: string) =>
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(f) ? prev.features.filter(x => x !== f) : [...prev.features, f],
    }))

  const generate = async () => {
    setLoading(true)
    const msgs = [
      'Analyzing your requirements…',
      'Selecting optimal tech stack…',
      'Generating database schemas…',
      'Creating API endpoints…',
      'Building deployment guide…',
      'Finalizing blueprint…',
    ]
    for (const m of msgs) {
      setLoadingMsg(m)
      await new Promise(r => setTimeout(r, 1000))
    }
    try {
      const res = await fetch('/api/build-studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.blueprint) {
        setBlueprint(data.blueprint)
        setProjectName(form.projectName)
        setPastProjects(prev => [{ _id: data._id, projectName: form.projectName, appType: form.appType, createdAt: new Date().toISOString(), blueprint: data.blueprint }, ...prev])
      }
    } catch {
      alert('Generation failed. Please try again.')
    }
    setLoading(false)
  }

  const copy = (text: string) => navigator.clipboard.writeText(text)

  const download = () => {
    if (!blueprint) return
    const txt = `AGENTIX BLUEPRINT — ${projectName}\n${'='.repeat(50)}\n\n` +
      `TECH STACK\n${blueprint.techStack.map(t => `${t.emoji} ${t.layer}: ${t.tool} — ${t.reason}`).join('\n')}\n\n` +
      `DATABASE SCHEMAS\n${blueprint.schemas.map(s => `// ${s.name}\n${s.code}`).join('\n\n')}\n\n` +
      `API ROUTES\n${blueprint.apiRoutes.map(r => `${r.method} ${r.endpoint} — ${r.description}`).join('\n')}\n\n` +
      `FILE STRUCTURE\n${blueprint.fileStructure}\n\n` +
      `COST ESTIMATE\n${blueprint.costEstimate.services.map(s => `${s.name}: ${s.freeTier}`).join('\n')}\n` +
      `Monthly (dev): ${blueprint.costEstimate.monthlyTotal.development}\n`
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' }))
    a.download = `${projectName}-blueprint.txt`
    a.click()
  }

  return (
    <div style={s.page}>
      <Sidebar />
      <div style={s.main}>
        <TopBar title="Build Studio" />
        <div style={s.body}>

          {/* Past Projects */}
          {pastProjects.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#6B7A91', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Past Blueprints</div>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                {pastProjects.map(p => (
                  <button key={p._id} onClick={() => { setBlueprint(p.blueprint); setProjectName(p.projectName) }}
                    style={{ ...s.card, padding: '12px 20px', border: 'none', cursor: 'pointer', flexShrink: 0, textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#E8EDF5', marginBottom: 6 }}>{p.projectName}</div>
                    <div style={{ ...s.tag, background: 'rgba(0,245,160,0.1)', color: '#00F5A0', border: '1px solid rgba(0,245,160,0.2)' }}>{p.appType}</div>
                    <div style={{ fontSize: 11, color: '#6B7A91', marginTop: 8 }}>{new Date(p.createdAt).toLocaleDateString()}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Layout */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

            {/* ── LEFT — Wizard ── */}
            <div style={{ ...s.card, width: 420, flexShrink: 0, padding: 32 }}>

              {/* Step Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
                {STEPS.map((label, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'unset' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: "'Space Mono', monospace", fontWeight: 700, background: step > i + 1 ? '#00F5A0' : step === i + 1 ? 'rgba(0,245,160,0.15)' : 'transparent', border: `2px solid ${step >= i + 1 ? '#00F5A0' : 'rgba(255,255,255,0.1)'}`, color: step > i + 1 ? '#060A0F' : step === i + 1 ? '#00F5A0' : '#6B7A91' }}>
                        {step > i + 1 ? '✓' : i + 1}
                      </div>
                      <div style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: step === i + 1 ? '#00F5A0' : '#6B7A91', whiteSpace: 'nowrap' }}>{label}</div>
                    </div>
                    {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: step > i + 1 ? '#00F5A0' : 'rgba(255,255,255,0.07)', margin: '0 8px', marginBottom: 20 }} />}
                  </div>
                ))}
              </div>

              {/* Step 1 */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Tell us about your idea</div>
                  <div>
                    <label style={s.label}>Project Name</label>
                    <input style={s.input} placeholder="e.g. InvoiceFlow" value={form.projectName} onChange={e => setForm(p => ({ ...p, projectName: e.target.value }))} />
                  </div>
                  <div>
                    <label style={s.label}>What does your product do?</label>
                    <textarea style={{ ...s.input, minHeight: 100, resize: 'vertical' }} placeholder="e.g. A SaaS platform that helps freelancers track invoices and expenses automatically..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div>
                    <label style={s.label}>App Type</label>
                    <select style={s.input} value={form.appType} onChange={e => setForm(p => ({ ...p, appType: e.target.value }))}>
                      {['Web App', 'Mobile App', 'API/Backend', 'Chrome Extension', 'Desktop App'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={s.label}>Target Users</label>
                    <select style={s.input} value={form.targetUsers} onChange={e => setForm(p => ({ ...p, targetUsers: e.target.value }))}>
                      {['B2C (consumers)', 'B2B (businesses)', 'Internal Tool', 'Marketplace'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <button style={{ ...s.btn, ...s.btnGreen, marginTop: 8 }} onClick={() => form.projectName && form.description ? setStep(2) : alert('Please fill in all fields')}>
                    Next →
                  </button>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Scale & Budget</div>
                  {[
                    { label: 'Expected Users in Year 1', key: 'expectedUsers', opts: ['Less than 1000', '1K - 10K', '10K - 100K', '100K+'] },
                    { label: 'Team Size', key: 'teamSize', opts: ['Solo founder', '2-3 people', '4-10 people', '10+ people'] },
                    { label: 'Primary Region', key: 'region', opts: ['India', 'USA', 'Europe', 'Global'] },
                  ].map(({ label, key, opts }) => (
                    <div key={key}>
                      <label style={s.label}>{label}</label>
                      <select style={s.input} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}>
                        {opts.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                  <div>
                    <label style={s.label}>Budget for paid services?</label>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {[true, false].map(val => (
                        <button key={String(val)} onClick={() => setForm(p => ({ ...p, hasBudget: val }))}
                          style={{ ...s.btn, flex: 1, background: form.hasBudget === val ? 'rgba(0,245,160,0.15)' : 'transparent', border: `1px solid ${form.hasBudget === val ? '#00F5A0' : 'rgba(255,255,255,0.1)'}`, color: form.hasBudget === val ? '#00F5A0' : '#6B7A91' }}>
                          {val ? 'Yes' : 'No (Free only)'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button style={{ ...s.btn, ...s.btnOutline, flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                    <button style={{ ...s.btn, ...s.btnGreen, flex: 1 }} onClick={() => setStep(3)}>Next →</button>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Technical Preferences</div>
                  <div>
                    <label style={s.label}>Your Coding Experience</label>
                    <select style={s.input} value={form.codingExperience} onChange={e => setForm(p => ({ ...p, codingExperience: e.target.value }))}>
                      {['No coding', 'Beginner', 'Intermediate', 'Advanced'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={s.label}>Features Needed</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {FEATURES.map(f => (
                        <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                          <div onClick={() => toggleFeature(f)} style={{ width: 18, height: 18, borderRadius: 2, border: `2px solid ${form.features.includes(f) ? '#00F5A0' : 'rgba(255,255,255,0.2)'}`, background: form.features.includes(f) ? '#00F5A0' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s', cursor: 'pointer' }}>
                            {form.features.includes(f) && <span style={{ color: '#060A0F', fontSize: 11, fontWeight: 900 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: 14, color: form.features.includes(f) ? '#E8EDF5' : '#6B7A91' }}>{f}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button style={{ ...s.btn, ...s.btnOutline, flex: 1 }} onClick={() => setStep(2)}>← Back</button>
                    <button style={{ ...s.btn, ...s.btnGreen, flex: 1 }} onClick={() => setStep(4)}>Next →</button>
                  </div>
                </div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Review & Generate</div>
                  {[
                    ['Project', form.projectName],
                    ['Type', form.appType],
                    ['Users', form.targetUsers],
                    ['Scale', form.expectedUsers],
                    ['Team', form.teamSize],
                    ['Region', form.region],
                    ['Experience', form.codingExperience],
                    ['Budget', form.hasBudget ? 'Yes' : 'No'],
                    ['Features', form.features.length ? form.features.join(', ') : 'None selected'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: 12, color: '#6B7A91', fontFamily: "'Space Mono', monospace" }}>{k}</span>
                      <span style={{ fontSize: 13, color: '#E8EDF5', maxWidth: 220, textAlign: 'right' }}>{v}</span>
                    </div>
                  ))}
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                      <div style={{ fontSize: 13, color: '#00F5A0', fontFamily: "'Space Mono', monospace", marginBottom: 16 }}>{loadingMsg}</div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#00F5A0', borderRadius: 2, animation: 'progress 6s linear forwards' }} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                      <button style={{ ...s.btn, ...s.btnGreen, width: '100%', padding: '14px 24px', fontSize: 13 }} onClick={generate}>
                        🚀 Generate My Blueprint
                      </button>
                      <button style={{ ...s.btn, ...s.btnOutline, width: '100%' }} onClick={() => setStep(3)}>← Back</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT — Output Panel ── */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {!blueprint ? (
                <div style={{ ...s.card, padding: 80, textAlign: 'center' }}>
                  <div style={{ fontSize: 56, marginBottom: 20 }}>🏗️</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Your Blueprint Will Appear Here</div>
                  <div style={{ color: '#6B7A91', fontSize: 14 }}>Complete the wizard on the left to generate your personalized MVP blueprint</div>
                </div>
              ) : (
                <div style={s.card}>
                  {/* Output Header */}
                  <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800 }}>{projectName}</div>
                      <div style={{ fontSize: 12, color: '#6B7A91', marginTop: 4 }}>Technical Blueprint Generated by Code Agent</div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button style={{ ...s.btn, ...s.btnOutline }} onClick={() => { setBlueprint(null); setStep(1); setForm({ projectName: '', description: '', appType: 'Web App', targetUsers: 'B2C (consumers)', expectedUsers: 'Less than 1000', teamSize: 'Solo founder', hasBudget: false, region: 'India', codingExperience: 'Intermediate', features: [] }) }}>
                        + New
                      </button>
                      <button style={{ ...s.btn, ...s.btnGreen }} onClick={download}>⬇ Download</button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 28px' }}>
                    {[['techStack', '⚙️ Tech Stack'], ['schemas', '🗄️ Database'], ['apiRoutes', '🔌 API Routes'], ['fileStructure', '📁 Files'], ['cost', '💰 Cost'], ['security', '🔒 Security']].map(([key, label]) => (
                      <button key={key} onClick={() => setActiveTab(key)}
                        style={{ padding: '14px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === key ? '#00F5A0' : 'transparent'}`, color: activeTab === key ? '#00F5A0' : '#6B7A91', fontSize: 12, fontFamily: "'Space Mono', monospace", cursor: 'pointer', transition: 'all 0.2s', marginBottom: -1 }}>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div style={{ padding: 28 }}>

                    {/* Tech Stack */}
                    {activeTab === 'techStack' && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                        {blueprint.techStack.map((t, i) => (
                          <div key={i} style={{ background: '#060A0F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, padding: 20 }}>
                            <div style={{ fontSize: 24, marginBottom: 10 }}>{t.emoji}</div>
                            <div style={{ fontSize: 11, color: '#6B7A91', fontFamily: "'Space Mono', monospace", marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.layer}</div>
                            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{t.tool}</div>
                            <div style={{ fontSize: 13, color: '#6B7A91', lineHeight: 1.6, marginBottom: 12 }}>{t.reason}</div>
                            <span style={{ ...s.tag, background: t.isFree ? 'rgba(0,245,160,0.1)' : 'rgba(255,107,53,0.1)', color: t.isFree ? '#00F5A0' : '#FF6B35', border: `1px solid ${t.isFree ? 'rgba(0,245,160,0.2)' : 'rgba(255,107,53,0.2)'}` }}>
                              {t.isFree ? 'FREE' : 'PAID'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Schemas */}
                    {activeTab === 'schemas' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {blueprint.schemas.map((schema, i) => (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700 }}>{schema.name}</div>
                              <button style={{ ...s.btn, ...s.btnOutline, padding: '6px 14px', fontSize: 11 }} onClick={() => copy(schema.code)}>Copy</button>
                            </div>
                            <div style={s.codeBlock}>{schema.code}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* API Routes */}
                    {activeTab === 'apiRoutes' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                          <button style={{ ...s.btn, ...s.btnOutline, fontSize: 11 }} onClick={() => copy(blueprint.apiRoutes.map(r => `${r.method} ${r.endpoint} — ${r.description}`).join('\n'))}>Copy All</button>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                              {['Method', 'Endpoint', 'Description', 'Auth'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '8px 16px', fontSize: 11, color: '#6B7A91', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {blueprint.apiRoutes.map((r, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={{ padding: '12px 16px' }}>
                                  <span style={{ ...s.tag, background: `${METHOD_COLORS[r.method]}18`, color: METHOD_COLORS[r.method], border: `1px solid ${METHOD_COLORS[r.method]}33` }}>{r.method}</span>
                                </td>
                                <td style={{ padding: '12px 16px', fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#00D9E8' }}>{r.endpoint}</td>
                                <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7A91' }}>{r.description}</td>
                                <td style={{ padding: '12px 16px' }}>
                                  <span style={{ fontSize: 12, color: r.authRequired ? '#FFB800' : '#6B7A91' }}>{r.authRequired ? '🔒 Yes' : '—'}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* File Structure */}
                    {activeTab === 'fileStructure' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                          <button style={{ ...s.btn, ...s.btnOutline, fontSize: 11 }} onClick={() => copy(blueprint.fileStructure)}>Copy</button>
                        </div>
                        <div style={s.codeBlock}>{blueprint.fileStructure}</div>
                      </div>
                    )}

                    {/* Cost */}
                    {activeTab === 'cost' && (
                      <div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                              {['Service', 'Free Tier', 'Paid Starts At', 'Recommendation'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '8px 16px', fontSize: 11, color: '#6B7A91', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {blueprint.costEstimate.services.map((svc, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{svc.name}</td>
                                <td style={{ padding: '12px 16px', fontSize: 13, color: '#00F5A0' }}>{svc.freeTier}</td>
                                <td style={{ padding: '12px 16px', fontSize: 13, color: '#FF6B35' }}>{svc.paidStartsAt}</td>
                                <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7A91' }}>{svc.recommendation}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                          {[['Development', blueprint.costEstimate.monthlyTotal.development], ['0-1K Users', blueprint.costEstimate.monthlyTotal.smallScale], ['1K-10K Users', blueprint.costEstimate.monthlyTotal.mediumScale]].map(([label, val]) => (
                            <div key={label} style={{ background: '#060A0F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, padding: 20, textAlign: 'center' }}>
                              <div style={{ fontSize: 11, color: '#6B7A91', fontFamily: "'Space Mono', monospace", marginBottom: 8 }}>{label}</div>
                              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: '#00F5A0' }}>{val}</div>
                              <div style={{ fontSize: 11, color: '#6B7A91', marginTop: 4 }}>/ month</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Security */}
                    {activeTab === 'security' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                        {[
                          { label: '🔴 Critical — Do before launch', items: blueprint.securityChecklist.critical, color: '#FF6B35' },
                          { label: '🟡 Important — Do within first month', items: blueprint.securityChecklist.important, color: '#FFB800' },
                          { label: '🟢 Nice to Have — Do when scaling', items: blueprint.securityChecklist.niceToHave, color: '#00F5A0' },
                        ].map(({ label, items, color }) => (
                          <div key={label}>
                            <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 14, fontFamily: "'Syne', sans-serif" }}>{label}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                              {items.map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: 14, padding: 14, background: '#060A0F', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4 }}>
                                  <div style={{ width: 18, height: 18, borderRadius: 2, border: `2px solid ${color}44`, flexShrink: 0, marginTop: 1 }} />
                                  <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{item.item}</div>
                                    <div style={{ fontSize: 12, color: '#6B7A91', lineHeight: 1.6 }}>{item.description}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
        select option { background: #0C1018; color: #E8EDF5; }
        @keyframes progress { from { width: 0% } to { width: 100% } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #060A0F; }
        ::-webkit-scrollbar-thumb { background: rgba(0,245,160,0.3); border-radius: 2px; }
      `}</style>
    </div>
  )
}