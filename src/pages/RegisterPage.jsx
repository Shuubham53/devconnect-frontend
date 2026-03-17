import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../services/api'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/auth/register', form)
      toast.success('OTP sent to your email!')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/api/auth/verify-otp', { email: form.email, otp })
      toast.success('Email verified! Please login.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px',
    background: '#0a0a0f', border: '1px solid #1e293b',
    color: '#e2e8f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
  }

  const labelStyle = {
    display: 'block', fontSize: '12px',
    color: '#94a3b8', marginBottom: '6px'
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
      background: '#060608',
      padding: '20px 0'
    }}>

      {/* Green orb top left */}
      <div style={{
        position: 'fixed', top: '-150px', left: '-150px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,255,135,0.15) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0
      }} />

      {/* Green orb bottom right */}
      <div style={{
        position: 'fixed', bottom: '-150px', right: '-150px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,255,135,0.1) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0
      }} />

      {/* Grid pattern */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0,255,135,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,135,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }} />

      {/* Content */}
      <div style={{
        width: '100%', maxWidth: '400px',
        padding: '0 20px',
        position: 'relative', zIndex: 1
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{
            fontSize: '30px', fontWeight: '800',
            letterSpacing: '-1px', color: '#e2e8f0', margin: 0
          }}>
            Dev<span style={{ color: '#00ff87' }}>Connect</span>
          </h1>
          <p style={{ marginTop: '6px', fontSize: '13px', color: '#475569' }}>
            Join the developer community
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(13, 13, 24, 0.9)',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '24px',
          backdropFilter: 'blur(20px)'
        }}>

          {/* Step Indicator */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '8px', marginBottom: '20px'
          }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: step >= 1 ? '#00ff87' : '#1e293b',
              color: step >= 1 ? '#000' : '#475569',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '700', flexShrink: 0
            }}>1</div>
            <span style={{ fontSize: '12px', color: step >= 1 ? '#00ff87' : '#475569' }}>
              Details
            </span>
            <div style={{
              flex: 1, height: '1px',
              background: step >= 2 ? '#00ff87' : '#1e293b'
            }} />
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: step >= 2 ? '#00ff87' : '#1e293b',
              color: step >= 2 ? '#000' : '#475569',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '700', flexShrink: 0
            }}>2</div>
            <span style={{ fontSize: '12px', color: step >= 2 ? '#00ff87' : '#475569' }}>
              Verify
            </span>
          </div>

          {step === 1 ? (
            <form onSubmit={handleRegister}>
              <h2 style={{
                fontSize: '18px', fontWeight: '600',
                color: '#f1f5f9', marginBottom: '16px', marginTop: 0
              }}>
                Create your account
              </h2>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text" name="name" value={form.name}
                  onChange={handleChange} placeholder="Enter your full name"
                  required style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#00ff87'}
                  onBlur={e => e.target.style.borderColor = '#1e293b'}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Username</label>
                <input
                  type="text" name="username" value={form.username}
                  onChange={handleChange} placeholder="Choose a username"
                  required style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#00ff87'}
                  onBlur={e => e.target.style.borderColor = '#1e293b'}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder="Enter your email"
                  required style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#00ff87'}
                  onBlur={e => e.target.style.borderColor = '#1e293b'}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Password</label>
                <input
                  type="password" name="password" value={form.password}
                  onChange={handleChange} placeholder="Create a password"
                  required style={inputStyle}
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
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

          ) : (
            <form onSubmit={handleVerifyOtp}>
              <h2 style={{
                fontSize: '18px', fontWeight: '600',
                color: '#f1f5f9', marginBottom: '8px', marginTop: 0
              }}>
                Verify your email
              </h2>
              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '20px' }}>
                We sent a 6-digit OTP to{' '}
                <span style={{ color: '#00ff87' }}>{form.email}</span>
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Enter OTP</label>
                <input
                  type="text" value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="• • • • • •"
                  maxLength={6} required
                  style={{
                    ...inputStyle,
                    textAlign: 'center',
                    fontSize: '22px',
                    letterSpacing: '10px',
                    fontWeight: '700'
                  }}
                  onFocus={e => e.target.style.borderColor = '#00ff87'}
                  onBlur={e => e.target.style.borderColor = '#1e293b'}
                />
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '11px', borderRadius: '8px',
                background: '#00ff87', color: '#000', fontSize: '14px',
                fontWeight: '700', border: 'none', cursor: 'pointer',
                marginBottom: '10px'
              }}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>

              <button type="button" onClick={() => setStep(1)} style={{
                width: '100%', padding: '11px', borderRadius: '8px',
                background: 'transparent', border: '1px solid #1e293b',
                color: '#94a3b8', fontSize: '14px', cursor: 'pointer'
              }}>
                Back
              </button>
            </form>
          )}

          <p style={{
            textAlign: 'center', fontSize: '13px',
            color: '#475569', marginTop: '20px', marginBottom: 0
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{
              color: '#00ff87', fontWeight: '500', textDecoration: 'none'
            }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}