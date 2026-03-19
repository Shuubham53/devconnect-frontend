import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Github, Linkedin, Edit, ArrowLeft, Heart, MessageCircle, TrendingUp } from 'lucide-react'
import api from '../services/api'
import Layout from '../components/layout/Layout'

export default function ProfilePage() {
  const { username } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [scoreHistory, setScoreHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)

  const isOwnProfile = user?.username === username

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchUserPosts()
      if (isOwnProfile) fetchScoreHistory()
    }
  }, [username, user])

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/api/users/${username}`)
      setProfile(res.data.data)
    } catch (err) {
      toast.error('User not found')
      navigate('/feed')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserPosts = async () => {
    try {
      const res = await api.get(`/api/posts/user/${username}`)
      setPosts(res.data.data || [])
    } catch (err) {}
  }

  const fetchScoreHistory = async () => {
    try {
      const res = await api.get('/api/users/score-history')
      setScoreHistory(res.data.data || [])
    } catch (err) {}
  }

  const handleFollow = async () => {
    try {
      if (following) {
        await api.delete(`/api/follow/${profile.id}`)
        setFollowing(false)
        toast.success('Unfollowed!')
      } else {
        await api.post(`/api/follow/${profile.id}`)
        setFollowing(true)
        toast.success('Now following!')
      }
      fetchProfile()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    }
  }

  const handleLike = async (e, postId) => {
    e.stopPropagation()
    try {
      await api.post(`/api/likes/${postId}`)
      fetchUserPosts()
      toast.success('Liked!')
    } catch (err) {
      if (err.response?.status === 400) {
        await api.delete(`/api/likes/${postId}`)
        fetchUserPosts()
      }
    }
  }

  const getBadgeConfig = (badge) => {
    switch (badge) {
      case 'LEGEND': return { bg: 'rgba(192,132,252,0.15)', color: '#c084fc', border: 'rgba(192,132,252,0.3)', emoji: '👑' }
      case 'EXPERT': return { bg: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: 'rgba(96,165,250,0.3)', emoji: '⚡' }
      case 'INTERMEDIATE': return { bg: 'rgba(74,222,128,0.15)', color: '#4ade80', border: 'rgba(74,222,128,0.3)', emoji: '🚀' }
      case 'BEGINNER': return { bg: 'rgba(52,211,153,0.15)', color: '#34d399', border: 'rgba(52,211,153,0.3)', emoji: '🌱' }
      default: return { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)', emoji: '👋' }
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
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

  if (loading) return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>Loading...</div>
    </Layout>
  )

  if (!profile) return null

  const badgeConfig = getBadgeConfig(profile.badge)

  return (
    <Layout>
      {/* Back */}
      <button onClick={() => navigate(-1)} style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        color: '#475569', fontSize: '13px', background: 'transparent',
        border: 'none', cursor: 'pointer', marginBottom: '20px',
        fontFamily: 'Inter, sans-serif', padding: 0
      }}
        onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
        onMouseLeave={e => e.currentTarget.style.color = '#475569'}
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* TOP ROW — Profile card + Score History side by side */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>

        {/* Profile Card */}
        <div style={{
          flex: 1, minWidth: 0,
          background: '#0d0d18', border: '1px solid #1e293b',
          borderRadius: '16px', overflow: 'hidden'
        }}>
          {/* Banner — gradient theme, avatar shows through */}
          <div style={{
            height: '110px', position: 'relative', overflow: 'visible',
            background: 'linear-gradient(135deg, #1931465c 0%, #060810 40%, #16634821 70%, #0d391d66 100%)'
          }}>
            {/* Orbs */}
            <div style={{
              position: 'absolute', top: '-50px', left: '-30px',
              width: '200px', height: '200px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(6, 30, 67, 0.59) 0%, transparent 70%)',
              filter: 'blur(35px)', pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute', top: '-30px', right: '60px',
              width: '160px', height: '160px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)',
              filter: 'blur(30px)', pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute', bottom: '-30px', right: '-20px',
              width: '180px', height: '180px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(192,132,252,0.12) 0%, transparent 70%)',
              filter: 'blur(30px)', pointerEvents: 'none'
            }} />

            {/* Avatar — overlapping banner */}
            <div style={{
              position: 'absolute', bottom: '-36px', left: '24px',
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(103, 221, 164, 0.09), rgba(53, 148, 62, 0.23))',
              border: '3px solid #0d0d18',
              outline: '1px solid rgba(0, 255, 136, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: '800', color: '#00ff87',
              zIndex: 10, boxShadow: '0 0 20px rgba(0, 255, 136, 0.03)'
            }}>
              {getInitials(profile.name)}
            </div>
          </div>

          <div style={{ padding: '44px 20px 20px' }}>
            {/* Name row */}
            <div style={{
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'space-between', marginBottom: '10px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                  <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' }}>
                    {profile.name}
                  </h1>
                  <span style={{
                    fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600',
                    background: badgeConfig.bg, color: badgeConfig.color, border: `1px solid ${badgeConfig.border}`
                  }}>
                    {badgeConfig.emoji} {profile.badge}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#475569' }}>@{profile.username}</div>
              </div>

              {isOwnProfile ? (
                <button onClick={() => navigate('/settings')} style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '7px 13px', borderRadius: '8px',
                  background: 'transparent', border: '1px solid #1e293b',
                  color: '#94a3b8', fontSize: '12px', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', flexShrink: 0
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#e2e8f0' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#94a3b8' }}
                >
                  <Edit size={12} /> Edit
                </button>
              ) : (
                <button onClick={handleFollow} style={{
                  padding: '7px 18px', borderRadius: '8px', flexShrink: 0,
                  background: following ? 'transparent' : '#00ff87',
                  border: following ? '1px solid #1e293b' : 'none',
                  color: following ? '#94a3b8' : '#000',
                  fontSize: '12px', fontWeight: '700',
                  cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                }}>
                  {following ? 'Following ✓' : '+ Follow'}
                </button>
              )}
            </div>

            {profile.bio && (
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '12px', marginTop: '8px' }}>
                {profile.bio}
              </p>
            )}

            {profile.skills && (
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {profile.skills.split(',').map(skill => (
                  <span key={skill} style={{
                    fontSize: '10px', padding: '3px 8px', borderRadius: '20px',
                    background: '#1e293b', color: '#94a3b8', border: '1px solid #334155'
                  }}>
                    {skill.trim()}
                  </span>
                ))}
              </div>
            )}

            {(profile.githubUrl || profile.linkedinUrl) && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px',
                    color: '#64748b', textDecoration: 'none', padding: '5px 10px',
                    borderRadius: '7px', background: '#0a0a0f', border: '1px solid #1e293b'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#e2e8f0' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#64748b' }}
                  >
                    <Github size={13} /> GitHub
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px',
                    color: '#64748b', textDecoration: 'none', padding: '5px 10px',
                    borderRadius: '7px', background: '#0a0a0f', border: '1px solid #1e293b'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#60a5fa' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#64748b' }}
                  >
                    <Linkedin size={13} /> LinkedIn
                  </a>
                )}
              </div>
            )}

            {/* Stats */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1px', background: '#1e293b', borderRadius: '10px',
              overflow: 'hidden', border: '1px solid #1e293b'
            }}>
              {[
                { label: 'Score', value: profile.score, color: '#00ff88ed', highlight: true },
                { label: 'Posts', value: posts.length, color: '#e2e8f0' },
                { label: 'Followers', value: profile.followersCount, color: '#e2e8f0' },
                { label: 'Following', value: profile.followingCount, color: '#e2e8f0' },
              ].map(stat => (
                <div key={stat.label} style={{
                  textAlign: 'center', padding: '12px 8px',
                  background: stat.highlight ? 'rgba(0, 255, 136, 0)' : '#0d0d18'
                }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: stat.color, letterSpacing: '-0.5px', lineHeight: 1 }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '10px', color: '#475569', marginTop: '3px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Score History — fills remaining width */}
        {isOwnProfile && (
          <div style={{
            width: '280px', flexShrink: 0,
            background: '#0d0d18', border: '1px solid #1e293b',
            borderRadius: '16px', overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '14px 16px', borderBottom: '1px solid #1e293b',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <TrendingUp size={14} color='#00ff87' />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>Score History</span>
              </div>
              <span style={{ fontSize: '10px', color: '#475569' }}>{scoreHistory.length} events</span>
            </div>

            {/* Total */}
            <div style={{
              margin: '10px 10px 0',
              padding: '12px 14px',
              background: 'rgba(0,255,135,0.06)',
              borderRadius: '10px',
              border: '1px solid rgba(0,255,135,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '10px', color: '#475569', marginBottom: '2px' }}>Total Score</div>
                <div style={{ fontSize: '26px', fontWeight: '800', color: '#00ff87', letterSpacing: '-1px', lineHeight: 1 }}>
                  {profile.score}
                </div>
              </div>
              <span style={{
                fontSize: '10px', padding: '3px 8px', borderRadius: '20px', fontWeight: '600',
                background: badgeConfig.bg, color: badgeConfig.color, border: `1px solid ${badgeConfig.border}`
              }}>
                {badgeConfig.emoji} {profile.badge}
              </span>
            </div>

            {/* List */}
            <div style={{ padding: '10px', maxHeight: '280px', overflowY: 'auto' }}>
              {scoreHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#475569', fontSize: '12px' }}>
                  No activity yet
                </div>
              ) : scoreHistory.map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '7px 6px', borderRadius: '7px', marginBottom: '3px',
                  transition: 'background 0.15s', cursor: 'default'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0a0a0f'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                    background: item.points > 0 ? 'rgba(0,255,135,0.1)' : 'rgba(248,113,113,0.1)',
                    border: `1px solid ${item.points > 0 ? 'rgba(0,255,135,0.2)' : 'rgba(248,113,113,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '700',
                    color: item.points > 0 ? '#00ff87' : '#f87171'
                  }}>
                    {item.points > 0 ? '+' : ''}{item.points}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '11px', color: '#94a3b8', marginBottom: '2px',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {item.reason}
                    </div>
                    <div style={{ fontSize: '10px', color: '#475569' }}>
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', color: item.points > 0 ? 'rgba(0,255,135,0.4)' : 'rgba(248,113,113,0.4)', flexShrink: 0 }}>
                    {item.points > 0 ? '↑' : '↓'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM ROW — Posts full width */}
