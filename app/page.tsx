'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Zap, ArrowRight, Lightbulb, Code2, TrendingUp, DollarSign,
  Scale, BarChart3, CheckCircle, Star, ChevronRight,
  Brain, Search, Megaphone, FileText
} from 'lucide-react'

const features = [
  { icon: Lightbulb, title: 'Idea Lab', desc: 'AI-powered validation scores, lean canvas generation, and competitor intelligence in under 60 seconds.', color: 'var(--color-green)' },
  { icon: Code2, title: 'Build Studio', desc: 'Spin up your MVP with AI-generated code, architecture diagrams, and tech stack recommendations.', color: 'var(--color-cyan)' },
  { icon: TrendingUp, title: 'Growth Engine', desc: 'Automated content strategy, social campaigns, and SEO optimization built for hypergrowth.', color: 'var(--color-purple)' },
  { icon: DollarSign, title: 'Funding Hub', desc: 'AI-crafted pitch decks, investor matching, and financial modeling to close your next round.', color: 'var(--color-orange)' },
  { icon: Scale, title: 'Legal Desk', desc: 'Contract drafting, compliance checks, and IP protection — all in plain English, instantly.', color: 'var(--color-green)' },
  { icon: BarChart3, title: 'Analytics Brain', desc: 'Vanity-free metrics, growth accounting, and predictive modeling to keep you data-driven.', color: 'var(--color-cyan)' },
]

const agents = [
  { emoji: '🧠', name: 'Supervisor AI', role: 'Orchestrates all agents', color: 'var(--color-purple)' },
  { emoji: '🔍', name: 'Research Agent', role: 'Market intelligence', color: 'var(--color-cyan)' },
  { emoji: '💻', name: 'Code Agent', role: 'Full-stack generation', color: 'var(--color-green)' },
  { emoji: '📣', name: 'Marketing Agent', role: 'Growth & campaigns', color: 'var(--color-orange)' },
  { emoji: '⚖️', name: 'Legal Agent', role: 'Compliance & contracts', color: 'var(--color-green)' },
  { emoji: '💰', name: 'Finance Agent', role: 'Modeling & forecasting', color: 'var(--color-purple)' },
]

