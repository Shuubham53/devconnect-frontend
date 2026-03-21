import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, User, FileText } from 'lucide-react'
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
      case 'QUESTION': return { bg: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: 'rgba(96,165,250,0.2)' }
      case 'ARTICLE': return { bg: 'rgba(0,184,163,0.1)', color: '#00b8a3', border: 'rgba(0,184,163,0.2)' }
      case 'DISCUSSION': return { bg: 'rgba(192,132,252,0.1)', color: '#c084fc', border: 'rgba(192,132,252,0.2)' }
      default: return { bg: '#3d3d3d', color: '#94a3b8', border: '#3d3d3d' }
    }
  }

  const getBadgeConfig = (badge) => {
    switch (badge) {
      case 'LEGEND': return { color: '#c084fc', emoji: '👑' }
      case 'EXPERT': return { color: '#60a5fa', emoji: '⚡' }
      case 'INTERMEDIATE': return { color: '#00b8a3', emoji: '🚀' }
      case 'BEGINNER': return { color: '#34d399', emoji: '🌱' }
      default: return { color: '#94a3b8', emoji: '👋' }
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
      <div>
        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#eff1f6', margin: 0 }}>Search</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>Find posts, questions and developers</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search posts, tags, developers..."
              style={{ width: '100%', padding: '10px 100px 10px 38px', borderRadius: '6px', background: '#282828', border: '1px solid #3d3d3d', color: '#eff1f6', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.15s' }}
              onFocus={e => e.target.style.borderColor = '#ffa116'}
              onBlur={e => e.target.style.borderColor = '#3d3d3d'}
            />
            <button type="submit" style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', padding: '6px 14px', borderRadius: '5px', background: '#ffa116', border: 'none', color: '#000', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Search
            </button>
          </div>
        </form>

        {!searched ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#282828', borderRadius: '8px', border: '1px solid #3d3d3d' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'rgba(255,161,22,0.1)', border: '1px solid rgba(255,161,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Search size={20} color='#ffa116' />
            </div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#eff1f6', marginBottom: '6px' }}>Search DevConnect</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Search for posts by title, content or tags</div>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {['java', 'springboot', 'jwt', 'dsa', 'backend'].map(tag => (
                <button key={tag} onClick={() => setQuery(tag)} style={{ padding: '4px 12px', borderRadius: '4px', background: '#1a1a1a', border: '1px solid #3d3d3d', color: '#64748b', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#ffa116'; e.currentTarget.style.color = '#ffa116' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3d3d'; e.currentTarget.style.color = '#64748b' }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '13px' }}>Searching...</div>
        ) : (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '2px', marginBottom: '14px', background: '#282828', padding: '4px', borderRadius: '8px', border: '1px solid #3d3d3d' }}>
              {[
                { key: 'posts', label: 'Posts', count: posts.length, icon: FileText },
                { key: 'users', label: 'Developers', count: users.length, icon: User },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  flex: 1, padding: '7px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: activeTab === tab.key ? '#3d3d3d' : 'transparent',
                  color: activeTab === tab.key ? '#eff1f6' : '#64748b',
                  fontSize: '13px', fontWeight: activeTab === tab.key ? '600' : '400',
                  fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}>
                  <tab.icon size={13} />
                  {tab.label}
                  <span style={{ fontSize: '11px', padding: '1px 5px', borderRadius: '4px', background: activeTab === tab.key ? '#555' : '#3d3d3d', color: activeTab === tab.key ? '#eff1f6' : '#64748b' }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Posts */}
            {activeTab === 'posts' && (
              posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', background: '#282828', borderRadius: '8px', border: '1px solid #3d3d3d', color: '#64748b', fontSize: '13px' }}>
                  No posts found for "{query}"
                </div>
              ) : (
                <div style={{ background: '#282828', border: '1px solid #3d3d3d', borderRadius: '8px', overflow: 'hidden' }}>
                  {posts.map((post, i) => {
                    const typeStyle = getTypeStyle(post.postType)
                    return (
                      <div key={post.id} onClick={() => navigate(`/post/${post.id}`)}
                        style={{ padding: '14px 16px', cursor: 'pointer', borderBottom: i < posts.length - 1 ? '1px solid #3d3d3d' : 'none', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#2d2d2d'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', fontWeight: '600', background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.border}` }}>{post.postType}</span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>by {post.authorName} · {timeAgo(post.createdAt)}</span>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#eff1f6', marginBottom: '4px', lineHeight: '1.4' }}>{post.title}</div>
                        <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.content}</div>
                        {post.tags && (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {post.tags.split(',').map(tag => (
                              <span key={tag} style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: '#1a1a1a', color: '#64748b', border: '1px solid #3d3d3d' }}>{tag.trim()}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            )}

            {/* Users */}
            {activeTab === 'users' && (
              users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', background: '#282828', borderRadius: '8px', border: '1px solid #3d3d3d', color: '#64748b', fontSize: '13px' }}>
                  No developers found for "{query}"
                </div>
              ) : (
                <div style={{ background: '#282828', border: '1px solid #3d3d3d', borderRadius: '8px', overflow: 'hidden' }}>
                  {users.map((u, i) => {
                    const color = getAvatarColor(u.name)
                    const badgeConfig = getBadgeConfig(u.badge)
                    return (
                      <div key={u.id} onClick={() => navigate(`/profile/${u.username}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', borderBottom: i < users.length - 1 ? '1px solid #3d3d3d' : 'none', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#2d2d2d'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color, flexShrink: 0 }}>
                          {getInitials(u.name)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '2px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#eff1f6' }}>{u.name}</span>
                            <span style={{ fontSize: '11px', color: badgeConfig.color }}>{badgeConfig.emoji} {u.badge}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>@{u.username}{u.bio ? ` · ${u.bio.slice(0, 50)}...` : ''}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#ffa116' }}>{u.score}</div>
                          <div style={{ fontSize: '10px', color: '#64748b' }}>pts</div>
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