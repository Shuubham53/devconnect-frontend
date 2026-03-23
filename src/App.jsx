import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import FeedPage from './pages/FeedPage'
import PostDetailPage from './pages/PostDetailPage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import SearchPage from './pages/SearchPage'
import ExplorePage from './pages/ExplorePage'
import CreatePostPage from './pages/CreatePostPage'
import EditProfilePage from './pages/EditProfilePage'
import LandingPage from './pages/LandingPage'
import BookmarkPage from './pages/BookmarkPage'

// Inside your routes


function App() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#1a1a1a'
    }}>
      <div style={{ color: '#ffa116', fontSize: '14px' }}>Loading...</div>
    </div>
  )

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/feed" /> : <LandingPage />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/feed" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/feed" />} />
      <Route path="/feed" element={user ? <FeedPage /> : <Navigate to="/" />} />
      <Route path="/post/:id" element={user ? <PostDetailPage /> : <Navigate to="/" />} />
      <Route path="/profile/:username" element={user ? <ProfilePage /> : <Navigate to="/" />} />
      <Route path="/notifications" element={user ? <NotificationsPage /> : <Navigate to="/" />} />
      <Route path="/leaderboard" element={user ? <LeaderboardPage /> : <Navigate to="/" />} />
      <Route path="/search" element={user ? <SearchPage /> : <Navigate to="/" />} />
      <Route path="/explore" element={user ? <ExplorePage /> : <Navigate to="/" />} />
      <Route path="/create-post" element={user ? <CreatePostPage /> : <Navigate to="/" />} />
      <Route path="/settings" element={user ? <EditProfilePage /> : <Navigate to="/" />} />
      <Route path="/bookmarks" element={user ? <BookmarkPage /> : <Navigate to="/" />} />
    </Routes>
  )
}

export default App