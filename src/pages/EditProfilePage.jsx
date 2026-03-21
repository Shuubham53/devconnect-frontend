import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Camera, ArrowLeft } from 'lucide-react'
import api from '../services/api'
import Layout from '../components/layout/Layout'

export default function EditProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [form, setForm] = useState({ name: '', bio: '', skills: '', githubUrl: '', linkedinUrl: '', avatarUrl: '' })

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/api/users/${user?.username}`)
      const data = res.data.data
      setForm({ name: data.name || '', bio: data.bio || '', skills: data.skills || '', githubUrl: data.githubUrl || '', linkedinUrl: data.linkedinUrl || '', avatarUrl: data.avatarUrl || '' })
      if (data.avatarUrl) setAvatarPreview(data.avatarUrl)
    } catch (err) { toast.error('Failed to load profile') }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/api/upload/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setForm(prev => ({ ...prev, avatarUrl: res.data.data }))
      toast.success('Avatar uploaded!')
    } catch (err) { toast.error('Failed to upload avatar') }
    finally { setAvatarUploading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/api/users/update', form)
      toast.success('Profile updated!')
      navigate(`/profile/${user?.username}`)
    } catch (err) { toast.error('Failed to update profile') }
    finally { setLoading(false) }
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '6px',
    background: '#1a1a1a', border: '1px solid #3d3d3d',
    color: '#eff1f6', fontSize: '13px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', transition: 'border-color 0.15s'
  }

  const labelStyle = { display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '500' }

  return (
    <Layout>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '13px', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '20px', fontFamily: 'Inter, sans-serif', padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = '#eff1f6'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
        >
          <ArrowLeft size={14} /> Back
        </button>

        <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#eff1f6', marginBottom: '4px' }}>Edit Profile</h1>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Update your profile information</p>

        <form onSubmit={handleSubmit}>

          {/* Avatar */}
          <div style={{ background: '#282828', border: '1px solid #3d3d3d', borderRadius: '8px', padding: '20px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '8px', background: '#1a1a1a', border: '1px solid #3d3d3d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '800', color: '#ffa116', overflow: 'hidden' }}>
                {avatarPreview ? <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(form.name || user?.username)}
              </div>
              <label style={{ position: 'absolute', bottom: '-6px', right: '-6px', width: '24px', height: '24px', borderRadius: '50%', background: '#ffa116', border: '2px solid #282828', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={11} color='#000' />
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </label>
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#eff1f6', marginBottom: '2px' }}>{form.name || user?.username}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{avatarUploading ? 'Uploading...' : 'Click camera icon to change avatar'}</div>
            </div>
          </div>

          {/* Fields */}
          <div style={{ background: '#282828', border: '1px solid #3d3d3d', borderRadius: '8px', padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#ffa116'} onBlur={e => e.target.style.borderColor = '#3d3d3d'} />
              </div>
              <div>
                <label style={labelStyle}>Username</label>
                <input type="text" value={user?.username} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Tell developers about yourself..." rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
                onFocus={e => e.target.style.borderColor = '#ffa116'} onBlur={e => e.target.style.borderColor = '#3d3d3d'} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Skills <span style={{ color: '#64748b', fontWeight: '400' }}>(comma separated)</span></label>
              <input type="text" name="skills" value={form.skills} onChange={handleChange} placeholder="Java, Spring Boot, PostgreSQL" style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#ffa116'} onBlur={e => e.target.style.borderColor = '#3d3d3d'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>GitHub URL</label>
                <input type="url" name="githubUrl" value={form.githubUrl} onChange={handleChange} placeholder="https://github.com/username" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#ffa116'} onBlur={e => e.target.style.borderColor = '#3d3d3d'} />
              </div>
              <div>
                <label style={labelStyle}>LinkedIn URL</label>
                <input type="url" name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/..." style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#ffa116'} onBlur={e => e.target.style.borderColor = '#3d3d3d'} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" disabled={loading || avatarUploading} style={{ flex: 1, padding: '10px', borderRadius: '6px', background: '#ffa116', color: '#000', fontSize: '13px', fontWeight: '700', border: 'none', cursor: 'pointer', opacity: loading ? 0.8 : 1, fontFamily: 'Inter, sans-serif' }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => navigate(-1)} style={{ padding: '10px 20px', borderRadius: '6px', background: 'transparent', border: '1px solid #3d3d3d', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}