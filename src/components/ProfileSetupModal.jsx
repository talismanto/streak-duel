import React, { useState } from 'react';
import { User, Sparkles, Check, Flame } from 'lucide-react';

export function ProfileSetupModal({ currentProfile, onSaveProfile, onClose, isFirstTime = false }) {
  const [name, setName] = useState(currentProfile?.name || '');
  const [tagline, setTagline] = useState(currentProfile?.tagline || 'Daily Streak Competitor');
  const [colorTheme, setColorTheme] = useState(currentProfile?.colorTheme || 'cyan');
  const [avatar, setAvatar] = useState(
    currentProfile?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );

  const avatarOptions = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSaveProfile({
      name: name.trim(),
      tagline: tagline.trim(),
      colorTheme,
      avatar
    });
    if (onClose) onClose();
  };

  return (
    <div className="modal-overlay" onClick={isFirstTime ? undefined : onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <User size={20} color="#06b6d4" />
            <span>{isFirstTime ? 'Setup Your Device Profile' : 'Edit Profile Settings'}</span>
          </h3>
          {!isFirstTime && onClose && (
            <button className="close-btn" onClick={onClose}>✕</button>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Your Name / Display Name</label>
            <input 
              type="text" 
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex or Sam"
              required 
            />
          </div>

          <div className="form-group">
            <label>Tagline / Motto</label>
            <input 
              type="text" 
              className="form-input"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Morning Runner or 100 Days Goal"
            />
          </div>

          <div className="form-group">
            <label>Card Color Theme</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className={`pill-btn cyan ${colorTheme === 'cyan' ? 'active' : ''}`}
                style={{ flex: 1, padding: '10px' }}
                onClick={() => setColorTheme('cyan')}
              >
                Cyan Glow ⚡
              </button>
              <button
                type="button"
                className={`pill-btn orange ${colorTheme === 'orange' ? 'active' : ''}`}
                style={{ flex: 1, padding: '10px' }}
                onClick={() => setColorTheme('orange')}
              >
                Orange Flame 🔥
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Choose Avatar</label>
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '4px 0' }}>
              {avatarOptions.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Avatar ${idx}`}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: avatar === url ? '3px solid #06b6d4' : '2px solid transparent',
                    boxShadow: avatar === url ? '0 0 10px rgba(6,182,212,0.5)' : 'none'
                  }}
                  onClick={() => setAvatar(url)}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" className="icon-btn primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              <Check size={18} />
              <span>{isFirstTime ? 'Save & Start Dueling!' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
