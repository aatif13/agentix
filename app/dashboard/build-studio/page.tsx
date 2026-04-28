'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { useSelectedProblem } from '@/lib/useSelectedProblem'
import { Target, Download, Copy, RefreshCw, Layers, Database, Globe, Shield, PieChart, FileCode, CheckCircle2 } from 'lucide-react'
import EmptyState from '@/components/EmptyState'
import BuildAdvisorPanel from '@/components/build-studio/BuildAdvisorPanel'

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

const METHOD_COLORS: Record<string, string> = {
  GET: '#00D9E8', POST: '#00F5A0', PUT: '#FFB800', DELETE: '#FF6B35',
}

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', minHeight: '100vh', background: '#060A0F', fontFamily: "'DM Sans', sans-serif", color: '#E8EDF5' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginLeft: 'var(--sidebar-w)' },
  body: { flex: 1, overflowY: 'auto', padding: '32px' },
  card: { background: '#0C1018', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4 },
  btn: { padding: '10px 24px', borderRadius: 4, border: 'none', cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 },
  btnGreen: { background: '#00F5A0', color: '#060A0F' },
  btnOutline: { background: 'transparent', color: '#6B7A91', border: '1px solid rgba(255,255,255,0.1)' },
  tag: { fontFamily: "'Space Mono', monospace", fontSize: 10, padding: '2px 8px', borderRadius: 2, fontWeight: 700 },
  codeBlock: { background: '#060A0F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, padding: 16, fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#00D9E8', overflowX: 'auto', whiteSpace: 'pre' },
}

