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
      const data = res.data.data
      login({ email: data.email, username: data.username, role: data.role }, data.token)
      toast.success('Welcome back!')
      navigate('/feed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '6px',
    background: '#1a1a1a', border: '1px solid #3d3d3d',
    color: '#eff1f6', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.15s'
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#1a1a1a',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '0 20px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              <span style={{ color: '#eff1f6' }}>Dev</span>
              <span style={{ color: '#ffa116' }}>Connect</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div style={{
          background: '#282828', border: '1px solid #3d3d3d',
          borderRadius: '10px', padding: '28px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#eff1f6', marginBottom: '20px' }}>
            Sign in
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Email</label>
              <input type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="you@example.com" required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#ffa116'}
                onBlur={e => e.target.style.borderColor = '#3d3d3d'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Password</label>
              <input type="password" name="password" value={form.password}
                onChange={handleChange} placeholder="••••••••" required
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#ffa116'}
                onBlur={e => e.target.style.borderColor = '#3d3d3d'}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '10px', borderRadius: '6px',
              background: '#ffa116', color: '#000', fontSize: '14px',
              fontWeight: '700', border: 'none', cursor: 'pointer',
              opacity: loading ? 0.8 : 1, fontFamily: 'Inter, sans-serif',
              transition: 'background 0.15s'
            }}
              onMouseEnter={e => { if (!loading) e.target.style.background = '#ff8c00' }}
              onMouseLeave={e => e.target.style.background = '#ffa116'}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '20px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#ffa116', fontWeight: '500', textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#3d3d3d', marginTop: '20px' }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  )
}