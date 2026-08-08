import React, { useState, useRef } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, Send, Camera, X, Image as ImageIcon, Trash2 } from 'lucide-react';

export function CommentsBanner({ 
  comments = [], 
  myProfile, 
  myDeviceId, 
  onAddComment, 
  onDeleteComment 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [text, setText]             = useState('');
  const [imageUrl, setImageUrl]     = useState('');
  const [uploading, setUploading]   = useState(false);
  const fileInputRef                = useRef(null);

  const recentComments = comments.slice(0, 2); // Show top 2 comments in collapsed mode

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setImageUrl(evt.target.result);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() && !imageUrl) return;
    if (!myProfile) return;

    const newComment = {
      id:           'cmt_' + Math.random().toString(36).substring(2, 11),
      authorId:     myDeviceId,
      authorName:   myProfile.name,
      authorAvatar: myProfile.avatar || '',
      text:         text.trim(),
      imageUrl:     imageUrl,
      createdAt:    new Date().toISOString()
    };

    onAddComment(newComment);
    setText('');
    setImageUrl('');
  };

  return (
    <div 
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: 'var(--shadow-card)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Banner Clickable Top Header Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(6,182,212,0.4)'
          }}>
            <MessageSquare size={18} />
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Activity & Comments</span>
              <span style={{ background: 'rgba(6,182,212,0.2)', color: '#38bdf8', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                {comments.length}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {isExpanded ? 'Tap to collapse comments' : 'Tap banner to expand & join conversation'}
            </div>
          </div>
        </div>

        <button 
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-subtle)',
            color: '#cbd5e1',
            borderRadius: '10px',
            padding: '6px 12px',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <span>{isExpanded ? 'Collapse' : 'Expand Feed'}</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Collapsed Mode Preview (Show top 2 comments) */}
      {!isExpanded && recentComments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
          {recentComments.map((c) => (
            <div 
              key={c.id} 
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.82rem'
              }}
            >
              <img src={c.authorAvatar} alt={c.authorName} style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span style={{ fontWeight: 800, color: '#06b6d4', marginRight: '6px' }}>{c.authorName}:</span>
                <span style={{ color: '#cbd5e1' }}>{c.text || (c.imageUrl ? '📷 Sent a photo proof' : '')}</span>
              </div>
              {c.imageUrl && <ImageIcon size={14} color="#f97316" />}
            </div>
          ))}
        </div>
      )}

      {/* Expanded Mode: Full Comments List & Input Form */}
      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '6px' }}>
          
          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', padding: '16px 0' }}>
                No comments yet. Be the first to post a message or check-in photo!
              </div>
            ) : (
              comments.map((c) => (
                <div 
                  key={c.id} 
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={c.authorAvatar} alt={c.authorName} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #06b6d4' }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fff' }}>{c.authorName}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>

                    {c.authorId === myDeviceId && (
                      <button 
                        onClick={() => onDeleteComment(c.id)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                        title="Delete Comment"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  {c.text && (
                    <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.4, margin: 0 }}>
                      {c.text}
                    </p>
                  )}

                  {c.imageUrl && (
                    <div style={{ borderRadius: '10px', overflow: 'hidden', maxHeight: '220px', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src={c.imageUrl} alt="Attached proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Comment Input Box */}
          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
            
            {/* Image Preview Attachment */}
            {imageUrl && (
              <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #06b6d4' }}>
                <img src={imageUrl} alt="Attachment preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                className="form-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={myProfile ? `Comment as ${myProfile.name}...` : 'Write a comment...'}
                style={{ flex: 1, padding: '10px 14px', fontSize: '0.88rem' }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', color: '#06b6d4', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="Attach Photo"
              >
                <Camera size={18} />
              </button>

              <button
                type="submit"
                className="icon-btn primary"
                style={{ height: '40px', padding: '0 16px', background: 'linear-gradient(135deg, #06b6d4, #0284c7)' }}
              >
                <Send size={15} />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </form>

        </div>
      )}
    </div>
  );
}
