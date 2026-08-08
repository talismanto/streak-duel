import React, { useState } from 'react';
import { X, ShieldCheck, Trash2, AlertTriangle, Crown } from 'lucide-react';

export function AdminPanelModal({ profiles, myDeviceId, onRemoveProfile, onClose }) {
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);
  const [removing, setRemoving] = useState(false);

  const otherProfiles = Object.values(profiles).filter(p => p.id !== myDeviceId);
  const myProfile     = profiles[myDeviceId];

  const handleRemove = async (profileId) => {
    setRemoving(true);
    await onRemoveProfile(profileId);
    setConfirmRemoveId(null);
    setRemoving(false);
  };

  const THEME_COLORS = {
    cyan:    '#06b6d4',
    orange:  '#f97316',
    purple:  '#a855f7',
    emerald: '#10b981',
    rose:    '#f43f5e',
    gold:    '#eab308'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>

        {/* Header */}
        <div className="modal-header">
          <h3>
            <ShieldCheck size={20} color="#eab308" />
            Admin Panel
          </h3>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Admin identity badge */}
        <div style={{
          background: 'rgba(234,179,8,0.08)',
          border: '1px solid rgba(234,179,8,0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Crown size={20} color="#eab308" />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>You are the Admin</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              You can remove other players from the duel at any time.
            </div>
          </div>
        </div>

        {/* Other players list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Players in this Duel
          </div>

          {otherProfiles.length === 0 && (
            <div style={{ fontSize: '0.88rem', color: '#64748b', padding: '12px', textAlign: 'center' }}>
              No other players have joined yet. Share the invite link so your friend can join!
            </div>
          )}

          {otherProfiles.map(profile => {
            const themeColor = THEME_COLORS[profile.colorTheme] || '#06b6d4';
            const isConfirming = confirmRemoveId === profile.id;

            return (
              <div key={profile.id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${isConfirming ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'border-color 0.2s'
              }}>
                {/* Avatar */}
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `2px solid ${themeColor}`,
                    flexShrink: 0
                  }}
                />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {profile.name}
                    <span style={{ background: `${themeColor}22`, color: themeColor, fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                      🔥 {profile.currentStreak || 0} day streak
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{profile.tagline || 'Streak competitor'}</div>
                </div>

                {/* Remove action */}
                {!isConfirming ? (
                  <button
                    onClick={() => setConfirmRemoveId(profile.id)}
                    style={{
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      color: '#f87171',
                      borderRadius: '10px',
                      padding: '7px 12px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0,
                      transition: 'all 0.2s'
                    }}
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.72rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                      <AlertTriangle size={12} /> Are you sure?
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setConfirmRemoveId(null)}
                        disabled={removing}
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#94a3b8',
                          borderRadius: '8px',
                          padding: '5px 10px',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 700
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRemove(profile.id)}
                        disabled={removing}
                        style={{
                          background: 'rgba(239,68,68,0.8)',
                          border: 'none',
                          color: '#fff',
                          borderRadius: '8px',
                          padding: '5px 10px',
                          cursor: removing ? 'wait' : 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 800
                        }}
                      >
                        {removing ? 'Removing...' : 'Yes, Remove'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Note */}
        <div style={{ fontSize: '0.75rem', color: '#475569', textAlign: 'center' }}>
          Removing a player deletes their profile and streak data from the duel permanently.
        </div>

        <button className="icon-btn" onClick={onClose} style={{ alignSelf: 'flex-end' }}>Close</button>
      </div>
    </div>
  );
}
