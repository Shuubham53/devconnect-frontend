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

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [id])

  const fetchPost = async () => {
    try {
      const res = await api.get(`/api/posts/${id}`)
      setPost(res.data.data)
    } catch (err) {
      toast.error('Post not found')
      navigate('/feed')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await api.get(`/api/comments/${id}`)
      setComments(res.data.data || [])
    } catch (err) {}
  }

  const handleLike = async () => {
    try {
      await api.post(`/api/likes/${id}`)
      fetchPost()
      toast.success('Liked!')
    } catch (err) {
      if (err.response?.status === 400) {
        await api.delete(`/api/likes/${id}`)
        fetchPost()
      }
    }
  }

  const handleBookmark = async () => {
    try {
      await api.post(`/api/bookmarks/${id}`)
      toast.success('Bookmarked!')
    } catch (err) {
      if (err.response?.status === 400) {
        await api.delete(`/api/bookmarks/${id}`)
        toast.success('Removed bookmark')
      }
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      if (replyTo) {
        await api.post(`/api/comments/${replyTo}/reply`, { content: comment })
        toast.success('Reply added!')
      } else {
        await api.post(`/api/comments/${id}`, { content: comment })
        toast.success('Comment added!')
      }
      setComment('')
      setReplyTo(null)
      fetchComments()
      fetchPost()
    } catch (err) {
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
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

  if (loading) return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
        Loading...
      </div>
    </Layout>
  )

  if (!post) return null

  const avatarColor = getAvatarColor(post.authorName)
  const badgeStyle = getBadgeStyle(post.postType)

  return (
    <Layout>
      <div style={{ maxWidth: '720px' }}>

        {/* Back button */}
        <button onClick={() => navigate('/feed')} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          color: '#475569', fontSize: '13px', background: 'transparent',
          border: 'none', cursor: 'pointer', marginBottom: '20px',
          fontFamily: 'Inter, sans-serif', padding: '0'
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
          onMouseLeave={e => e.currentTarget.style.color = '#475569'}
        >
          <ArrowLeft size={16} />
          Back to feed
        </button>

        {/* Post Card */}
        <div style={{
          background: '#0d0d18', border: '1px solid #1e293b',
          borderRadius: '12px', padding: '28px', marginBottom: '20px'
        }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '12px', marginBottom: '20px'
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: avatarColor.bg, color: avatarColor.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '700', flexShrink: 0
            }}>
              {getInitials(post.authorName)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>
                {post.authorName}
              </div>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                {timeAgo(post.createdAt)} · {post.viewCount} views
              </div>
            </div>
            <span style={{
              fontSize: '11px', padding: '4px 10px',
              borderRadius: '20px', fontWeight: '600',
              letterSpacing: '0.3px', ...badgeStyle
            }}>
              {post.postType}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '24px', fontWeight: '700', color: '#f1f5f9',
            marginBottom: '16px', lineHeight: '1.3', letterSpacing: '-0.5px'
          }}>
            {post.title}
          </h1>

          {/* Image */}
          {post.imageUrl && (
            <div style={{ marginBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}>
              <img src={post.imageUrl} alt="post"
                style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Content */}
          <div style={{
            fontSize: '15px', color: '#94a3b8',
            lineHeight: '1.8', marginBottom: '20px',
            whiteSpace: 'pre-wrap'
          }}>
            {post.content}
          </div>

          {/* Tags */}
          {post.tags && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {post.tags.split(',').map(tag => (
                <span key={tag} style={{
                  fontSize: '12px', padding: '4px 10px',
                  borderRadius: '6px', background: '#1e293b', color: '#94a3b8'
                }}>
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            paddingTop: '16px', borderTop: '1px solid #1e293b'
          }}>
            <button onClick={handleLike} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px', border: 'none',
              background: '#1e293b', color: '#e2e8f0', cursor: 'pointer',
              fontSize: '13px', fontFamily: 'Inter, sans-serif'
            }}>
              <Heart size={15} />
              {post.likesCount} Likes
            </button>

            <button style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px', border: 'none',
              background: '#1e293b', color: '#e2e8f0', cursor: 'pointer',
              fontSize: '13px', fontFamily: 'Inter, sans-serif'
            }}>
              <MessageCircle size={15} />
              {post.commentsCount} Comments
            </button>

            <div style={{ flex: 1 }} />

            <button onClick={handleBookmark} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px', border: 'none',
              background: '#1e293b', color: '#e2e8f0', cursor: 'pointer',
              fontSize: '13px', fontFamily: 'Inter, sans-serif'
            }}>
              <Bookmark size={15} />
              Bookmark
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div style={{
          background: '#0d0d18', border: '1px solid #1e293b',
          borderRadius: '12px', padding: '24px'
        }}>
          <h2 style={{
            fontSize: '16px', fontWeight: '600', color: '#f1f5f9',
            marginBottom: '20px'
          }}>
            {post.commentsCount} Comments
          </h2>

          {/* Add Comment */}
          <form onSubmit={handleComment} style={{ marginBottom: '24px' }}>
            {replyTo && (
              <div style={{
                fontSize: '12px', color: '#00ff87', marginBottom: '8px',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                Replying to comment
                <button type="button" onClick={() => setReplyTo(null)} style={{
                  background: 'transparent', border: 'none',
                  color: '#475569', cursor: 'pointer', fontSize: '12px'
                }}>
                  Cancel
                </button>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(0,255,135,0.15)', color: '#00ff87',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '700', flexShrink: 0
              }}>
                {getInitials(user?.username || '?')}
              </div>
              <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={2}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: '8px',
                    background: '#0a0a0f', border: '1px solid #1e293b',
                    color: '#e2e8f0', fontSize: '13px', outline: 'none',
                    resize: 'none', fontFamily: 'Inter, sans-serif'
                  }}
                  onFocus={e => e.target.style.borderColor = '#00ff87'}
                  onBlur={e => e.target.style.borderColor = '#1e293b'}
                />
                <button type="submit" disabled={submitting} style={{
                  padding: '10px 16px', borderRadius: '8px',
                  background: '#00ff87', border: 'none', color: '#000',
                  cursor: 'pointer', flexShrink: 0
                }}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#475569', fontSize: '13px' }}>
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map(c => {
              const cAvatarColor = getAvatarColor(c.authorName)
              return (
                <div key={c.id} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: cAvatarColor.bg, color: cAvatarColor.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: '700', flexShrink: 0
                    }}>
                      {getInitials(c.authorName)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        background: '#0a0a0f', borderRadius: '8px',
                        padding: '12px 14px', border: '1px solid #1e293b'
                      }}>
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          gap: '8px', marginBottom: '6px'
                        }}>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>
                            {c.authorName}
                          </span>
                          <span style={{ fontSize: '11px', color: '#475569' }}>
                            {timeAgo(c.createdAt)}
                          </span>
                          {c.isEdited && (
                            <span style={{ fontSize: '10px', color: '#475569' }}>edited</span>
                          )}
                        </div>
                        <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
                          {c.content}
                        </p>
                      </div>
                      <button onClick={() => setReplyTo(c.id)} style={{
                        background: 'transparent', border: 'none',
                        color: '#475569', fontSize: '12px', cursor: 'pointer',
                        marginTop: '6px', fontFamily: 'Inter, sans-serif'
                      }}>
                        Reply
                      </button>

                      {/* Replies */}
                      {c.replies && c.replies.length > 0 && (
                        <div style={{ marginTop: '12px', paddingLeft: '16px', borderLeft: '2px solid #1e293b' }}>
                          {c.replies.map(reply => {
                            const rAvatarColor = getAvatarColor(reply.authorName)
                            return (
                              <div key={reply.id} style={{
                                display: 'flex', gap: '8px', marginBottom: '12px'
                              }}>
                                <div style={{
                                  width: '26px', height: '26px', borderRadius: '50%',
                                  background: rAvatarColor.bg, color: rAvatarColor.color,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '9px', fontWeight: '700', flexShrink: 0
                                }}>
                                  {getInitials(reply.authorName)}
                                </div>
                                <div style={{
                                  background: '#0a0a0f', borderRadius: '8px',
                                  padding: '10px 12px', border: '1px solid #1e293b', flex: 1
                                }}>
                                  <div style={{
                                    display: 'flex', alignItems: 'center',
                                    gap: '8px', marginBottom: '4px'
                                  }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#e2e8f0' }}>
                                      {reply.authorName}
                                    </span>
                                    <span style={{ fontSize: '10px', color: '#475569' }}>
                                      {timeAgo(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                                    {reply.content}
                                  </p>
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
            })
          )}
        </div>
      </div>
    </Layout>
  )
}