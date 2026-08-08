import React, { useState } from 'react';
import { X, Swords, Coins, Check, User } from 'lucide-react';

export function CreateWagerModal({ profiles, myDeviceId, myProfile, onSendWager, onClose }) {
  const otherProfiles = Object.values(profiles || {}).filter(p => p.id !== myDeviceId);
  
  const [targetId, setTargetId] = useState(otherProfiles[0]?.id || '');
  const [title, setTitle]       = useState('Daily 30-Min Fitness Workout');
  const [wager, setWager]       = useState('☕ Loser buys coffee');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetId) return;

    const targetProfile = profiles[targetId];
    if (!targetProfile) return;

    const newWager = {
      id:            'wager_' + Math.random().toString(36).substring(2, 11),
      creatorId:     myDeviceId,
      creatorName:   myProfile?.name || 'Challenger',
      creatorAvatar: myProfile?.avatar || '',
      targetId:      targetProfile.id,
      targetName:    targetProfile.name,
      targetAvatar:  targetProfile.avatar || '',
      title:         title.trim(),
      wager:         wager.trim() || '☕ Loser buys coffee',
      status:        'pending',
      createdAt:     new Date().toISOString()
    };

    onSendWager(newWager);
    onClose();
  };

  const presetWagers = [
    '☕ Loser buys coffee',
    '🍕 Loser buys dinner',
    '🥤 Loser buys Boba tea',
    '💵 $10 Cash wager',
    '💵 $20 Stakes',
    '🧹 Loser does dishes / chores',
    '💪 50 Punishment pushups',
    '🍦 Loser buys ice cream'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3>
            <Swords size={22} color="#f97316" />
            <span>Challenge a Player to a Wager</span>
          </h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {otherProfiles.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
            <p style={{ fontSize: '0.95rem', marginBottom: '10px' }}>No other players have joined yet!</p>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Share your invite link with a friend so they can create a profile and accept your wager challenge.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Target Player Selector */}
            <div className="form-group">
              <label>Select Opponent</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                {otherProfiles.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setTargetId(p.id)}
                    style={{
                      background: targetId === p.id ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255,255,255,0.04)',
                      border: targetId === p.id ? '2px solid #f97316' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      color: '#fff',
                      transition: 'all 0.2s'
                    }}
                  >
                    <img 
                      src={p.avatar} 
                      alt={p.name} 
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Streak: 🔥 {p.currentStreak || 0}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Habit Title */}
            <div className="form-group">
              <label>Challenge Habit / Title</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Daily 30-Min Gym Workout"
                required
              />
            </div>

            {/* Wager / Stakes */}
            <div className="form-group">
              <label style={{ color: '#eab308', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Coins size={16} />
                <span>Wager / Stakes</span>
              </label>
              <input
                type="text"
                className="form-input"
                style={{ borderColor: 'rgba(234, 179, 8, 0.4)', background: 'rgba(0,0,0,0.4)', fontWeight: 700 }}
                value={wager}
                onChange={(e) => setWager(e.target.value)}
                placeholder="e.g. ☕ Loser buys coffee"
                required
              />

              {/* Preset Wager Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                {presetWagers.map((w) => (
                  <button
                    type="button"
                    key={w}
                    onClick={() => setWager(w)}
                    style={{
                      background: wager === w ? 'rgba(234, 179, 8, 0.25)' : 'rgba(0,0,0,0.3)',
                      border: wager === w ? '1px solid #eab308' : '1px solid rgba(255,255,255,0.1)',
                      color: wager === w ? '#fef08a' : '#cbd5e1',
                      borderRadius: '20px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="giant-tick-btn can-tick orange"
              style={{ marginTop: '10px' }}
            >
              <Swords size={18} />
              <span>Send Wager Challenge</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
