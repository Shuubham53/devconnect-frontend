import Sidebar from './Sidebar'
import MobileNav from './MobileNav'

export default function Layout({ children }) {
  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#0a0a0f', fontFamily: 'Inter, sans-serif'
    }}>
      <Sidebar />
      <main className="main-content" style={{
  marginLeft: '220px', flex: 1,
  padding: '28px', minWidth: 0,
  paddingBottom: '80px' // space for mobile nav
}}>
  {children}
      </main>
      <MobileNav />
    </div>
  )
}