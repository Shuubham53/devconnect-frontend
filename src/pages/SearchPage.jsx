import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, User, FileText, Heart, MessageCircle, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '../services/api'
import Layout from '../components/layout/Layout'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('posts')
  const [posts, setPosts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true); setSearched(true)
    try {
      const [postsRes, usersRes] = await Promise.all([
        api.get(`/api/posts/search?query=${query}`),
        api.get(`/api/users/search?query=${query}`)
      ])
      setPosts(postsRes.data.data || [])
      setUsers(usersRes.data.data || [])
    } catch (err) { toast.error('Search failed') }
    finally { setLoading(false) }
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

  const getBadgeConfig = (badge) => {
    switch (badge) {
      case 'LEGEND':       return { color: '#d8b4fe', bg: 'rgba(192,132,252,0.12)', emoji: '👑' }
      case 'EXPERT':       return { color: '#93c5fd', bg: 'rgba(96,165,250,0.12)',  emoji: '⚡' }
      case 'INTERMEDIATE': return { color: '#2dd4bf', bg: 'rgba(0,184,163,0.12)',   emoji: '🚀' }
      case 'BEGINNER':     return { color: '#6ee7b7', bg: 'rgba(52,211,153,0.12)',  emoji: '🌱' }
      default:             return { color: '#94a3b8', bg: '#2d2d2d',                emoji: '👋' }
    }
  }

  const timeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <Layout>
      <style>{`
        .search-post-card { background: #242424; border: 1px solid #333; border-radius: 8px; padding: 16px; margin-bottom: 10px; cursor: pointer; transition: border-color 0.15s; }
        .search-post-card:hover { border-color: #555; }
        .search-user-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; border-bottom: 1px solid #2d2d2d; transition: background 0.15s; }
        .search-user-row:last-child { border-bottom: none; }
        .search-user-row:hover { background: #2d2d2d; }
        .s-stat { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #6b7280; }
      `}</style>
    

      <div>
        {/* Header */}
        <div style={{ marginBottom: '18px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>Search</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '3px' }}>Find posts, questions and developers</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search posts, tags, developers..."
              style={{ width: '100%', padding: '11px 110px 11px 38px', borderRadius: '8px', background: '#242424', border: '1px solid #333', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.15s' }}
              onFocus={e => e.target.style.borderColor = '#ffa116'}
              onBlur={e => e.target.style.borderColor = '#333'}
            />
            <button type="submit" style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', padding: '7px 16px', borderRadius: '6px', background: '#ffa116', border: 'none', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Search
            </button>
          </div>
        </form>

        {/* Empty state */}
        {!searched ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#242424', borderRadius: '8px', border: '1px solid #333' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'rgba(255,161,22,0.1)', border: '1px solid rgba(255,161,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Search size={20} color='#ffa116' />
            </div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px' }}>Search DevConnect</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>Search for posts by title, content or tags</div>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['java', 'springboot', 'jwt', 'dsa', 'backend'].map(tag => (
                <button key={tag} onClick={() => setQuery(tag)}
                  style={{ padding: '4px 12px', borderRadius: '4px', background: '#1e1e1e', border: '1px solid #383838', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#ffa116'; e.currentTarget.style.color = '#ffa116' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#383838'; e.currentTarget.style.color = '#94a3b8' }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', fontSize: '13px' }}>Searching...</div>
        ) : (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '2px', marginBottom: '14px', background: '#242424', padding: '4px', borderRadius: '8px', border: '1px solid #333' }}>
              {[
                { key: 'posts', label: 'Posts', count: posts.length, icon: FileText },
                { key: 'users', label: 'Developers', count: users.length, icon: User },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  flex: 1, padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: activeTab === tab.key ? '#383838' : 'transparent',
                  color: activeTab === tab.key ? '#f1f5f9' : '#6b7280',
                  fontSize: '13px', fontWeight: activeTab === tab.key ? '600' : '400',
                  fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'all 0.15s'
                }}>
                  <tab.icon size={13} />
                  {tab.label}
                  <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', background: activeTab === tab.key ? '#555' : '#2d2d2d', color: activeTab === tab.key ? '#f1f5f9' : '#6b7280' }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Posts Results */}
            {activeTab === 'posts' && (
              posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', background: '#242424', borderRadius: '8px', border: '1px solid #333', color: '#6b7280', fontSize: '13px' }}>
                  No posts found for "{query}"
                </div>
              ) : posts.map(post => {
                const typeStyle = getTypeStyle(post.postType)
                const color = getAvatarColor(post.authorName)
                return (
                  <div key={post.id} className="search-post-card" onClick={() => navigate(`/post/${post.id}`)}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '5px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color, flexShrink: 0 }}>
                        {getInitials(post.authorName)}
                      </div>
                      <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '500' }}>{post.authorName}</span>
                      <span style={{ fontSize: '12px', color: '#444' }}>·</span>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{timeAgo(post.createdAt)}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', padding: '3px 9px', borderRadius: '4px', fontWeight: '600', letterSpacing: '0.3px', background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}` }}>
                        {post.postType}
                      </span>
                    </div>

                    {/* Title + excerpt */}
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '6px', lineHeight: '1.45' }}>{post.title}</div>
                    <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</div>

                    {/* Tags + stats */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingTop: '10px', borderTop: '1px solid #2d2d2d' }}>
                      <div className="s-stat">
                        <Heart size={12} strokeWidth={1.8} />
                        <span>{post.likesCount}</span>
                      </div>
                      <div className="s-stat" style={{ marginLeft: '4px' }}>
                        <MessageCircle size={12} strokeWidth={1.8} />
                        <span>{post.commentsCount}</span>
                      </div>
                      <div className="s-stat" style={{ marginLeft: '4px' }}>
                        <Eye size={12} strokeWidth={1.8} color="#60a5fa" />
                        <span style={{ color: '#94a3b8' }}>{post.viewCount ?? 0}</span>
                      </div>
                      <div style={{ flex: 1 }} />
                      {post.tags && (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {post.tags.split(',').slice(0, 2).map(tag => (
                            <span key={tag} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: '#1e1e1e', color: '#94a3b8', border: '1px solid #383838' }}>{tag.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}

            {/* Users Results */}
            {activeTab === 'users' && (
              users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', background: '#242424', borderRadius: '8px', border: '1px solid #333', color: '#6b7280', fontSize: '13px' }}>
                  No developers found for "{query}"
                </div>
              ) : (
                <div style={{ background: '#242424', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
                  {users.map((u) => {
                    const color = getAvatarColor(u.name)
                    const badgeConfig = getBadgeConfig(u.badge)
                    return (
                      <div key={u.id} className="search-user-row" onClick={() => navigate(`/profile/${u.username}`)}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '7px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color, flexShrink: 0 }}>
                          {u.avatarUrl
                            ? <img src={u.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '7px' }} />
                            : getInitials(u.name)
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>{u.name}</span>
                            <span style={{ fontSize: '11px', padding: '1px 7px', borderRadius: '4px', fontWeight: '600', background: badgeConfig.bg, color: badgeConfig.color }}>{badgeConfig.emoji} {u.badge}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>@{u.username}{u.bio ? ` · ${u.bio.slice(0, 50)}` : ''}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffa116' }}>{u.score}</div>
                          <div style={{ fontSize: '10px', color: '#6b7280' }}>pts</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            )}
          </>
        )}
      </div>
    </Layout>
  )
}