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

  useEffect(() => { fetchNotifications() }, [])

  const fetchNotifications = async () => {
    try { const res = await api.get('/api/notifications'); setNotifications(res.data.data || []) }
    catch (err) { toast.error('Failed to load notifications') }
    finally { setLoading(false) }
  }

  const markAllRead = async () => {
    try { await api.put('/api/notifications/read-all'); fetchNotifications(); toast.success('All marked as read!') } catch (err) {}
  }

  const markRead = async (id) => {
    try { await api.put(`/api/notifications/${id}/read`); fetchNotifications() } catch (err) {}
  }

  const deleteNotification = async (e, id) => {
    e.stopPropagation()
    try { await api.delete(`/api/notifications/${id}`); setNotifications(prev => prev.filter(n => n.id !== id)) } catch (err) {}
  }

  const getIcon = (type) => {
    switch (type) {
      case 'LIKE': return { icon: Heart, color: '#f87171', bg: 'rgba(248,113,113,0.1)' }
      case 'COMMENT': return { icon: MessageCircle, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' }
      case 'FOLLOW': return { icon: UserPlus, color: '#ffa116', bg: 'rgba(255,161,22,0.1)' }
      case 'REPLY': return { icon: Reply, color: '#c084fc', bg: 'rgba(192,132,252,0.1)' }
      default: return { icon: Bell, color: '#94a3b8', bg: '#3d3d3d' }
    }
  }

  const timeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <Layout>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#eff1f6', margin: 0 }}>Notifications</h1>
            {unreadCount > 0 && <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 14px', borderRadius: '6px',
              background: 'transparent', border: '1px solid #3d3d3d',
              color: '#94a3b8', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ffa116'; e.currentTarget.style.color = '#ffa116' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3d3d'; e.currentTarget.style.color = '#94a3b8' }}
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '13px' }}>Loading...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#282828', borderRadius: '8px', border: '1px solid #3d3d3d' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(255,161,22,0.1)', border: '1px solid rgba(255,161,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Bell size={22} color='#ffa116' />
            </div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#eff1f6', marginBottom: '6px' }}>All caught up!</div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>No notifications yet.</div>
          </div>
        ) : (
          <div style={{ background: '#282828', border: '1px solid #3d3d3d', borderRadius: '8px', overflow: 'hidden' }}>
            {notifications.map((notif, i) => {
              const { icon: Icon, color, bg } = getIcon(notif.type)
              return (
                <div key={notif.id}
                  onClick={() => { markRead(notif.id); if (notif.postId) navigate(`/post/${notif.postId}`) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
                    cursor: notif.postId ? 'pointer' : 'default',
                    borderBottom: i < notifications.length - 1 ? '1px solid #3d3d3d' : 'none',
                    background: notif.isRead ? 'transparent' : 'rgba(255,161,22,0.03)',
                    transition: 'background 0.15s', position: 'relative'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2d2d2d'}
                  onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? 'transparent' : 'rgba(255,161,22,0.03)'}
                >
                  {!notif.isRead && (
                    <div style={{ position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)', width: '5px', height: '5px', borderRadius: '50%', background: '#ffa116' }} />
                  )}
                  <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', color: notif.isRead ? '#94a3b8' : '#eff1f6', fontWeight: notif.isRead ? '400' : '500', lineHeight: '1.4' }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{timeAgo(notif.createdAt)}</div>
                  </div>
                  <button onClick={e => deleteNotification(e, notif.id)} style={{
                    width: '28px', height: '28px', borderRadius: '4px', background: 'transparent',
                    border: 'none', color: '#3d3d3d', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0, transition: 'opacity 0.15s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#3d3d3d'; e.currentTarget.style.color = '#ef4444' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#3d3d3d' }}
                    ref={el => { if (el) { el.parentElement.addEventListener('mouseenter', () => el.style.opacity = '1'); el.parentElement.addEventListener('mouseleave', () => el.style.opacity = '0') } }}
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