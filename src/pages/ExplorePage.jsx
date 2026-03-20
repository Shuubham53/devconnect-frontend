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

  const popularTags = [
    'java', 'springboot', 'jwt', 'dsa', 'backend',
    'postgresql', 'redis', 'docker', 'react', 'api'
  ]

  useEffect(() => { fetchTrending() }, [])

  const fetchTrending = async () => {
    try {
      const res = await api.get('/api/posts/trending')
      setTrending(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load trending')
    } finally {
      setLoading(false)
    }
  }

  const fetchByTag = async (tag) => {
    setSelectedTag(tag)
    setTagLoading(true)
    try {
      const res = await api.get(`/api/posts/tag/${tag}`)
      setTagPosts(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load posts')
    } finally {
      setTagLoading(false)
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
    return colors[name?.charCodeAt(0) % colors.length || 0]
  }

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'QUESTION': return { background: '#1e3a5f', color: '#60a5fa' }
      case 'ARTICLE': return { background: '#1a2e1a', color: '#4ade80' }
      case 'DISCUSSION': return { background: '#2d1b4e', color: '#c084fc' }
      default: return { background: '#1e293b', color: '#94a3b8' }
    }
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

  const PostCard = ({ post }) => {
    const avatarColor = getAvatarColor(post.authorName)
    return (
      <div onClick={() => navigate(`/post/${post.id}`)}
        style={{
          background: '#0d0d18', border: '1px solid #1e293b',
          borderRadius: '12px', padding: '18px',
          cursor: 'pointer', transition: 'all 0.2s', marginBottom: '10px'
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.transform = 'translateY(0)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: avatarColor.bg, color: avatarColor.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: '700', flexShrink: 0
          }}>
            {getInitials(post.authorName)}
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>{post.authorName}</span>
          <span style={{ fontSize: '11px', color: '#334155' }}>·</span>
          <span style={{ fontSize: '11px', color: '#475569' }}>{timeAgo(post.createdAt)}</span>
          <span style={{ marginLeft: 'auto', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600', ...getBadgeStyle(post.postType) }}>
            {post.postType}
          </span>
        </div>
        <div style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '8px', lineHeight: '1.4' }}>
          {post.title}
        </div>
        <div style={{
          fontSize: '13px', color: '#64748b', lineHeight: '1.5', marginBottom: '12px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {post.content}
        </div>
        {post.tags && (
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {post.tags.split(',').map(tag => (
              <span key={tag} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', background: '#1e293b', color: '#94a3b8' }}>
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '10px', borderTop: '1px solid #1e293b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#475569' }}>
            <Heart size={12} /> {post.likesCount}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#475569' }}>
            <MessageCircle size={12} /> {post.commentsCount}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#475569' }}>
            <Eye size={12} /> {post.viewCount}
          </span>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      {/* explore-layout stacks on mobile */}
      <div className="explore-layout" style={{ display: 'flex', gap: '24px' }}>

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              Explore
            </h1>
            <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
              {selectedTag ? `Posts tagged #${selectedTag}` : 'Trending posts right now'}
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>Loading...</div>
          ) : tagLoading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>Loading posts...</div>
          ) : selectedTag ? (
            tagPosts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: '#0d0d18', borderRadius: '12px', border: '1px solid #1e293b', color: '#475569', fontSize: '13px' }}>
                No posts found for #{selectedTag}
              </div>
            ) : tagPosts.map(post => <PostCard key={post.id} post={post} />)
          ) : (
            trending.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: '#0d0d18', borderRadius: '12px', border: '1px solid #1e293b', color: '#475569', fontSize: '13px' }}>
                No trending posts yet
              </div>
            ) : trending.map(post => <PostCard key={post.id} post={post} />)
          )}
        </div>

        {/* Right Panel */}
        <div className="explore-right" style={{ width: '260px', flexShrink: 0 }}>

          {/* Trending Now */}
          <div style={{ background: '#0d0d18', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={14} color='#00ff87' />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#e2e8f0' }}>Trending Now</span>
            </div>
            <div style={{ padding: '8px' }}>
              {trending.slice(0, 5).map((post, i) => (
                <div key={post.id} onClick={() => navigate(`/post/${post.id}`)}
                  style={{
                    padding: '10px 8px', borderRadius: '8px', cursor: 'pointer',
                    marginBottom: '4px', transition: 'background 0.15s',
                    borderBottom: i < 4 ? '1px solid #1e293b' : 'none'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0a0a0f'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '6px',
                      background: i === 0 ? 'rgba(255,215,0,0.1)' : '#1e293b',
                      border: `1px solid ${i === 0 ? 'rgba(255,215,0,0.3)' : '#334155'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: '700', flexShrink: 0,
                      color: i === 0 ? '#FFD700' : '#475569'
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px', color: '#e2e8f0', lineHeight: '1.4',
                        marginBottom: '6px', fontWeight: '500',
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden'
                      }}>
                        {post.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#f87171' }}>
                          <Heart size={11} /> {post.likesCount}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#475569' }}>
                          <Eye size={11} /> {post.viewCount}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#475569' }}>
                          <MessageCircle size={11} /> {post.commentsCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Tags */}
          <div style={{ background: '#0d0d18', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Hash size={14} color='#94a3b8' />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#e2e8f0' }}>Popular Tags</span>
            </div>
            <div style={{ padding: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {popularTags.map(tag => (
                <button key={tag} onClick={() => fetchByTag(tag)} style={{
                  padding: '5px 12px', borderRadius: '20px', cursor: 'pointer',
                  background: selectedTag === tag ? 'rgba(0,255,135,0.1)' : '#1e293b',
                  border: `1px solid ${selectedTag === tag ? 'rgba(0,255,135,0.3)' : '#334155'}`,
                  color: selectedTag === tag ? '#00ff87' : '#94a3b8',
                  fontSize: '12px', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s'
                }}
                  onMouseEnter={e => { if (selectedTag !== tag) { e.currentTarget.style.borderColor = '#00ff87'; e.currentTarget.style.color = '#00ff87' } }}
                  onMouseLeave={e => { if (selectedTag !== tag) { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94a3b8' } }}
                >
                  #{tag}
                </button>
              ))}
              {selectedTag && (
                <button onClick={() => { setSelectedTag(null); setTagPosts([]) }} style={{
                  padding: '5px 12px', borderRadius: '20px', cursor: 'pointer',
                  background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                  color: '#f87171', fontSize: '12px', fontFamily: 'Inter, sans-serif'
                }}>
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