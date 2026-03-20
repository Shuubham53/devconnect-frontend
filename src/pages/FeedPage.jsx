import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Heart, MessageCircle, Bookmark } from 'lucide-react'
import Layout from '../components/layout/Layout'
import api from '../services/api'

export default function FeedPage() {
  const [posts, setPosts] = useState([])
  const [trending, setTrending] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('latest')
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
  if (user) {
    fetchPosts()
    fetchTrending()
    fetchLeaderboard()
  }
}, [activeTab, user])
const fetchPosts = async () => {
  try {
    setLoading(true)
    let res
    if (activeTab === 'feed') {
      res = await api.get('/api/posts/feed')
      setPosts(res.data.data || [])
    } else if (activeTab === 'trending') {
      res = await api.get('/api/posts/trending')
      setPosts(res.data.data || [])
    } else {
      res = await api.get('/api/posts?page=0&size=20')

      console.log('Posts response:', res.data)

      const data = res.data.data
      if (Array.isArray(data)) {
        setPosts(data)
      } else if (data?.content) {
        setPosts(data.content)
      } else {
        setPosts([])
      }
    }
  } catch (err) {
    toast.error('Failed to load posts')
  } finally {
    setLoading(false)
  }
}

  const fetchTrending = async () => {
    try {
      const res = await api.get('/api/posts/trending')
      setTrending(res.data.data?.slice(0, 5) || [])
    } catch (err) {}
  }

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/api/users/leaderboard')
      setLeaderboard(res.data.data?.slice(0, 5) || [])
    } catch (err) {}
  }

  const handleLike = async (postId) => {
    try {
      await api.post(`/api/likes/${postId}`)
      fetchPosts()
      toast.success('Liked!')
    } catch (err) {
      if (err.response?.status === 400) {
        await api.delete(`/api/likes/${postId}`)
        fetchPosts()
      }
    }
  }

  const handleBookmark = async (postId) => {
    try {
      await api.post(`/api/bookmarks/${postId}`)
      toast.success('Bookmarked!')
    } catch (err) {
      if (err.response?.status === 400) {
        await api.delete(`/api/bookmarks/${postId}`)
        toast.success('Removed bookmark')
      }
    }
  }

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'QUESTION': return { background: '#1e3a5f', color: '#60a5fa' }
      case 'ARTICLE': return { background: '#1a2e1a', color: '#4ade80' }
      case 'DISCUSSION': return { background: '#2d1b4e', color: '#c084fc' }
      default: return { background: '#1e293b', color: '#94a3b8' }
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAvatarColor = (name) => {
    const colors = [
      { bg: '#1e3a5f', color: '#60a5fa' },
      { bg: '#1a2e1a', color: '#4ade80' },
      { bg: '#2d1b4e', color: '#c084fc' },
      { bg: '#1a1a2e', color: '#f87171' },
      { bg: '#1a2e2e', color: '#34d399' },
    ]
    const index = name?.charCodeAt(0) % colors.length || 0
    return colors[index]
  }

  const timeAgo = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <Layout>
      <div style={{ display: 'flex', gap: '24px' }}>

        {/* Main Feed */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: '4px', marginBottom: '20px',
            background: '#0d0d18', padding: '4px',
            borderRadius: '10px', border: '1px solid #1e293b'
          }}>
            {[
              { key: 'latest', label: 'Latest' },
              { key: 'feed', label: 'Following' },
              { key: 'trending', label: 'Trending' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1, padding: '8px', borderRadius: '7px',
                  border: 'none', cursor: 'pointer', fontSize: '13px',
                  fontWeight: activeTab === tab.key ? '600' : '400',
                  background: activeTab === tab.key ? '#1e293b' : 'transparent',
                  color: activeTab === tab.key ? '#e2e8f0' : '#64748b',
                  fontFamily: 'Inter, sans-serif'
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              background: '#0d0d18', borderRadius: '12px',
              border: '1px solid #1e293b'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>👋</div>
              <div style={{ color: '#e2e8f0', fontWeight: '600', marginBottom: '8px' }}>
                No posts yet
              </div>
              <div style={{ color: '#475569', fontSize: '13px' }}>
                Be the first to create a post!
              </div>
            </div>
          ) : (
            posts.map(post => {
              const avatarColor = getAvatarColor(post.authorName)
              const badgeStyle = getBadgeStyle(post.postType)
              return (
                <div key={post.id}
                  style={{
                    background: '#0d0d18', border: '1px solid #1e293b',
                    borderRadius: '12px', padding: '20px',
                    marginBottom: '12px', cursor: 'pointer',
                    transition: 'border-color 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#334155'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#1e293b'}
                  onClick={() => navigate(`/post/${post.id}`)}
                >

                  {/* Header */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: '10px', marginBottom: '14px'
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: avatarColor.bg, color: avatarColor.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: '700', flexShrink: 0
                    }}>
                      {getInitials(post.authorName)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#e2e8f0' }}>
                        {post.authorName}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>
                        {timeAgo(post.createdAt)}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '10px', padding: '3px 8px',
                      borderRadius: '20px', fontWeight: '600',
                      letterSpacing: '0.3px', ...badgeStyle
                    }}>
                      {post.postType}
                    </span>
                  </div>

                  {/* Body */}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '16px', fontWeight: '600',
                        color: '#f1f5f9', marginBottom: '8px',
                        lineHeight: '1.4', letterSpacing: '-0.2px'
                      }}>
                        {post.title}
                      </div>
                      <div style={{
                        fontSize: '13px', color: '#64748b',
                        lineHeight: '1.6', marginBottom: '12px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {post.content}
                      </div>

                      {/* Tags */}
                      {post.tags && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {post.tags.split(',').map(tag => (
                            <span key={tag} style={{
                              fontSize: '11px', padding: '3px 8px',
                              borderRadius: '6px', background: '#1e293b',
                              color: '#94a3b8'
                            }}>
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Thumbnail */}
                    {post.imageUrl && (
                      <div style={{
                        width: '100px', height: '80px',
                        borderRadius: '8px', overflow: 'hidden',
                        flexShrink: 0
                      }}>
                        <img src={post.imageUrl} alt="post"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: '4px', paddingTop: '14px',
                    borderTop: '1px solid #1e293b', marginTop: '14px'
                  }}>
                    <button
                      onClick={e => { e.stopPropagation(); handleLike(post.id) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        fontSize: '12px', color: '#475569', padding: '5px 10px',
                        borderRadius: '6px', border: 'none',
                        background: 'transparent', cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Heart size={13} />
                      {post.likesCount}
                    </button>

                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/post/${post.id}`) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        fontSize: '12px', color: '#475569', padding: '5px 10px',
                        borderRadius: '6px', border: 'none',
                        background: 'transparent', cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <MessageCircle size={13} />
                      {post.commentsCount}
                    </button>

                    <div style={{ flex: 1 }} />

                    <button
                      onClick={e => { e.stopPropagation(); handleBookmark(post.id) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        fontSize: '12px', color: '#475569', padding: '5px 10px',
                        borderRadius: '6px', border: 'none',
                        background: 'transparent', cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Bookmark size={13} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Right Panel */}
        {/* Right Panel */}
        <div className="right-panel" style={{ width: '260px', flexShrink: 0 }}></div>
        <div style={{ width: '260px', flexShrink: 0 }}>

          {/* Leaderboard */}
          <div style={{
            background: '#0d0d18', border: '1px solid #1e293b',
            borderRadius: '12px', padding: '16px', marginBottom: '16px'
          }}>
            <div style={{
              fontSize: '11px', fontWeight: '600', color: '#475569',
              letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px'
            }}>
              Top Developers
            </div>
            {leaderboard.map((dev, i) => {
              const avatarColor = getAvatarColor(dev.name)
              return (
                <div key={dev.id} style={{
                  display: 'flex', alignItems: 'center',
                  gap: '10px', marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '11px', color: '#475569', width: '16px' }}>
                    {i + 1}
                  </div>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: avatarColor.bg, color: avatarColor.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: '700', flexShrink: 0
                  }}>
                    {getInitials(dev.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '13px', color: '#e2e8f0',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {dev.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#475569' }}>
                      {dev.badge}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#00ff87', fontWeight: '600' }}>
                    {dev.score}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Trending Tags */}
          <div style={{
            background: '#0d0d18', border: '1px solid #1e293b',
            borderRadius: '12px', padding: '16px'
          }}>
            <div style={{
              fontSize: '11px', fontWeight: '600', color: '#475569',
              letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px'
            }}>
              Trending Tags
            </div>
            {trending.map((post, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: i < trending.length - 1 ? '1px solid #1e293b' : 'none'
              }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                  #{post.tags?.split(',')[0]?.trim()}
                </span>
                <span style={{ fontSize: '11px', color: '#475569' }}>
                  {post.viewCount} views
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}