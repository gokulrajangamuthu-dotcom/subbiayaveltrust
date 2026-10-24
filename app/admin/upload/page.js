'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Nav from '@/components/Nav'
import { useToast } from '@/components/Toast'
import { 
  Megaphone, 
  Video, 
  BookOpen, 
  UploadCloud, 
  FileText, 
  X, 
  Check, 
  ArrowLeft,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

export default function AdminUploadPage() {
  const router = useRouter()
  const sb = createClient()
  const { toast } = useToast()
  const fileInputRef = useRef(null)

  const [me, setMe] = useState({})
  const [type, setType] = useState('announcement')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    sb.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        sb.from('profiles')
          .select('name, role')
          .eq('id', user.id)
          .single()
          .then(({ data }) => setMe(data || {}))
      }
    })
  }, [])

  // Handle file select & preview
  function handleFileChange(selectedFile) {
    if (!selectedFile) return
    setFile(selectedFile)
    if (selectedFile.type.startsWith('video/')) {
      setFilePreview(URL.createObjectURL(selectedFile))
    } else {
      setFilePreview(null)
    }
  }

  function handleDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setProgress(10)

    try {
      let path = null

      if (type !== 'announcement') {
        if (!file) {
          toast.error('Please attach a media file before publishing.')
          setBusy(false)
          return
        }

        setProgress(30)
        path = `${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`
        const bucket = type === 'video' ? 'videos' : 'pdfs'
        
        const { error: uploadErr } = await sb.storage
          .from(bucket)
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadErr) throw uploadErr
        setProgress(75)
      }

      const { error: insertErr } = await sb.from('posts').insert({
        type,
        title: title.trim(),
        body: body.trim(),
        file_url: path
      })

      if (insertErr) throw insertErr

      setProgress(100)
      toast.success('Post published successfully!')
      router.push('/admin')
      router.refresh()
    } catch (err) {
      toast.error('Failed to publish: ' + (err.message || 'Unknown error'))
      setBusy(false)
      setProgress(0)
    }
  }

  return (
    <>
      <Nav name={me?.name || 'Admin'} role={me?.role || 'admin'} />
      <div className="main-wrapper">
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href="/admin" className="btn-icon" title="Back to dashboard">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ fontSize: '1.6rem' }}>Create New Post</h1>
            <p className="meta">Publish announcements, video lessons, or PDF books to the portal</p>
          </div>
        </div>

        <div className="card-box">
          <form onSubmit={submit}>
            {/* Post Type Selector */}
            <div className="form-group">
              <label className="form-label">Content Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                <div 
                  onClick={() => { setType('announcement'); setFile(null); setFilePreview(null) }}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${type === 'announcement' ? 'var(--primary)' : 'var(--border-light)'}`,
                    background: type === 'announcement' ? 'var(--primary-light)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem'
                  }}
                >
                  <Megaphone size={18} color={type === 'announcement' ? 'var(--primary)' : 'var(--text-secondary)'} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: type === 'announcement' ? 'var(--primary)' : 'var(--text-primary)' }}>Announcement</div>
                    <div className="meta" style={{ fontSize: '0.75rem' }}>Text updates</div>
                  </div>
                </div>

                <div 
                  onClick={() => setType('video')}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${type === 'video' ? 'var(--primary)' : 'var(--border-light)'}`,
                    background: type === 'video' ? 'var(--primary-light)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem'
                  }}
                >
                  <Video size={18} color={type === 'video' ? 'var(--primary)' : 'var(--text-secondary)'} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: type === 'video' ? 'var(--primary)' : 'var(--text-primary)' }}>Video</div>
                    <div className="meta" style={{ fontSize: '0.75rem' }}>MP4, WebM, etc.</div>
                  </div>
                </div>

                <div 
                  onClick={() => setType('pdf')}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${type === 'pdf' ? 'var(--primary)' : 'var(--border-light)'}`,
                    background: type === 'pdf' ? 'var(--primary-light)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem'
                  }}
                >
                  <BookOpen size={18} color={type === 'pdf' ? 'var(--primary)' : 'var(--text-secondary)'} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: type === 'pdf' ? 'var(--primary)' : 'var(--text-primary)' }}>Book / PDF</div>
                    <div className="meta" style={{ fontSize: '0.75rem' }}>Documents</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Welcome to the Q4 Portal Release!"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description / Body */}
            <div className="form-group">
              <label className="form-label">
                {type === 'announcement' ? 'Announcement Message' : 'Description / Notes (Optional)'}
              </label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder={type === 'announcement' ? 'Write your announcement here...' : 'Add context or key takeaways about this resource...'}
                value={body}
                onChange={e => setBody(e.target.value)}
                required={type === 'announcement'}
              />
            </div>

            {/* File Upload for Video and PDF */}
            {type !== 'announcement' && (
              <div className="form-group">
                <label className="form-label">
                  Attach {type === 'video' ? 'Video File' : 'PDF Document'}
                </label>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept={type === 'video' ? 'video/*' : 'application/pdf'} 
                  onChange={e => handleFileChange(e.target.files[0])} 
                  style={{ display: 'none' }}
                />

                {!file ? (
                  <div 
                    className={`dropzone ${isDragging ? 'active' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="dropzone-icon">
                      <UploadCloud size={24} />
                    </div>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                      Click to upload or drag and drop
                    </h4>
                    <p className="meta">
                      {type === 'video' ? 'Supports MP4, WebM, MOV' : 'Supports PDF documents'}
                    </p>
                  </div>
                ) : (
                  <div 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      background: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div 
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {type === 'video' ? <Video size={18} /> : <FileText size={18} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{file.name}</div>
                        <div className="meta" style={{ fontSize: '0.75rem' }}>
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      className="btn-icon btn-sm"
                      onClick={() => { setFile(null); setFilePreview(null) }}
                      title="Remove file"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Video Preview if selected */}
                {filePreview && (
                  <div className="video-wrapper" style={{ marginTop: '1rem' }}>
                    <video src={filePreview} controls />
                  </div>
                )}
              </div>
            )}

            {/* Progress Bar when uploading */}
            {busy && progress > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span className="meta">Publishing post...</span>
                  <span className="meta">{progress}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--border-light)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${progress}%`, 
                      height: '100%', 
                      background: 'var(--primary)', 
                      transition: 'width 200ms ease' 
                    }} 
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Link href="/admin" className="btn btn-secondary">
                Cancel
              </Link>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={busy}
              >
                <Sparkles size={16} />
                <span>{busy ? 'Publishing...' : 'Publish Post'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