<div style={{ background: '#0d0d18', border: '1px solid #1e293b', borderRadius: '12px', overflow: 'hidden' }}>
  <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', margin: 0 }}>
      Posts <span style={{ marginLeft: '6px', fontSize: '12px', color: '#475569', fontWeight: '400' }}>{posts.length}</span>
    </h2>
    {isOwnProfile && (
      <button onClick={() => navigate('/create-post')} style={{
        padding: '6px 14px', borderRadius: '7px', border: 'none',
        background: '#00ff87', color: '#000', fontSize: '12px',
        fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif'
      }}>
        + New Post
      </button>
    )}
  </div>
  <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
    {posts.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '40px', color: '#475569', fontSize: '13px', gridColumn: '1/-1' }}>
        <div style={{ fontSize: '28px', marginBottom: '10px' }}>📝</div>
        No posts yet
      </div>
    ) : posts.map((post) => {
      const badgeStyle = getBadgeStyle(post.postType)
      const typeGlow = {
        QUESTION: 'rgba(96,165,250,0.06)',
        ARTICLE: 'rgba(74,222,128,0.06)',
        DISCUSSION: 'rgba(192,132,252,0.06)',
      }
      return (
        <div key={post.id} onClick={() => navigate(`/post/${post.id}`)}
          style={{
            background: typeGlow[post.postType] || '#0a0a0f',
            border: '1px solid #1e293b',
            borderRadius: '12px', padding: '16px',
            cursor: 'pointer', transition: 'all 0.2s',
            display: 'flex', flexDirection: 'column', gap: '10px',
            position: 'relative', overflow: 'hidden'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#334155'
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#1e293b'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {/* Subtle corner accent */}
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: '60px', height: '60px',
            background: `radial-gradient(circle at top right, ${
              post.postType === 'QUESTION' ? 'rgba(96,165,250,0.08)' :
              post.postType === 'ARTICLE' ? 'rgba(74,222,128,0.08)' :
              'rgba(192,132,252,0.08)'
            }, transparent 70%)`,
            pointerEvents: 'none'
          }} />

          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: '10px', padding: '3px 8px', borderRadius: '20px',
              fontWeight: '600', ...badgeStyle
            }}>
              {post.postType}
            </span>
            <span style={{ fontSize: '11px', color: '#475569' }}>
              {timeAgo(post.createdAt)}
            </span>
          </div>

          {/* Title */}
          <div style={{
            fontSize: '14px', fontWeight: '600', color: '#f1f5f9',
            lineHeight: '1.4', letterSpacing: '-0.2px'
          }}>
            {post.title}
          </div>

          {/* Content preview */}
          <div style={{
            fontSize: '12px', color: '#64748b', lineHeight: '1.5',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1
          }}>
            {post.content}
          </div>

          {/* Tags */}
          {post.tags && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {post.tags.split(',').slice(0, 3).map(tag => (
                <span key={tag} style={{
                  fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                  background: '#1e293b', color: '#64748b'
                }}>
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            paddingTop: '10px', borderTop: '1px solid #1e293b'
          }}>
            <button onClick={e => handleLike(e, post.id)} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '12px', color: '#475569', background: 'transparent',
              border: 'none', cursor: 'pointer', padding: '3px 7px',
              borderRadius: '5px', fontFamily: 'Inter, sans-serif'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = '#f87171' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569' }}
            >
              <Heart size={12} /> {post.likesCount}
            </button>

            <button onClick={e => { e.stopPropagation(); navigate(`/post/${post.id}`) }} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '12px', color: '#475569', background: 'transparent',
              border: 'none', cursor: 'pointer', padding: '3px 7px',
              borderRadius: '5px', fontFamily: 'Inter, sans-serif'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(96,165,250,0.1)'; e.currentTarget.style.color = '#60a5fa' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569' }}
            >
              <MessageCircle size={12} /> {post.commentsCount}
            </button>

            <div style={{ flex: 1 }} />

            <span style={{ fontSize: '11px', color: '#334155' }}>
              {post.viewCount} views
            </span>
          </div>
        </div>
        )
        })}
    </div>
    </div>
    </Layout>
  )
}