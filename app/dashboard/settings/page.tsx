'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Save, Key, ToggleLeft, AlertTriangle, Check, User } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import LoadingSkeleton from '@/components/LoadingSkeleton'

interface UserProfile {
  name: string
  email: string
  startupName: string
  startupIdea: string
  openaiKey: string
  serperKey: string
  plan: string
}

const INTEGRATIONS = [
  { name: 'Notion', desc: 'Sync ideas and tasks to Notion pages', emoji: '📝' },
  { name: 'GitHub', desc: 'Connect repos for AI code agent context', emoji: '🐙' },
  { name: 'Slack', desc: 'Get agent task updates in Slack', emoji: '💬' },
  { name: 'Linear', desc: 'Auto-create issues from agent tasks', emoji: '📋' },
]

export default function SettingsPage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile>({ name: '', email: '', startupName: '', startupIdea: '', openaiKey: '', serperKey: '', plan: 'starter' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toggles, setToggles] = useState<Record<string, boolean>>({})
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user')
        if (res.ok) {
          const data = await res.json()
          const u = data.user
          setProfile({
            name: u.name || '',
            email: u.email || '',
            startupName: u.startupName || '',
            startupIdea: u.startupIdea || '',
            openaiKey: u.openaiKey || '',
            serperKey: u.serperKey || '',
            plan: u.plan || 'starter',
          })
        }
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [session])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const planColors: Record<string, string> = {
    starter: 'var(--color-cyan)',
    growth: 'var(--color-green)',
    enterprise: 'var(--color-purple)',
  }

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main">
          <TopBar title="Settings" />
          <div className="dashboard-content">
            <LoadingSkeleton type="card" count={4} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <TopBar title="Settings" subtitle="Manage your profile and integrations" />
        <div className="dashboard-content" style={{ maxWidth: 720 }}>

          {saved && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(0,245,160,0.08)', border: '1px solid rgba(0,245,160,0.2)',
              borderRadius: 4, padding: '10px 16px', marginBottom: 20,
              color: 'var(--color-green)', fontSize: 13,
            }}>
              <Check size={14} /> Settings saved successfully
            </div>
          )}

          {/* Profile */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <User size={16} style={{ color: 'var(--color-green)' }} />
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>Profile</h2>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 4,
                  background: 'rgba(0,245,160,0.12)', border: '2px solid rgba(0,245,160,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Syne', fontWeight: 800, fontSize: 24, color: 'var(--color-green)',
                  flexShrink: 0,
                }}>
                  {profile.name.charAt(0).toUpperCase() || '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, marginBottom: 2 }}>{profile.name}</p>
                  <p style={{ fontFamily: 'Space Mono', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{profile.email}</p>
                  <span style={{
                    fontFamily: 'Space Mono', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                    color: planColors[profile.plan] || planColors.starter,
                    background: (planColors[profile.plan] || planColors.starter) + '15',
                    border: `1px solid ${(planColors[profile.plan] || planColors.starter)}30`,
                    borderRadius: 4, padding: '2px 8px',
                  }}>
                    {profile.plan.toUpperCase()} PLAN
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input className="input" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Email</label>
                  <input className="input" value={profile.email} disabled style={{ opacity: 0.6 }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Startup Name</label>
                  <input className="input" placeholder="Untitled Startup" value={profile.startupName} onChange={e => setProfile({ ...profile, startupName: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Startup Idea (short)</label>
                  <input className="input" placeholder="One-line pitch" value={profile.startupIdea} onChange={e => setProfile({ ...profile, startupIdea: e.target.value })} />
                </div>
              </div>

              {/* API Keys */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 20, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Key size={14} style={{ color: 'var(--color-purple)' }} />
                <h3 style={{ fontSize: 13, fontWeight: 700 }}>API Keys</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">OpenAI API Key</label>
                  <input className="input" type="password" placeholder="sk-..." value={profile.openaiKey} onChange={e => setProfile({ ...profile, openaiKey: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Serper API Key</label>
                  <input className="input" type="password" placeholder="serp-..." value={profile.serperKey} onChange={e => setProfile({ ...profile, serperKey: e.target.value })} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 20, fontSize: 13 }}>
                {saving ? <><span className="spinner" /> Saving...</> : <><Save size={14} /> Save Changes</>}
              </button>
            </form>
          </div>

          {/* Plan */}
          <div className="card" style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Current Plan</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--elevated)', borderRadius: 4, border: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: planColors[profile.plan] || planColors.starter }}>
                  {profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)} Plan
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  {profile.plan === 'starter' ? '5 validations, 50 chats, 10 tasks/month' :
                    profile.plan === 'growth' ? 'Unlimited validations, 500 chats, 100 tasks/month' :
                      'Everything + custom agents, SLA, SSO'}
                </p>
              </div>
              <button className="btn btn-outline" style={{ fontSize: 12 }}>Upgrade Plan</button>
            </div>
          </div>

          {/* Integrations */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <ToggleLeft size={16} style={{ color: 'var(--color-cyan)' }} />
              <h2 style={{ fontSize: 15, fontWeight: 700 }}>Integrations</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {INTEGRATIONS.map(int => (
                <div key={int.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--elevated)', borderRadius: 4, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{int.emoji}</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{int.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{int.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setToggles(prev => ({ ...prev, [int.name]: !prev[int.name] }))}
                    style={{
                      width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                      background: toggles[int.name] ? 'var(--color-green)' : 'var(--elevated)',
                      border: `1px solid ${toggles[int.name] ? 'var(--color-green)' : 'var(--border)'}`,
                      transition: 'all 0.2s', position: 'relative',
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: 3, left: toggles[int.name] ? 22 : 3,
                      width: 16, height: 16, borderRadius: '50%',
                      background: toggles[int.name] ? '#060A0F' : 'var(--text-muted)',
                      transition: 'left 0.2s',
                    }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card" style={{ borderColor: 'rgba(255,107,53,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <AlertTriangle size={16} style={{ color: 'var(--color-orange)' }} />
              <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-orange)' }}>Danger Zone</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(255,107,53,0.04)', borderRadius: 4, border: '1px solid rgba(255,107,53,0.15)' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>Delete Account</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Permanently delete your account and all data. This cannot be undone.</p>
              </div>
              <button className="btn btn-danger" style={{ fontSize: 12 }} onClick={() => setShowDeleteModal(true)}>
                Delete Account
              </button>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}>
              <div className="modal-box" style={{ maxWidth: 440 }}>
                <div className="modal-header">
                  <h2 className="modal-title" style={{ color: 'var(--color-orange)' }}>⚠️ Delete Account</h2>
                  <button className="modal-close" onClick={() => setShowDeleteModal(false)} aria-label="Close">×</button>
                </div>
                <div className="modal-body">
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                    This will permanently delete your account, all chats, ideas, and tasks. This action <strong style={{ color: 'var(--text-primary)' }}>cannot be undone</strong>.
                  </p>
                  <div className="form-group">
                    <label className="form-label">Type <strong style={{ color: 'var(--color-orange)' }}>DELETE</strong> to confirm</label>
                    <input className="input" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="DELETE" />
                  </div>
                  <button className="btn btn-danger" disabled={deleteConfirm !== 'DELETE'} style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
                    Permanently Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
