import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { TrendingUp, Hash, Heart, MessageCircle, Eye } from 'lucide-react'
import api from '../services/api'
import Layout from '../components/layout/Layout'

export default function ExplorePage() {
  const [trending, setTrending] = useState([])
  const [tagPosts, setTagPosts] = useState([])
  const [selectedTag, setSelectedTag] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tagLoading, setTagLoading] = useState(false)
  const navigate = useNavigate()

  const popularTags = ['java', 'springboot', 'jwt', 'dsa', 'backend', 'postgresql', 'redis', 'docker', 'react', 'api']

  useEffect(() => { fetchTrending() }, [])

  const fetchTrending = async () => {
    try { const res = await api.get('/api/posts/trending'); setTrending(res.data.data || []) }
    catch (err) { toast.error('Failed to load trending') }
    finally { setLoading(false) }
  }

  const fetchByTag = async (tag) => {
    setSelectedTag(tag); setTagLoading(true)
    try { const res = await api.get(`/api/posts/tag/${tag}`); setTagPosts(res.data.data || []) }
    catch (err) { toast.error('Failed to load posts') }
    finally { setTagLoading(false) }
  }

  const getInitials = (name) => { if (!name) return '?'; return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) }
  const getAvatarColor = (name) => { const c = ['#60a5fa','#00b8a3','#c084fc','#f87171','#34d399']; return c[name?.charCodeAt(0) % c.length || 0] }

  const avatarStyles = (color, size = 26) => ({
    width: `${size}px`, height: `${size}px`, borderRadius: '5px',
    background: `${color}20`, border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '9px', fontWeight: '700', color, flexShrink: 0
  })

  const getTypeStyle = (type) => {
    switch (type) {
      case 'QUESTION':   return { bg: 'rgba(96,165,250,0.12)',  color: '#93c5fd', border: 'rgba(96,165,250,0.25)' }
      case 'ARTICLE':    return { bg: 'rgba(0,184,163,0.12)',   color: '#2dd4bf', border: 'rgba(0,184,163,0.25)' }
      case 'DISCUSSION': return { bg: 'rgba(192,132,252,0.12)', color: '#d8b4fe', border: 'rgba(192,132,252,0.25)' }
      default:           return { bg: '#2d2d2d', color: '#94a3b8', border: '#3d3d3d' }
    }
  }

  const timeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const PostCard = ({ post }) => {
    const color = getAvatarColor(post.authorName)
    const typeStyle = getTypeStyle(post.postType)
    return (
      <div onClick={() => navigate(`/post/${post.id}`)} className="post-card">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ ...avatarStyles(color), overflow: 'hidden' }}>
            {post.authorAvatarUrl
              ? <img src={post.authorAvatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : getInitials(post.authorName)
            }
          </div>
          <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '500' }}>{post.authorName}</span>
          <span style={{ fontSize: '12px', color: '#444' }}>·</span>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>{timeAgo(post.createdAt)}</span>
          <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '3px 9px', borderRadius: '4px', fontWeight: '600', letterSpacing: '0.3px', background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}` }}>
            {post.postType}
          </span>
        </div>

        {/* Body */}
        <div style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px', lineHeight: '1.45' }}>{post.title}</div>
        <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</div>

        {post.tags && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {post.tags.split(',').map(tag => (
              <span key={tag} style={{ fontSize: '12px', padding: '3px 9px', borderRadius: '4px', background: '#1e1e1e', color: '#94a3b8', border: '1px solid #383838' }}>{tag.trim()}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingTop: '10px', borderTop: '1px solid #2d2d2d' }}>
          <div className="stat-pill">
            <Heart size={13} strokeWidth={1.8} style={{ display: 'block' }} />
            <span>{post.likesCount}</span>
          </div>
          <div className="stat-pill">
            <MessageCircle size={13} strokeWidth={1.8} style={{ display: 'block' }} />
            <span>{post.commentsCount}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '6px', fontSize: '12px', color: '#94a3b8' }}>
            <Eye size={13} strokeWidth={1.8} style={{ display: 'block', color: '#60a5fa' }} />
            <span style={{ fontWeight: '500' }}>{post.viewCount ?? 0}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <style>{`
        .explore-layout { display: flex; gap: 20px; }
        .explore-right { width: 240px; flex-shrink: 0; }
        @media (max-width: 1024px) { .explore-right { display: none; } }
        .post-card { background: #242424; border: 1px solid #343434; border-radius: 8px; padding: 16px; margin-bottom: 10px; cursor: pointer; transition: border-color 0.15s; }
        .post-card:hover { border-color: #555; }
        .stat-pill { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #6b7280; padding: 4px 9px; border-radius: 6px; border: 1px solid #383838; background: #2a2a2a; }
        .trend-item { padding: 8px; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
        .trend-item:hover { background: #2d2d2d; }
        .tag-btn { padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; font-family: Inter, sans-serif; transition: all 0.15s; border: 1px solid #333; background: #1e1e1e; color: #94a3b8; }
        .tag-btn:hover { border-color: #ffa116; color: #ffa116; }
        .tag-btn.active { background: rgba(255,161,22,0.1); border-color: rgba(255,161,22,0.3); color: #ffa116; }
      `}</style>

      <div className="explore-layout">

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: '18px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 3px' }}>Explore</h1>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
              {selectedTag ? `Posts tagged #${selectedTag}` : 'Trending posts right now'}
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', fontSize: '13px' }}>Loading...</div>
          ) : tagLoading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', fontSize: '13px' }}>Loading posts...</div>
          ) : selectedTag ? (
            tagPosts.length === 0
              ? <div style={{ textAlign: 'center', padding: '48px', background: '#242424', borderRadius: '8px', border: '1px solid #333', color: '#6b7280', fontSize: '13px' }}>No posts found for #{selectedTag}</div>
              : tagPosts.map(post => <PostCard key={post.id} post={post} />)
          ) : (
            trending.length === 0
              ? <div style={{ textAlign: 'center', padding: '48px', background: '#242424', borderRadius: '8px', border: '1px solid #333', color: '#6b7280', fontSize: '13px' }}>No trending posts yet</div>
              : trending.map(post => <PostCard key={post.id} post={post} />)
          )}
        </div>

        {/* Right Panel */}
        <div className="explore-right">

          {/* Trending Now */}
          <div style={{ background: '#242424', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #2d2d2d', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={13} color="#ffa116" />
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.7px', textTransform: 'uppercase' }}>Trending Now</span>
            </div>
            <div style={{ padding: '6px' }}>
              {trending.slice(0, 5).map((post, i) => (
                <div key={post.id} className="trend-item" onClick={() => navigate(`/post/${post.id}`)}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: i === 0 ? 'rgba(255,215,0,0.1)' : '#1e1e1e', border: `1px solid ${i === 0 ? 'rgba(255,215,0,0.3)' : '#333'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0, color: i === 0 ? '#FFD700' : '#6b7280' }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4', marginBottom: '4px', fontWeight: '500', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.title}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#6b7280' }}>
                          <Heart size={10} strokeWidth={1.8} /> {post.likesCount}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#6b7280' }}>
                          <Eye size={10} strokeWidth={1.8} /> {post.viewCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Tags */}
          <div style={{ background: '#242424', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #2d2d2d', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Hash size={13} color="#6b7280" />
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.7px', textTransform: 'uppercase' }}>Popular Tags</span>
            </div>
            <div style={{ padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {popularTags.map(tag => (
                <button key={tag} className={`tag-btn ${selectedTag === tag ? 'active' : ''}`} onClick={() => fetchByTag(tag)}>
                  #{tag}
                </button>
              ))}
              {selectedTag && (
                <button onClick={() => { setSelectedTag(null); setTagPosts([]) }}
                  style={{ padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>
                  ✕ Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}