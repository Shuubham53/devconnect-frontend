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
      case 'LEGEND':       return { color: '#d8b4fe', bg: 'rgba(192,132,252,0.12)', emoji: '👑' }
      case 'EXPERT':       return { color: '#93c5fd', bg: 'rgba(96,165,250,0.12)',  emoji: '⚡' }
      case 'INTERMEDIATE': return { color: '#2dd4bf', bg: 'rgba(0,184,163,0.12)',   emoji: '🚀' }
      case 'BEGINNER':     return { color: '#6ee7b7', bg: 'rgba(52,211,153,0.12)',  emoji: '🌱' }
      default:             return { color: '#fbbf24', bg: 'rgba(255,161,22,0.1)',   emoji: '👋' }
    }
  }

  const avatarStyle = (name, size = 38) => {
    const color = getAvatarColor(name)
    return {
      width: `${size}px`, height: `${size}px`, borderRadius: '7px',
      background: `${color}20`, border: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size >= 50 ? '18px' : size >= 38 ? '13px' : '11px',
      fontWeight: '700', color, flexShrink: 0, overflow: 'hidden'
    }
  }

  if (loading) return (
    <Layout>
      <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', fontSize: '13px' }}>Loading...</div>
    </Layout>
  )

  const first = leaderboard[0]
  const second = leaderboard[1]
  const third = leaderboard[2]
  const rest = leaderboard.slice(3)
  const totalPages = Math.ceil(rest.length / PAGE_SIZE)
  const pagedRest = rest.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <Layout>
      <style>{`
        .lb-hero { background: #242424; border: 1px solid rgba(255,215,0,0.2); border-radius: 12px; padding: 22px; margin-bottom: 14px; display: flex; gap: 16px; align-items: center; cursor: pointer; transition: border-color .15s; }
        .lb-hero:hover { border-color: rgba(255,215,0,0.45); }
        .lb-runner-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
        .lb-runner { background: #242424; border: 1px solid #333; border-radius: 10px; padding: 16px; display: flex; gap: 12px; align-items: center; cursor: pointer; transition: border-color .15s; }
        .lb-runner:hover { border-color: #555; }
        .lb-runner.s2 { border-color: rgba(192,192,192,0.2); }
        .lb-runner.s2:hover { border-color: rgba(192,192,192,0.45); }
        .lb-runner.s3 { border-color: rgba(205,127,50,0.15); }
        .lb-runner.s3:hover { border-color: rgba(205,127,50,0.4); }
        .lb-row { display: flex; align-items: center; gap: 12px; padding: 12px 18px; border-bottom: 1px solid #1e1e1e; cursor: pointer; transition: background .15s; }
        .lb-row:last-child { border-bottom: none; }
        .lb-row:hover { background: #2a2a2a; }
        .pg-btn { display: flex; align-items: center; gap: 3px; padding: 6px 12px; border-radius: 6px; background: transparent; border: 1px solid #333; color: #94a3b8; font-size: 12px; cursor: pointer; font-family: Inter, sans-serif; transition: all .15s; }
        .pg-btn:disabled { color: #333; border-color: #2a2a2a; cursor: not-allowed; }
        .pg-btn:not(:disabled):hover { background: #2d2d2d; border-color: #555; }
        .pg-num { width: 30px; height: 30px; border-radius: 6px; border: 1px solid #333; background: transparent; color: #94a3b8; font-size: 12px; cursor: pointer; font-family: Inter, sans-serif; transition: all .15s; }
        .pg-num.active { background: #ffa116; border-color: #ffa116; color: #000; font-weight: 700; }
        .hero-score { font-size: 38px; font-weight: 800; color: #FFD700; line-height: 1; }
        .hero-trophy { width: 52px; height: 52px; background: rgba(255,215,0,0.1); border: 1px solid rgba(255,215,0,0.25); border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        @media (max-width: 640px) {
          .lb-hero { flex-wrap: wrap; padding: 14px; gap: 10px; }
          .hero-trophy { width: 40px; height: 40px; }
          .hero-score { font-size: 28px !important; }
          .lb-runner-grid { grid-template-columns: 1fr !important; }
          .lb-runner { padding: 12px; }
          .lb-row { padding: 10px 12px; gap: 8px; }
          .pg-btn { padding: 5px 8px; font-size: 11px; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ width: '36px', height: '36px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Trophy size={18} color="#FFD700" />
        </div>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>Leaderboard</h1>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Top developers by contribution score</p>
        </div>
      </div>

      {/* #1 Hero */}
      {first && (
        <div className="lb-hero" onClick={() => navigate(`/profile/${first.username}`)}>
          <div className="hero-trophy">
            <Trophy size={22} color="#FFD700" />
          </div>
          <div style={{ ...avatarStyle(first.name, 56) }}>
            {first.avatarUrl
              ? <img src={first.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : getInitials(first.name)
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11px', color: '#ffa116', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '4px' }}>1st Place</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#f1f5f9', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{first.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>@{first.username}</span>
              <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '4px', fontWeight: '600', background: getBadgeConfig(first.badge).bg, color: getBadgeConfig(first.badge).color }}>
                {getBadgeConfig(first.badge).emoji} {first.badge}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div className="hero-score">{first.score}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>pts</div>
          </div>
        </div>
      )}

      {/* #2 and #3 runners up */}
      {(second || third) && (
        <div className="lb-runner-grid">
          {second && (
            <div className="lb-runner s2" onClick={() => navigate(`/profile/${second.username}`)}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>🥈</span>
              <div style={{ ...avatarStyle(second.name, 40) }}>
                {second.avatarUrl
                  ? <img src={second.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : getInitials(second.name)
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{second.name}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>@{second.username}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#C0C0C0', lineHeight: 1 }}>{second.score}</div>
                <div style={{ fontSize: '10px', color: '#6b7280' }}>pts</div>
              </div>
            </div>
          )}
          {third && (
            <div className="lb-runner s3" onClick={() => navigate(`/profile/${third.username}`)}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>🥉</span>
              <div style={{ ...avatarStyle(third.name, 40) }}>
                {third.avatarUrl
                  ? <img src={third.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : getInitials(third.name)
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{third.name}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>@{third.username}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#CD7F32', lineHeight: 1 }}>{third.score}</div>
                <div style={{ fontSize: '10px', color: '#6b7280' }}>pts</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rest list */}
      {rest.length > 0 && (
        <div style={{ background: '#242424', border: '1px solid #333', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '10px 18px', borderBottom: '1px solid #2d2d2d8d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
              Rankings #{4}–#{3 + rest.length}
            </span>
            {totalPages > 1 && <span style={{ fontSize: '11px', color: '#6b7280' }}>Page {page + 1}/{totalPages}</span>}
          </div>

          {pagedRest.map((dev, i) => {
            const rank = 3 + page * PAGE_SIZE + i + 1
            const badgeConfig = getBadgeConfig(dev.badge)
            return (
              <div key={dev.id} className="lb-row" onClick={() => navigate(`/profile/${dev.username}`)}>
                <div style={{ width: '28px', textAlign: 'center', fontSize: '12px', color: '#6b7280', fontWeight: '600', flexShrink: 0 }}>#{rank}</div>
                <div style={{ ...avatarStyle(dev.name, 34) }}>
                  {dev.avatarUrl
                    ? <img src={dev.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : getInitials(dev.name)
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#cbd5e1', marginBottom: '1px' }}>{dev.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>@{dev.username}</span>
                    <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', fontWeight: '600', background: badgeConfig.bg, color: badgeConfig.color }}>
                      {badgeConfig.emoji} {dev.badge}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffa116' }}>{dev.score}</div>
                  <div style={{ fontSize: '10px', color: '#6b7280' }}>pts</div>
                </div>
              </div>
            )
          })}

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px 18px', borderTop: '1px solid #2d2d2d', flexWrap: 'wrap' }}>
              <button className="pg-btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                <ChevronLeft size={13} /> Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} className={`pg-num ${page === i ? 'active' : ''}`} onClick={() => setPage(i)}>
                  {i + 1}
                </button>
              ))}
              <button className="pg-btn" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>
                Next <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}