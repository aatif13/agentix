import { useState, useEffect, useRef } from 'react'
import { Bell, Search, Check, Clock, User as UserIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  fromName?: string
  firmName?: string
  isRead: boolean
  createdAt: string
  pitchId?: string
  status?: 'pending' | 'accepted' | 'declined'
}

interface TopBarProps {
  title: string
  subtitle?: string
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const isInvestor = pathname?.startsWith('/investor')
  const notifEndpoint = isInvestor ? '/api/investor/notifications' : '/api/notifications'
  
  const name = session?.user?.name || 'User'
  const unreadCount = notifications.filter(n => !n.isRead).length
  const pendingActionCount = notifications.filter(n => n.type === 'investor_interest' && n.status === 'pending' && !n.isRead).length

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 60000)

    const handleOpenNotifs = () => setShowNotifs(true)
    window.addEventListener('open-notifications', handleOpenNotifs)

    return () => {
      clearInterval(interval)
      window.removeEventListener('open-notifications', handleOpenNotifs)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifs(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifs = async () => {
    try {
      const res = await fetch(notifEndpoint)
      const data = await res.json()
      if (data.notifications) setNotifications(data.notifications)
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    }
  }

  const markAsRead = async (id: string, pitchId?: string) => {
    try {
      await fetch(notifEndpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
      
      if (pitchId) {
        if (isInvestor) {
          router.push(`/investor/startup/${pitchId}`)
        } else {
          router.push('/dashboard/pitch-room')
        }
      }
      setShowNotifs(false)
    } catch (err) {
      console.error('Failed to mark as read', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch(notifEndpoint, { method: 'DELETE' })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Failed to mark all as read', err)
    }
  }

  const handleRespond = async (e: React.MouseEvent, id: string, action: 'accepted' | 'declined') => {
    e.stopPropagation() // Prevent triggering the markAsRead click
    if (!confirm(`Are you sure you want to ${action.replace('ed', 'e')} this investor introduction? This action cannot be undone.`)) return

    setActionLoading(id)
    try {
      const res = await fetch('/api/notifications/respond', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id, action })
      })
      
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: action, isRead: true } : n))
      }
    } catch (err) {
      console.error('Failed to respond to request', err)
    } finally {
      setActionLoading(null)
    }
  }

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <header className="topbar" style={{ position: 'relative', zIndex: 100 }}>
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>
      <div className="topbar-right">
        <div className="search-box">
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search..." className="search-input" />
        </div>
        
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button 
            className="icon-btn" 
            aria-label="Notifications"
            onClick={() => setShowNotifs(!showNotifs)}
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="notif-dot" style={{ 
                position: 'absolute', top: 8, right: 8, 
                width: 8, height: 8, borderRadius: '50%',
                background: pendingActionCount > 0 ? '#FFB800' : '#FF4B4B', 
                border: '2px solid #0C1018',
                boxShadow: pendingActionCount > 0 ? '0 0 10px rgba(255, 184, 0, 0.6)' : 'none',
                animation: pendingActionCount > 0 ? 'pulse 2s infinite' : 'none'
              }} />
            )}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 12,
              width: 360, background: '#0C1018', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', overflow: 'hidden'
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>
                  {isInvestor ? 'Investor Alerts' : 'Notifications'}
                </span>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} style={{ fontSize: 10, color: '#00F5A0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Space Mono', monospace" }}>
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 450, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: '#6B7A91', fontSize: 12 }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(n => {
                    // Check if it represents an actionable investor interest
                    const isInterest = n.type === 'investor_interest'
                    
                    return (
                      <div 
                        key={n._id}
                        onClick={() => !isInterest ? markAsRead(n._id, n.pitchId) : null}
                        style={{ 
                          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', 
                          cursor: isInterest ? 'default' : 'pointer', background: n.isRead ? 'transparent' : 'rgba(0,245,160,0.03)',
                          transition: 'background 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', gap: 12 }}>
                          <div style={{ 
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            background: isInterest && n.status === 'accepted' ? 'rgba(0,245,160,0.1)' : 
                                        isInterest && n.status === 'declined' ? 'rgba(255,75,75,0.1)' : 
                                        'rgba(255,255,255,0.05)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center' 
                          }}>
                            {isInterest && n.status === 'accepted' ? <Check size={14} style={{ color: '#00F5A0' }} /> :
                             isInterest && n.status === 'declined' ? <div style={{width: 10, height: 2, background: '#FF4B4B', transform: 'rotate(45deg)', position: 'relative'}}><div style={{width: 10, height: 2, background: '#FF4B4B', transform: 'rotate(-90deg)'}}/></div> :
                             <UserIcon size={14} style={{ color: n.isRead ? '#6B7A91' : '#00F5A0' }} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Title state changes based on status if it's an interest request */}
                            <div style={{ fontSize: 12, fontWeight: 700, color: n.isRead && !isInterest ? '#A0ADBF' : '#E8EDF5', marginBottom: 4 }}>
                              {isInterest && n.status === 'accepted' ? `✅ You connected with ${n.fromName}` :
                               isInterest && n.status === 'declined' ? `❌ You declined introduction` :
                               n.title}
                            </div>
                            
                            {/* Message content */}
                            {isInterest && n.status === 'pending' ? (
                              <>
                                <div style={{ fontSize: 11, color: '#6B7A91', lineHeight: 1.5, marginBottom: 8, fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: 4, borderLeft: '2px solid #FFB800' }}>
                                  "{n.message}"
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                  <button onClick={(e) => handleRespond(e, n._id, 'accepted')} disabled={actionLoading === n._id} style={{ flex: 1, padding: '6px 0', background: 'rgba(0,245,160,0.1)', border: '1px solid rgba(0,245,160,0.2)', color: '#00F5A0', borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', transition: 'all 0.2s', opacity: actionLoading === n._id ? 0.5 : 1 }}>
                                    {actionLoading === n._id ? '...' : '✅ Accept'}
                                  </button>
                                  <button onClick={(e) => handleRespond(e, n._id, 'declined')} disabled={actionLoading === n._id} style={{ flex: 1, padding: '6px 0', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#6B7A91', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', transition: 'all 0.2s', opacity: actionLoading === n._id ? 0.5 : 1 }}>
                                    {actionLoading === n._id ? '...' : '❌ Decline'}
                                  </button>
                                </div>
                                {!n.isRead && <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}><button onClick={(e) => { e.stopPropagation(); markAsRead(n._id) }} style={{ fontSize: 10, color: '#A0ADBF', background: 'none', border: 'none', cursor: 'pointer' }}>Mark read & skip</button></div>}
                              </>
                            ) : (
                              <div style={{ fontSize: 11, color: '#6B7A91', lineHeight: 1.5, marginBottom: 8 }}>
                                {isInterest && n.status === 'accepted' ? 'Their email was shared with them and you can expect direct communications.' :
                                 isInterest && n.status === 'declined' ? 'The investor was politely notified.' :
                                 n.message}
                              </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#4B5563', fontFamily: "'Space Mono', monospace" }}>
                               <Clock size={10} /> {getTimeAgo(n.createdAt)}
                            </div>
                          </div>
                          {!n.isRead && !isInterest && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00F5A0', marginTop: 4, flexShrink: 0 }} />}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div style={{ padding: 12, textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                 <p style={{ fontSize: 10, color: '#4B5563' }}>Agentix {isInvestor ? 'Investor' : 'Notification'} Engine</p>
              </div>
            </div>
          )}
        </div>

        <div className="topbar-avatar" title={name}>
          {name.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}
