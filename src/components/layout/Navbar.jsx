import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { Bell, Search, Plus, ChevronDown, Bookmark, User, Settings, FileText, LogOut } from 'lucide-react'
import api from '../../services/api'

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      fetchProfile()
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
    try { const res = await api.get('/api/notifications/unread-count'); setUnreadCount(res.data.data || 0) } catch (err) {}
  }

  const fetchProfile = async () => {
    try { const res = await api.get(`/api/users/${user?.username}`); setProfile(res.data.data) } catch (err) {}
  }

  const handleLogout = () => { logout(); toast.success('Logged out!'); navigate('/login'); setDropdownOpen(false) }

  const navLinks = [
    { label: 'Feed', path: '/feed' },
    { label: 'Explore', path: '/explore' },
    { label: 'Leaderboard', path: '/leaderboard' },
  ]

  const isActive = (path) => pathname === path

  const dropdownItems = [
    { label: 'My Profile', icon: User, action: () => { navigate(`/profile/${user?.username}`); setDropdownOpen(false) } },
    { label: 'Saved Posts', icon: Bookmark, action: () => { navigate('/bookmarks'); setDropdownOpen(false) } },
    { label: 'Edit Profile', icon: Settings, action: () => { navigate('/settings'); setDropdownOpen(false) } },
    { label: 'Create Post', icon: FileText, action: () => { navigate('/create-post'); setDropdownOpen(false) } },
  ]

  const avatarColor = '#ffa116'

  return (
    <>
     <style>{`
        .desktop-nav { display: flex; }
        .desktop-only { display: flex; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-only { display: none !important; }
          .dd-dropdown { right: -8px !important; min-width: 160px !important; }
        }
        .nav-link-item { padding: 5px 12px; border-radius: 6px; font-size: 13px; color: #94a3b8; background: transparent; transition: all 0.15s; cursor: pointer; text-decoration: none; display: block; }
        .nav-link-item:hover { color: #eff1f6 !important; background: #2d2d2d !important; }
        .nav-link-item.active { color: #eff1f6 !important; background: #3d3d3d !important; font-weight: 600; }
        .dd-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; color: #94a3b8; transition: all 0.15s; }
        .dd-item:hover { background: #3d3d3d; color: #eff1f6; }
        .dd-item.danger { color: #ef4444; }
        .dd-item.danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; }
      `}</style>

      <div style={{ background: '#282828', borderBottom: '1px solid #3d3d3d', position: 'sticky', top: 0, zIndex: 100, fontFamily: 'Inter, sans-serif' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', height: '54px', gap: '8px' }}>

          {/* Logo */}
          <Link to="/feed" style={{ textDecoration: 'none', flexShrink: 0, marginRight: '8px' }}>
            <span style={{ fontSize: '17px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              <span style={{ color: '#eff1f6' }}>Dev</span>
              <span style={{ color: '#ffa116' }}>Connect</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="desktop-nav" style={{ alignItems: 'center', gap: '2px', flex: 1 }}>
            {navLinks.map(({ label, path }) => (
              <Link key={path} to={path} className={`nav-link-item ${isActive(path) ? 'active' : ''}`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: 'auto' }}>

            {/* Search */}
            <Link to="/search" style={{ textDecoration: 'none' }} className="desktop-only">
              <div style={{ padding: '7px 8px', borderRadius: '6px', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.15s', display: 'flex' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#3d3d3d'; e.currentTarget.style.color = '#eff1f6' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
              >
                <Search size={17} />
              </div>
            </Link>

            {/* Notifications */}
            <Link to="/notifications" style={{ textDecoration: 'none' }} className="desktop-only">
              <div style={{ position: 'relative', padding: '7px 8px', borderRadius: '6px', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.15s', display: 'flex' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#3d3d3d'; e.currentTarget.style.color = '#eff1f6' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8' }}
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <div style={{ position: 'absolute', top: '3px', right: '3px', width: '14px', height: '14px', borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: '8px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #282828' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </div>
            </Link>

            {/* Create */}
            <Link to="/create-post" style={{ textDecoration: 'none' }} className="desktop-only">
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '6px', background: '#ffa116', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.15s', marginLeft: '4px' }}
                onMouseEnter={e => e.currentTarget.style.background = '#ff8c00'}
                onMouseLeave={e => e.currentTarget.style.background = '#ffa116'}
              >
                <Plus size={15} /> Create
              </div>
            </Link>

            {/* Avatar Dropdown */}
            <div style={{ position: 'relative', marginLeft: '4px' }} onClick={e => { e.stopPropagation(); setDropdownOpen(!dropdownOpen) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', background: dropdownOpen ? '#3d3d3d' : 'transparent', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#3d3d3d'}
                onMouseLeave={e => { if (!dropdownOpen) e.currentTarget.style.background = 'transparent' }}
              >
                {/* Avatar — shows profile picture if available */}
                <div style={{ width: '28px', height: '28px', borderRadius: '5px', background: `rgba(255,161,22,0.15)`, border: '1px solid rgba(255,161,22,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: avatarColor, overflow: 'hidden', flexShrink: 0 }}>
                  {profile?.avatarUrl
                    ? <img src={profile.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : user?.username?.charAt(0).toUpperCase()
                  }
                </div>
                <span className="desktop-only" style={{ fontSize: '13px', color: '#eff1f6', fontWeight: '500', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.username}
                </span>
                <ChevronDown size={12} color='#94a3b8' style={{ flexShrink: 0 }} className="desktop-only" />
              </div>

              {/* Dropdown */}
              {dropdownOpen && (
                <div  className="dd-dropdown" style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#242424', border: '1px solid #333', borderRadius: '10px', padding: '6px', minWidth: '180px', zIndex: 200, boxShadow: '0 12px 32px rgba(0,0,0,0.6)' }}>

                  {/* User info header */}
                  <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid #2d2d2d', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '6px', background: 'rgba(255,161,22,0.15)', border: '1px solid rgba(255,161,22,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: avatarColor, overflow: 'hidden', flexShrink: 0 }}>
                      {profile?.avatarUrl
                        ? <img src={profile.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : user?.username?.charAt(0).toUpperCase()
                      }
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>{user?.role}</div>
                    </div>
                  </div>

                  {/* Menu items */}
                  {dropdownItems.map(item => (
                    <div key={item.label} className="dd-item" onClick={item.action}>
                      <item.icon size={14} style={{ flexShrink: 0 }} />
                      {item.label}
                    </div>
                  ))}

                  <div style={{ height: '1px', background: '#2d2d2d', margin: '4px 0' }} />

                  <div className="dd-item danger" onClick={handleLogout}>
                    <LogOut size={14} style={{ flexShrink: 0 }} />
                    Sign Out
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}