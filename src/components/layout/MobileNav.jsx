import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, Compass, Bell, User, Search, Trophy, LogOut } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function MobileNav() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out!')
    navigate('/login')
  }

  const navItems = [
    { icon: Home, path: '/feed' },
    { icon: Compass, path: '/explore' },
    { icon: Search, path: '/search' },
    { icon: Trophy, path: '/leaderboard' },
    { icon: Bell, path: '/notifications' },
    { icon: User, path: `/profile/${user?.username}` },
  ]

  return (
    <div className="mobile-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#0d0d18', borderTop: '1px solid #1e293b',
      padding: '8px 4px', zIndex: 100,
      justifyContent: 'space-around', alignItems: 'center'
    }}>
      {navItems.map(({ icon: Icon, path }) => {
        const isActive = pathname === path
        return (
          <Link key={path} to={path} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', padding: '6px 10px',
              color: isActive ? '#00ff87' : '#475569',
              borderRadius: '8px',
              background: isActive ? 'rgba(0,255,135,0.08)' : 'transparent'
            }}>
              <Icon size={19} />
            </div>
          </Link>
        )
      })}

      {/* Logout button */}
      <div onClick={handleLogout} style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '6px 10px',
        color: '#ef4444', borderRadius: '8px',
        cursor: 'pointer'
      }}>
        <LogOut size={19} />
      </div>
    </div>
  )
}