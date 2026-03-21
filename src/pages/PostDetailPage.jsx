import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Heart, MessageCircle, Bookmark, ArrowLeft, Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Layout from '../components/layout/Layout'

export default function PostDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchPost(); fetchComments() }, [id])

  const fetchPost = async () => {
    try { const res = await api.get(`/api/posts/${id}`); setPost(res.data.data) }
    catch (err) { toast.error('Post not found'); navigate('/feed') }
    finally { setLoading(false) }
  }

  const fetchComments = async () => {
    try { const res = await api.get(`/api/comments/${id}`); setComments(res.data.data || []) } catch (err) {}
  }

  const handleLike = async () => {
    try { await api.post(`/api/likes/${id}`); fetchPost(); toast.success('Liked!') }
    catch (err) { if (err.response?.status === 400) { await api.delete(`/api/likes/${id}`); fetchPost() } }
  }

  const handleBookmark = async () => {
    try { await api.post(`/api/bookmarks/${id}`); toast.success('Bookmarked!') }
    catch (err) { if (err.response?.status === 400) { await api.delete(`/api/bookmarks/${id}`); toast.success('Removed') } }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      if (replyTo) await api.post(`/api/comments/${replyTo}/reply`, { content: comment })
      else await api.post(`/api/comments/${id}`, { content: comment })
      setComment(''); setReplyTo(null); fetchComments(); fetchPost()
      toast.success(replyTo ? 'Reply added!' : 'Comment added!')
    } catch (err) { toast.error('Failed to add comment') }
    finally { setSubmitting(false) }
  }

  const getTypeStyle = (type) => {
    switch (type) {
      case 'QUESTION': return { bg: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: 'rgba(96,165,250,0.2)' }
      case 'ARTICLE': return { bg: 'rgba(0,184,163,0.1)', color: '#00b8a3', border: 'rgba(0,184,163,0.2)' }
      case 'DISCUSSION': return { bg: 'rgba(192,132,252,0.1)', color: '#c084fc', border: 'rgba(192,132,252,0.2)' }
      default: return { bg: '#3d3d3d', color: '#94a3b8', border: '#3d3d3d' }
    }
  }

  const getInitials = (name) => { if (!name) return '?'; return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) }
  const getAvatarColor = (name) => { const c = ['#60a5fa','#00b8a3','#c084fc','#f87171','#34d399']; return c[name?.charCodeAt(0) % c.length || 0] }

  const timeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  if (loading) return <Layout><div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '13px' }}>Loading...</div></Layout>
  if (!post) return null

  const typeStyle = getTypeStyle(post.postType)
  const authorColor = getAvatarColor(post.authorName)
  const userColor = getAvatarColor(user?.username || '')

  return (
    <Layout>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '16px', fontFamily: 'Inter, sans-serif', padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = '#eff1f6'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Post */}
        <div style={{ background: '#282828', border: '1px solid #3d3d3d', borderRadius: '8px', padding: '24px', marginBottom: '12px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: `${authorColor}20`, border: `1px solid ${authorColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: authorColor, flexShrink: 0 }}>
              {getInitials(post.authorName)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#eff1f6' }}>{post.authorName}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{timeAgo(post.createdAt)} · {post.viewCount} views</div>
            </div>
            <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '4px', fontWeight: '600', background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}` }}>
              {post.postType}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#eff1f6', marginBottom: '14px', lineHeight: '1.3', letterSpacing: '-0.3px' }}>
            {post.title}
          </h1>

          {/* Image */}
          {post.imageUrl && (
            <div style={{ marginBottom: '16px', borderRadius: '6px', overflow: 'hidden' }}>
              <img src={post.imageUrl} alt="post" style={{ width: '100%', maxHeight: '360px', objectFit: 'cover' }} />
            </div>
          )}

          {/* Content */}
          <div style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.8', marginBottom: '16px', whiteSpace: 'pre-wrap' }}>
            {post.content}
          </div>

          {/* Tags */}
          {post.tags && (
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {post.tags.split(',').map(tag => (
                <span key={tag} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#1a1a1a', color: '#64748b', border: '1px solid #3d3d3d' }}>
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '14px', borderTop: '1px solid #3d3d3d' }}>
            <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '6px', border: '1px solid #3d3d3d', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.color = '#f87171' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3d3d'; e.currentTarget.style.color = '#94a3b8' }}
            >
              <Heart size={14} /> {post.likesCount} Likes
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '6px', border: '1px solid #3d3d3d', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
              <MessageCircle size={14} /> {post.commentsCount} Comments
            </button>
            <div style={{ flex: 1 }} />
            <button onClick={handleBookmark} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '6px', border: '1px solid #3d3d3d', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ffa116'; e.currentTarget.style.color = '#ffa116' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3d3d'; e.currentTarget.style.color = '#94a3b8' }}
            >
              <Bookmark size={14} /> Save
            </button>
          </div>
        </div>

        {/* Comments */}
        <div style={{ background: '#282828', border: '1px solid #3d3d3d', borderRadius: '8px', padding: '20px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#eff1f6', marginBottom: '16px' }}>
            {post.commentsCount} Comments
          </h2>

          {/* Add Comment */}
          <form onSubmit={handleComment} style={{ marginBottom: '20px' }}>
            {replyTo && (
              <div style={{ fontSize: '12px', color: '#ffa116', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Replying to comment
                <button type="button" onClick={() => setReplyTo(null)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `${userColor}20`, border: `1px solid ${userColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: userColor, flexShrink: 0 }}>
                {getInitials(user?.username || '?')}
              </div>
              <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment..." rows={2}
                  style={{ flex: 1, padding: '9px 12px', borderRadius: '6px', background: '#1a1a1a', border: '1px solid #3d3d3d', color: '#eff1f6', fontSize: '13px', outline: 'none', resize: 'none', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.15s' }}
                  onFocus={e => e.target.style.borderColor = '#ffa116'}
                  onBlur={e => e.target.style.borderColor = '#3d3d3d'}
                />
                <button type="submit" disabled={submitting} style={{ padding: '9px 14px', borderRadius: '6px', background: '#ffa116', border: 'none', color: '#000', cursor: 'pointer', flexShrink: 0 }}>
                  <Send size={15} />
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px', color: '#64748b', fontSize: '13px' }}>
              No comments yet. Be the first!
            </div>
          ) : comments.map(c => {
            const cColor = getAvatarColor(c.authorName)
            return (
              <div key={c.id} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: `${cColor}20`, border: `1px solid ${cColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: cColor, flexShrink: 0 }}>
                    {getInitials(c.authorName)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ background: '#1a1a1a', borderRadius: '6px', padding: '10px 12px', border: '1px solid #3d3d3d' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#eff1f6' }}>{c.authorName}</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{timeAgo(c.createdAt)}</span>
                        {c.isEdited && <span style={{ fontSize: '10px', color: '#64748b' }}>edited</span>}
                      </div>
                      <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>{c.content}</p>
                    </div>
                    <button onClick={() => setReplyTo(c.id)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', marginTop: '5px', fontFamily: 'Inter, sans-serif' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ffa116'}
                      onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                    >
                      Reply
                    </button>

                    {/* Replies */}
                    {c.replies?.length > 0 && (
                      <div style={{ marginTop: '10px', paddingLeft: '12px', borderLeft: '2px solid #3d3d3d' }}>
                        {c.replies.map(reply => {
                          const rColor = getAvatarColor(reply.authorName)
                          return (
                            <div key={reply.id} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                              <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: `${rColor}20`, border: `1px solid ${rColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color: rColor, flexShrink: 0 }}>
                                {getInitials(reply.authorName)}
                              </div>
                              <div style={{ background: '#1a1a1a', borderRadius: '6px', padding: '8px 10px', border: '1px solid #3d3d3d', flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#eff1f6' }}>{reply.authorName}</span>
                                  <span style={{ fontSize: '10px', color: '#64748b' }}>{timeAgo(reply.createdAt)}</span>
                                </div>
                                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{reply.content}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}