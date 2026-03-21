import { Link } from 'react-router-dom'
import { ArrowRight, Code2, Users, Trophy, MessageSquare, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', fontFamily: 'Inter, sans-serif' }}>

      {/* Navbar */}
      <div style={{ background: '#282828', borderBottom: '1px solid #3d3d3d', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '17px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            <span style={{ color: '#eff1f6' }}>Dev</span>
            <span style={{ color: '#ffa116' }}>Connect</span>
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '6px 16px', borderRadius: '6px', fontSize: '13px',
                color: '#94a3b8', border: '1px solid #3d3d3d', cursor: 'pointer',
                fontWeight: '500', transition: 'all 0.15s'
              }}
                onMouseEnter={e => { e.currentTarget.style.color = '#eff1f6'; e.currentTarget.style.borderColor = '#555' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#3d3d3d' }}
              >
                Sign In
              </div>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '6px 16px', borderRadius: '6px', fontSize: '13px',
                background: '#ffa116', color: '#000', cursor: 'pointer',
                fontWeight: '700', transition: 'background 0.15s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#ff8c00'}
                onMouseLeave={e => e.currentTarget.style.background = '#ffa116'}
              >
                Sign Up
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 20px 60px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '4px 14px', borderRadius: '20px',
          background: 'rgba(255,161,22,0.08)', border: '1px solid rgba(255,161,22,0.2)',
          fontSize: '12px', color: '#ffa116', fontWeight: '600', marginBottom: '28px'
        }}>
          <Zap size={12} /> The Developer Community Platform
        </div>

        <h1 style={{
          fontSize: '56px', fontWeight: '800', color: '#eff1f6',
          letterSpacing: '-2px', lineHeight: '1.1', marginBottom: '20px'
        }}>
          Where Developers<br />
          <span style={{ color: '#ffa116' }}>Connect & Grow</span>
        </h1>

        <p style={{
          fontSize: '16px', color: '#64748b', maxWidth: '480px',
          margin: '0 auto 40px', lineHeight: '1.7'
        }}>
          Ask questions, share articles, discuss ideas and build your reputation in the developer community.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 28px', borderRadius: '8px',
              background: '#ffa116', color: '#000',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer',
              transition: 'background 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#ff8c00'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffa116'}
            >
              Get Started Free <ArrowRight size={16} />
            </div>
          </Link>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '12px 28px', borderRadius: '8px',
              border: '1px solid #3d3d3d', color: '#94a3b8',
              fontSize: '14px', fontWeight: '500', cursor: 'pointer',
              transition: 'all 0.15s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#eff1f6' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3d3d'; e.currentTarget.style.color = '#94a3b8' }}
            >
              Sign In
            </div>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px 60px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px', background: '#3d3d3d', borderRadius: '12px',
          overflow: 'hidden', border: '1px solid #3d3d3d'
        }}>
          {[
            { value: '10K+', label: 'Developers' },
            { value: '50K+', label: 'Posts & Questions' },
            { value: '100K+', label: 'Answers Given' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center', padding: '24px', background: '#282828' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#ffa116', letterSpacing: '-1px' }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px 80px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#eff1f6', textAlign: 'center', marginBottom: '32px', letterSpacing: '-0.5px' }}>
          Everything you need to grow
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {[
            { icon: MessageSquare, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)', title: 'Ask & Answer', desc: 'Get expert help on any technical problem from experienced developers' },
            { icon: Code2, color: '#00b8a3', bg: 'rgba(0,184,163,0.1)', border: 'rgba(0,184,163,0.2)', title: 'Share Knowledge', desc: 'Write tutorials and articles to help others and build your reputation' },
            { icon: Users, color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.2)', title: 'Build Network', desc: 'Follow developers, get followers and grow your professional network' },
            { icon: Trophy, color: '#ffa116', bg: 'rgba(255,161,22,0.1)', border: 'rgba(255,161,22,0.2)', title: 'Earn Recognition', desc: 'Get points for contributions and climb the developer leaderboard' },
          ].map(({ icon: Icon, color, bg, border, title, desc }) => (
            <div key={title} style={{
              background: '#282828', border: `1px solid #3d3d3d`,
              borderRadius: '10px', padding: '20px',
              transition: 'border-color 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#555'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#3d3d3d'}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: '8px',
                background: bg, border: `1px solid ${border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '14px'
              }}>
                <Icon size={18} color={color} />
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#eff1f6', marginBottom: '8px' }}>{title}</div>
              <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px 80px' }}>
        <div style={{
          background: '#282828', border: '1px solid #3d3d3d',
          borderRadius: '16px', padding: '48px', textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#eff1f6', marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Ready to join the community?
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px' }}>
            Join thousands of developers sharing knowledge and growing together.
          </p>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 32px', borderRadius: '8px',
              background: '#ffa116', color: '#000',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer',
              transition: 'background 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#ff8c00'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffa116'}
            >
              Create Free Account <ArrowRight size={16} />
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #3d3d3d', padding: '20px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
          DevConnect © 2026 — The Developer Community
        </div>
      </div>
    </div>
  )
}