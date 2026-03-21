import Navbar from './Navbar'
import MobileNav from './MobileNav'

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', fontFamily: 'Inter, sans-serif' }}>
      {/* Navbar — hidden on mobile via CSS */}
      <div className="desktop-navbar">
        <Navbar />
      </div>
      <div className="main-content" style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '24px 20px',
        paddingBottom: '80px',
        boxSizing: 'border-box'
      }}>
        {children}
      </div>
      <MobileNav />
    </div>
  )
}