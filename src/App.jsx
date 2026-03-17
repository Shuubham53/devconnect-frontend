import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FeedPage from './pages/FeedPage'
import CreatePostPage from './pages/CreatePostPage'



function App() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0f'
    }}>
      <div style={{ color: '#00ff87', fontSize: '14px' }}>Loading...</div>
    </div>
  )

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/feed" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/feed" />} />
      <Route path="/" element={<Navigate to={user ? "/feed" : "/login"} />} />
      <Route path="/feed" element={user ? <FeedPage /> : <Navigate to="/login" />} />
      <Route path="/create-post" element={user ? <CreatePostPage /> : <Navigate to="/login" />} />
    </Routes>
  )
}

export default App