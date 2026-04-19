'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Briefcase, Send, MapPin, 
  Target, TrendingUp, Users, DollarSign, 
  BarChart3, Globe, Info, Loader2 
} from 'lucide-react'
import TopBar from '@/components/TopBar'

interface InvestorProfile {
  fullName: string
  photo: string
  firmName: string
  location: string
  linkedIn: string
  twitter: string
  bio: string
  investmentFocus: string[]
  preferredStage: string[]
  ticketSizeMin: number
  ticketSizeMax: number
  portfolio: string
  stats: {
    pitchesViewed: number
    watchlistCount: number
  }
}

export default function PublicInvestorProfile() {
  const { id } = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<InvestorProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/investor/profile/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          console.error(data.error)
          return
        }
        setProfile(data.profile)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--background)' }}>
        <Loader2 className="animate-spin" size={32} style={{ color: 'var(--color-green)' }} />
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Profile not found</h2>
        <Link href="/dashboard" style={{ color: 'var(--color-green)' }}>Return to dashboard</Link>
      </div>
    )
  }

  return (
    <>
      <TopBar title="Investor Profile" subtitle="Public legitimacy and track record" />
      <div className="dashboard-content" style={{ maxWidth: 900, margin: '0 auto', padding: '24px' }}>
        
        {/* Navigation */}
        <button 
          onClick={() => router.back()} 
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24 }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Hero Header */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid rgba(0,245,160,0.15)',
          borderRadius: 12,
          padding: 32,
          marginBottom: 24,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        }}>
          {/* Subtle Glow */}
          <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'rgba(0,245,160,0.03)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: 100, height: 100, borderRadius: 12,
              background: 'rgba(0,245,160,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(0,245,160,0.3)',
              fontSize: 32, fontWeight: 700, color: 'var(--color-green)',
              fontFamily: 'Syne',
            }}>
              {profile.fullName?.charAt(0).toUpperCase() || 'I'}
            </div>

            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, fontFamily: 'Syne' }}>{profile.fullName}</h1>
                <span style={{ 
                  padding: '2px 10px', borderRadius: 20, background: 'rgba(0,245,160,0.1)', 
                  color: 'var(--color-green)', fontSize: 10, fontWeight: 700,
                  fontFamily: 'Space Mono', letterSpacing: '0.05em', border: '1px solid rgba(0,245,160,0.2)'
                }}>VERIFIED INVESTOR</span>
              </div>
              <p style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 8, fontWeight: 600 }}>{profile.firmName || 'Independent Investor'}</p>
              
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                  <MapPin size={14} /> {profile.location || 'Remote'}
                </div>
                {profile.linkedIn && (
                  <a href={profile.linkedIn} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-green)', fontSize: 13, textDecoration: 'none' }}>
                    <Briefcase size={14} /> LinkedIn
                  </a>
                )}
                {profile.twitter && (
                  <a href={profile.twitter} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-cyan)', fontSize: 13, textDecoration: 'none' }}>
                    <Send size={14} /> Twitter
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Focus & Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Investment Focus */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Target size={16} style={{ color: 'var(--color-green)' }} /> Investment Thesis
              </h3>
              
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, fontFamily: 'Space Mono' }}>Preferred Sectors</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {profile.investmentFocus?.map(tag => (
                    <span key={tag} style={{
                      padding: '6px 14px', borderRadius: 20, background: 'rgba(0,245,160,0.1)',
                      color: 'var(--color-green)', fontSize: 12, fontWeight: 600, border: '1px solid rgba(0,245,160,0.2)'
                    }}>
                      {tag}
                    </span>
                  )) || <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No sectors specified</span>}
                </div>
              </div>

              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, fontFamily: 'Space Mono' }}>Stage focus</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {profile.preferredStage?.map(tag => (
                    <span key={tag} style={{
                      padding: '6px 14px', borderRadius: 4, background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-primary)', fontSize: 12, fontWeight: 600, border: '1px solid var(--border)'
                    }}>
                      {tag}
                    </span>
                  )) || <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No stages specified</span>}
                </div>
              </div>
            </div>

            {/* Bio & Portfolio */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Biography</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24 }}>
                {profile.bio || 'This investor has not provided a biography yet.'}
              </p>

              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Portfolio & Notable Investments</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                {profile.portfolio || 'Track record details are private or not yet listed.'}
              </p>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Ticket Size */}
            <div className="card" style={{ background: 'rgba(0,245,160,0.03)', border: '1px solid rgba(0,245,160,0.2)' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Space Mono' }}>Average Ticket Size</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-green)', fontFamily: 'Syne' }}>
                  ${profile.ticketSizeMin?.toLocaleString()}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>to</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-green)', fontFamily: 'Syne' }}>
                  ${profile.ticketSizeMax?.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Platform Activity</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <BarChart3 size={16} style={{ color: 'var(--color-cyan)' }} />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Pitches Viewed</span>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Space Mono' }}>{profile.stats.pitchesViewed}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Users size={16} style={{ color: 'var(--color-purple)' }} />
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Startups Watchlisted</span>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Space Mono' }}>{profile.stats.watchlistCount}</span>
                </div>
              </div>
            </div>

            {/* Contact Trust Info */}
            <div style={{ padding: '20px', borderRadius: 12, border: '1px dashed var(--border)', textAlign: 'center' }}>
              <Info size={20} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                This is a verified investor profile. Founders can see this information when an investor shows interest or views their pitch.
              </p>
            </div>
          </div>
        </div>

      </div>

      <style jsx>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
        }
      `}</style>
    </>
  )
}
