import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#0a0a0f',
      fontFamily: 'Inter, sans-serif'
    }}>
      <Sidebar />
      <main style={{
        marginLeft: '220px',
        flex: 1,
        padding: '28px',
        maxWidth: '1200px'
      }}>
        {children}
      </main>
    </div>
  )
}