const pricing = [
  {
    name: 'Starter', price: 29, color: 'var(--color-cyan)',
    features: ['5 Idea Validations/mo', '50 Chat Messages/mo', '10 Agent Tasks/mo', 'Lean Canvas Export', 'Email Support'],
    cta: 'Get Started',
  },
  {
    name: 'Growth', price: 99, color: 'var(--color-green)', popular: true,
    features: ['Unlimited Validations', '500 Chat Messages/mo', '100 Agent Tasks/mo', 'All 6 Modules', 'API Access', 'Priority Support'],
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise', price: 499, color: 'var(--color-purple)',
    features: ['Everything in Growth', 'Custom AI Agents', 'Dedicated Infrastructure', 'SSO & Security', 'SLA Guarantee', '24/7 Support'],
    cta: 'Contact Sales',
  },
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="landing-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 40px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(6,10,15,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Zap size={22} style={{ color: 'var(--color-green)' }} />
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: 'var(--color-green)', letterSpacing: '0.08em' }}>AGENTIX</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {['Features', 'Agents', 'Pricing'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" className="btn btn-outline" style={{ padding: '8px 18px', fontSize: 13 }}>Login</Link>
          <Link href="/signup" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>Get Started <ArrowRight size={14} /></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="grid-bg" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '100px 40px 80px',
        position: 'relative',
      }}>
        {/* Glow orbs */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,245,160,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 840, position: 'relative', zIndex: 1 }}>
          <div className="fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,245,160,0.06)', border: '1px solid rgba(0,245,160,0.15)',
            borderRadius: 4, padding: '6px 16px', marginBottom: 32,
            fontFamily: 'Space Mono', fontSize: 12, color: 'var(--color-green)',
          }}>
            <span style={{ width: 6, height: 6, background: 'var(--color-green)', borderRadius: '50%' }} />
            12+ AI Agents · Live Now
          </div>
          <h1 className="fade-up fade-up-delay-1" style={{ fontSize: 'clamp(48px, 8vw, 88px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 24 }}>
            Your AI Co-Founder.<br />
            <span style={{ color: 'var(--color-green)' }}>Always On.</span>
          </h1>
          <p className="fade-up fade-up-delay-2" style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            From zero to funded — Agentix deploys specialized AI agents to validate ideas, build products, grow audiences, and close rounds.
          </p>
          <div className="fade-up fade-up-delay-3" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 14 }}>
              Start Building Free <ArrowRight size={16} />
            </Link>
            <Link href="#features" className="btn btn-outline" style={{ padding: '14px 32px', fontSize: 14 }}>
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 40px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 80, flexWrap: 'wrap' }}>
          {[
            { value: '12+', label: 'AI Agents' },
            { value: '6', label: 'Core Modules' },
            { value: '500+', label: 'Startups Helped' },
            { value: '99.9%', label: 'Uptime SLA' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Syne', fontSize: 40, fontWeight: 800, color: 'var(--color-green)' }}>{s.value}</p>
              <p style={{ fontFamily: 'Space Mono', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '100px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontFamily: 'Space Mono', fontSize: 12, color: 'var(--color-green)', marginBottom: 12, letterSpacing: '0.08em' }}>PLATFORM MODULES</p>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800 }}>Everything your startup needs</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, marginTop: 12, maxWidth: 500, margin: '12px auto 0' }}>Six integrated modules powered by AI agents that work together to accelerate your growth.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="card" style={{ cursor: 'default', transition: 'border-color 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = f.color + '40'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                >
                  <div style={{ width: 44, height: 44, background: f.color + '15', border: `1px solid ${f.color}30`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Icon size={22} style={{ color: f.color }} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Space Mono', fontSize: 12, color: f.color }}>
                    Explore <ChevronRight size={14} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Agents */}
      <section id="agents" style={{ padding: '80px 40px', background: 'rgba(12,16,24,0.5)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <p style={{ fontFamily: 'Space Mono', fontSize: 12, color: 'var(--color-cyan)', marginBottom: 12, letterSpacing: '0.08em' }}>SPECIALIZED AGENTS</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800 }}>Meet your AI team</h2>
          </div>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
            {agents.map((a) => (
              <div key={a.name} className="card" style={{
                minWidth: 200, flexShrink: 0, textAlign: 'center', padding: '24px 20px',
                cursor: 'default', transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = a.color + '40'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>{a.emoji}</div>
                <div style={{ width: 8, height: 8, background: a.color, borderRadius: '50%', margin: '0 auto 12px', boxShadow: `0 0 8px ${a.color}` }} />
                <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{a.name}</p>
                <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)' }}>{a.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '100px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontFamily: 'Space Mono', fontSize: 12, color: 'var(--color-purple)', marginBottom: 12, letterSpacing: '0.08em' }}>PRICING</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800 }}>Invest in your success</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, marginTop: 12 }}>All plans include a 14-day free trial. No credit card required.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
            {pricing.map((p) => (
              <div key={p.name} className="card" style={{
                position: 'relative', padding: '32px 28px',
                borderColor: p.popular ? p.color + '50' : 'var(--border)',
                boxShadow: p.popular ? `0 0 40px ${p.color}10` : 'none',
              }}>
                {p.popular && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: p.color, color: '#060A0F', padding: '3px 14px',
                    fontFamily: 'Space Mono', fontSize: 11, fontWeight: 700, borderRadius: 4,
                    whiteSpace: 'nowrap',
                  }}>MOST POPULAR</div>
                )}
                <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: p.color, marginBottom: 8, letterSpacing: '0.06em' }}>{p.name.toUpperCase()}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                  <span style={{ fontFamily: 'Syne', fontSize: 48, fontWeight: 800, color: 'var(--text-primary)' }}>${p.price}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>/month</span>
                </div>
                <ul style={{ listStyle: 'none', marginBottom: 28 }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, color: 'var(--text-muted)' }}>
                      <CheckCircle size={14} style={{ color: p.color, flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="btn" style={{
                  width: '100%', justifyContent: 'center', fontSize: 13,
                  background: p.popular ? p.color : 'transparent',
                  color: p.popular ? '#060A0F' : p.color,
                  border: `1px solid ${p.color}50`,
                }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '80px 40px', background: 'rgba(0,245,160,0.03)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, marginBottom: 16 }}>
            Ready to build your <span style={{ color: 'var(--color-green)' }}>AI-powered startup?</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 32 }}>Join 500+ founders who&apos;ve shipped faster with Agentix.</p>
          <Link href="/signup" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: 14 }}>
            Start Free Today <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={16} style={{ color: 'var(--color-green)' }} />
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: 'var(--color-green)' }}>AGENTIX</span>
        </div>
        <p style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)' }}>
          © 2026 Agentix. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
