'use client'

import { useEffect, useState, useRef } from 'react'
import { Zap, TrendingUp, ChevronDown } from 'lucide-react'
import TopBar from '@/components/TopBar'

const SECTOR_ICONS: Record<string, string> = {
  'SaaS': '☁️', 'FinTech': '💳', 'HealthTech': '🏥', 'EdTech': '🎓',
  'E-Commerce': '🛒', 'AI/ML': '🤖', 'Climate Tech': '🌱', 'Web3': '🔗',
  'Developer Tools': '⚡', 'Consumer Apps': '📱',
}

export default function InsightsPage() {
  const [sectors, setSectors] = useState<string[]>([])
  const [selectedSector, setSelectedSector] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingSectors, setFetchingSectors] = useState(true)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/investor/insights')
      .then(r => r.json())
      .then(data => { setSectors(data.sectors || []); setSelectedSector(data.sectors?.[0] || '') })
      .catch(console.error)
      .finally(() => setFetchingSectors(false))
  }, [])

  const generateInsight = async () => {
    if (!selectedSector || loading) return
    setLoading(true)
    setContent('')

    try {
      const res = await fetch('/api/investor/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector: selectedSector }),
      })

      if (!res.ok) { setContent('Failed to generate insights. Please try again.'); return }
      if (!res.body) return

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setContent(full)
        // Auto-scroll
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight
        }
      }
    } catch (e) {
      console.error(e)
      setContent('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Format markdown-ish content
  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h3 key={i} style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-green)', margin: '20px 0 8px', fontFamily: 'Syne' }}>{line.replace(/\*\*/g, '')}</h3>
      }
      if (line.match(/^\d+\.\s\*\*/)) {
        const parts = line.replace(/^\d+\.\s/, '').split('**').filter(Boolean)
        return (
          <div key={i} style={{ marginBottom: 10 }}>
            <span style={{ color: 'var(--color-green)', fontWeight: 700 }}>{parts[0]}</span>
            {parts[1] && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{parts[1]}</span>}
          </div>
        )
      }
      if (line.startsWith('-') || line.startsWith('•')) {
        return <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, paddingLeft: 8 }}>
          <span style={{ color: 'var(--color-green)', flexShrink: 0 }}>›</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{line.replace(/^[-•]\s*/, '')}</span>
        </div>
      }
      if (line.trim() === '') return <div key={i} style={{ height: 8 }} />
      return <p key={i} style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 6 }}>{line}</p>
    })
  }

  return (
    <>
      <TopBar title="AI Market Insights" subtitle="Powered by Groq — real-time sector trend analysis" />
      <div className="dashboard-content">

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>

          {/* Sector Selector Panel */}
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Select Sector</h2>
            {fetchingSectors ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 44, borderRadius: 6 }} />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sectors.map(sector => {
                  const active = sector === selectedSector
                  return (
                    <button
                      key={sector}
                      onClick={() => setSelectedSector(sector)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', borderRadius: 6, border: '1px solid',
                        borderColor: active ? 'rgba(0,245,160,0.3)' : 'var(--border)',
                        background: active ? 'rgba(0,245,160,0.06)' : 'var(--elevated)',
                        cursor: 'pointer', textAlign: 'left',
                        color: active ? 'var(--color-green)' : 'var(--text-muted)',
                        fontSize: 13, fontWeight: active ? 600 : 400,
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{SECTOR_ICONS[sector] || '📊'}</span>
                      {sector}
                      {active && <ChevronDown size={13} style={{ marginLeft: 'auto', transform: 'rotate(-90deg)' }} />}
                    </button>
                  )
                })}
              </div>
            )}

            <button
              onClick={generateInsight}
              disabled={loading || !selectedSector}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: 8, marginTop: 20, padding: '11px 0' }}
            >
              {loading ? (
                <><span className="spinner" /> Generating...</>
              ) : (
                <><Zap size={14} /> Generate Insights</>
              )}
            </button>
          </div>

          {/* Content Panel */}
          <div className="card" style={{ minHeight: 500, padding: 28 }}>
            {!content && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, textAlign: 'center' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'rgba(0,245,160,0.06)', border: '1px solid rgba(0,245,160,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20, animation: 'pulse-glow 3s ease infinite',
                }}>
                  <TrendingUp size={28} style={{ color: 'var(--color-green)' }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>AI Market Intelligence</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 320, lineHeight: 1.6 }}>
                  Select a sector and click <strong>Generate Insights</strong> to get an AI-powered market trend analysis for investment decision-making.
                </p>
              </div>
            )}

            {(content || loading) && (
              <div ref={contentRef} style={{ maxHeight: 600, overflowY: 'auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 24 }}>{SECTOR_ICONS[selectedSector] || '📊'}</span>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>{selectedSector} — Market Analysis</h2>
                    <p style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      POWERED BY GROQ × LLAMA 3.3 70B · {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div>{formatContent(content)}</div>

                {/* Typing cursor */}
                {loading && (
                  <span style={{
                    display: 'inline-block', width: 2, height: 16, background: 'var(--color-green)',
                    marginLeft: 2, animation: 'status-pulse 0.8s ease infinite', verticalAlign: 'text-bottom',
                  }} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 20, opacity: 0.6 }}>
          AI-generated insights are for informational purposes only and do not constitute financial or investment advice.
        </p>
      </div>
    </>
  )
}
