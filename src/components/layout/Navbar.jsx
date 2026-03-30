import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-hot-toast'
import { useState, useEffect, useRef } from 'react'
import { Bell, Search, Plus, ChevronDown, Bookmark, User, Settings, FileText, LogOut } from 'lucide-react'
import api from '../../services/api'

export default function Navbar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [unreadCount, setUnreadCount] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profile, setProfile] = useState(null)

  const dropdownRef = useRef()

  // Fetch data
  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      fetchProfile()
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/api/notifications/unread-count')
      setUnreadCount(res.data.data || 0)
    } catch {}
  }

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/api/users/${user?.username}`)
      setProfile(res.data.data)
    } catch {}
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

  const dropdownItems = [
    {
      label: 'My Profile',
      icon: User,
      action: () => navigate(`/profile/${user?.username}`),
    },
    {
      label: 'Saved Posts',
      icon: Bookmark,
      action: () => navigate('/bookmarks'),
    },
    {
      label: 'Edit Profile',
      icon: Settings,
      action: () => navigate('/settings'),
    },
    {
      label: 'Create Post',
      icon: FileText,
      action: () => navigate('/create-post'),
    },
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

          .dd-dropdown {
            width: 90vw !important;
            max-width: 260px !important;
            right: 10px !important;
          }
        }

        .nav-link-item {
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 13px;
          color: #94a3b8;
          cursor: pointer;
        }

        .nav-link-item.active {
          background: #3d3d3d;
          color: #fff;
          font-weight: 600;
        }

        .dd-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          color: #94a3b8;
        }

        .dd-item:hover {
          background: #3d3d3d;
          color: #fff;
        }

        .dd-item.danger {
          color: #ef4444;
        }
      `}</style>

      {/* NAVBAR */}
      <div style={{
        background: '#282828',
        borderBottom: '1px solid #3d3d3d',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        overflow: 'visible'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          minHeight: '54px',   // ✅ FIXED
        }}>

          {/* Logo */}
          <Link to="/feed" style={{ textDecoration: 'none' }}>
            <b style={{ color: '#fff' }}>Dev<span style={{ color: '#ffa116' }}>Connect</span></b>
          </Link>

          {/* Nav */}
          <div className="desktop-nav" style={{ marginLeft: '20px' }}>
            {navLinks.map(link => (
              <Link key={link.path} to={link.path}
                className={`nav-link-item ${pathname === link.path ? 'active' : ''}`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>

            <Link to="/search" className="desktop-only">
              <Search size={18} color="#94a3b8" />
            </Link>

            <Link to="/notifications" className="desktop-only" style={{ marginLeft: '10px' }}>
              <Bell size={18} color="#94a3b8" />
            </Link>

            <Link to="/create-post" className="desktop-only" style={{ marginLeft: '10px' }}>
              <Plus size={18} color="#ffa116" />
            </Link>

            {/* Avatar */}
            <div ref={dropdownRef} style={{ marginLeft: '10px', position: 'relative' }}>
              <div onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ cursor: 'pointer' }}>
                {user?.username?.charAt(0).toUpperCase()}
              </div>

              {dropdownOpen && (
                <div className="dd-dropdown" style={{
                  position: 'fixed',   // ✅ FIXED
                  top: '60px',
                  right: '10px',
                  background: '#242424',
                  borderRadius: '10px',
                  padding: '6px',
                  width: '210px',
                  zIndex: 9999
                }}>

                  {dropdownItems.map(item => (
                    <div key={item.label}
                      className="dd-item"
                      onClick={() => {
                        item.action()
                        setDropdownOpen(false)
                      }}>
                      <item.icon size={14} />
                      {item.label}
                    </div>
                  ))}

                  <div className="dd-item danger" onClick={handleLogout}>
                    <LogOut size={14} />
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