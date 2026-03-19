import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ImagePlus, X } from 'lucide-react'
import api from '../services/api'
import Layout from '../components/layout/Layout'

export default function CreatePostPage() {
  const [form, setForm] = useState({
    title: '', content: '', tags: '', postType: 'DISCUSSION'
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let imageUrl = null

      // Upload image first if selected
      if (imageFile) {
        setUploading(true)
        const formData = new FormData()
        formData.append('file', imageFile)
        const uploadRes = await api.post('/api/upload/post-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        imageUrl = uploadRes.data.data
        setUploading(false)
      }

      // Create post
      await api.post('/api/posts', {
        ...form,
        imageUrl
      })

      toast.success('Post created!')
      navigate('/feed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '8px',
    background: '#0a0a0f', border: '1px solid #1e293b',
    color: '#e2e8f0', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'Inter, sans-serif'
  }

  const labelStyle = {
    display: 'block', fontSize: '13px',
    color: '#94a3b8', marginBottom: '8px', fontWeight: '500'
  }

  const postTypes = ['QUESTION', 'ARTICLE', 'DISCUSSION']

  const typeColors = {
    QUESTION: { active: { background: '#1e3a5f', color: '#60a5fa', border: '1px solid #60a5fa40' } },
    ARTICLE: { active: { background: '#1a2e1a', color: '#4ade80', border: '1px solid #4ade8040' } },
    DISCUSSION: { active: { background: '#2d1b4e', color: '#c084fc', border: '1px solid #c084fc40' } },
  }

  return (
    <Layout>
      <div style={{ maxWidth: '70%' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontSize: '24px', fontWeight: '700',
            color: '#f1f5f9', margin: 0, letterSpacing: '-0.5px'
          }}>
            Create Post
          </h1>
          <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
            Share your knowledge with the community
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Post Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Post Type</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {postTypes.map(type => {
                const isActive = form.postType === type
                const activeStyle = typeColors[type].active
                return (
                  <button
                    key={type} type="button"
                    onClick={() => setForm({ ...form, postType: type })}
                    style={{
                      padding: '8px 16px', borderRadius: '8px',
                      fontSize: '12px', fontWeight: '600',
                      cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.15s',
                      ...(isActive ? activeStyle : {
                        background: '#0d0d18',
                        color: '#64748b',
                        border: '1px solid #1e293b'
                      })
                    }}>
                    {type}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Title</label>
            <input
              type="text" name="title" value={form.title}
              onChange={handleChange}
              placeholder="Write a clear, descriptive title"
              required style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#00ff87'}
              onBlur={e => e.target.style.borderColor = '#1e293b'}
            />
          </div>

          {/* Content */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Content</label>
            <textarea
              name="content" value={form.content}
              onChange={handleChange}
              placeholder="Write your post content here..."
              required rows={8}
              style={{
                ...inputStyle,
                resize: 'vertical',
                lineHeight: '1.6'
              }}
              onFocus={e => e.target.style.borderColor = '#00ff87'}
              onBlur={e => e.target.style.borderColor = '#1e293b'}
            />
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Tags</label>
            <input
              type="text" name="tags" value={form.tags}
              onChange={handleChange}
              placeholder="tags (comma separated)"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#00ff87'}
              onBlur={e => e.target.style.borderColor = '#1e293b'}
            />
            <p style={{ fontSize: '11px', color: '#475569', marginTop: '6px' }}>
              Separate tags with commas
            </p>
          </div>

          {/* Image Upload */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Image (Optional)</label>

            {imagePreview ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={imagePreview} alt="preview"
                  style={{
                    width: '100%', maxHeight: '200px',
                    objectFit: 'cover', borderRadius: '8px',
                    border: '1px solid #1e293b'
                  }}
                />
                <button type="button" onClick={removeImage}
                  style={{
                    position: 'absolute', top: '8px', right: '8px',
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: '#0a0a0f', border: '1px solid #1e293b',
                    color: '#e2e8f0', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '10px', padding: '24px', borderRadius: '8px',
                border: '1px dashed #1e293b', cursor: 'pointer',
                color: '#475569', fontSize: '13px',
                transition: 'all 0.15s'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#00ff87'
                  e.currentTarget.style.color = '#00ff87'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#1e293b'
                  e.currentTarget.style.color = '#475569'
                }}
              >
                <ImagePlus size={18} />
                Click to upload image
                <input type="file" accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" disabled={loading} style={{
              flex: 1, padding: '12px', borderRadius: '8px',
              background: '#00ff87', color: '#000', fontSize: '14px',
              fontWeight: '700', border: 'none', cursor: 'pointer',
              opacity: loading ? 0.8 : 1, fontFamily: 'Inter, sans-serif'
            }}>
              {uploading ? 'Uploading image...' : loading ? 'Publishing...' : 'Publish Post'}
            </button>

            <button type="button" onClick={() => navigate('/feed')} style={{
              padding: '12px 20px', borderRadius: '8px',
              background: 'transparent', border: '1px solid #1e293b',
              color: '#94a3b8', fontSize: '14px', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif'
            }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}