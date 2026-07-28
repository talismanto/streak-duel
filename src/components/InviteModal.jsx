import React, { useState } from 'react';
import { Share2, Copy, Check, X, QrCode } from 'lucide-react';

export function InviteModal({ onClose }) {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Daily Habit Streak Duel!',
          text: 'Compete with me on our daily habit streak! Who will hold the streak longest?',
          url: currentUrl,
        });
      } catch (err) {}
    } else {
      handleCopy();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Share2 size={20} color="#06b6d4" />
            <span>Invite Friend to StreakDuel</span>
          </h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlignment: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
            Send this website link to your friend! Once they open it on their phone, they can create their profile and start dueling with you in real time!
          </p>

          <div className="form-group">
            <label>Your Website Link</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="form-input" 
                value={currentUrl} 
                readOnly 
                style={{ flex: 1, fontSize: '0.85rem' }} 
              />
              <button className="icon-btn primary" onClick={handleCopy}>
                {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {typeof navigator !== 'undefined' && navigator.share && (
            <button className="icon-btn" onClick={handleNativeShare} style={{ background: 'linear-gradient(135deg, #06b6d4, #a855f7)', color: '#fff', border: 'none', padding: '14px', justifyContent: 'center' }}>
              <Share2 size={18} />
              <span>Share via WhatsApp / Messages</span>
            </button>
          )}

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              💡 Both devices will sync live via Supabase Cloud DB!
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button className="icon-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
