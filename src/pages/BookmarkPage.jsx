import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Bookmark, Heart, MessageCircle, Eye, Trash2 } from 'lucide-react'
import api from '../services/api'
import Layout from '../components/layout/Layout'

export default function BookmarkPage() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { fetchBookmarks() }, [])

  const fetchBookmarks = async () => {
    try {
      const res = await api.get('/api/bookmarks')
      setBookmarks(res.data.data || [])
    } catch (err) { toast.error('Failed to load saved posts') }
    finally { setLoading(false) }
  }

  const handleRemoveBookmark = async (e, postId) => {
    e.stopPropagation()
    try {
      await api.delete(`/api/bookmarks/${postId}`)
      setBookmarks(prev => prev.filter(b => (b.postId || b.post?.id || b.id) !== postId))
      toast.success('Removed from saved')
    } catch (err) { toast.error('Failed to remove') }
  }

  const handleLike = async (e, postId) => {
    e.stopPropagation()
    try { await api.post(`/api/likes/${postId}/toggle`); fetchBookmarks() }
    catch (err) { toast.error('Failed to like') }
  }

  const getInitials = (name) => { if (!name) return '?'; return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) }
  const getAvatarColor = (name) => { const c = ['#60a5fa','#00b8a3','#c084fc','#f87171','#34d399']; return c[name?.charCodeAt(0) % c.length || 0] }

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

  // normalize post object — API might return bookmark wrapper or direct post
  const getPost = (item) => item.post || item

  return (
    <Layout>
      <style>{`
        .bm-card { background: #242424; border: 1px solid #333; border-radius: 8px; padding: 16px; margin-bottom: 10px; cursor: pointer; transition: border-color .15s; }
        .bm-card:hover { border-color: #555; }
        .bm-action { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #cbd5e1; padding: 4px 10px; border-radius: 6px; border: 1px solid #383838; background: #2a2a2a; cursor: pointer; font-family: Inter, sans-serif; transition: all .15s; line-height: 1; outline: none; }
        .bm-action:hover { background: #333; border-color: #555; }
        .bm-action.like:hover { color: #f87171; border-color: rgba(248,113,113,.3); }
        .bm-action.like:hover svg { stroke: #f87171; }
        .bm-action.remove:hover { color: #ef4444; border-color: rgba(239,68,68,.3); }
        .bm-action.remove:hover svg { stroke: #ef4444; }
        @media (max-width: 640px) {
          .bm-card { padding: 12px; }
          .bm-tags { display: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '36px', height: '36px', background: 'rgba(255,161,22,0.1)', border: '1px solid rgba(255,161,22,0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bookmark size={18} color="#ffa116" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>Saved Posts</h1>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Posts you've bookmarked</p>
          </div>
          {!loading && (
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#6b7280', background: '#1e1e1e', padding: '3px 10px', borderRadius: '10px', border: '1px solid #333' }}>
              {bookmarks.length} saved
            </span>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', fontSize: '13px' }}>Loading...</div>
        ) : bookmarks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#242424', borderRadius: '10px', border: '1px solid #333' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(255,161,22,0.1)', border: '1px solid rgba(255,161,22,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Bookmark size={22} color="#ffa116" />
            </div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px' }}>No saved posts yet</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>Bookmark posts to read them later</div>
            <button onClick={() => navigate('/feed')} style={{ padding: '8px 20px', borderRadius: '6px', background: '#ffa116', color: '#000', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', fontFamily: 'Inter, sans-serif' }}>
              Browse Feed
            </button>
          </div>
        ) : bookmarks.map((item) => {
          const post = getPost(item)
          const postId = post.id
          const typeStyle = getTypeStyle(post.postType)
          const color = getAvatarColor(post.authorName)
          return (
            <div key={postId} className="bm-card" onClick={() => navigate(`/post/${postId}`)}>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '5px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color, flexShrink: 0, overflow: 'hidden' }}>
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
              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px', lineHeight: '1.45' }}>{post.title}</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</div>
                  {post.tags && (
                    <div className="bm-tags" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {post.tags.split(',').slice(0, 3).map(tag => (
                        <span key={tag} style={{ fontSize: '12px', padding: '3px 9px', borderRadius: '4px', background: '#1e1e1e', color: '#94a3b8', border: '1px solid #383838' }}>{tag.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
                {post.imageUrl && (
                  <div style={{ width: '80px', height: '62px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={post.imageUrl} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingTop: '12px', borderTop: '1px solid #2d2d2d', marginTop: '12px' }}>
                <button className="bm-action like" onClick={e => handleLike(e, postId)}>
                  <Heart size={13} strokeWidth={1.8} style={{ display: 'block' }} />
                  <span>{post.likesCount}</span>
                </button>
                <button className="bm-action" onClick={e => { e.stopPropagation(); navigate(`/post/${postId}`) }}>
                  <MessageCircle size={13} strokeWidth={1.8} style={{ display: 'block' }} />
                  <span>{post.commentsCount}</span>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '6px', fontSize: '12px', color: '#94a3b8' }}>
                  <Eye size={13} strokeWidth={1.8} style={{ display: 'block', color: '#60a5fa' }} />
                  <span style={{ fontWeight: '500' }}>{post.viewCount ?? 0}</span>
                </div>
                <div style={{ flex: 1 }} />
                <button className="bm-action remove" onClick={e => handleRemoveBookmark(e, postId)}>
                  <Trash2 size={13} strokeWidth={1.8} style={{ display: 'block' }} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}