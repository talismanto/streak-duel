import React, { useState, useRef } from 'react';
import { Camera, Check, User, Pen } from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
];

const THEMES = [
  { key: 'cyan',    label: 'Cyan',    emoji: '⚡', color: '#06b6d4' },
  { key: 'orange',  label: 'Orange',  emoji: '🔥', color: '#f97316' },
  { key: 'purple',  label: 'Purple',  emoji: '💜', color: '#a855f7' },
  { key: 'emerald', label: 'Green',   emoji: '🌿', color: '#10b981' },
  { key: 'rose',    label: 'Rose',    emoji: '🌸', color: '#f43f5e' },
  { key: 'gold',    label: 'Gold',    emoji: '👑', color: '#eab308' }
];

export function ProfileBuilder({ existingProfile, onSave, isEditMode = false }) {
  const [name, setName] = useState(existingProfile?.name || '');
  const [tagline, setTagline] = useState(existingProfile?.tagline || '');
  const [colorTheme, setColorTheme] = useState(existingProfile?.colorTheme || 'cyan');
  const [avatar, setAvatar] = useState(existingProfile?.avatar || PRESET_AVATARS[0]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setAvatar(evt.target.result);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), tagline: tagline.trim(), colorTheme, avatar });
  };

  const selectedTheme = THEMES.find(t => t.key === colorTheme);

  return (
    <div className={isEditMode ? '' : 'profile-builder-screen'}>
      <div className={isEditMode ? '' : 'profile-builder-card'}>
        {!isEditMode && (
          <div>
            <span className="step-label">Step 1 of 1 — Create Your Profile</span>
            <h2>
              <User size={22} color="#06b6d4" />
              Build Your Duel Identity
            </h2>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Avatar Upload */}
          <div className="avatar-upload-area">
            <div className="avatar-upload-ring" onClick={() => fileInputRef.current?.click()}>
              <img
                src={avatar}
                alt="Profile"
                className="avatar-upload-img"
                style={{ border: `3px solid ${selectedTheme?.color || '#06b6d4'}`, boxShadow: `0 0 20px ${selectedTheme?.color || '#06b6d4'}55` }}
              />
              <div className="avatar-upload-overlay">
                <Camera size={20} color="#fff" />
                <span>{uploading ? 'Uploading...' : 'Change Photo'}</span>
              </div>
            </div>

            <div className="avatar-upload-hint">
              Tap your photo to upload from camera or gallery
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />

            {/* Preset Avatars */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {PRESET_AVATARS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  className={`avatar-preset-btn ${avatar === url ? 'selected' : ''}`}
                  onClick={() => setAvatar(url)}
                  style={{ borderColor: avatar === url ? selectedTheme?.color : 'transparent' }}
                >
                  <img src={url} alt={`preset ${i}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alex, Jordan, Sam..."
              maxLength={20}
              required
            />
          </div>

          {/* Tagline */}
          <div className="form-group">
            <label>Tagline / Motto <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label>
            <input
              type="text"
              className="form-input"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              placeholder="e.g. Never miss a day 💪"
              maxLength={35}
            />
          </div>

          {/* Color Theme */}
          <div className="form-group">
            <label>Card Color Theme</label>
            <div className="theme-picker">
              {THEMES.map((theme) => (
                <button
                  key={theme.key}
                  type="button"
                  className="theme-option"
                  onClick={() => setColorTheme(theme.key)}
                  style={{
                    borderColor: colorTheme === theme.key ? theme.color : 'transparent',
                    background: colorTheme === theme.key ? `${theme.color}22` : 'rgba(255,255,255,0.04)',
                    color: colorTheme === theme.key ? theme.color : '#94a3b8'
                  }}
                >
                  <div className="theme-dot" style={{ background: theme.color }} />
                  {theme.emoji} {theme.label}
                  {colorTheme === theme.key && <Check size={10} />}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="giant-tick-btn can-tick"
            style={{
              background: `linear-gradient(135deg, ${selectedTheme?.color}, ${selectedTheme?.color}aa)`,
              boxShadow: `0 8px 25px ${selectedTheme?.color}55`,
              color: colorTheme === 'gold' ? '#000' : '#fff',
              fontSize: '1rem',
              marginTop: '4px'
            }}
          >
            {isEditMode ? <Pen size={18} /> : <Check size={18} />}
            <span>{isEditMode ? 'Save Changes' : 'Start Dueling!'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
