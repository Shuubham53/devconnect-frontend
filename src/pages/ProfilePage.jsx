import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Github, Linkedin, Edit, Heart, MessageCircle, TrendingUp, Users } from 'lucide-react'
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
    try { await api.post(`/api/likes/${postId}`); fetchUserPosts() }
    catch (err) { if (err.response?.status === 400) { await api.delete(`/api/likes/${postId}`); fetchUserPosts() } }
  }

  const getBadgeConfig = (badge) => {
    switch (badge) {
      case 'LEGEND': return { color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.2)', emoji: '👑' }
      case 'EXPERT': return { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)', emoji: '⚡' }
      case 'INTERMEDIATE': return { color: '#00b8a3', bg: 'rgba(0,184,163,0.1)', border: 'rgba(0,184,163,0.2)', emoji: '🚀' }
      case 'BEGINNER': return { color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', emoji: '🌱' }
      default: return { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', emoji: '👋' }
    }
  }

  const getTypeStyle = (type) => {
    switch (type) {
      case 'QUESTION': return { bg: 'rgba(96,165,250,0.1)', color: '#60a5fa' }
      case 'ARTICLE': return { bg: 'rgba(0,184,163,0.1)', color: '#00b8a3' }
      case 'DISCUSSION': return { bg: 'rgba(192,132,252,0.1)', color: '#c084fc' }
      default: return { bg: '#3d3d3d', color: '#94a3b8' }
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

  if (loading) return <Layout><div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading...</div></Layout>
  if (!profile) return null

  const badgeConfig = getBadgeConfig(profile.badge)
  const avatarColor = getAvatarColor(profile.name)

  return (
    <Layout>
      <div className="profile-top-row" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

        {/* LEFT SIDEBAR — LeetCode style */}
        <div style={{ width: '260px', flexShrink: 0 }}>

          {/* Profile Card — no border, blends with bg */}
          <div style={{ background: '#282828', borderRadius: '8px', padding: '20px', marginBottom: '8px' }}>

            {/* Avatar — square like LeetCode */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '88px', height: '88px', borderRadius: '8px',
                background: `${avatarColor}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '30px', fontWeight: '800', color: avatarColor,
                overflow: 'hidden', marginBottom: '12px'
              }}>
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : getInitials(profile.name)}
              </div>

              {/* Name */}
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#eff1f6', marginBottom: '2px', textAlign: 'center' }}>
                {profile.name}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>@{profile.username}</div>

              {/* Badge */}
              <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '4px', fontWeight: '600', background: badgeConfig.bg, color: badgeConfig.color, border: `1px solid ${badgeConfig.border}`, marginBottom: '12px', display: 'inline-block' }}>
                {badgeConfig.emoji} {profile.badge}
              </span>

              {/* Action Button */}
              {isOwnProfile ? (
                <button onClick={() => navigate('/settings')} style={{ width: '100%', padding: '7px', borderRadius: '6px', background: 'transparent', border: '1px solid #3d3d3d', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#eff1f6' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3d3d'; e.currentTarget.style.color = '#94a3b8' }}
                >
                  <Edit size={13} /> Edit Profile
                </button>
              ) : (
                <button onClick={handleFollow} style={{ width: '100%', padding: '7px', borderRadius: '6px', background: following ? 'transparent' : '#ffa116', border: following ? '1px solid #3d3d3d' : 'none', color: following ? '#94a3b8' : '#000', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  {following ? 'Following ✓' : '+ Follow'}
                </button>
              )}
            </div>

            {/* Followers/Following — horizontal like LeetCode */}
            <div style={{ display: 'flex', gap: '0', borderTop: '1px solid #3d3d3d', paddingTop: '14px', marginBottom: '14px' }}>
              <div style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#eff1f6' }}>{profile.followersCount}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Followers</div>
              </div>
              <div style={{ width: '1px', background: '#3d3d3d' }} />
              <div style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#eff1f6' }}>{profile.followingCount}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Following</div>
              </div>
            </div>

            {/* Rank/Score row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#1a1a1a', borderRadius: '6px', marginBottom: '14px' }}>
              <div style={{ fontSize: '20px' }}>🏆</div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>DevConnect Score</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#ffa116', letterSpacing: '-0.5px' }}>{profile.score}</div>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '12px' }}>{profile.bio}</p>
            )}

            {/* Skills */}
            {profile.skills && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {profile.skills.split(',').map(skill => (
                  <span key={skill} style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: '#1a1a1a', color: '#64748b', border: '1px solid #3d3d3d' }}>
                    {skill.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Links */}
            {(profile.githubUrl || profile.linkedinUrl) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: '#64748b', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#eff1f6'}
                    onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                  >
                    <Github size={14} /> {profile.githubUrl.replace('https://github.com/', '')}
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: '#64748b', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
                    onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                  >
                    <Linkedin size={14} /> LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Community Stats — like LeetCode */}
          <div style={{ background: '#282828', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#eff1f6', marginBottom: '12px' }}>Stats</div>
            {[
              { label: 'Posts', value: posts.length, icon: '📝' },
              { label: 'Score', value: profile.score, icon: '⭐', highlight: true },
            ].map((stat, i) => (
              <div key={stat.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 1 ? '1px solid #3d3d3d' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>{stat.icon}</span>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{stat.label}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: stat.highlight ? '#ffa116' : '#eff1f6' }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT MAIN — Posts + Score History */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #3d3d3d', marginBottom: '16px' }}>
            {[
              { key: 'posts', label: `Posts`, count: posts.length },
              ...(isOwnProfile ? [{ key: 'score', label: 'Score History' }] : [])
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                padding: '10px 20px', background: 'transparent', border: 'none',
                borderBottom: `2px solid ${activeTab === tab.key ? '#ffa116' : 'transparent'}`,
                color: activeTab === tab.key ? '#ffa116' : '#64748b',
                fontSize: '14px', fontWeight: activeTab === tab.key ? '600' : '400',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                transition: 'all 0.15s', marginBottom: '-1px'
              }}>
                {tab.label} {tab.count !== undefined && <span style={{ fontSize: '12px', color: '#64748b' }}>({tab.count})</span>}
              </button>
            ))}
          </div>

          {/* Posts Tab */}
          {activeTab === 'posts' && (
            posts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: '#282828', borderRadius: '8px', color: '#64748b', fontSize: '13px' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📝</div>
                No posts yet
                {isOwnProfile && (
                  <div style={{ marginTop: '14px' }}>
                    <button onClick={() => navigate('/create-post')} style={{ padding: '8px 20px', borderRadius: '6px', background: '#ffa116', color: '#000', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>
                      Create First Post
                    </button>
                  </div>
                )}
              </div>
            ) : posts.map(post => {
              const typeStyle = getTypeStyle(post.postType)
              return (
                <div key={post.id} onClick={() => navigate(`/post/${post.id}`)}
                  style={{ background: '#282828', borderRadius: '8px', padding: '16px', marginBottom: '8px', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2d2d2d'}
                  onMouseLeave={e => e.currentTarget.style.background = '#282828'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', fontWeight: '600', background: typeStyle.bg, color: typeStyle.color }}>{post.postType}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{timeAgo(post.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#eff1f6', marginBottom: '6px', lineHeight: '1.4' }}>{post.title}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '10px', borderTop: '1px solid #3d3d3d' }}>
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
                    {post.tags && (
                      <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                        {post.tags.split(',').slice(0, 2).map(tag => (
                          <span key={tag} style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: '#1a1a1a', color: '#64748b', border: '1px solid #3d3d3d' }}>{tag.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}

          {/* Score History Tab */}
          {activeTab === 'score' && isOwnProfile && (
            <div style={{ background: '#282828', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #3d3d3d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={14} color='#ffa116' />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#eff1f6' }}>Score History</span>
                </div>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#ffa116' }}>{profile.score} pts</span>
              </div>
              {scoreHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>No activity yet</div>
              ) : scoreHistory.map((item, i) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: i < scoreHistory.length - 1 ? '1px solid #3d3d3d' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2d2d2d'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '6px', flexShrink: 0, background: item.points > 0 ? 'rgba(255,161,22,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${item.points > 0 ? 'rgba(255,161,22,0.2)' : 'rgba(239,68,68,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: item.points > 0 ? '#ffa116' : '#ef4444' }}>
                    {item.points > 0 ? '+' : ''}{item.points}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '2px' }}>{item.reason}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <div style={{ fontSize: '14px', color: item.points > 0 ? 'rgba(255,161,22,0.4)' : 'rgba(239,68,68,0.4)' }}>
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