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
    setLoading(true)
    setSearched(true)
    try {
      const [postsRes, usersRes] = await Promise.all([
        api.get(`/api/posts/search?query=${query}`),
        api.get(`/api/users/search?query=${query}`)
      ])
      setPosts(postsRes.data.data || [])
      setUsers(usersRes.data.data || [])
    } catch (err) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
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
    return colors[name?.charCodeAt(0) % colors.length || 0]
  }

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'QUESTION': return { background: '#1e3a5f', color: '#60a5fa' }
      case 'ARTICLE': return { background: '#1a2e1a', color: '#4ade80' }
      case 'DISCUSSION': return { background: '#2d1b4e', color: '#c084fc' }
      default: return { background: '#1e293b', color: '#94a3b8' }
    }
  }

  const getBadgeConfig = (badge) => {
    switch (badge) {
      case 'LEGEND': return { color: '#c084fc', emoji: '👑' }
      case 'EXPERT': return { color: '#60a5fa', emoji: '⚡' }
      case 'INTERMEDIATE': return { color: '#4ade80', emoji: '🚀' }
      case 'BEGINNER': return { color: '#34d399', emoji: '🌱' }
      default: return { color: '#94a3b8', emoji: '👋' }
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

  return (
    <Layout>
      {/* <div style={{ maxWidth: '720px' }}> */}
      <div style={{ maxWidth: '73%' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontSize: '22px', fontWeight: '700',
            color: '#f1f5f9', margin: '0 0 4px', letterSpacing: '-0.5px'
          }}>
            Search
          </h1>
          <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
            Find posts, questions and developers
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{
              position: 'absolute', left: '14px', top: '50%',
              transform: 'translateY(-50%)', color: '#475569'
            }} />
            <input
              type="text" value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search posts, tags, users..."
              style={{
                width: '100%', padding: '13px 14px 13px 42px',
                borderRadius: '12px', background: '#0d0d18',
                border: '1px solid #1e293b', color: '#e2e8f0',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                fontFamily: 'Inter, sans-serif'
              }}
              onFocus={e => e.target.style.borderColor = '#00ff87'}
              onBlur={e => e.target.style.borderColor = '#1e293b'}
            />
            <button type="submit" style={{
              position: 'absolute', right: '8px', top: '50%',
              transform: 'translateY(-50%)',
              padding: '7px 16px', borderRadius: '8px',
              background: '#00ff87', border: 'none',
              color: '#000', fontSize: '13px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif'
            }}>
              Search
            </button>
          </div>
        </form>

        {/* Results */}
        {!searched ? (

          /* Empty state */
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            background: '#0d0d18', borderRadius: '16px',
            border: '1px solid #1e293b'
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Search size={24} color='#00ff87' />
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#e2e8f0', marginBottom: '8px' }}>
              Search DevConnect
            </div>
            <div style={{ fontSize: '13px', color: '#475569' }}>
              Search for posts by title, content or tags
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
              {['java', 'springboot', 'jwt', 'dsa', 'backend'].map(tag => (
                <button key={tag} onClick={() => { setQuery(tag); }}
                  style={{
                    padding: '5px 12px', borderRadius: '20px',
                    background: '#1e293b', border: '1px solid #334155',
                    color: '#94a3b8', fontSize: '12px', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#00ff87'; e.currentTarget.style.color = '#00ff87' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#94a3b8' }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
            Searching...
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div style={{
              display: 'flex', gap: '4px', marginBottom: '16px',
              background: '#0d0d18', padding: '4px',
              borderRadius: '10px', border: '1px solid #1e293b'
            }}>
              {[
                { key: 'posts', label: 'Posts', count: posts.length, icon: FileText },
                { key: 'users', label: 'Developers', count: users.length, icon: User },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: '7px',
                    border: 'none', cursor: 'pointer',
                    background: activeTab === tab.key ? '#1e293b' : 'transparent',
                    color: activeTab === tab.key ? '#e2e8f0' : '#64748b',
                    fontSize: '13px', fontWeight: activeTab === tab.key ? '600' : '400',
                    fontFamily: 'Inter, sans-serif',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '6px'
                  }}>
                  <tab.icon size={13} />
                  {tab.label}
                  <span style={{
                    fontSize: '11px', padding: '1px 6px', borderRadius: '20px',
                    background: activeTab === tab.key ? '#334155' : '#1e293b',
                    color: activeTab === tab.key ? '#e2e8f0' : '#475569'
                  }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Posts Results */}
            {activeTab === 'posts' && (
              posts.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '60px',
                  background: '#0d0d18', borderRadius: '12px',
                  border: '1px solid #1e293b', color: '#475569', fontSize: '13px'
                }}>
                  No posts found for "{query}"
                </div>
              ) : (
                <div style={{
                  background: '#0d0d18', border: '1px solid #1e293b',
                  borderRadius: '12px', overflow: 'hidden'
                }}>
                  {posts.map((post, i) => (
                    <div key={post.id}
                      onClick={() => navigate(`/post/${post.id}`)}
                      style={{
                        padding: '16px 20px', cursor: 'pointer',
                        borderBottom: i < posts.length - 1 ? '1px solid #1e293b' : 'none',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#0a0a0f'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{
                          fontSize: '10px', padding: '2px 8px',
                          borderRadius: '20px', fontWeight: '600',
                          ...getBadgeStyle(post.postType)
                        }}>
                          {post.postType}
                        </span>
                        <span style={{ fontSize: '11px', color: '#475569' }}>
                          by {post.authorName} · {timeAgo(post.createdAt)}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '15px', fontWeight: '600',
                        color: '#f1f5f9', marginBottom: '6px', lineHeight: '1.4'
                      }}>
                        {post.title}
                      </div>
                      <div style={{
                        fontSize: '13px', color: '#64748b', lineHeight: '1.5',
                        marginBottom: '10px',
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden'
                      }}>
                        {post.content}
                      </div>
                      {post.tags && (
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                          {post.tags.split(',').map(tag => (
                            <span key={tag} style={{
                              fontSize: '11px', padding: '2px 8px',
                              borderRadius: '6px', background: '#1e293b', color: '#94a3b8'
                            }}>
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Users Results */}
            {activeTab === 'users' && (
              users.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '60px',
                  background: '#0d0d18', borderRadius: '12px',
                  border: '1px solid #1e293b', color: '#475569', fontSize: '13px'
                }}>
                  No developers found for "{query}"
                </div>
              ) : (
                <div style={{
                  background: '#0d0d18', border: '1px solid #1e293b',
                  borderRadius: '12px', overflow: 'hidden'
                }}>
                  {users.map((user, i) => {
                    const avatarColor = getAvatarColor(user.name)
                    const badgeConfig = getBadgeConfig(user.badge)
                    return (
                      <div key={user.id}
                        onClick={() => navigate(`/profile/${user.username}`)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '14px',
                          padding: '14px 20px', cursor: 'pointer',
                          borderBottom: i < users.length - 1 ? '1px solid #1e293b' : 'none',
                          transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#0a0a0f'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{
                          width: '42px', height: '42px', borderRadius: '50%',
                          background: avatarColor.bg, color: avatarColor.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '14px', fontWeight: '700', flexShrink: 0
                        }}>
                          {getInitials(user.name)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            display: 'flex', alignItems: 'center',
                            gap: '8px', marginBottom: '3px'
                          }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0' }}>
                              {user.name}
                            </span>
                            <span style={{ fontSize: '11px', color: badgeConfig.color }}>
                              {badgeConfig.emoji} {user.badge}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#475569' }}>
                            @{user.username}
                            {user.bio && ` · ${user.bio.slice(0, 50)}...`}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: '#00ff87' }}>
                            {user.score}
                          </div>
                          <div style={{ fontSize: '10px', color: '#475569' }}>score</div>
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