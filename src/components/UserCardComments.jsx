import React, { useState, useRef } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, Send, Camera, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { compressImage } from '../services/storageAdapter';

export function UserCardComments({ 
  targetUser, 
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

  // Filter comments specifically for THIS target user
  const userComments = (comments || []).filter(c => c.targetUserId === targetUser.id || (!c.targetUserId && c.authorId === targetUser.id));
  const recentComments = userComments.slice(0, 2);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setUploading(true);
    try {
      const compressed = await compressImage(file, 600, 0.7);
      setImageUrl(compressed);
    } catch (err) {
      console.warn('Image compression error:', err);
    }
    setUploading(false);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() && !imageUrl) return;
    if (!myProfile) return;

    const newComment = {
      id:           'cmt_' + Math.random().toString(36).substring(2, 11),
      targetUserId: targetUser.id, // Direct comment to THIS person
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
        background: 'rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '6px'
      }}
    >
      {/* Clickable Header Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={16} color="#06b6d4" />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
            Comments on {targetUser.name}
          </span>
          <span style={{ background: 'rgba(6,182,212,0.2)', color: '#38bdf8', fontSize: '0.68rem', padding: '1px 7px', borderRadius: '10px', fontWeight: 700 }}>
            {userComments.length}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>
          <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Collapsed Mode Preview (Show top 2 comments for THIS user) */}
      {!isExpanded && recentComments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {recentComments.map((c) => (
            <div 
              key={c.id} 
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '8px',
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.78rem'
              }}
            >
              <img src={c.authorAvatar} alt={c.authorName} style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span style={{ fontWeight: 800, color: '#06b6d4', marginRight: '4px' }}>{c.authorName}:</span>
                <span style={{ color: '#cbd5e1' }}>{c.text || (c.imageUrl ? '📷 Photo attached' : '')}</span>
              </div>
              {c.imageUrl && <ImageIcon size={12} color="#f97316" />}
            </div>
          ))}
        </div>
      )}

      {/* Expanded Mode: Full Comments List & Input Box */}
      {isExpanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
          
          {/* Comments List for THIS user */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '260px', overflowY: 'auto', paddingRight: '2px' }}>
            {userComments.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.78rem', padding: '10px 0' }}>
                No comments on {targetUser.name} yet. Leave a message or cheering photo!
              </div>
            ) : (
              userComments.map((c) => (
                <div 
                  key={c.id} 
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <img src={c.authorAvatar} alt={c.authorName} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #06b6d4' }} />
                      <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#fff' }}>{c.authorName}</span>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {c.authorId === myDeviceId && (
                      <button 
                        onClick={() => onDeleteComment(c.id)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                        title="Delete Comment"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>

                  {c.text && (
                    <p style={{ fontSize: '0.82rem', color: '#e2e8f0', margin: 0, lineHeight: 1.35 }}>
                      {c.text}
                    </p>
                  )}

                  {c.imageUrl && (
                    <div style={{ borderRadius: '8px', overflow: 'hidden', maxHeight: '180px', width: '100%', border: '1px solid rgba(255,255,255,0.1)', marginTop: '2px' }}>
                      <img src={c.imageUrl} alt="Attached photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Comment Input Box */}
          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            
            {/* Image Preview Attachment */}
            {imageUrl && (
              <div style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #06b6d4' }}>
                <img src={imageUrl} alt="Attachment preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  style={{ position: 'absolute', top: '3px', right: '3px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={10} />
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="text"
                className="form-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Comment on ${targetUser.name}...`}
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.82rem' }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', color: '#06b6d4', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="Attach Photo"
              >
                <Camera size={16} />
              </button>

              <button
                type="submit"
                className="icon-btn primary"
                style={{ height: '36px', padding: '0 12px', background: 'linear-gradient(135deg, #06b6d4, #0284c7)' }}
              >
                <Send size={14} />
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
