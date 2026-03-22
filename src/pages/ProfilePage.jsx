import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Github, Linkedin, Edit, Heart, MessageCircle, TrendingUp, Eye, Bookmark } from 'lucide-react'
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
    try {
      const res = await api.get(`/api/users/${username}`)
      setProfile(res.data.data)
      if (!isOwnProfile) {
        const followRes = await api.get(`/api/follow/${res.data.data.id}/is-following`)
        setFollowing(followRes.data.data)
      }
    } catch (err) { toast.error('User not found'); navigate('/feed') }
    finally { setLoading(false) }
  }

  const handleFollow = async () => {
    try {
      const res = await api.post(`/api/follow/${profile.id}/toggle`)
      const result = res.data.message
      setFollowing(result === 'followed')
      toast.success(result === 'followed' ? 'Following!' : 'Unfollowed!')
      fetchProfile()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    }
  }

  const fetchUserPosts = async () => {
    try { const res = await api.get(`/api/posts/user/${username}`); setPosts(res.data.data || []) } catch (err) {}
  }

  const fetchScoreHistory = async () => {
    try { const res = await api.get('/api/users/score-history'); setScoreHistory(res.data.data || []) } catch (err) {}
  }

  const handleLike = async (e, postId) => {
    e.stopPropagation()
    try { await api.post(`/api/likes/${postId}/toggle`); fetchUserPosts() }
    catch (err) { toast.error('Failed to like') }
  }

  const handleBookmark = async (e, postId) => {
    e.stopPropagation()
    try { await api.post(`/api/bookmarks/${postId}`); toast.success('Bookmarked!') }
    catch (err) { if (err.response?.status === 400) { await api.delete(`/api/bookmarks/${postId}`); toast.success('Removed') } }
  }

  const getBadgeConfig = (badge) => {
    switch (badge) {
      case 'LEGEND': return { color: '#c084fc', bg: 'rgba(192,132,252,0.15)', emoji: '👑' }
      case 'EXPERT': return { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', emoji: '⚡' }
      case 'INTERMEDIATE': return { color: '#00b8a3', bg: 'rgba(0,184,163,0.15)', emoji: '🚀' }
      case 'BEGINNER': return { color: '#34d399', bg: 'rgba(52,211,153,0.15)', emoji: '🌱' }
      default: return { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', emoji: '👋' }
    }
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

  if (loading) return <Layout><div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading...</div></Layout>
  if (!profile) return null

  const badgeConfig = getBadgeConfig(profile.badge)
  const avatarColor = getAvatarColor(profile.name)

  const ProfileSidebar = () => (
    <div style={{ width: '300px', flexShrink: 0 }}>
      <div style={{ background: '#28282858', borderRadius: '8px', padding: '20px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '8px', background: `${avatarColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: avatarColor, overflow: 'hidden', flexShrink: 0 }}>
            {profile.avatarUrl
              ? <img src={profile.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : getInitials(profile.name)
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#eff1f6', marginBottom: '2px', lineHeight: 1.2 }}>{profile.name}</div>
            <div style={{ fontSize: '13px', color: '#7e8897', marginBottom: '6px' }}>{profile.username}</div>
            <div style={{ fontSize: '13px', color: '#f6f8fb' }}>
              Score <span style={{ color: '#ffa116', fontWeight: '700' }}>{profile.score}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px', fontSize: '13px' }}>
          <span style={{ color: '#eff1f6', fontWeight: '600' }}>{profile.followingCount}</span>
          <span style={{ color: '#aaabac' }}>Following</span>
          <span style={{ color: '#3d3d3d', margin: '0 6px' }}>|</span>
          <span style={{ color: '#eff1f6', fontWeight: '600' }}>{profile.followersCount}</span>
          <span style={{ color: '#aaabac' }}>Followers</span>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '4px', fontWeight: '600', background: badgeConfig.bg, color: badgeConfig.color, display: 'inline-block' }}>
            {badgeConfig.emoji} {profile.badge}
          </span>
        </div>

        {isOwnProfile ? (
          <button onClick={() => navigate('/settings')} style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'transparent', border: '1px solid #00b8a3', color: '#00b8a3', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '16px', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,184,163,0.1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <Edit size={13} /> Edit Profile
          </button>
        ) : (
          <button onClick={handleFollow} style={{ width: '100%', padding: '8px', borderRadius: '6px', background: following ? 'transparent' : '#ffa116', border: following ? '1px solid #3d3d3d' : 'none', color: following ? '#94a3b8' : '#000', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginBottom: '16px' }}>
            {following ? 'Following ✓' : '+ Follow'}
          </button>
        )}

        <div style={{ height: '1px', background: '#3d3d3d', marginBottom: '14px' }} />

        {profile.githubUrl && (
          <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#eff1f6', textDecoration: 'none', marginBottom: '10px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffa116'}
            onMouseLeave={e => e.currentTarget.style.color = '#eff1f6'}
          >
            <Github size={15} color='#94a3b8' />
            <span>{profile.githubUrl.replace('https://github.com/', '')}</span>
          </a>
        )}

        {profile.linkedinUrl && (
          <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#eff1f6', textDecoration: 'none', marginBottom: '14px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
            onMouseLeave={e => e.currentTarget.style.color = '#eff1f6'}
          >
            <Linkedin size={15} color='#94a3b8' />
            <span>LinkedIn</span>
          </a>
        )}

        {profile.bio && (
          <>
            <div style={{ height: '1px', background: '#3d3d3d', marginBottom: '12px' }} />
            <p style={{ fontSize: '13px', color: '#eff1f6', lineHeight: '1.7', marginBottom: '14px', opacity: 0.85 }}>{profile.bio}</p>
          </>
        )}

        {profile.skills && (
          <>
            <div style={{ height: '1px', background: '#3d3d3d', marginBottom: '12px' }} />
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skills</div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {profile.skills.split(',').map(skill => (
                <span key={skill} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '4px', background: '#1a1a1a', color: '#eff1f6', fontWeight: '500', border: '1px solid #3d3d3d' }}>
                  {skill.trim()}
                </span>
              ))}
            </div>
          </>
        )}

        <div style={{ height: '1px', background: '#3d3d3d', margin: '14px 0' }} />
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Community Stats</div>
        {[
          { icon: '📝', label: 'Posts', value: posts.length },
          { icon: '⭐', label: 'Score', value: profile.score, color: '#ffa116' },
          { icon: '👥', label: 'Followers', value: profile.followersCount },
          { icon: '➡️', label: 'Following', value: profile.followingCount },
        ].map((stat, i) => (
          <div key={stat.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < 3 ? '1px solid #3d3d3d' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px' }}>{stat.icon}</span>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>{stat.label}</span>
            </div>
            <span style={{ fontSize: '13px', fontWeight: '700', color: stat.color || '#eff1f6' }}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const MainContent = () => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <style>{`
        .profile-post-card { background: #242424; border: 1px solid #333; border-radius: 8px; padding: 16px; margin-bottom: 10px; cursor: pointer; transition: border-color 0.15s; }
        .profile-post-card:hover { border-color: #555; }
        .p-action-btn { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #cbd5e1; padding: 4px 10px; border-radius: 6px; border: 1px solid #383838; background: #2a2a2a; cursor: pointer; font-family: Inter, sans-serif; transition: all 0.15s; line-height: 1; outline: none; }
        .p-action-btn:hover { background: #333; border-color: #555; }
        .p-action-btn.like:hover { color: #f87171; border-color: rgba(248,113,113,.3); }
        .p-action-btn.like:hover svg { stroke: #f87171; }
        .p-action-btn.comment:hover { color: #60a5fa; border-color: rgba(96,165,250,.3); }
        .p-action-btn.comment:hover svg { stroke: #60a5fa; }
        .p-action-btn.save:hover { color: #ffa116; border-color: rgba(255,161,22,.3); }
        .p-action-btn.save:hover svg { stroke: #ffa116; }
      `}</style>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #3d3d3db6', marginBottom: '16px' }}>
        {[
          { key: 'posts', label: 'Posts', count: posts.length },
          ...(isOwnProfile ? [{ key: 'score', label: 'Score History' }] : [])
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: '10px 20px', background: 'transparent', border: 'none', borderBottom: `2px solid ${activeTab === tab.key ? '#ffa116' : 'transparent'}`, color: activeTab === tab.key ? '#ffa116' : '#64748b', fontSize: '14px', fontWeight: activeTab === tab.key ? '600' : '400', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s', marginBottom: '-1px' }}>
            {tab.label}
            {tab.count !== undefined && <span style={{ marginLeft: '5px', fontSize: '12px', color: '#64748b' }}>({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Posts */}
      {activeTab === 'posts' && (
        posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#242424', borderRadius: '8px', border: '1px solid #333', color: '#6b7280', fontSize: '13px' }}>
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
            <div key={post.id} className="profile-post-card" onClick={() => navigate(`/post/${post.id}`)}>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '4px', fontWeight: '600', letterSpacing: '0.3px', background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}` }}>
                  {post.postType}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{timeAgo(post.createdAt)}</span>
              </div>

              {/* Title */}
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px', lineHeight: '1.45' }}>{post.title}</div>

              {/* Excerpt */}
              <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</div>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingTop: '10px', borderTop: '1px solid #2d2d2d' }}>
                <button className="p-action-btn like" onClick={e => handleLike(e, post.id)}>
                  <Heart size={13} strokeWidth={1.8} style={{ display: 'block' }} />
                  <span>{post.likesCount}</span>
                </button>
                <button className="p-action-btn comment" onClick={e => { e.stopPropagation(); navigate(`/post/${post.id}`) }}>
                  <MessageCircle size={13} strokeWidth={1.8} style={{ display: 'block' }} />
                  <span>{post.commentsCount}</span>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '6px', fontSize: '12px', color: '#94a3b8' }}>
                  <Eye size={13} strokeWidth={1.8} style={{ display: 'block', color: '#60a5fa' }} />
                  <span style={{ fontWeight: '500' }}>{post.viewCount ?? 0}</span>
                </div>
                <div style={{ flex: 1 }} />
                {post.tags && (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {post.tags.split(',').slice(0, 2).map(tag => (
                      <span key={tag} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#1e1e1e', color: '#94a3b8', border: '1px solid #383838' }}>{tag.trim()}</span>
                    ))}
                  </div>
                )}
                <button className="p-action-btn save" onClick={e => handleBookmark(e, post.id)} style={{ marginLeft: '4px' }}>
                  <Bookmark size={13} strokeWidth={1.8} style={{ display: 'block' }} />
                </button>
              </div>
            </div>
          )
        })
      )}

      {/* Score History */}
      {activeTab === 'score' && isOwnProfile && (
        <div style={{ background: '#161616', border: '1px solid #2d2d2d73', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #2d2d2d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={14} color='#ffa116' />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>Score History</span>
            </div>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#ffa116' }}>{profile.score} pts</span>
          </div>
          {scoreHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '13px' }}>No activity yet</div>
          ) : scoreHistory.map((item, i) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: i < scoreHistory.length - 1 ? '1px solid #2d2d2d' : 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#2d2d2d'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: '38px', height: '38px', borderRadius: '6px', flexShrink: 0, background: item.points > 0 ? 'rgba(255,161,22,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${item.points > 0 ? 'rgba(255,161,22,0.2)' : 'rgba(239,68,68,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: item.points > 0 ? '#ffa116' : '#ef4444' }}>
                {item.points > 0 ? '+' : ''}{item.points}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', color: '#e2e8f0', marginBottom: '2px' }}>{item.reason}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
              <div style={{ fontSize: '14px', color: item.points > 0 ? 'rgba(255,161,22,0.5)' : 'rgba(239,68,68,0.5)' }}>
                {item.points > 0 ? '↑' : '↓'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Layout>
      <div className="profile-top-row" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <ProfileSidebar />
        <MainContent />
      </div>
    </Layout>
  )
}