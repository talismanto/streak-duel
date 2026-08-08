import React, { useState, useRef } from 'react';
import { X, Camera, Flame, MessageSquare, Image, Check } from 'lucide-react';
import { compressImage } from '../services/storageAdapter';

export function CheckinNoteModal({ user, onConfirmCheckin, onClose }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setUploading(true);
    try {
      const compressed = await compressImage(file, 600, 0.7);
      setImage(compressed);
    } catch (err) {
      console.warn('Image compression error:', err);
    }
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmCheckin({
      text: text.trim(),
      imageUrl: image
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3>
            <Flame size={22} color="#f97316" />
            <span>Daily Check-In Note & Proof</span>
          </h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* User Info Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.04)', padding: '10px 14px', borderRadius: '14px' }}>
            <img src={user.avatar} alt={user.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #06b6d4' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Completing today's habit streak</div>
            </div>
          </div>

          {/* Text Note */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={15} color="#06b6d4" />
              <span>Add a note or comment <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></span>
            </label>
            <textarea
              className="form-input"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Completed 30 mins leg workout, felt awesome! 💪"
            />
          </div>

          {/* Photo Proof Upload */}
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Camera size={15} color="#f97316" />
              <span>Attach Photo Proof <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></span>
            </label>

            {image ? (
              <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img src={image} alt="Proof preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => setImage('')}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px dashed rgba(255,255,255,0.15)',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                <Camera size={24} color="#f97316" />
                <span>{uploading ? 'Processing photo...' : 'Tap to take or upload a photo'}</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          <button
            type="submit"
            className="giant-tick-btn can-tick orange"
            style={{ marginTop: '8px' }}
          >
            <Check size={20} />
            <span>Complete & Post Check-In!</span>
          </button>
        </form>
      </div>
    </div>
  );
}
