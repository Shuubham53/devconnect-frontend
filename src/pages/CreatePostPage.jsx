import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ImagePlus, X, ArrowLeft } from 'lucide-react'
import api from '../services/api'
import Layout from '../components/layout/Layout'

export default function CreatePostPage() {
  const [form, setForm] = useState({ title: '', content: '', tags: '', postType: 'DISCUSSION' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let imageUrl = null
      if (imageFile) {
        setUploading(true)
        const formData = new FormData()
        formData.append('file', imageFile)
        const uploadRes = await api.post('/api/upload/post-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        imageUrl = uploadRes.data.data
        setUploading(false)
      }
      await api.post('/api/posts', { ...form, imageUrl })
      toast.success('Post created!')
      navigate('/feed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post')
    } finally {
      setLoading(false); setUploading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '6px',
    background: '#1a1a1a', border: '1px solid #3d3d3d',
    color: '#eff1f6', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.15s'
  }

  const labelStyle = { display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px', fontWeight: '500' }

  const postTypes = [
    { key: 'QUESTION', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.3)' },
    { key: 'ARTICLE', color: '#00b8a3', bg: 'rgba(0,184,163,0.1)', border: 'rgba(0,184,163,0.3)' },
    { key: 'DISCUSSION', color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.3)' },
  ]

  return (
    <Layout>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '13px', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '20px', fontFamily: 'Inter, sans-serif', padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = '#eff1f6'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#eff1f6', margin: 0 }}>Create Post</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px' }}>Share your knowledge with the community</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Post Type */}
          <div style={{ background: '#282828', border: '1px solid #3d3d3d', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
            <label style={labelStyle}>Post Type</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {postTypes.map(({ key, color, bg, border }) => {
                const isActive = form.postType === key
                return (
                  <button key={key} type="button" onClick={() => setForm({ ...form, postType: key })} style={{
                    padding: '7px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s',
                    background: isActive ? bg : 'transparent',
                    color: isActive ? color : '#64748b',
                    border: `1px solid ${isActive ? border : '#3d3d3d'}`
                  }}>
                    {key}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div style={{ background: '#282828', border: '1px solid #3d3d3d', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
            <label style={labelStyle}>Title</label>
            <input type="text" name="title" value={form.title} onChange={handleChange}
              placeholder="Write a clear, descriptive title" required style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#ffa116'}
              onBlur={e => e.target.style.borderColor = '#3d3d3d'}
            />
          </div>

          {/* Content */}
          <div style={{ background: '#282828', border: '1px solid #3d3d3d', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
            <label style={labelStyle}>Content</label>
            <textarea name="content" value={form.content} onChange={handleChange}
              placeholder="Write your post content here..." required rows={8}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }}
              onFocus={e => e.target.style.borderColor = '#ffa116'}
              onBlur={e => e.target.style.borderColor = '#3d3d3d'}
            />
          </div>

          {/* Tags */}
          <div style={{ background: '#282828', border: '1px solid #3d3d3d', borderRadius: '8px', padding: '16px', marginBottom: '12px' }}>
            <label style={labelStyle}>Tags <span style={{ color: '#64748b', fontWeight: '400' }}>(comma separated)</span></label>
            <input type="text" name="tags" value={form.tags} onChange={handleChange}
              placeholder="java, springboot, backend" style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#ffa116'}
              onBlur={e => e.target.style.borderColor = '#3d3d3d'}
            />
          </div>

          {/* Image */}
          <div style={{ background: '#282828', border: '1px solid #3d3d3d', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <label style={labelStyle}>Cover Image <span style={{ color: '#64748b', fontWeight: '400' }}>(optional)</span></label>
            {imagePreview ? (
              <div style={{ position: 'relative' }}>
                <img src={imagePreview} alt="preview" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #3d3d3d' }} />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(null) }} style={{ position: 'absolute', top: '8px', right: '8px', width: '26px', height: '26px', borderRadius: '50%', background: '#1a1a1a', border: '1px solid #3d3d3d', color: '#eff1f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={13} />
                </button>
              </div>
            ) : (
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '20px', borderRadius: '6px', border: '1px dashed #3d3d3d', cursor: 'pointer', color: '#64748b', fontSize: '13px', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ffa116'; e.currentTarget.style.color = '#ffa116' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#3d3d3d'; e.currentTarget.style.color = '#64748b' }}
              >
                <ImagePlus size={16} /> Click to upload image
                <input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: '6px', background: '#ffa116', color: '#000', fontSize: '14px', fontWeight: '700', border: 'none', cursor: 'pointer', opacity: loading ? 0.8 : 1, fontFamily: 'Inter, sans-serif' }}>
              {uploading ? 'Uploading...' : loading ? 'Publishing...' : 'Publish Post'}
            </button>
            <button type="button" onClick={() => navigate('/feed')} style={{ padding: '10px 20px', borderRadius: '6px', background: 'transparent', border: '1px solid #3d3d3d', color: '#94a3b8', fontSize: '14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}