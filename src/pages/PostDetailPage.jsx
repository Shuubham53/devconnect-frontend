import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Heart, MessageCircle, Bookmark, ArrowLeft, Send, Eye, ChevronDown } from 'lucide-react'
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
  const [replyText, setReplyText] = useState({})
  const [collapsedReplies, setCollapsedReplies] = useState({})
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
      await api.post(`/api/comments/${id}`, { content: comment })
      setComment(''); fetchComments(); fetchPost()
      toast.success('Comment added!')
    } catch (err) { toast.error('Failed to add comment') }
    finally { setSubmitting(false) }
  }

  const handleReply = async (commentId) => {
    const text = replyText[commentId]?.trim()
    if (!text) return
    try {
      await api.post(`/api/comments/${commentId}/reply`, { content: text })
      setReplyText(prev => ({ ...prev, [commentId]: '' }))
      setReplyTo(null)
      fetchComments(); fetchPost()
      toast.success('Reply added!')
    } catch (err) { toast.error('Failed to add reply') }
  }

  const toggleReplies = (commentId) => {
    setCollapsedReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }))
  }

  const getTypeStyle = (type) => {
    switch (type) {
      case 'QUESTION':   return { bg: 'rgba(96,165,250,0.12)',  color: '#93c5fd', border: 'rgba(96,165,250,0.25)' }
      case 'ARTICLE':    return { bg: 'rgba(0,184,163,0.12)',   color: '#2dd4bf', border: 'rgba(0,184,163,0.25)' }
      case 'DISCUSSION': return { bg: 'rgba(192,132,252,0.12)', color: '#d8b4fe', border: 'rgba(192,132,252,0.25)' }
      default:           return { bg: '#2d2d2d', color: '#94a3b8', border: '#3d3d3d' }
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

  const avatarStyle = (name, size = 32) => {
    const color = getAvatarColor(name)
    return {
      width: `${size}px`, height: `${size}px`, borderRadius: '6px',
      background: `${color}20`, border: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size <= 26 ? '9px' : size <= 30 ? '10px' : '11px',
      fontWeight: '700', color, flexShrink: 0
    }
  }

  if (loading) return <Layout><div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '13px' }}>Loading...</div></Layout>
  if (!post) return null

  const typeStyle = getTypeStyle(post.postType)

  return (
    <Layout>
      <style>{`
        .detail-btn { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #cbd5e1; padding: 7px 14px; border-radius: 6px; border: 1px solid #383838; background: #2a2a2a; cursor: pointer; font-family: Inter, sans-serif; transition: all .15s; line-height: 1; outline: none; }
        .detail-btn:hover { background: #333; border-color: #555; }
        .detail-btn.like:hover { color: #f87171; border-color: rgba(248,113,113,.3); }
        .detail-btn.like:hover svg { stroke: #f87171; }
        .detail-btn.save:hover { color: #ffa116; border-color: rgba(255,161,22,.3); }
        .detail-btn.save:hover svg { stroke: #ffa116; }
        .c-action { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #4b5563; background: none; border: none; cursor: pointer; font-family: inherit; padding: 3px 7px; border-radius: 4px; transition: all .15s; }
        .c-action:hover { background: #2d2d2d; color: #cbd5e1; }
        .c-action.reply:hover { color: #60a5fa; }
        .c-action.toggle { color: #60a5fa; }
        .c-action.toggle:hover { background: rgba(96,165,250,.08); }
        .comment-box { background: #1e1e1e; border: 1px solid #2d2d2d; border-radius: 9px; padding: 12px 14px; transition: border-color .15s; }
        .comment-box:hover { border-color: #383838; }
        .reply-box { background: #1a1a1a; border: 1px solid #252525; border-radius: 8px; padding: 10px 12px; transition: border-color .15s; }
        .reply-box:hover { border-color: #2d2d2d; }
        .comment-textarea { width: 100%; background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #e2e8f0; font-family: inherit; resize: none; outline: none; transition: border-color .15s; }
        .comment-textarea:focus { border-color: #ffa116; }
      `}</style>

      <div style={{ maxWidth: '760px', margin: '0 auto' }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '16px', fontFamily: 'Inter, sans-serif', padding: 0, transition: 'color .15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Post Card */}
        <div style={{ background: '#242424', border: '1px solid #333', borderRadius: '10px', padding: '24px', marginBottom: '14px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={avatarStyle(post.authorName, 38)}>
              {post.authorAvatarUrl
                ? <img src={post.authorAvatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                : getInitials(post.authorName)
              }
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>{post.authorName}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '1px' }}>{timeAgo(post.createdAt)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#94a3b8', marginRight: '8px' }}>
              <Eye size={13} strokeWidth={1.8} color="#60a5fa" />
              <span style={{ fontWeight: '500' }}>{post.viewCount} views</span>
            </div>
            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '4px', fontWeight: '600', letterSpacing: '.3px', background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}` }}>
              {post.postType}
            </span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9', marginBottom: '14px', lineHeight: '1.35', letterSpacing: '-0.3px' }}>
            {post.title}
          </h1>

          {/* Image */}
          {post.imageUrl && (
            <div style={{ marginBottom: '16px', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={post.imageUrl} alt="post" style={{ width: '100%', maxHeight: '360px', objectFit: 'cover' }} />
            </div>
          )}

          {/* Content */}
          <div style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.8', marginBottom: '16px', whiteSpace: 'pre-wrap' }}>
            {post.content}
          </div>

          {/* Tags */}
          {post.tags && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
              {post.tags.split(',').map(tag => (
                <span key={tag} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '4px', background: '#1e1e1e', color: '#94a3b8', border: '1px solid #383838' }}>
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '16px', borderTop: '1px solid #2d2d2d' }}>
            <button className="detail-btn like" onClick={handleLike}>
              <Heart size={14} strokeWidth={1.8} /> {post.likesCount} Likes
            </button>
            <button className="detail-btn">
              <MessageCircle size={14} strokeWidth={1.8} /> {post.commentsCount} Comments
            </button>
            <div style={{ flex: 1 }} />
            <button className="detail-btn save" onClick={handleBookmark}>
              <Bookmark size={14} strokeWidth={1.8} /> Save
            </button>
          </div>
        </div>

        {/* Comments Card */}
        <div style={{ background: '#242424', border: '1px solid #333', borderRadius: '10px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#e2e8f0', margin: 0 }}>Comments</h2>
            <span style={{ fontSize: '12px', color: '#6b7280', background: '#1e1e1e', padding: '2px 8px', borderRadius: '10px', border: '1px solid #333' }}>{post.commentsCount}</span>
          </div>

          {/* Add Comment */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '22px', paddingBottom: '20px', borderBottom: '1px solid #2d2d2d' }}>
            <div style={{ ...avatarStyle(user?.username || '', 30), marginTop: '2px' }}>
              {getInitials(user?.username || '?')}
            </div>
            <textarea
              className="comment-textarea"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={2}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleComment(e) }}
            />
            <button onClick={handleComment} disabled={submitting || !comment.trim()}
              style={{ background: '#ffa116', border: 'none', borderRadius: '8px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, opacity: !comment.trim() ? 0.5 : 1, transition: 'opacity .15s' }}>
              <Send size={15} color="#191919" />
            </button>
          </div>

          {/* Comments List */}
          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px', color: '#6b7280', fontSize: '13px' }}>No comments yet. Be the first!</div>
          ) : comments.map(c => {
            const cColor = getAvatarColor(c.authorName)
            const repliesVisible = !collapsedReplies[c.id]
            return (
              <div key={c.id} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>

                  {/* Left — avatar + thread line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={avatarStyle(c.authorName, 30)}>
                      {c.authorAvatarUrl
                        ? <img src={c.authorAvatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                        : getInitials(c.authorName)
                      }
                    </div>
                    {(c.replies?.length > 0 || replyTo === c.id) && (
                      <div style={{ width: '2px', background: '#2d2d2d', borderRadius: '2px', flex: 1, marginTop: '4px', minHeight: '20px' }} />
                    )}
                  </div>

                  {/* Right — comment content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="comment-box">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>{c.authorName}</span>
                        <span style={{ fontSize: '11px', color: '#4b5563' }}>{timeAgo(c.createdAt)}</span>
                        {c.isEdited && <span style={{ fontSize: '10px', color: '#4b5563' }}>edited</span>}
                      </div>
                      <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.65', margin: '0 0 10px' }}>{c.content}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <button className="c-action reply" onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}>
                          Reply
                        </button>
                        {c.replies?.length > 0 && (
                          <button className="c-action toggle" onClick={() => toggleReplies(c.id)}>
                            <ChevronDown size={12} strokeWidth={2} style={{ transition: 'transform .2s', transform: repliesVisible ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
                            {repliesVisible ? 'Hide' : 'Show'} {c.replies.length} {c.replies.length === 1 ? 'reply' : 'replies'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline Reply Input */}
                    {replyTo === c.id && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '8px', paddingLeft: '4px' }}>
                        <div style={{ ...avatarStyle(user?.username || '', 26), marginTop: '2px' }}>
                          {getInitials(user?.username || '?')}
                        </div>
                        <textarea
                          className="comment-textarea"
                          value={replyText[c.id] || ''}
                          onChange={e => setReplyText(prev => ({ ...prev, [c.id]: e.target.value }))}
                          placeholder={`Reply to ${c.authorName}...`}
                          rows={2}
                          autoFocus
                        />
                        <button onClick={() => handleReply(c.id)}
                          style={{ background: '#ffa116', border: 'none', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                          <Send size={13} color="#191919" />
                        </button>
                      </div>
                    )}

                    {/* Nested Replies */}
                    {c.replies?.length > 0 && repliesVisible && (
                      <div style={{ marginTop: '8px', paddingLeft: '4px' }}>
                        {c.replies.map((reply, ri) => {
                          const rColor = getAvatarColor(reply.authorName)
                          return (
                            <div key={reply.id} style={{ display: 'flex', gap: '8px', marginBottom: ri < c.replies.length - 1 ? '8px' : 0 }}>
                              <div style={{ width: '2px', background: '#2a2a2a', borderRadius: '2px', marginLeft: '14px', flexShrink: 0 }} />
                              <div style={avatarStyle(reply.authorName, 26)}>
                                {reply.authorAvatarUrl
                                  ? <img src={reply.authorAvatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '5px' }} />
                                  : getInitials(reply.authorName)
                                }
                              </div>
                              <div className="reply-box" style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
                                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#e2e8f0' }}>{reply.authorName}</span>
                                  <span style={{ fontSize: '10px', color: '#4b5563' }}>{timeAgo(reply.createdAt)}</span>
                                  {reply.isEdited && <span style={{ fontSize: '10px', color: '#4b5563' }}>edited</span>}
                                </div>
                                <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.6', margin: 0 }}>{reply.content}</p>
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