export default function BuildStudioPage() {
  useSession()
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null)
  const [activeTab, setActiveTab] = useState('techStack')
  const [pastProjects, setPastProjects] = useState<PastProject[]>([])
  const [projectName, setProjectName] = useState('')
  const { problem } = useSelectedProblem()

  useEffect(() => {
    fetch('/api/build-studio/projects')
      .then(r => r.json())
      .then(d => setPastProjects(d.projects || []))
      .catch(() => { })
  }, [])

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

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
    a.download = `${projectName.replace(/\s+/g, '_')}-blueprint.txt`
    a.click()
  }

  const generate = async () => {
    setLoading(true)
    const msgs = [
      'Analyzing requirements for your problem...',
      'Mapping solution architecture...',
      'Selecting optimal tech stack...',
      'Generating database schemas...',
      'Creating API endpoints...',
      'Finalizing blueprint...',
    ]
    for (const m of msgs) {
      setLoadingMsg(m)
      await new Promise(r => setTimeout(r, 600))
    }
    try {
      const res = await fetch('/api/build-studio/generate', {
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
      if (data.blueprint) {
        setBlueprint(data.blueprint)
        const name = problem ? `Solution for ${problem.title}` : 'Your Project'
        setProjectName(name)
        setPastProjects(prev => [{ _id: data._id, projectName: name, appType: 'Web App', createdAt: new Date().toISOString(), blueprint: data.blueprint }, ...prev])
      }
    } catch {
      alert('Generation failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={s.page}>
      <Sidebar />
      <div style={s.main}>
        <TopBar title="Build Studio" />
        <div style={s.body}>
          {problem && (
            <div style={{ background: 'rgba(0,245,160,0.05)', border: '1px solid rgba(0,245,160,0.2)', borderRadius: 4, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ background: '#00F5A0', color: '#060A0F', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#E8EDF5' }}>Building for problem: <span style={{ color: '#00F5A0' }}>{problem.title}</span></p>
                <p style={{ fontSize: 11, color: '#6B7A91', marginTop: 2 }}>{problem.location.district}, {problem.location.state} • {problem.domain} context will be injected into AI generation.</p>
              </div>
            </div>
          )}

          {pastProjects.length > 0 && !blueprint && !loading && (
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

          {!problem && pastProjects.length === 0 ? (
            <div style={{ ...s.card, padding: 80, textAlign: 'center', width: '100%' }}>
              <EmptyState
                icon={Target}
                title="No problem selected"
                description="Please select a problem in the Problem Finder first to generate a technical blueprint."
                action={{ label: 'Go to Problem Finder', onClick: () => window.location.href = '/dashboard/problem-finder' }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              {/* LEFT ACTION PANEL */}
              <div style={{ ...s.card, width: 380, flexShrink: 0, padding: 32 }}>
                {!blueprint ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 44, marginBottom: 20 }}>🏗️</div>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Architect Your MVP</h3>
                    <p style={{ color: '#6B7A91', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
                      We'll generate a comprehensive technical blueprint for: <br/>
                      <strong style={{ color: '#00F5A0' }}>"{problem?.title}"</strong>
                    </p>
                    {loading ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 13, color: '#00F5A0', fontFamily: "'Space Mono', monospace", marginBottom: 16 }}>{loadingMsg}</div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: '#00F5A0', borderRadius: 2, animation: 'progress 4s linear forwards' }} />
                        </div>
                      </div>
                    ) : (
                      <button style={{ ...s.btn, ...s.btnGreen, width: '100%', justifyContent: 'center' }} onClick={generate}>
                        Generate Blueprint →
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Active Session</h3>
                    <p style={{ fontSize: 13, color: '#6B7A91', lineHeight: 1.6, marginBottom: 24 }}>
                      Tailored architectural blueprint for: <br/>
                      <strong style={{ color: '#00F5A0' }}>{problem?.title}</strong>
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <button style={{ ...s.btn, ...s.btnGreen, width: '100%', justifyContent: 'center' }} onClick={download}>
                        <Download size={15} /> Download PDF/TXT
                      </button>
                      <button style={{ ...s.btn, ...s.btnOutline, width: '100%', justifyContent: 'center' }} onClick={() => setBlueprint(null)}>
                        <RefreshCw size={14} /> Re-generate
                      </button>
                    </div>
                    {/* ── NEW: Build Advisor Agent ── */}
                    <BuildAdvisorPanel 
                      blueprint={blueprint} 
                      problem={problem} 
                    />
                  </div>
                )}
              </div>

              {/* RIGHT RESULTS PANEL */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {!blueprint ? (
                  <div style={{ ...s.card, padding: 80, textAlign: 'center' }}>
                    <div style={{ fontSize: 56, marginBottom: 20 }}>📊</div>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Blueprint Ready</h2>
                    <p style={{ color: '#6B7A91', fontSize: 14 }}>Select a problem to generate architecture, schemas, and cost estimates.</p>
                  </div>
                ) : (
                  <div style={s.card}>
                    <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800 }}>{projectName}</h2>
                      <p style={{ fontSize: 12, color: '#6B7A91', marginTop: 4 }}>System-generated MVP technical architecture</p>
                    </div>

                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', overflowX: 'auto' }}>
                      {[
                        { id: 'techStack', label: 'Stack', icon: Layers },
                        { id: 'schemas', label: 'Models', icon: Database },
                        { id: 'apiRoutes', label: 'API', icon: Globe },
                        { id: 'fileStructure', label: 'Files', icon: FileCode },
                        { id: 'costEstimate', label: 'Costs', icon: PieChart },
                        { id: 'security', label: 'Security', icon: Shield },
                      ].map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                          style={{ padding: '16px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === t.id ? '#00F5A0' : 'transparent'}`, color: activeTab === t.id ? '#00F5A0' : '#6B7A91', fontSize: 12, fontFamily: "'Space Mono', monospace", cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                          <t.icon size={14} /> {t.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ padding: 28 }}>
                      {activeTab === 'techStack' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                          {blueprint.techStack.map((t, i) => (
                            <div key={i} style={{ background: '#060A0F', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, padding: 20 }}>
                              <div style={{ fontSize: 24, marginBottom: 10 }}>{t.emoji}</div>
                              <div style={{ fontSize: 10, color: '#6B7A91', fontFamily: "'Space Mono', monospace", marginBottom: 6, textTransform: 'uppercase' }}>{t.layer}</div>
                              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{t.tool}</div>
                              <p style={{ fontSize: 12, color: '#6B7A91', lineHeight: 1.6, marginBottom: 12 }}>{t.reason}</p>
                              <span style={{ ...s.tag, background: t.isFree ? 'rgba(0,245,160,0.1)' : 'rgba(255,107,53,0.1)', color: t.isFree ? '#00F5A0' : '#FF6B35' }}>{t.isFree ? 'FREE' : 'PAID'}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'schemas' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                          {blueprint.schemas.map((sch, i) => (
                            <div key={i}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700 }}>{sch.name} Model</span>
                                <button style={{ ...s.btnOutline, padding: '4px 10px', fontSize: 10 }} onClick={() => copy(sch.code)}><Copy size={12} /> Copy</button>
                              </div>
                              <pre style={s.codeBlock}>{sch.code}</pre>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'apiRoutes' && (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                              {['Method', 'Endpoint', 'Description'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 10, color: '#6B7A91', fontFamily: "'Space Mono', monospace" }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {blueprint.apiRoutes.map((r, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '12px 16px' }}><span style={{ ...s.tag, background: METHOD_COLORS[r.method], color: '#060A0F' }}>{r.method}</span></td>
                                <td style={{ padding: '12px 16px', fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#00D9E8' }}>{r.endpoint}</td>
                                <td style={{ padding: '12px 16px', fontSize: 12, color: '#6B7A91' }}>{r.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {activeTab === 'fileStructure' && <pre style={{ ...s.codeBlock, color: '#E8EDF5' }}>{blueprint.fileStructure}</pre>}

                      {activeTab === 'costEstimate' && (
                        <div>
                          <table style={{ width: '100%', marginBottom: 24 }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                {['Service', 'Free Tier', 'Scalability'].map(h => (
                                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 10, color: '#6B7A91', fontFamily: "'Space Mono', monospace" }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {blueprint.costEstimate.services.map((svc, i) => (
                                <tr key={i}>
                                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700 }}>{svc.name}</td>
                                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#00F5A0' }}>{svc.freeTier}</td>
                                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#6B7A91' }}>{svc.recommendation}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                            {[
                              ['Initial', blueprint.costEstimate.monthlyTotal.development],
                              ['Scaling', blueprint.costEstimate.monthlyTotal.smallScale],
                              ['Growth', blueprint.costEstimate.monthlyTotal.mediumScale],
                            ].map(([l, v]) => (
                              <div key={l} style={{ background: '#060A0F', padding: 20, borderRadius: 4, textAlign: 'center' }}>
                                <div style={{ fontSize: 10, color: '#6B7A91', fontFamily: "'Space Mono', monospace", marginBottom: 6 }}>{l}</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: '#00F5A0' }}>{v}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === 'security' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                          {blueprint.securityChecklist.critical.map((item, i) => (
                            <div key={i} style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.1)', padding: 16, borderRadius: 4, display: 'flex', gap: 12 }}>
                              <Shield size={16} color="#FF6B35" />
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#FF6B35', marginBottom: 4 }}>{item.item}</div>
                                <p style={{ fontSize: 12, color: '#6B7A91' }}>{item.description}</p>
                              </div>
                            </div>
                          ))}
                          {blueprint.securityChecklist.important.map((item, i) => (
                            <div key={i} style={{ background: 'rgba(255,184,0,0.05)', border: '1px solid rgba(255,184,0,0.1)', padding: 16, borderRadius: 4, display: 'flex', gap: 12 }}>
                              <CheckCircle2 size={16} color="#FFB800" />
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#FFB800', marginBottom: 4 }}>{item.item}</div>
                                <p style={{ fontSize: 12, color: '#6B7A91' }}>{item.description}</p>
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
          )}
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;700&family=Space+Mono&display=swap');
        @keyframes progress { from { width: 0% } to { width: 100% } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #060A0F; }
        ::-webkit-scrollbar-thumb { background: rgba(0,245,160,0.2); border-radius: 2px; }
      `}</style>
    </div>
  )
}