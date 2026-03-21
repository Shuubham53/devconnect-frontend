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

  const getTypeStyle = (type) => {
    switch (type) {
      case 'QUESTION': return { bg: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: 'rgba(96,165,250,0.2)' }
      case 'ARTICLE': return { bg: 'rgba(0,184,163,0.1)', color: '#00b8a3', border: 'rgba(0,184,163,0.2)' }
      case 'DISCUSSION': return { bg: 'rgba(192,132,252,0.1)', color: '#c084fc', border: 'rgba(192,132,252,0.2)' }
      default: return { bg: '#3d3d3d', color: '#94a3b8', border: '#3d3d3d' }
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
      <div onClick={() => navigate(`/post/${post.id}`)}
        style={{ background: '#282828', border: '1px solid #3d3d3d67', borderRadius: '8px', padding: '16px', cursor: 'pointer', transition: 'border-color 0.15s', marginBottom: '8px' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#555'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#3d3d3d'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color, flexShrink: 0 }}>
            {getInitials(post.authorName)}
          </div>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{post.authorName}</span>
          <span style={{ fontSize: '11px', color: '#3d3d3d' }}>·</span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>{timeAgo(post.createdAt)}</span>
          <span style={{ marginLeft: 'auto', fontSize: '10px', padding: '2px 7px', borderRadius: '4px', fontWeight: '600', background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}` }}>
            {post.postType}
          </span>
        </div>
        <div style={{ fontSize: '15px', fontWeight: '600', color: '#eff1f6', marginBottom: '6px', lineHeight: '1.4' }}>{post.title}</div>
        <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</div>
        {post.tags && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {post.tags.split(',').map(tag => (
              <span key={tag} style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: '#1a1a1a', color: '#64748b', border: '1px solid #3d3d3d' }}>{tag.trim()}</span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '10px', borderTop: '1px solid #3d3d3d' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}><Heart size={12} /> {post.likesCount}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}><MessageCircle size={12} /> {post.commentsCount}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}><Eye size={12} /> {post.viewCount}</span>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="explore-layout" style={{ display: 'flex', gap: '20px' }}>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: '16px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#eff1f6', margin: 0 }}>Explore</h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '3px 0 0' }}>
              {selectedTag ? `Posts tagged #${selectedTag}` : 'Trending posts right now'}
            </p>
          </div>

          {loading ? <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '13px' }}>Loading...</div>
            : tagLoading ? <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '13px' }}>Loading posts...</div>
            : selectedTag ? (
              tagPosts.length === 0
                ? <div style={{ textAlign: 'center', padding: '48px', background: '#282828', borderRadius: '8px', border: '1px solid #3d3d3d', color: '#64748b', fontSize: '13px' }}>No posts found for #{selectedTag}</div>
                : tagPosts.map(post => <PostCard key={post.id} post={post} />)
            ) : (
              trending.length === 0
                ? <div style={{ textAlign: 'center', padding: '48px', background: '#282828', borderRadius: '8px', border: '1px solid #3d3d3d', color: '#64748b', fontSize: '13px' }}>No trending posts yet</div>
                : trending.map(post => <PostCard key={post.id} post={post} />)
            )}
        </div>

        {/* Right Panel */}
        <div className="explore-right" style={{ width: '240px', flexShrink: 0 }}>

          {/* Trending Now */}
          <div style={{ background: '#282828', border: '1px solid hsla(0, 0%, 24%, 0.11)', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #3d3d3d', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={13} color='#ffa116' />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#eff1f6' }}>Trending Now</span>
            </div>
            <div style={{ padding: '6px' }}>
              {trending.slice(0, 5).map((post, i) => (
                <div key={post.id} onClick={() => navigate(`/post/${post.id}`)}
                  style={{ padding: '8px', borderRadius: '6px', cursor: 'pointer', marginBottom: '2px', transition: 'background 0.15s', borderBottom: i < 4 ? '1px solid #3d3d3d' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2d2d2d'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: i === 0 ? 'rgba(255,215,0,0.1)' : '#3d3d3d', border: `1px solid ${i === 0 ? 'rgba(255,215,0,0.3)' : '#555'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', flexShrink: 0, color: i === 0 ? '#FFD700' : '#64748b' }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', color: '#eff1f6', lineHeight: '1.4', marginBottom: '4px', fontWeight: '500', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {post.title}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#f87171' }}><Heart size={10} /> {post.likesCount}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#64748b' }}><Eye size={10} /> {post.viewCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Tags */}
          <div style={{ background: '#282828', border: '1px solid hsla(0, 0%, 24%, 0.11)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #3d3d3d', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Hash size={13} color='#94a3b8' />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#eff1f6' }}>Popular Tags</span>
            </div>
            <div style={{ padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {popularTags.map(tag => (
                <button key={tag} onClick={() => fetchByTag(tag)} style={{
                  padding: '4px 10px', borderRadius: '4px', cursor: 'pointer',
                  background: selectedTag === tag ? 'rgba(255,161,22,0.1)' : '#1a1a1a',
                  border: `1px solid ${selectedTag === tag ? 'rgba(255,161,22,0.3)' : '#3d3d3d'}`,
                  color: selectedTag === tag ? '#ffa116' : '#64748b',
                  fontSize: '11px', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s'
                }}
                  onMouseEnter={e => { if (selectedTag !== tag) { e.currentTarget.style.borderColor = '#ffa116'; e.currentTarget.style.color = '#ffa116' } }}
                  onMouseLeave={e => { if (selectedTag !== tag) { e.currentTarget.style.borderColor = '#3d3d3d'; e.currentTarget.style.color = '#64748b' } }}
                >
                  #{tag}
                </button>
              ))}
              {selectedTag && (
                <button onClick={() => { setSelectedTag(null); setTagPosts([]) }} style={{ padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>
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