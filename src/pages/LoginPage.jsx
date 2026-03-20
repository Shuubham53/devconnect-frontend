import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  try {
    const res = await api.post('/api/auth/login', form)
    const data = res.data.data  // ← get nested data
    login(
      { email: data.email, username: data.username, role: data.role },
      data.token
    )
    toast.success('Welcome back!')
    navigate('/feed')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Login failed')
  } finally {
    setLoading(false)
  }
 
}
  


  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      background: '#060608'
    }}>

      {/* Background — blurry green orbs */}
      <div style={{
        position: 'absolute', top: '-20%', left: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, #00ff8722 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, #00ff8715 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none'
      }} />

      {/* Grid pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(#00ff8708 1px, transparent 1px), linear-gradient(90deg, #00ff8708 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />

      {/* Content */}
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 20px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '-1px', color: '#e2e8f0', margin: 0 }}>
            Dev<span style={{ color: '#00ff87' }}>Connect</span>
          </h1>
          <p style={{ marginTop: '6px', fontSize: '13px', color: '#475569' }}>
            The community for developers
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(13, 13, 24, 0.85)',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '28px',
          backdropFilter: 'blur(20px)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', marginBottom: '20px', marginTop: 0 }}>
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="you@example.com" required
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '8px',
                  background: '#0a0a0f', border: '1px solid #1e293b',
                  color: '#e2e8f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#00ff87'}
                onBlur={e => e.target.style.borderColor = '#1e293b'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password" name="password" value={form.password}
                onChange={handleChange} placeholder="••••••••" required
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '8px',
                  background: '#0a0a0f', border: '1px solid #1e293b',
                  color: '#e2e8f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#00ff87'}
                onBlur={e => e.target.style.borderColor = '#1e293b'}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px', borderRadius: '8px',
              background: '#00ff87', color: '#000', fontSize: '14px',
              fontWeight: '700', border: 'none', cursor: 'pointer',
              opacity: loading ? 0.8 : 1
            }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#475569', marginTop: '20px', marginBottom: 0 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#00ff87', fontWeight: '500', textDecoration: 'none' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}