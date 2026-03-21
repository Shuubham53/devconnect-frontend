import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Github, Linkedin, Edit, Heart, MessageCircle, TrendingUp, MapPin } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState('posts')

  const isOwnProfile = user?.username === username

  useEffect(() => {
    if (user) { fetchProfile(); fetchUserPosts(); if (isOwnProfile) fetchScoreHistory() }
  }, [username, user])

  const fetchProfile = async () => {
    try { const res = await api.get(`/api/users/${username}`); setProfile(res.data.data) }
    catch (err) { toast.error('User not found'); navigate('/feed') }
    finally { setLoading(false) }
  }

  const fetchUserPosts = async () => {
    try { const res = await api.get(`/api/posts/user/${username}`); setPosts(res.data.data || []) } catch (err) {}
  }

  const fetchScoreHistory = async () => {
    try { const res = await api.get('/api/users/score-history'); setScoreHistory(res.data.data || []) } catch (err) {}
  }

  const handleFollow = async () => {
    try {
      if (following) { await api.delete(`/api/follow/${profile.id}`); setFollowing(false); toast.success('Unfollowed!') }
      else { await api.post(`/api/follow/${profile.id}`); setFollowing(true); toast.success('Following!') }
      fetchProfile()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const handleLike = async (e, postId) => {
    e.stopPropagation()
    try { await api.post(`/api/likes/${postId}`); fetchUserPosts(); toast.success('Liked!') }
    catch (err) { if (err.response?.status === 400) { await api.delete(`/api/likes/${postId}`); fetchUserPosts() } }
  }

  const getBadgeConfig = (badge) => {
    switch (badge) {
      case 'LEGEND': return { color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.2)', emoji: '👑' }
      case 'EXPERT': return { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)', emoji: '⚡' }
      case 'INTERMEDIATE': return { color: '#00b8a3', bg: 'rgba(0,184,163,0.1)', border: 'rgba(0,184,163,0.2)', emoji: '🚀' }
      case 'BEGINNER': return { color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', emoji: '🌱' }
      default: return { color: '#94a3b8', bg: '#3d3d3d', border: '#555', emoji: '👋' }
    }
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
    const colors = ['#60a5fa', '#00b8a3', '#c084fc', '#f87171', '#34d399']
    return colors[name?.charCodeAt(0) % colors.length || 0]
  }

  const timeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  if (loading) return <Layout><div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading...</div></Layout>
  if (!profile) return null

  const badgeConfig = getBadgeConfig(profile.badge)
  const avatarColor = getAvatarColor(profile.name)

  return (
    <Layout>
      <div className="profile-top-row" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '16px' }}>

        {/* Left — Profile Card */}
        <div style={{ width: '260px', flexShrink: 0 }}>
          <div style={{ background: '#282828', border: '1px solid #3d3d3d', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>

            {/* Avatar — LeetCode square style */}
            <div style={{
              width: '80px', height: '80px', borderRadius: '8px',
              background: `${avatarColor}20`,
              border: `2px solid ${avatarColor}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px', fontWeight: '800', color: avatarColor,
              margin: '0 auto 14px', overflow: 'hidden'
            }}>
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : getInitials(profile.name)}
            </div>

            {/* Name */}
            <div style={{ fontSize: '17px', fontWeight: '700', color: '#eff1f6', marginBottom: '2px' }}>{profile.name}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>@{profile.username}</div>

            {/* Badge */}
            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '4px', fontWeight: '600', background: badgeConfig.bg, color: badgeConfig.color, border: `1px solid ${badgeConfig.border}`, display: 'inline-block', marginBottom: '14px' }}>
              {badgeConfig.emoji} {profile.badge}
            </span>

            {/* Action Button */}
            <div style={{ marginBottom: '16px' }}>
              {isOwnProfile ? (
                <button onClick={() => navigate('/settings')} style={{
                  width: '100%', padding: '7px', borderRadius: '6px',
                  background: 'transparent', border: '1px solid #3d3d3d',
                  color: '#94a3b8', fontSize: '13px', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#eff1f6' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3d3d'; e.currentTarget.style.color = '#94a3b8' }}
                >
                  <Edit size={13} /> Edit Profile
                </button>
              ) : (
                <button onClick={handleFollow} style={{
                  width: '100%', padding: '7px', borderRadius: '6px',
                  background: following ? 'transparent' : '#ffa116',
                  border: following ? '1px solid #3d3d3d' : 'none',
                  color: following ? '#94a3b8' : '#000',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                }}>
                  {following ? 'Following ✓' : '+ Follow'}
                </button>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#3d3d3d', marginBottom: '14px' }} />

            {/* Bio */}
            {profile.bio && <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '12px', textAlign: 'left' }}>{profile.bio}</p>}

            {/* Skills */}
            {profile.skills && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px', justifyContent: 'flex-start' }}>
                {profile.skills.split(',').map(skill => (
                  <span key={skill} style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '4px', background: '#1a1a1a', color: '#64748b', border: '1px solid #3d3d3d' }}>
                    {skill.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Links */}
            {(profile.githubUrl || profile.linkedinUrl) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#eff1f6'}
                    onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                  >
                    <Github size={13} /> {profile.githubUrl.replace('https://', '')}
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
                    onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                  >
                    <Linkedin size={13} /> LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={{ background: '#282828', border: '1px solid #3d3d3d', borderRadius: '8px', padding: '14px', marginTop: '10px' }}>
            {[
              { label: 'Score', value: profile.score, color: '#ffa116' },
              { label: 'Posts', value: posts.length, color: '#eff1f6' },
              { label: 'Followers', value: profile.followersCount, color: '#eff1f6' },
              { label: 'Following', value: profile.followingCount, color: '#eff1f6' },
            ].map((stat, i) => (
              <div key={stat.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 3 ? '1px solid #3d3d3d' : 'none' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{stat.label}</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Posts + Score History */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '2px', marginBottom: '14px', background: '#282828', padding: '4px', borderRadius: '8px', border: '1px solid #3d3d3d' }}>
            {[{ key: 'posts', label: `Posts (${posts.length})` }, ...(isOwnProfile ? [{ key: 'score', label: 'Score History' }] : [])].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                flex: 1, padding: '7px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: activeTab === tab.key ? '600' : '400',
                background: activeTab === tab.key ? '#3d3d3d' : 'transparent',
                color: activeTab === tab.key ? '#eff1f6' : '#64748b',
                fontFamily: 'Inter, sans-serif'
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'posts' && (
            posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', background: '#282828', borderRadius: '8px', border: '1px solid #3d3d3d', color: '#64748b', fontSize: '13px' }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>📝</div>
                No posts yet
                {isOwnProfile && <div style={{ marginTop: '12px' }}><button onClick={() => navigate('/create-post')} style={{ padding: '7px 16px', borderRadius: '6px', background: '#ffa116', color: '#000', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>Create Post</button></div>}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                {posts.map(post => {
                  const typeStyle = getTypeStyle(post.postType)
                  return (
                    <div key={post.id} onClick={() => navigate(`/post/${post.id}`)}
                      style={{ background: '#282828', border: '1px solid #3d3d3d', borderRadius: '8px', padding: '14px', cursor: 'pointer', transition: 'border-color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#555'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#3d3d3d'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: '600', background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}` }}>{post.postType}</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{timeAgo(post.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#eff1f6', marginBottom: '6px', lineHeight: '1.4' }}>{post.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '10px', borderTop: '1px solid #3d3d3d' }}>
                        <button onClick={e => handleLike(e, post.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', fontFamily: 'Inter, sans-serif' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#3d3d3d'; e.currentTarget.style.color = '#f87171' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
                        >
                          <Heart size={12} /> {post.likesCount}
                        </button>
                        <button onClick={e => { e.stopPropagation(); navigate(`/post/${post.id}`) }} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', fontFamily: 'Inter, sans-serif' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#3d3d3d'; e.currentTarget.style.color = '#60a5fa' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
                        >
                          <MessageCircle size={12} /> {post.commentsCount}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          )}

          {activeTab === 'score' && isOwnProfile && (
            <div style={{ background: '#282828', border: '1px solid #3d3d3d', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #3d3d3d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={14} color='#ffa116' />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#eff1f6' }}>Score History</span>
                </div>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#ffa116' }}>{profile.score} pts</span>
              </div>
              {scoreHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: '#64748b', fontSize: '13px' }}>No activity yet</div>
              ) : scoreHistory.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: '1px solid #3d3d3d', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2d2d2d'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '6px', flexShrink: 0,
                    background: item.points > 0 ? 'rgba(255,161,22,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${item.points > 0 ? 'rgba(255,161,22,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '700',
                    color: item.points > 0 ? '#ffa116' : '#ef4444'
                  }}>
                    {item.points > 0 ? '+' : ''}{item.points}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>{item.reason}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <div style={{ fontSize: '14px', color: item.points > 0 ? 'rgba(255,161,22,0.5)' : 'rgba(239,68,68,0.5)' }}>
                    {item.points > 0 ? '↑' : '↓'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}