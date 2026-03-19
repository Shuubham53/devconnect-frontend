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

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/api/users/leaderboard')
      setLeaderboard(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load leaderboard')
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

  const getBadgeConfig = (badge) => {
    switch (badge) {
      case 'LEGEND': return { bg: 'rgba(192,132,252,0.15)', color: '#c084fc', border: 'rgba(192,132,252,0.3)', emoji: '👑' }
      case 'EXPERT': return { bg: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: 'rgba(96,165,250,0.3)', emoji: '⚡' }
      case 'INTERMEDIATE': return { bg: 'rgba(74,222,128,0.15)', color: '#4ade80', border: 'rgba(74,222,128,0.3)', emoji: '🚀' }
      case 'BEGINNER': return { bg: 'rgba(52,211,153,0.15)', color: '#34d399', border: 'rgba(52,211,153,0.3)', emoji: '🌱' }
      default: return { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)', emoji: '👋' }
    }
  }

  const getRankConfig = (rank) => {
    switch (rank) {
      case 1: return { medal: '🥇', color: '#FFD700', glow: 'rgba(255,215,0,0.12)', border: 'rgba(255,215,0,0.25)' }
      case 2: return { medal: '🥈', color: '#C0C0C0', glow: 'rgba(192,192,192,0.08)', border: 'rgba(192,192,192,0.2)' }
      case 3: return { medal: '🥉', color: '#CD7F32', glow: 'rgba(205,127,50,0.08)', border: 'rgba(205,127,50,0.2)' }
      case 4: return { medal: '4️⃣', color: '#94a3b8', glow: 'rgba(148,163,184,0.04)', border: '#1e293b' }
      default: return { medal: null, color: '#475569', glow: 'transparent', border: '#1e293b' }
    }
  }

  if (loading) return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>Loading...</div>
    </Layout>
  )

  const top4 = leaderboard.slice(0, TOP_COUNT)
  const rest = leaderboard.slice(TOP_COUNT)
  const totalPages = Math.ceil(rest.length / PAGE_SIZE)
  const pagedRest = rest.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <Layout>
      <div style={{ maxWidth: '760px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Trophy size={20} color='#FFD700' />
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px' }}>
              Leaderboard
            </h1>
            <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
              Top developers ranked by contribution score
            </p>
          </div>
        </div>

        {/* Top 4 Cards */}
        {top4.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px', marginBottom: '20px'
          }}>
            {top4.map((dev, i) => {
              const rank = i + 1
              const rankConfig = getRankConfig(rank)
              const avatarColor = getAvatarColor(dev.name)
              const badgeConfig = getBadgeConfig(dev.badge)

              return (
                <div key={dev.id}
                  onClick={() => navigate(`/profile/${dev.username}`)}
                  style={{
                    background: `linear-gradient(160deg, ${rankConfig.glow} 0%, #0d0d18 50%)`,
                    border: `1px solid ${rankConfig.border}`,
                    borderRadius: '14px', padding: '18px 14px',
                    textAlign: 'center', cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginTop: rank === 1 ? '0' : rank === 2 ? '8px' : rank === 3 ? '16px' : '24px'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.4)`
                    e.currentTarget.style.borderColor = rankConfig.color + '50'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = rankConfig.border
                  }}
                >
                  {/* Medal */}
                  <div style={{ fontSize: '26px', marginBottom: '10px', lineHeight: 1 }}>
                    {rankConfig.medal}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    background: avatarColor.bg, color: avatarColor.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: '700', margin: '0 auto 10px',
                    border: `2px solid ${rankConfig.color}25`
                  }}>
                    {getInitials(dev.name)}
                  </div>

                  {/* Name */}
                  <div style={{
                    fontSize: '13px', fontWeight: '600', color: '#f1f5f9',
                    marginBottom: '2px', whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {dev.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#475569', marginBottom: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    @{dev.username}
                  </div>

                  {/* Score */}
                  <div style={{
                    fontSize: '28px', fontWeight: '800',
                    color: rank === 1 ? '#FFD700' : '#00ff87',
                    letterSpacing: '-1px', lineHeight: 1, marginBottom: '2px'
                  }}>
                    {dev.score}
                  </div>
                  <div style={{ fontSize: '10px', color: '#475569', marginBottom: '10px' }}>points</div>

                  {/* Badge */}
                  <span style={{
                    fontSize: '10px', padding: '3px 8px', borderRadius: '20px', fontWeight: '600',
                    background: badgeConfig.bg, color: badgeConfig.color, border: `1px solid ${badgeConfig.border}`
                  }}>
                    {badgeConfig.emoji} {dev.badge}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Rest — ranked list */}
        {rest.length > 0 && (
          <div style={{
            background: '#0d0d18', border: '1px solid #1e293b',
            borderRadius: '16px', overflow: 'hidden'
          }}>

            {/* Section label */}
            <div style={{
              padding: '12px 20px', borderBottom: '1px solid #1e293b',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: '600', letterSpacing: '0.5px' }}>
                RANKINGS #{TOP_COUNT + 1} — #{TOP_COUNT + rest.length}
              </span>
              {totalPages > 1 && (
                <span style={{ fontSize: '11px', color: '#475569' }}>
                  Page {page + 1} of {totalPages}
                </span>
              )}
            </div>

            {/* List */}
            {pagedRest.map((dev, i) => {
              const rank = TOP_COUNT + page * PAGE_SIZE + i + 1
              const avatarColor = getAvatarColor(dev.name)
              const badgeConfig = getBadgeConfig(dev.badge)

              return (
                <div key={dev.id}
                  onClick={() => navigate(`/profile/${dev.username}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '13px 20px', cursor: 'pointer',
                    borderBottom: i < pagedRest.length - 1 ? '1px solid #1e293b' : 'none',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0a0a0f'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Rank */}
                  <div style={{
                    width: '32px', textAlign: 'center', flexShrink: 0,
                    fontSize: '13px', color: '#475569', fontWeight: '600'
                  }}>
                    #{rank}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: avatarColor.bg, color: avatarColor.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '700', flexShrink: 0
                  }}>
                    {getInitials(dev.name)}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '2px' }}>
                      {dev.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#475569' }}>@{dev.username}</span>
                      <span style={{
                        fontSize: '10px', padding: '1px 6px', borderRadius: '20px',
                        fontWeight: '600', background: badgeConfig.bg, color: badgeConfig.color
                      }}>
                        {badgeConfig.emoji} {dev.badge}
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#00ff87', letterSpacing: '-0.5px' }}>
                      {dev.score}
                    </div>
                    <div style={{ fontSize: '10px', color: '#475569' }}>pts</div>
                  </div>
                </div>
              )
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', padding: '14px 20px',
                borderTop: '1px solid #1e293b'
              }}>
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '7px 14px', borderRadius: '8px',
                    background: 'transparent', border: '1px solid #1e293b',
                    color: page === 0 ? '#334155' : '#94a3b8',
                    fontSize: '13px', cursor: page === 0 ? 'not-allowed' : 'pointer',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  <ChevronLeft size={14} /> Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i)} style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: page === i ? '#00ff87' : 'transparent',
                    border: `1px solid ${page === i ? '#00ff87' : '#1e293b'}`,
                    color: page === i ? '#000' : '#94a3b8',
                    fontSize: '13px', fontWeight: page === i ? '700' : '400',
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif'
                  }}>
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '7px 14px', borderRadius: '8px',
                    background: 'transparent', border: '1px solid #1e293b',
                    color: page === totalPages - 1 ? '#334155' : '#94a3b8',
                    fontSize: '13px', cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}