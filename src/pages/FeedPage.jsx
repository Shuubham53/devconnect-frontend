import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Heart, MessageCircle, Bookmark, TrendingUp, Eye } from 'lucide-react'
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
      case 'QUESTION':   return { bg: 'rgba(96,165,250,0.12)',  color: '#93c5fd', border: 'rgba(96,165,250,0.25)' }
      case 'ARTICLE':    return { bg: 'rgba(0,184,163,0.12)',   color: '#2dd4bf', border: 'rgba(0,184,163,0.25)' }
      case 'DISCUSSION': return { bg: 'rgba(192,132,252,0.12)', color: '#d8b4fe', border: 'rgba(192,132,252,0.25)' }
      default:           return { bg: '#2d2d2d', color: '#94a3b8', border: '#3d3d3d' }
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAvatarColor = (name) => {
    const colors = ['#60a5fa', '#00b8a3', '#c084fc', '#f87171', '#34d399']
    return colors[name?.charCodeAt(0) % colors.length || 0]
  }

  const avatarStyles = (color, size = 28) => ({
    width: `${size}px`, height: `${size}px`, borderRadius: '5px',
    background: `${color}20`, border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size <= 26 ? '9px' : '10px', fontWeight: '700', color, flexShrink: 0
  })

  const actionBtn = (hoverColor) => ({
    base: {
      display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px',
      color: '#6b7280', padding: '4px 9px', borderRadius: '5px',
      border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'Inter, sans-serif'
    },
    hover: hoverColor
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
      <style>{`
        .feed-layout { display: flex; gap: 20px; }
        .right-panel { width: 250px; flex-shrink: 0; }
        @media (max-width: 1024px) { .right-panel { display: none; } }
        @media (max-width: 640px) {
          .feed-layout { gap: 12px; }
          .post-thumb { display: none !important; }
          .post-tags { display: none !important; }
        }
        .action-btn { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #cbd5e1; padding: 4px 10px; border-radius: 6px; border: 1px solid #383838; background: #2a2a2a; cursor: pointer; font-family: Inter, sans-serif; transition: all 0.15s; line-height: 1; outline: none; box-shadow: none; }
        .action-btn:hover { background: #333; border-color: #555; }
        .action-btn.like:hover { color: #f87171; border-color: #f8717140; }
        .action-btn.like:hover svg { stroke: #f87171; }
        .action-btn.comment:hover { color: #60a5fa; border-color: #60a5fa40; }
        .action-btn.comment:hover svg { stroke: #60a5fa; }
        .action-btn.bookmark:hover { color: #ffa116; border-color: #ffa11640; }
        .action-btn.bookmark:hover svg { stroke: #ffa116; }
        .post-card { background: #242424; border: 1px solid #333; border-radius: 8px; padding: 16px; margin-bottom: 10px; cursor: pointer; transition: border-color 0.15s; }
        .post-card:hover { border-color: #555; }
        .dev-row { display: flex; align-items: center; gap: 8px; padding: 5px; border-radius: 6px; cursor: pointer; margin-bottom: 4px; transition: background 0.15s; }
        .dev-row:hover { background: #2d2d2d; }
      `}</style>

      <div className="feed-layout">

        {/* Main Feed */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: '2px', marginBottom: '14px',
            background: '#242424', padding: '4px', borderRadius: '8px',
            border: '1px solid #383838'
          }}>
            {[{ key: 'latest', label: 'Latest' }, { key: 'feed', label: 'Following' }, { key: 'trending', label: 'Trending' }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                flex: 1, padding: '8px', borderRadius: '6px', border: 'none',
                cursor: 'pointer', fontSize: '13px',
                fontWeight: activeTab === tab.key ? '600' : '400',
                background: activeTab === tab.key ? '#383838' : 'transparent',
                color: activeTab === tab.key ? '#f1f5f9' : '#6b7280',
                fontFamily: 'Inter, sans-serif', transition: 'all 0.15s'
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '13px' }}>Loading...</div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#242424', borderRadius: '8px', border: '1px solid #333' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>👋</div>
              <div style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: '6px', fontSize: '14px' }}>No posts yet</div>
              <div style={{ color: '#6b7280', fontSize: '13px' }}>Be the first to create a post!</div>
            </div>
          ) : posts.map(post => {
            const typeStyle = getTypeStyle(post.postType)
            const color = getAvatarColor(post.authorName)
            return (
              <div key={post.id} className="post-card"
                onClick={() => navigate(`/post/${post.id}`)}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ ...avatarStyles(color, 26), overflow: 'hidden' }}>
                    {post.authorAvatarUrl
                      ? <img src={post.authorAvatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : getInitials(post.authorName)
                    }
                  </div>
                  <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '500' }}>{post.authorName}</span>
                  <span style={{ fontSize: '12px', color: '#444' }}>·</span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{timeAgo(post.createdAt)}</span>
                  <span style={{
                    marginLeft: 'auto', fontSize: '11px', padding: '3px 9px', borderRadius: '4px',
                    fontWeight: '600', letterSpacing: '0.3px',
                    background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}`
                  }}>
                    {post.postType}
                  </span>
                </div>

                {/* Body */}
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px', lineHeight: '1.45' }}>
                      {post.title}
                    </div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {post.content}
                    </div>
                    {post.tags && (
                      <div className="post-tags" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {post.tags.split(',').map(tag => (
                          <span key={tag} style={{ fontSize: '12px', padding: '3px 9px', borderRadius: '4px', background: '#1e1e1e', color: '#94a3b8', border: '1px solid #383838' }}>
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {post.imageUrl && (
                    <div className="post-thumb" style={{ width: '85px', height: '66px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={post.imageUrl} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

               {/* Footer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingTop: '12px', borderTop: '1px solid #2d2d2d', marginTop: '12px' }}>
                    <button className="action-btn like" onClick={e => { e.stopPropagation(); handleLike(post.id) }}>
                      <Heart size={14} strokeWidth={1.8} style={{ display: 'block' }} />
                      <span>{post.likesCount}</span>
                    </button>
                    <button className="action-btn comment" onClick={e => { e.stopPropagation(); navigate(`/post/${post.id}`) }}>
                      <MessageCircle size={14} strokeWidth={1.8} style={{ display: 'block' }} />
                      <span>{post.commentsCount}</span>
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '6px', fontSize: '12px', color: '#94a3b8', padding: '4px 9px', borderRadius: '5px', background: '#1e1e1e' }}>
                      <Eye size={14} strokeWidth={1.8} style={{ display: 'block', color: '#60a5fa' }} />
                      <span style={{ fontWeight: '500' }}>{post.viewCount ?? 0}</span>
                    </div>
                    <div style={{ flex: 1 }} />
                    <button className="action-btn bookmark" onClick={e => { e.stopPropagation(); handleBookmark(post.id) }}>
                      <Bookmark size={14} strokeWidth={1.8} style={{ display: 'block' }} />
                    </button>
                  </div>
                                </div>
            )
          })}
        </div>

        {/* Right Panel */}
        <div className="right-panel">

          {/* Top Developers */}
          <div style={{ background: '#242424', border: '1px solid #333', borderRadius: '8px', padding: '14px', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Top Developers
            </div>
            {leaderboard.map((dev, i) => {
              const color = getAvatarColor(dev.name)
              return (
                <div key={dev.id} className="dev-row" onClick={() => navigate(`/profile/${dev.username}`)}>
                  <div style={{ fontSize: '11px', color: '#6b7280', width: '14px', flexShrink: 0, textAlign: 'center' }}>{i + 1}</div>
                  <div style={{ ...avatarStyles(color), overflow: 'hidden' }}>
                    {dev.avatarUrl
                      ? <img src={dev.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : getInitials(dev.name)
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dev.name}</div>
                    <div style={{ fontSize: '10px', color: '#6b7280' }}>{dev.badge}</div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#ffa116', fontWeight: '700', flexShrink: 0 }}>{dev.score}</div>
                </div>
              )
            })}
          </div>

          {/* Trending */}
          <div style={{ background: '#242424', border: '1px solid #333', borderRadius: '8px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <TrendingUp size={13} color="#ffa116" />
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.7px', textTransform: 'uppercase' }}>Trending</span>
            </div>
            {trending.map((post, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < trending.length - 1 ? '1px solid #2d2d2d' : 'none' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>#{post.tags?.split(',')[0]?.trim()}</span>
                <span style={{ fontSize: '11px', color: '#4b5563', background: '#1e1e1e', padding: '1px 6px', borderRadius: '3px' }}>{post.viewCount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}