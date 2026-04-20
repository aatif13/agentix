'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Save, User, Target, Bell, Briefcase, Send, Code, 
  MapPin, Globe, Users, Rocket, Check, Loader2, Camera
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

interface ProfileData {
  name: string
  email: string
  avatar: string
  linkedinUrl: string
  twitterUrl: string
  githubUrl: string
  location: string
  bio: string
  preferredIndustry: string
  stage: 'idea' | 'mvp' | 'revenue' | 'scaling'
  cofounderStatus: 'solo' | 'has co-founder' | 'looking for co-founder'
  notifications: {
    investorViews: boolean
    progressReminders: boolean
    problemSuggestions: boolean
  }
}

const T = {
  card: { background: '#0C1018', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 },
  input: { width: '100%', background: '#060A0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 14px', color: '#E8EDF5', fontSize: 14, outline: 'none' },
  label: { display: 'block', fontSize: 11, color: '#6B7A91', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8, fontFamily: "'Space Mono', monospace" },
  btn: { padding: '12px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: '#00F5A0', color: '#060A0F', display: 'inline-flex', alignItems: 'center', gap: 8 },
  accent: '#00F5A0',
  dim: '#6B7A91',
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'profile' | 'startup' | 'notifications'>('profile')
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    avatar: '',
    linkedinUrl: '',
    twitterUrl: '',
    githubUrl: '',
    location: '',
    bio: '',
    preferredIndustry: '',
    stage: 'idea',
    cofounderStatus: 'solo',
    notifications: {
      investorViews: true,
      progressReminders: true,
      problemSuggestions: true,
    }
  })
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handlePhotoClick = () => fileInputRef.current?.click()
  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setProfile({ ...profile, avatar: url })
      setSelectedFile(file)
    }
  }
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user')
        if (res.ok) {
          const data = await res.json()
          setProfile(data.user)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        ...T.label,
        display: 'flex', 
        alignItems: 'center', 
        gap: 10, 
        padding: '12px 20px',
        background: activeTab === id ? 'rgba(0, 245, 160, 0.05)' : 'transparent',
        border: 'none', 
        borderBottom: `2px solid ${activeTab === id ? T.accent : 'transparent'}`,
        color: activeTab === id ? '#fff' : T.dim,
        cursor: 'pointer', 
        fontSize: 13, 
        transition: 'all 0.2s',
        textTransform: 'none', 
        marginBottom: 0
      }}
    >
      <Icon size={16} /> {label}
    </button>
  )

  if (loading) return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <TopBar title="Settings" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
          <Loader2 className="animate-spin" size={32} style={{ color: T.accent }} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <TopBar title="Founder Settings" subtitle="Configure your profile and professional preferences" />
        <div className="dashboard-content" style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '32px' }}>
            <TabButton id="profile" label="Profile Essentials" icon={User} />
            <TabButton id="startup" label="Startup Preferences" icon={Target} />
            <TabButton id="notifications" label="Notifications" icon={Bell} />
          </div>

          <div style={{ minHeight: '400px' }}>
            
            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '8px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ 
                      width: '80px', height: '80px', borderRadius: '16px', overflow: 'hidden',
                      background: profile.avatar ? 'transparent' : 'rgba(0, 245, 160, 0.12)', border: '2px solid rgba(0, 245, 160, 0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '32px', fontWeight: 800, color: T.accent, fontFamily: 'Syne'
                    }}>
                      {profile.avatar ? <img src={profile.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (profile.name ? profile.name.charAt(0).toUpperCase() : '?')}
                    </div>
                    <button onClick={handlePhotoClick} style={{ 
                      position: 'absolute', bottom: '-4px', right: '-4px', 
                      width: '28px', height: '28px', borderRadius: '50%', background: '#1A2535',
                      border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: T.dim, cursor: 'pointer'
                    }} title="Upload Photo">
                      <Camera size={14} />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', fontFamily: 'Syne' }}>{profile.name || 'Founder Name'}</h2>
                    <p style={{ color: T.dim, fontSize: '13px' }}>{profile.email}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={T.label}>Full Name</label>
                    <input style={T.input} value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                  </div>
                  <div>
                    <label style={T.label}>Email (Read-only)</label>
                    <input style={{...T.input, opacity: 0.5}} value={profile.email} disabled />
                  </div>
                </div>

                <div>
                  <label style={T.label}>Bio (2-3 sentences)</label>
                  <textarea style={{...T.input, minHeight: '80px', resize: 'vertical'}} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} placeholder="Tell us about yourself..." />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={T.label}>Location</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: T.dim }} />
                      <input style={{...T.input, paddingLeft: '40px'}} value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} placeholder="e.g. San Francisco, CA" />
                    </div>
                  </div>
                  <div>
                    <label style={T.label}>Website / URL</label>
                    <div style={{ position: 'relative' }}>
                      <Globe size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: T.dim }} />
                      <input style={{...T.input, paddingLeft: '40px'}} placeholder="https://yourwebsite.com" />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={T.label}>LinkedIn</label>
                    <div style={{ position: 'relative' }}>
                      <Briefcase size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: T.dim }} />
                      <input style={{...T.input, paddingLeft: '40px'}} value={profile.linkedinUrl} onChange={e => setProfile({...profile, linkedinUrl: e.target.value})} placeholder="linkedin.com/in/..." />
                    </div>
                  </div>
                  <div>
                    <label style={T.label}>Twitter / X</label>
                    <div style={{ position: 'relative' }}>
                      <Send size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: T.dim }} />
                      <input style={{...T.input, paddingLeft: '40px'}} value={profile.twitterUrl} onChange={e => setProfile({...profile, twitterUrl: e.target.value})} placeholder="@username" />
                    </div>
                  </div>
                  <div>
                    <label style={T.label}>GitHub</label>
                    <div style={{ position: 'relative' }}>
                      <Code size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: T.dim }} />
                      <input style={{...T.input, paddingLeft: '40px'}} value={profile.githubUrl} onChange={e => setProfile({...profile, githubUrl: e.target.value})} placeholder="github.com/..." />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: STARTUP PREFERENCES */}
            {activeTab === 'startup' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <label style={T.label}>Preferred Industry</label>
                  <input style={T.input} value={profile.preferredIndustry} onChange={e => setProfile({...profile, preferredIndustry: e.target.value})} placeholder="e.g. FinTech, B2B SaaS, HealthTech" />
                </div>

                <div>
                  <label style={T.label}>Current Startup Stage</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {['idea', 'mvp', 'revenue', 'scaling'].map(stage => (
                      <button
                        key={stage}
                        onClick={() => setProfile({...profile, stage: stage as any})}
                        style={{
                          padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                          background: profile.stage === stage ? 'rgba(0, 245, 160, 0.1)' : '#0C1018',
                          color: profile.stage === stage ? T.accent : T.dim,
                          cursor: 'pointer', fontWeight: 600, fontSize: '13px', textTransform: 'capitalize'
                        }}
                      >
                        {stage}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={T.label}>Co-Founder Status</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {['solo', 'has co-founder', 'looking for co-founder'].map(status => (
                      <button
                        key={status}
                        onClick={() => setProfile({...profile, cofounderStatus: status as any})}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: profile.cofounderStatus === status ? 'rgba(0, 245, 160, 0.05)' : '#0C1018',
                          color: profile.cofounderStatus === status ? '#fff' : T.dim,
                          cursor: 'pointer', textAlign: 'left' as const, transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ 
                          width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${profile.cofounderStatus === status ? T.accent : 'rgba(255,255,255,0.15)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {profile.cofounderStatus === status && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: T.accent }} />}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 500, textTransform: 'capitalize' }}>{status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { id: 'investorViews', label: 'Email me when an investor views my pitch', desc: 'Instant notification whenever your profile is accessed by a verified investor' },
                  { id: 'progressReminders', label: 'Email me when I receive a new message', desc: 'Get notified by email when an investor sends you a message' },
                  { id: 'problemSuggestions', label: 'Email me when an investor accepts my introduction', desc: 'Get notified when a founder accepts your introduction request' }
                ].map(item => (
                  <div key={item.id} style={{ ...T.card, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{item.label}</p>
                      <p style={{ fontSize: '12px', color: T.dim }}>{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => setProfile({
                        ...profile, 
                        notifications: { ...profile.notifications, [item.id]: !((profile.notifications as any)[item.id]) }
                      })}
                      style={{
                        width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer',
                        background: (profile.notifications as any)[item.id] ? T.accent : 'rgba(255,255,255,0.05)',
                        border: 'none', position: 'relative', transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: '3px', 
                        left: (profile.notifications as any)[item.id] ? '23px' : '3px',
                        width: '18px', height: '18px', borderRadius: '50%',
                        background: (profile.notifications as any)[item.id] ? '#060A0F' : T.dim,
                        transition: 'all 0.2s'
                      }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            {saved && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: T.accent, fontSize: '13px', fontWeight: 600 }}>
                <Check size={16} /> Saved!
              </div>
            )}
            <button 
              onClick={handleSave} 
              disabled={saving}
              style={{...T.btn, opacity: saving ? 0.7 : 1}}
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>

        </div>
      </div>
      <style jsx>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
