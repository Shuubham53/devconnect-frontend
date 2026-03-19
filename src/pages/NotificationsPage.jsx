import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Bell, Heart, MessageCircle, UserPlus, Reply, CheckCheck, Trash2 } from 'lucide-react'
import api from '../services/api'
import Layout from '../components/layout/Layout'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications')
      setNotifications(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all')
      fetchNotifications()
      toast.success('All marked as read!')
    } catch (err) {}
  }

  const markRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`)
      fetchNotifications()
    } catch (err) {}
  }

  const deleteNotification = async (e, id) => {
    e.stopPropagation()
    try {
      await api.delete(`/api/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast.success('Deleted!')
    } catch (err) {}
  }

  const getIcon = (type) => {
    switch (type) {
      case 'LIKE': return { icon: Heart, color: '#f87171', bg: 'rgba(248,113,113,0.1)' }
      case 'COMMENT': return { icon: MessageCircle, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' }
      case 'FOLLOW': return { icon: UserPlus, color: '#00ff87', bg: 'rgba(0,255,135,0.1)' }
      case 'REPLY': return { icon: Reply, color: '#c084fc', bg: 'rgba(192,132,252,0.1)' }
      default: return { icon: Bell, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' }
    }
  }

  const timeAgo = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <Layout>
      <div style={{ maxWidth: '72%' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '24px'
        }}>
          <div>
            <h1 style={{
              fontSize: '22px', fontWeight: '700',
              color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px'
            }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px',
              background: 'transparent', border: '1px solid #1e293b',
              color: '#94a3b8', fontSize: '13px', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#00ff87'; e.currentTarget.style.color = '#00ff87' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#94a3b8' }}
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            background: '#0d0d18', borderRadius: '16px',
            border: '1px solid #1e293b'
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Bell size={24} color='#00ff87' />
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0', marginBottom: '8px' }}>
              All caught up!
            </div>
            <div style={{ fontSize: '13px', color: '#475569' }}>
              No notifications yet. Interact with posts to get started.
            </div>
          </div>
        ) : (
          <div style={{
            background: '#0d0d18', border: '1px solid #1e293b',
            borderRadius: '16px', overflow: 'hidden'
          }}>
            {notifications.map((notif, i) => {
              const { icon: Icon, color, bg } = getIcon(notif.type)
              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markRead(notif.id)
                    if (notif.postId) navigate(`/post/${notif.postId}`)
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '16px 20px', cursor: notif.postId ? 'pointer' : 'default',
                    borderBottom: i < notifications.length - 1 ? '1px solid #1e293b' : 'none',
                    background: notif.isRead ? 'transparent' : 'rgba(0,255,135,0.02)',
                    transition: 'background 0.15s', position: 'relative'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0a0a0f'}
                  onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? 'transparent' : 'rgba(0,255,135,0.02)'}
                >
                  {/* Unread dot */}
                  {!notif.isRead && (
                    <div style={{
                      position: 'absolute', left: '8px', top: '50%',
                      transform: 'translateY(-50%)',
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#00ff87'
                    }} />
                  )}

                  {/* Icon */}
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: bg, border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={16} color={color} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '13px', color: notif.isRead ? '#94a3b8' : '#e2e8f0',
                      fontWeight: notif.isRead ? '400' : '500',
                      marginBottom: '3px', lineHeight: '1.4'
                    }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569' }}>
                      {timeAgo(notif.createdAt)}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={e => deleteNotification(e, notif.id)}
                    style={{
                      width: '28px', height: '28px', borderRadius: '6px',
                      background: 'transparent', border: 'none',
                      color: '#334155', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, opacity: 0, transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = '#f87171' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#334155' }}
                    ref={el => {
                      if (el) {
                        el.parentElement.addEventListener('mouseenter', () => el.style.opacity = '1')
                        el.parentElement.addEventListener('mouseleave', () => el.style.opacity = '0')
                      }
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}