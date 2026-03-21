import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../services/api'
import Layout from '../components/layout/Layout'

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const navigate = useNavigate()

  const TOP_COUNT = 4
  const PAGE_SIZE = 7

  useEffect(() => { fetchLeaderboard() }, [])

  const fetchLeaderboard = async () => {
    try { const res = await api.get('/api/users/leaderboard'); setLeaderboard(res.data.data || []) }
    catch (err) { toast.error('Failed to load leaderboard') }
    finally { setLoading(false) }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAvatarColor = (name) => {
    const colors = ['#60a5fa', '#00b8a3', '#c084fc', '#f87171', '#34d399']
    return colors[name?.charCodeAt(0) % colors.length || 0]
  }

  const getBadgeConfig = (badge) => {
    switch (badge) {
      case 'LEGEND': return { color: '#c084fc', bg: 'rgba(192,132,252,0.1)', emoji: '👑' }
      case 'EXPERT': return { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', emoji: '⚡' }
      case 'INTERMEDIATE': return { color: '#00b8a3', bg: 'rgba(0,184,163,0.1)', emoji: '🚀' }
      case 'BEGINNER': return { color: '#34d399', bg: 'rgba(52,211,153,0.1)', emoji: '🌱' }
      default: return { color: '#94a3b8', bg: '#3d3d3d', emoji: '👋' }
    }
  }

  const getRankConfig = (rank) => {
    switch (rank) {
      case 1: return { medal: '🥇', color: '#FFD700', bg: 'rgba(255,215,0,0.05)', border: 'rgba(255,215,0,0.2)' }
      case 2: return { medal: '🥈', color: '#C0C0C0', bg: 'rgba(192,192,192,0.05)', border: 'rgba(192,192,192,0.2)' }
      case 3: return { medal: '🥉', color: '#CD7F32', bg: 'rgba(205,127,50,0.05)', border: 'rgba(205,127,50,0.2)' }
      case 4: return { medal: '4️⃣', color: '#94a3b8', bg: 'transparent', border: '#3d3d3d' }
      default: return { medal: null, color: '#64748b', bg: 'transparent', border: '#3d3d3d' }
    }
  }

  if (loading) return <Layout><div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '13px' }}>Loading...</div></Layout>

  const top4 = leaderboard.slice(0, TOP_COUNT)
  const rest = leaderboard.slice(TOP_COUNT)
  const totalPages = Math.ceil(rest.length / PAGE_SIZE)
  const pagedRest = rest.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <Layout>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '6px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={17} color='#FFD700' />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#eff1f6', margin: 0 }}>Leaderboard</h1>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Top developers by contribution score</p>
          </div>
        </div>

        {/* Top 4 */}
        {top4.length > 0 && (
          <div className="leaderboard-top" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
            {top4.map((dev, i) => {
              const rank = i + 1
              const rankConfig = getRankConfig(rank)
              const avatarColor = getAvatarColor(dev.name)
              const badgeConfig = getBadgeConfig(dev.badge)
              return (
                <div key={dev.id} onClick={() => navigate(`/profile/${dev.username}`)}
                  style={{
                    background: rankConfig.bg || '#282828', border: `1px solid ${rankConfig.border}`,
                    borderRadius: '8px', padding: '16px 12px', textAlign: 'center',
                    cursor: 'pointer', transition: 'all 0.15s',
                    marginTop: rank === 1 ? '0' : rank === 2 ? '6px' : rank === 3 ? '12px' : '18px'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = rankConfig.color + '60'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = rankConfig.border; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ fontSize: '18px', marginBottom: '8px' }}>{rankConfig.medal}</div>
                  {/* Square avatar like LeetCode */}
                  <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: `${avatarColor}20`, border: `1px solid ${avatarColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: avatarColor, margin: '0 auto 8px' }}>
                    {getInitials(dev.name)}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#eff1f6', marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dev.name}</div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>@{dev.username}</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: rank === 1 ? '#FFD700' : '#ffa116', letterSpacing: '-0.5px', lineHeight: 1, marginBottom: '2px' }}>{dev.score}</div>
                  <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '8px' }}>pts</div>
                  <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: '600', background: badgeConfig.bg, color: badgeConfig.color }}>{badgeConfig.emoji} {dev.badge}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Rest List */}
        {rest.length > 0 && (
          <div style={{ background: '#282828', border: '1px solid #3d3d3d', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #3d3d3d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', letterSpacing: '0.5px' }}>
                RANKINGS #{TOP_COUNT + 1}–#{TOP_COUNT + rest.length}
              </span>
              {totalPages > 1 && <span style={{ fontSize: '11px', color: '#64748b' }}>Page {page + 1}/{totalPages}</span>}
            </div>

            {pagedRest.map((dev, i) => {
              const rank = TOP_COUNT + page * PAGE_SIZE + i + 1
              const avatarColor = getAvatarColor(dev.name)
              const badgeConfig = getBadgeConfig(dev.badge)
              return (
                <div key={dev.id} onClick={() => navigate(`/profile/${dev.username}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 16px', cursor: 'pointer', borderBottom: i < pagedRest.length - 1 ? '1px solid #3d3d3d' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2d2d2d'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '28px', textAlign: 'center', fontSize: '12px', color: '#64748b', fontWeight: '600', flexShrink: 0 }}>#{rank}</div>
                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: `${avatarColor}20`, border: `1px solid ${avatarColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: avatarColor, flexShrink: 0 }}>
                    {getInitials(dev.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#eff1f6', marginBottom: '1px' }}>{dev.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>@{dev.username}</span>
                      <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', fontWeight: '600', background: badgeConfig.bg, color: badgeConfig.color }}>{badgeConfig.emoji} {dev.badge}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffa116' }}>{dev.score}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>pts</div>
                  </div>
                </div>
              )
            })}

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px 16px', borderTop: '1px solid #3d3d3d' }}>
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '6px 12px', borderRadius: '6px', background: 'transparent', border: '1px solid #3d3d3d', color: page === 0 ? '#3d3d3d' : '#94a3b8', fontSize: '12px', cursor: page === 0 ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  <ChevronLeft size={13} /> Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i)} style={{ width: '30px', height: '30px', borderRadius: '6px', background: page === i ? '#ffa116' : 'transparent', border: `1px solid ${page === i ? '#ffa116' : '#3d3d3d'}`, color: page === i ? '#000' : '#94a3b8', fontSize: '12px', fontWeight: page === i ? '700' : '400', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '6px 12px', borderRadius: '6px', background: 'transparent', border: '1px solid #3d3d3d', color: page === totalPages - 1 ? '#3d3d3d' : '#94a3b8', fontSize: '12px', cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Next <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}