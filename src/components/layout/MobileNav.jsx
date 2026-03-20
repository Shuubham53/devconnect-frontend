import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, Compass, Bell, User, Search, Trophy } from 'lucide-react'

export default function MobileNav() {
  const { pathname } = useLocation()
  const { user } = useAuth()

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
      padding: '8px 0', zIndex: 100,
      justifyContent: 'space-around', alignItems: 'center'
    }}>
      {navItems.map(({ icon: Icon, path }) => {
        const isActive = pathname === path
        return (
          <Link key={path} to={path} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', padding: '6px 12px',
              color: isActive ? '#00ff87' : '#475569',
              borderRadius: '8px',
              background: isActive ? 'rgba(0,255,135,0.08)' : 'transparent'
            }}>
              <Icon size={20} />
            </div>
          </Link>
        )
      })}
    </div>
  )
}