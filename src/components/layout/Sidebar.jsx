import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-hot-toast'
import {
  Home, Compass, Bell, User, Trophy,
  Search, PlusSquare, LogOut
} from 'lucide-react'
import api from '../../services/api'

export default function Sidebar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/api/notifications/unread-count')
      setUnreadCount(res.data.data || 0)
    } catch (err) {}
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out!')
    navigate('/login')
  }

  const navItems = [
    { icon: Home, label: 'Feed', path: '/feed' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Bell, label: 'Notifications', path: '/notifications', badge: unreadCount },
    { icon: User, label: 'Profile', path: `/profile/${user?.username}` },
    { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
  ]

  return (
    <div className="sidebar" style={{
      width: '220px', minHeight: '100vh',
      background: '#0d0d18', borderRight: '1px solid #1e293b',
      padding: '20px 12px', display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, fontFamily: 'Inter, sans-serif'
    }}>

      {/* Logo */}
      <Link to="/feed" style={{ textDecoration: 'none', marginBottom: '28px', paddingLeft: '8px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', margin: 0 }}>
          <span style={{ color: '#e2e8f0' }}>Dev</span>
          <span style={{ color: '#00ff87' }}>Connect</span>
        </h1>
      </Link>

      {/* Nav Items */}
      <nav style={{ flex: 1 }}>
        {navItems.map(({ icon: Icon, label, path, badge }) => {
          const isActive = pathname === path
          return (
            <Link key={path} to={path} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '8px',
                marginBottom: '4px', cursor: 'pointer',
                background: isActive ? 'rgba(0,255,135,0.08)' : 'transparent',
                color: isActive ? '#00ff87' : '#64748b',
                fontSize: '14px', fontWeight: isActive ? '600' : '400',
                transition: 'all 0.15s', position: 'relative'
              }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#1e293b'
                    e.currentTarget.style.color = '#e2e8f0'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#64748b'
                  }
                }}
              >
                <div style={{ position: 'relative' }}>
                  <Icon size={18} />
                  {/* Notification badge */}
                  {badge > 0 && (
                    <div style={{
                      position: 'absolute', top: '-6px', right: '-8px',
                      minWidth: '16px', height: '16px', borderRadius: '10px',
                      background: '#f87171', color: '#fff',
                      fontSize: '9px', fontWeight: '700',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 4px', border: '2px solid #0d0d18'
                    }}>
                      {badge > 99 ? '99+' : badge}
                    </div>
                  )}
                </div>
                {label}
              </div>
            </Link>
          )
        })}

        {/* Create Post Button */}
        <Link to="/create-post" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '8px',
            marginTop: '8px', cursor: 'pointer',
            background: '#00ff87', color: '#000',
            fontSize: '14px', fontWeight: '700',
            transition: 'all 0.15s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#00cc6a'}
            onMouseLeave={e => e.currentTarget.style.background = '#00ff87'}
          >
            <PlusSquare size={18} />
            Create Post
          </div>
        </Link>
      </nav>

      {/* User Profile + Logout */}
      <div style={{
        borderTop: '1px solid #1e293b',
        paddingTop: '16px', marginTop: '16px'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '10px', marginBottom: '12px', padding: '0 4px'
        }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'rgba(0,255,135,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '700', color: '#00ff87', flexShrink: 0
          }}>
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              fontSize: '13px', fontWeight: '600', color: '#e2e8f0',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {user?.username}
            </div>
            <div style={{ fontSize: '11px', color: '#475569' }}>
              {user?.role}
            </div>
          </div>
        </div>

        <div onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '9px 12px', borderRadius: '8px',
          cursor: 'pointer', color: '#ef4444',
          fontSize: '13px', fontWeight: '500',
          transition: 'all 0.15s'
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={16} />
          Logout
        </div>
      </div>
    </div>
  )
}