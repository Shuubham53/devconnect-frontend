import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Heart, MessageCircle, Bookmark, TrendingUp } from 'lucide-react'
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
    if (user) { fetchPosts(); fetchTrending(); fetchLeaderboard() }
  }, [activeTab, user])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      let res
      if (activeTab === 'feed') { res = await api.get('/api/posts/feed'); setPosts(res.data.data || []) }
      else if (activeTab === 'trending') { res = await api.get('/api/posts/trending'); setPosts(res.data.data || []) }
      else {
        res = await api.get('/api/posts?page=0&size=20')
        const data = res.data.data
        if (Array.isArray(data)) setPosts(data)
        else if (data?.content) setPosts(data.content)
        else setPosts([])
      }
    } catch (err) { toast.error('Failed to load posts') }
    finally { setLoading(false) }
  }

  const fetchTrending = async () => {
    try { const res = await api.get('/api/posts/trending'); setTrending(res.data.data?.slice(0, 5) || []) } catch (err) {}
  }

  const fetchLeaderboard = async () => {
    try { const res = await api.get('/api/users/leaderboard'); setLeaderboard(res.data.data?.slice(0, 5) || []) } catch (err) {}
  }

  const handleLike = async (postId) => {
    try { await api.post(`/api/likes/${postId}`); fetchPosts(); toast.success('Liked!') }
    catch (err) { if (err.response?.status === 400) { await api.delete(`/api/likes/${postId}`); fetchPosts() } }
  }

  const handleBookmark = async (postId) => {
    try { await api.post(`/api/bookmarks/${postId}`); toast.success('Bookmarked!') }
    catch (err) { if (err.response?.status === 400) { await api.delete(`/api/bookmarks/${postId}`); toast.success('Removed') } }
  }

  const getTypeStyle = (type) => {
    switch (type) {
      case 'QUESTION': return { bg: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: 'rgba(96,165,250,0.2)' }
      case 'ARTICLE': return { bg: 'rgba(0,184,163,0.1)', color: '#00b8a3', border: 'rgba(0,184,163,0.2)' }
      case 'DISCUSSION': return { bg: 'rgba(192,132,252,0.1)', color: '#c084fc', border: 'rgba(192,132,252,0.2)' }
      default: return { bg: '#3d3d3d', color: '#94a3b8', border: '#3d3d3d' }
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAvatarColor = (name) => {
    const colors = ['#60a5fa','#00b8a3','#c084fc','#f87171','#34d399']
    return colors[name?.charCodeAt(0) % colors.length || 0]
  }
  const avatarStyles = (color) => ({
  width: '28px', height: '28px', borderRadius: '6px',
  background: `${color}20`, border: `none`,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '10px', fontWeight: '700', color, flexShrink: 0
})

  const timeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <Layout>
      <div className="feed-layout" style={{ display: 'flex', gap: '20px' }}>

        {/* Main Feed */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: '2px', marginBottom: '16px',
            background: '#282828', padding: '4px', borderRadius: '8px',
            border: '1px solid #3d3d3d'
          }}>
            {[{ key: 'latest', label: 'Latest' }, { key: 'feed', label: 'Following' }, { key: 'trending', label: 'Trending' }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                flex: 1, padding: '7px', borderRadius: '6px', border: 'none',
                cursor: 'pointer', fontSize: '13px',
                fontWeight: activeTab === tab.key ? '600' : '400',
                background: activeTab === tab.key ? '#3d3d3d' : 'transparent',
                color: activeTab === tab.key ? '#eff1f6' : '#64748b',
                fontFamily: 'Inter, sans-serif'
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>Loading...</div>
          ) : posts.length === 0 ? (
            //<div style={{ background: '#282828', border: '1px solid hsla(0, 0%, 24%, 0.11)', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#282828', borderRadius: '8px',  border: '1px solid hsla(0, 0%, 24%, 0.11)' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>👋</div>
              <div style={{ color: '#eff1f6', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>No posts yet</div>
              <div style={{ color: '#64748b', fontSize: '13px' }}>Be the first to create a post!</div>
            </div>
          ) : posts.map(post => {
            const typeStyle = getTypeStyle(post.postType)
            const color = getAvatarColor(post.authorName)
            return (
              <div key={post.id}
                style={{ background: '#282828', border: '1px solid #3d3d3d', borderRadius: '8px', padding: '16px', marginBottom: '8px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#555'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#3d3d3d'}
                onClick={() => navigate(`/post/${post.id}`)}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color, flexShrink: 0 }}>
                    {getInitials(post.authorName)}
                  </div>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>{post.authorName}</span>
                  <span style={{ fontSize: '11px', color: '#3d3d3d' }}>·</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{timeAgo(post.createdAt)}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '10px', padding: '2px 7px', borderRadius: '4px', fontWeight: '600', background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}` }}>
                    {post.postType}
                  </span>
                </div>

                {/* Body */}
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#eff1f6', marginBottom: '6px', lineHeight: '1.4' }}>
                      {post.title}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.content}
                    </div>
                    {post.tags && (
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {post.tags.split(',').map(tag => (
                          <span key={tag} style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '4px', background: '#1a1a1a', color: '#64748b', border: '1px solid #3d3d3d' }}>
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {post.imageUrl && (
                    <div style={{ width: '90px', height: '70px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={post.imageUrl} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingTop: '12px', borderTop: '1px solid #3d3d3d', marginTop: '12px' }}>
                  <button onClick={e => { e.stopPropagation(); handleLike(post.id) }} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b', padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#3d3d3d'; e.currentTarget.style.color = '#f87171' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}>
                    <Heart size={13} /> {post.likesCount}
                  </button>
                  <button onClick={e => { e.stopPropagation(); navigate(`/post/${post.id}`) }} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b', padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#3d3d3d'; e.currentTarget.style.color = '#60a5fa' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}>
                    <MessageCircle size={13} /> {post.commentsCount}
                  </button>
                  <div style={{ flex: 1 }} />
                  <button onClick={e => { e.stopPropagation(); handleBookmark(post.id) }} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b', padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#3d3d3d'; e.currentTarget.style.color = '#ffa116' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}>
                    <Bookmark size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right Panel */}
        <div className="right-panel" style={{ width: '250px', flexShrink: 0 }}>

          {/* Top Developers */}
          <div style={{ background: '#282828', border: '1px solid hsla(0, 0%, 24%, 0.11)', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Top Developers
            </div>
            {leaderboard.map((dev, i) => {
              const color = getAvatarColor(dev.name)
              return (
                <div key={dev.id} onClick={() => navigate(`/profile/${dev.username}`)} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2d2d2d'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontSize: '11px', color: '#64748b', width: '14px', flexShrink: 0 }}>{i + 1}</div>
                 <div style={{ ...avatarStyles(color), overflow: 'hidden' }}>
                    {dev.avatarUrl
                      ? <img src={dev.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : getInitials(dev.name)
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', color: '#eff1f6', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dev.name}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{dev.badge}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#ffa116', fontWeight: '600', flexShrink: 0 }}>{dev.score}</div>
                </div>
              )
            })}
          </div>

          {/* Trending Tags */}
          <div style={{ background: '#282828', border: '1px solid hsla(0, 0%, 24%, 0.11', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <TrendingUp size={13} color='#ffa116' />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Trending</span>
            </div>
            {trending.map((post, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < trending.length - 1 ? '1px solid #3d3d3d' : 'none' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>#{post.tags?.split(',')[0]?.trim()}</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{post.viewCount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}