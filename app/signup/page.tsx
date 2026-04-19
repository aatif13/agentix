'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Zap, Eye, EyeOff, AlertCircle, CheckCircle, Building2, TrendingUp } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [role, setRole] = useState<'founder' | 'investor'>('founder')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const normalizedEmail = form.email.toLowerCase().trim()
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, email: normalizedEmail, role }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed')
        return
      }
      const signInRes = await signIn('credentials', {
        redirect: false,
        email: normalizedEmail,
        password: form.password,
      })
      if (signInRes?.error) {
        setError('Account created! Please log in.')
        router.push('/login')
      } else {
        router.push(role === 'investor' ? '/investor/dashboard' : '/dashboard')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const pwStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3
  const pwColors = ['', 'var(--color-orange)', '#FFC300', 'var(--color-green)']
  const pwLabels = ['', 'Too short', 'Good', 'Strong']

  return (
    <div className="grid-bg" style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Zap size={24} style={{ color: 'var(--color-green)' }} />
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: 'var(--color-green)', letterSpacing: '0.08em' }}>AGENTIX</span>
          </Link>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>Build your AI startup team — free</p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Create your account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>No credit card required · 14-day free trial</p>

          {/* Role Selector */}
          <div style={{ marginBottom: 24 }}>
            <label className="form-label" style={{ marginBottom: 10, display: 'block' }}>I am a...</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {([
                { value: 'founder', label: "I'm a Founder", icon: Building2, desc: 'Build & validate startups' },
                { value: 'investor', label: "I'm an Investor", icon: TrendingUp, desc: 'Discover deal flow' },
              ] as const).map(opt => {
                const Icon = opt.icon
                const active = role === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    style={{
                      background: active ? 'rgba(0,245,160,0.06)' : 'var(--elevated)',
                      border: `1px solid ${active ? 'var(--color-green)' : 'var(--border)'}`,
                      borderRadius: 6,
                      padding: '14px 12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      outline: 'none',
                    }}
                  >
                    <Icon size={18} style={{ color: active ? 'var(--color-green)' : 'var(--text-muted)', marginBottom: 6 }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--color-green)' : 'var(--text-primary)', marginBottom: 2 }}>{opt.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>{opt.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)',
              borderRadius: 4, padding: '10px 14px', marginBottom: 20,
              color: 'var(--color-orange)', fontSize: 13,
            }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input"
                placeholder="Full Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="Email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input"
                  placeholder="Password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ paddingRight: 42 }}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= pwStrength ? pwColors[pwStrength] : 'var(--elevated)', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, fontFamily: 'Space Mono', color: pwColors[pwStrength] }}>{pwLabels[pwStrength]}</p>
                </div>
              )}
            </div>
            <button type="submit" id="signup-submit-btn" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '12px 0' }}>
              {loading ? <><span className="spinner" /> Creating account...</> : `Create ${role === 'investor' ? 'Investor' : 'Founder'} Account`}
            </button>
          </form>

          <div style={{ marginTop: 20 }}>
            {['No credit card required', 'Cancel anytime', '14-day free trial'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                <CheckCircle size={13} style={{ color: 'var(--color-green)' }} />
                {t}
              </div>
            ))}
          </div>

          <div style={{ position: 'relative', textAlign: 'center', margin: '20px 0' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--border)' }} />
            <span style={{ position: 'relative', background: 'var(--surface)', padding: '0 12px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Space Mono' }}>OR</span>
          </div>

          <button
            type="button"
            onClick={async () => {
              await signIn('google', {
                callbackUrl: '/dashboard',
                redirect: true
              })
            }}
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'center', gap: 10 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--color-green)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
