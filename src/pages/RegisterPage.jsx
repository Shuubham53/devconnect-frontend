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
      toast.success('Email verified! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '6px',
    background: '#1a1a1a', border: '1px solid #3d3d3d',
    color: '#eff1f6', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'Inter, sans-serif'
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#1a1a1a',
      fontFamily: 'Inter, sans-serif', padding: '20px 0'
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
        <div style={{ background: '#282828', border: '1px solid #3d3d3d', borderRadius: '10px', padding: '28px' }}>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: step >= 1 ? '#ffa116' : '#3d3d3d',
              color: step >= 1 ? '#000' : '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '700', flexShrink: 0
            }}>1</div>
            <span style={{ fontSize: '12px', color: step >= 1 ? '#ffa116' : '#64748b' }}>Details</span>
            <div style={{ flex: 1, height: '1px', background: step >= 2 ? '#ffa116' : '#3d3d3d' }} />
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: step >= 2 ? '#ffa116' : '#3d3d3d',
              color: step >= 2 ? '#000' : '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '700', flexShrink: 0
            }}>2</div>
            <span style={{ fontSize: '12px', color: step >= 2 ? '#ffa116' : '#64748b' }}>Verify</span>
          </div>

          {step === 1 ? (
            <form onSubmit={handleRegister}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#eff1f6', marginBottom: '16px' }}>
                Create account
              </h2>
              {[
                { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Enter your full name' },
                { label: 'Username', name: 'username', type: 'text', placeholder: 'Choose a username' },
                { label: 'Email', name: 'email', type: 'email', placeholder: 'Enter your email' },
                { label: 'Password', name: 'password', type: 'password', placeholder: 'Create a password' },
              ].map(field => (
                <div key={field.name} style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
                    {field.label}
                  </label>
                  <input type={field.type} name={field.name} value={form[field.name]}
                    onChange={handleChange} placeholder={field.placeholder} required
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#ffa116'}
                    onBlur={e => e.target.style.borderColor = '#3d3d3d'}
                  />
                </div>
              ))}
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '10px', borderRadius: '6px',
                background: '#ffa116', color: '#000', fontSize: '14px',
                fontWeight: '700', border: 'none', cursor: 'pointer',
                marginTop: '8px', fontFamily: 'Inter, sans-serif',
                opacity: loading ? 0.8 : 1
              }}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#eff1f6', marginBottom: '8px' }}>
                Verify email
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                We sent a 6-digit OTP to <span style={{ color: '#ffa116' }}>{form.email}</span>
              </p>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>OTP Code</label>
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                  placeholder="• • • • • •" maxLength={6} required
                  style={{ ...inputStyle, textAlign: 'center', fontSize: '20px', letterSpacing: '8px', fontWeight: '700' }}
                  onFocus={e => e.target.style.borderColor = '#ffa116'}
                  onBlur={e => e.target.style.borderColor = '#3d3d3d'}
                />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '10px', borderRadius: '6px',
                background: '#ffa116', color: '#000', fontSize: '14px',
                fontWeight: '700', border: 'none', cursor: 'pointer',
                marginBottom: '8px', fontFamily: 'Inter, sans-serif'
              }}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
              <button type="button" onClick={() => setStep(1)} style={{
                width: '100%', padding: '10px', borderRadius: '6px',
                background: 'transparent', border: '1px solid #3d3d3d',
                color: '#94a3b8', fontSize: '14px', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif'
              }}>
                Back
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '20px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#ffa116', fontWeight: '500', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '12px' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  )
}