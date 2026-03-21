import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, Compass, Bell, Search, Trophy, LogOut, User, PlusSquare } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useState } from 'react'

export default function MobileNav() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out!')
    navigate('/login')
    setProfileOpen(false)
  }

  const navItems = [
    { icon: Home, path: '/feed' },
    { icon: Compass, path: '/explore' },
    { icon: Search, path: '/search' },
    { icon: Trophy, path: '/leaderboard' },
    { icon: Bell, path: '/notifications' },
  ]

  return (
    <>
      {/* Profile dropdown overlay */}
      {profileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 98 }} onClick={() => setProfileOpen(false)}>
          <div style={{
            position: 'absolute', bottom: '64px', right: '12px',
            background: '#282828', border: '1px solid #3d3d3d',
            borderRadius: '8px', padding: '4px', minWidth: '180px',
            boxShadow: '0 -8px 24px rgba(0,0,0,0.5)', zIndex: 99
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid #3d3d3d', marginBottom: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#eff1f6' }}>{user?.username}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{user?.role}</div>
            </div>
            {[
              { label: 'My Profile', action: () => { navigate(`/profile/${user?.username}`); setProfileOpen(false) } },
              { label: 'Edit Profile', action: () => { navigate('/settings'); setProfileOpen(false) } },
              { label: 'Create Post', action: () => { navigate('/create-post'); setProfileOpen(false) } },
            ].map(item => (
              <div key={item.label} onClick={item.action} style={{ padding: '9px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#94a3b8' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#3d3d3d'; e.currentTarget.style.color = '#eff1f6' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
              >
                {item.label}
              </div>
            ))}
            <div style={{ height: '1px', background: '#3d3d3d', margin: '4px 0' }} />
            <div onClick={handleLogout} style={{ padding: '9px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}
              onMouseEnter={e => e.currentTarget.style.background = '#3d3d3d'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={13} /> Sign Out
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="mobile-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#282828', borderTop: '1px solid #3d3d3d',
        padding: '8px 0', zIndex: 100,
        justifyContent: 'space-around', alignItems: 'center'
      }}>
        {navItems.map(({ icon: Icon, path }) => {
          const isActive = pathname === path
          return (
            <Link key={path} to={path} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '6px 12px', color: isActive ? '#ffa116' : '#64748b',
                borderRadius: '6px', background: isActive ? 'rgba(255,161,22,0.08)' : 'transparent'
              }}>
                <Icon size={20} />
              </div>
            </Link>
          )
        })}

        {/* Profile with dropdown */}
        <div onClick={() => setProfileOpen(!profileOpen)} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '6px 12px', cursor: 'pointer',
          color: profileOpen ? '#ffa116' : '#64748b',
          borderRadius: '6px',
          background: profileOpen ? 'rgba(255,161,22,0.08)' : 'transparent'
        }}>
          <User size={20} />
        </div>
      </div>
    </>
  )
}