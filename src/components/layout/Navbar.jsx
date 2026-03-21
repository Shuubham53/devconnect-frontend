import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { Bell, Search, Plus, ChevronDown } from 'lucide-react'
import api from '../../services/api'

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    const close = () => setDropdownOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

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
    setDropdownOpen(false)
  }

  const navLinks = [
    { label: 'Feed', path: '/feed' },
    { label: 'Explore', path: '/explore' },
    { label: 'Leaderboard', path: '/leaderboard' },
  ]

  const isActive = (path) => pathname === path

  return (
    <div style={{
      background: '#282828',
      borderBottom: '1px solid #3d3d3d',
      position: 'sticky', top: 0, zIndex: 100,
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto', padding: '0 20px',
        display: 'flex', alignItems: 'center', height: '54px', gap: '8px'
      }}>

        {/* Logo */}
        <Link to="/feed" style={{ textDecoration: 'none', flexShrink: 0, marginRight: '16px' }}>
          <span style={{ fontSize: '17px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            <span style={{ color: '#eff1f6' }}>Dev</span>
            <span style={{ color: '#ffa116' }}>Connect</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1 }}>
          {navLinks.map(({ label, path }) => (
            <Link key={path} to={path} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '5px 12px', borderRadius: '6px',
                fontSize: '13px', fontWeight: isActive(path) ? '600' : '400',
                color: isActive(path) ? '#eff1f6' : '#94a3b8',
                background: isActive(path) ? '#3d3d3d' : 'transparent',
                transition: 'all 0.15s', cursor: 'pointer'
              }}
                onMouseEnter={e => { if (!isActive(path)) { e.currentTarget.style.color = '#eff1f6'; e.currentTarget.style.background = '#2d2d2d' } }}
                onMouseLeave={e => { if (!isActive(path)) { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent' } }}
              >
                {label}
              </div>
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>

          {/* Search */}
          <Link to="/search" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '7px 8px', borderRadius: '6px', cursor: 'pointer',
              color: '#94a3b8', transition: 'all 0.15s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#3d3d3d'; e.currentTarget.style.color = '#eff1f6' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
            >
              <Search size={17} />
            </div>
          </Link>

          {/* Notifications */}
          <Link to="/notifications" style={{ textDecoration: 'none' }}>
            <div style={{
              position: 'relative', padding: '7px 8px', borderRadius: '6px',
              cursor: 'pointer', color: '#94a3b8', transition: 'all 0.15s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#3d3d3d'; e.currentTarget.style.color = '#eff1f6' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute', top: '3px', right: '3px',
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: '#ef4444', color: '#fff',
                  fontSize: '8px', fontWeight: '700',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #282828'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>
          </Link>

          {/* Create Post */}
          <Link to="/create-post" style={{ textDecoration: 'none', marginLeft: '4px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 14px', borderRadius: '6px',
              background: '#ffa116', color: '#000',
              fontSize: '13px', fontWeight: '700', cursor: 'pointer',
              transition: 'background 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#ff8c00'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffa116'}
            >
              <Plus size={15} />
              Create
            </div>
          </Link>

          {/* Avatar Dropdown */}
          <div style={{ position: 'relative', marginLeft: '4px' }}
            onClick={e => { e.stopPropagation(); setDropdownOpen(!dropdownOpen) }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '4px 8px', borderRadius: '6px', cursor: 'pointer',
              background: dropdownOpen ? '#3d3d3d' : 'transparent',
              transition: 'background 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#3d3d3d'}
              onMouseLeave={e => { if (!dropdownOpen) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'rgba(255,161,22,0.15)',
                border: '1px solid rgba(255,161,22,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '700', color: '#ffa116',
                overflow: 'hidden', flexShrink: 0
              }}>
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: '13px', color: '#eff1f6', fontWeight: '500', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.username}
              </span>
              <ChevronDown size={12} color='#94a3b8' />
            </div>

            {dropdownOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                background: '#282828', border: '1px solid #3d3d3d',
                borderRadius: '8px', padding: '4px',
                minWidth: '160px', zIndex: 200,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
              }}>
                <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid #3d3d3d', marginBottom: '4px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#eff1f6' }}>{user?.username}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{user?.role}</div>
                </div>
                {[
                  { label: 'My Profile', action: () => { navigate(`/profile/${user?.username}`); setDropdownOpen(false) } },
                  { label: 'Edit Profile', action: () => { navigate('/settings'); setDropdownOpen(false) } },
                ].map(item => (
                  <div key={item.label} onClick={item.action} style={{
                    padding: '8px 12px', borderRadius: '6px', cursor: 'pointer',
                    fontSize: '13px', color: '#94a3b8', transition: 'all 0.15s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#3d3d3d'; e.currentTarget.style.color = '#eff1f6' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
                  >
                    {item.label}
                  </div>
                ))}
                <div style={{ height: '1px', background: '#3d3d3d', margin: '4px 0' }} />
                <div onClick={handleLogout} style={{
                  padding: '8px 12px', borderRadius: '6px', cursor: 'pointer',
                  fontSize: '13px', color: '#ef4444', transition: 'all 0.15s'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#3d3d3d'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Sign Out
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}