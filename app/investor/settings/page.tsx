'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Save, User, Briefcase, Bell, Check, Loader2, Camera,
  MapPin, Send, Globe, Info, Rocket
} from 'lucide-react'
import TopBar from '@/components/TopBar'

interface InvestorProfileData {
  fullName: string
  photo: string
  linkedIn: string
  twitter: string
  location: string
  bio: string
  firmName: string
  investmentFocus: string[]
  preferredStage: string[]
  ticketSizeMin: number
  ticketSizeMax: number
  portfolio: string
  notifications: {
    newMatchingStartups: boolean
    watchlistUpdates: boolean
    weeklyDigest: boolean
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

const FOCUS_OPTIONS = ['SaaS', 'FinTech', 'HealthTech', 'EdTech', 'D2C', 'DeepTech', 'CleanTech', 'Other']
const STAGE_OPTIONS = ['Idea', 'MVP', 'Revenue', 'Scaling']

export default function InvestorSettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'profile' | 'investment' | 'notifications'>('profile')
  const [profile, setProfile] = useState<InvestorProfileData>({
    fullName: '',
    photo: '',
    linkedIn: '',
    twitter: '',
    location: '',
    bio: '',
    firmName: '',
    investmentFocus: [],
    preferredStage: [],
    ticketSizeMin: 0,
    ticketSizeMax: 0,
    portfolio: '',
    notifications: {
      newMatchingStartups: true,
      watchlistUpdates: true,
      weeklyDigest: true,
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
      setProfile({ ...profile, photo: url })
      setSelectedFile(file)
    }
  }
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/investor/settings')
        if (res.ok) {
          const data = await res.json()
          setProfile(data.profile)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/investor/settings', {
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

  const toggleFocus = (focus: string) => {
    const updated = profile.investmentFocus.includes(focus)
      ? profile.investmentFocus.filter(f => f !== focus)
      : [...profile.investmentFocus, focus]
    setProfile({ ...profile, investmentFocus: updated })
  }

  const toggleStage = (stage: string) => {
    const updated = profile.preferredStage.includes(stage)
      ? profile.preferredStage.filter(s => s !== stage)
      : [...profile.preferredStage, stage]
    setProfile({ ...profile, preferredStage: updated })
  }

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        ...T.label,
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px',
        background: activeTab === id ? 'rgba(0, 245, 160, 0.05)' : 'transparent',
        border: 'none', borderBottom: `2px solid ${activeTab === id ? T.accent : 'transparent'}`,
        color: activeTab === id ? '#fff' : T.dim,
        cursor: 'pointer', fontSize: 13, transition: 'all 0.2s', textTransform: 'none', marginBottom: 0
      }}
    >
      <Icon size={16} /> {label}
    </button>
  )

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#060A0F' }}>
      <Loader2 className="animate-spin" size={32} style={{ color: T.accent }} />
    </div>
  )

  return (
    <div className="dashboard-content" style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      <TopBar title="Investor Settings" subtitle="Preferences for deal flow and platform visibility" />

      {/* Tab Nav */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '32px', marginTop: '24px' }}>
        <TabButton id="profile" label="Personal Profile" icon={User} />
        <TabButton id="investment" label="Investment Profile" icon={Briefcase} />
        <TabButton id="notifications" label="Notifications" icon={Bell} />
      </div>

      <div style={{ minHeight: '500px' }}>
        {/* TAB 1: PERSONAL */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden',
                  background: profile.photo ? 'transparent' : 'rgba(0,245,160,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(0,245,160,0.3)'
                }}>
                  {profile.photo ? <img src={profile.photo} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={32} style={{ color: T.accent }} />}
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
                <h3 style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'Syne' }}>{profile.fullName || 'Investor Profile'}</h3>
                <p style={{ color: T.dim, fontSize: '13px' }}>{session?.user?.email}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={T.label}>Full Name</label>
                <input style={T.input} value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} placeholder="Enter your full name" />
              </div>
              <div>
                <label style={T.label}>Location</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: T.dim }} />
                  <input style={{...T.input, paddingLeft: '40px'}} value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} placeholder="e.g. London, UK" />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={T.label}>LinkedIn URL</label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: T.dim }} />
                  <input style={{...T.input, paddingLeft: '40px'}} value={profile.linkedIn} onChange={e => setProfile({...profile, linkedIn: e.target.value})} placeholder="linkedin.com/in/..." />
                </div>
              </div>
              <div>
                <label style={T.label}>Twitter / X</label>
                <div style={{ position: 'relative' }}>
                  <Send size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: T.dim }} />
                  <input style={{...T.input, paddingLeft: '40px'}} value={profile.twitter} onChange={e => setProfile({...profile, twitter: e.target.value})} placeholder="@username" />
                </div>
              </div>
            </div>

            <div>
              <label style={T.label}>Short Bio</label>
              <textarea style={{...T.input, minHeight: '100px', resize: 'vertical'}} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} placeholder="Briefly describe your investment thesis and background..." />
            </div>
          </div>
        )}

        {/* TAB 2: INVESTMENT */}
        {activeTab === 'investment' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <label style={T.label}>Fund / Firm Name</label>
              <input style={T.input} value={profile.firmName} onChange={e => setProfile({...profile, firmName: e.target.value})} placeholder="e.g. Sequoia Capital (or leave blank if Angel)" />
            </div>

            <div>
              <label style={T.label}>Investment Focus</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {FOCUS_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => toggleFocus(opt)}
                    style={{
                      padding: '8px 16px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)',
                      background: profile.investmentFocus.includes(opt) ? 'rgba(0,245,160,0.1)' : 'transparent',
                      color: profile.investmentFocus.includes(opt) ? T.accent : T.dim,
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={T.label}>Preferred Stage</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {STAGE_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => toggleStage(opt)}
                    style={{
                      padding: '8px 16px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.1)',
                      background: profile.preferredStage.includes(opt) ? 'rgba(0,245,160,0.1)' : 'transparent',
                      color: profile.preferredStage.includes(opt) ? T.accent : T.dim,
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={T.label}>Min Ticket Size ($)</label>
                <input type="number" style={T.input} value={profile.ticketSizeMin} onChange={e => setProfile({...profile, ticketSizeMin: Number(e.target.value)})} />
              </div>
              <div>
                <label style={T.label}>Max Ticket Size ($)</label>
                <input type="number" style={T.input} value={profile.ticketSizeMax} onChange={e => setProfile({...profile, ticketSizeMax: Number(e.target.value)})} />
              </div>
            </div>

            <div>
              <label style={T.label}>Portfolio Companies / Notable Investments</label>
              <textarea style={{...T.input, minHeight: '80px', resize: 'vertical'}} value={profile.portfolio} onChange={e => setProfile({...profile, portfolio: e.target.value})} placeholder="List some of your past investments..." />
            </div>
          </div>
        )}

        {/* TAB 3: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { id: 'newMatchingStartups', label: 'New Match Alerts', desc: 'Email me when a new startup fits my investment focus' },
              { id: 'watchlistUpdates', label: 'Watchlist Updates', desc: 'Email me when a startup I\'m watching updates their pitch' },
              { id: 'weeklyDigest', label: 'Email me when I receive a new message', desc: 'Get notified by email when a founder replies to your message' }
            ].map(item => (
              <div key={item.id} style={{ ...T.card, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{item.label}</p>
                  <p style={{ fontSize: '12px', color: T.dim }}>{item.desc}</p>
                </div>
                <button
                  onClick={() => setProfile({
                    ...profile,
                    notifications: { ...profile.notifications, [item.id]: !((profile.notifications as any)[item.id]) }
                  })}
                  style={{
                    width: '44px', height: '22px', borderRadius: '12px', cursor: 'pointer',
                    background: (profile.notifications as any)[item.id] ? T.accent : 'rgba(255,255,255,0.05)',
                    border: 'none', position: 'relative', transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    position: 'absolute', top: '2px', left: (profile.notifications as any)[item.id] ? '24px' : '2px',
                    width: '18px', height: '18px', borderRadius: '50%', background: (profile.notifications as any)[item.id] ? '#060A0F' : T.dim,
                    transition: 'all 0.2s'
                  }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
        {saved && <span style={{ color: T.accent, fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><Check size={16} /> All changes saved</span>}
        <button onClick={handleSave} disabled={saving} style={{...T.btn, width: '160px', justifyContent: 'center'}}>
          {saving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Settings</>}
        </button>
      </div>

      <style jsx>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
