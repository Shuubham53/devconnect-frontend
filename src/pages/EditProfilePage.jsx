import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Camera, ArrowLeft } from 'lucide-react'
import api from '../services/api'
import Layout from '../components/layout/Layout'

export default function EditProfilePage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [form, setForm] = useState({
    name: '',
    bio: '',
    skills: '',
    githubUrl: '',
    linkedinUrl: '',
    avatarUrl: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/api/users/${user?.username}`)
      const data = res.data.data
      setForm({
        name: data.name || '',
        bio: data.bio || '',
        skills: data.skills || '',
        githubUrl: data.githubUrl || '',
        linkedinUrl: data.linkedinUrl || '',
        avatarUrl: data.avatarUrl || ''
      })
      if (data.avatarUrl) setAvatarPreview(data.avatarUrl)
    } catch (err) {
      toast.error('Failed to load profile')
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/api/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setForm(prev => ({ ...prev, avatarUrl: res.data.data }))
      toast.success('Avatar uploaded!')
    } catch (err) {
      toast.error('Failed to upload avatar')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/api/users/update', form)
      toast.success('Profile updated!')
      navigate(`/profile/${user?.username}`)
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: '8px',
    background: '#0a0a0f', border: '1px solid #1e293b',
    color: '#e2e8f0', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'Inter, sans-serif'
  }

  const labelStyle = {
    display: 'block', fontSize: '13px',
    color: '#94a3b8', marginBottom: '7px', fontWeight: '500'
  }

  return (
    <Layout>
      <div style={{ maxWidth: '70%' }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          color: '#475569', fontSize: '13px', background: 'transparent',
          border: 'none', cursor: 'pointer', marginBottom: '24px',
          fontFamily: 'Inter, sans-serif', padding: 0
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
          onMouseLeave={e => e.currentTarget.style.color = '#475569'}
        >
          <ArrowLeft size={15} /> Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontSize: '22px', fontWeight: '700',
            color: '#f1f5f9', margin: '0 0 4px', letterSpacing: '-0.5px'
          }}>
            Edit Profile
          </h1>
          <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
            Update your profile information
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Avatar Upload */}
          <div style={{
            background: '#0d0d18', border: '1px solid #1e293b',
            borderRadius: '16px', padding: '24px',
            marginBottom: '16px', textAlign: 'center'
          }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '12px' }}>
              {/* Avatar */}
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%',
                background: avatarPreview ? 'transparent' : 'rgba(0,255,135,0.15)',
                border: '3px solid rgba(0,255,135,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', fontWeight: '800', color: '#00ff87',
                overflow: 'hidden', margin: '0 auto'
              }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : getInitials(form.name || user?.username)}
              </div>

              {/* Camera overlay */}
              <label style={{
                position: 'absolute', bottom: '0', right: '0',
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#00ff87', border: '2px solid #0d0d18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer'
              }}>
                <Camera size={13} color='#000' />
                <input type="file" accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div style={{ fontSize: '13px', color: '#475569' }}>
              {avatarUploading ? 'Uploading...' : 'Click camera to change avatar'}
            </div>
          </div>

          {/* Form Fields */}
          <div style={{
            background: '#0d0d18', border: '1px solid #1e293b',
            borderRadius: '16px', padding: '24px'
          }}>

            {/* Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text" name="name" value={form.name}
                onChange={handleChange} placeholder="Your full name"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#00ff87'}
                onBlur={e => e.target.style.borderColor = '#1e293b'}
              />
            </div>

            {/* Bio */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Bio</label>
              <textarea
                name="bio" value={form.bio}
                onChange={handleChange}
                placeholder="Tell developers about yourself..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
                onFocus={e => e.target.style.borderColor = '#00ff87'}
                onBlur={e => e.target.style.borderColor = '#1e293b'}
              />
            </div>

            {/* Skills */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Skills</label>
              <input
                type="text" name="skills" value={form.skills}
                onChange={handleChange}
                placeholder="Java, Spring Boot, PostgreSQL, JWT"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#00ff87'}
                onBlur={e => e.target.style.borderColor = '#1e293b'}
              />
              <p style={{ fontSize: '11px', color: '#475569', marginTop: '5px' }}>
                Separate skills with commas
              </p>
            </div>

            {/* GitHub */}
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>GitHub URL</label>
              <input
                type="url" name="githubUrl" value={form.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/username"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#00ff87'}
                onBlur={e => e.target.style.borderColor = '#1e293b'}
              />
            </div>

            {/* LinkedIn */}
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>LinkedIn URL</label>
              <input
                type="url" name="linkedinUrl" value={form.linkedinUrl}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#00ff87'}
                onBlur={e => e.target.style.borderColor = '#1e293b'}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={loading || avatarUploading} style={{
                flex: 1, padding: '12px', borderRadius: '8px',
                background: '#00ff87', color: '#000', fontSize: '14px',
                fontWeight: '700', border: 'none', cursor: 'pointer',
                opacity: loading ? 0.8 : 1, fontFamily: 'Inter, sans-serif'
              }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => navigate(-1)} style={{
                padding: '12px 20px', borderRadius: '8px',
                background: 'transparent', border: '1px solid #1e293b',
                color: '#94a3b8', fontSize: '14px', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif'
              }}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}