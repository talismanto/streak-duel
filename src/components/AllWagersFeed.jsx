import React, { useState } from 'react';
import { Swords, Coins, Check, X, Clock, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { formatDate } from '../services/streakEngine';

export function AllWagersFeed({ 
  wagers, 
  profiles, 
  myDeviceId, 
  onRespondWager, 
  onDeleteWager, 
  onOpenCreateWager 
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'my' | 'active' | 'pending'
  const todayStr = formatDate();

  const filteredWagers = (wagers || []).filter(w => {
    if (filter === 'my') return w.creatorId === myDeviceId || w.targetId === myDeviceId;
    if (filter === 'active') return w.status === 'accepted';
    if (filter === 'pending') return w.status === 'pending';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header & New Wager Action */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Swords size={22} color="#f97316" />
            <span>Community Wagers & Duels</span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
            View all 1-on-1 habit bets and challenge requests between members.
          </p>
        </div>

        <button 
          className="icon-btn primary"
          onClick={onOpenCreateWager}
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)' }}
        >
          <Plus size={16} />
          <span>New Wager Challenge</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `All Wagers (${wagers.length})` },
          { key: 'my', label: 'My Wagers' },
          { key: 'active', label: 'Active Duels' },
          { key: 'pending', label: 'Pending Requests' }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`pill-btn ${filter === f.key ? 'active orange' : ''}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Wagers List */}
      {filteredWagers.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px dashed var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '40px 20px',
          textAlign: 'center',
          color: '#94a3b8'
        }}>
          <Coins size={36} color="#eab308" style={{ marginBottom: '10px', opacity: 0.7 }} />
          <h3>No wagers found in this category</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '6px', color: '#64748b' }}>
            Click "New Wager Challenge" to propose a bet to another player!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
          {filteredWagers.map(wager => {
            const isTarget = wager.targetId === myDeviceId;
            const isCreator = wager.creatorId === myDeviceId;
            const creatorProfile = profiles[wager.creatorId] || { name: wager.creatorName, avatar: wager.creatorAvatar };
            const targetProfile = profiles[wager.targetId] || { name: wager.targetName, avatar: wager.targetAvatar };

            const creatorTicked = creatorProfile.lastTickedDate === todayStr;
            const targetTicked = targetProfile.lastTickedDate === todayStr;

            return (
              <div 
                key={wager.id}
                style={{
                  background: 'var(--bg-card)',
                  border: wager.status === 'accepted' 
                    ? '1px solid rgba(234, 179, 8, 0.35)' 
                    : wager.status === 'pending' 
                      ? '1px solid rgba(249, 115, 22, 0.3)' 
                      : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                {/* Wager Header Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Coins size={18} color="#eab308" />
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                      {wager.wager}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`status-badge ${wager.status === 'accepted' ? 'ticked' : 'pending'}`}>
                      {wager.status === 'accepted' ? '⚔️ ACTIVE DUEL' : wager.status === 'pending' ? '⏳ PENDING' : '❌ DECLINED'}
                    </span>
                    {(isCreator || isTarget) && (
                      <button 
                        onClick={() => onDeleteWager(wager.id)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                        title="Delete Wager"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Challenge Title */}
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                  Habit: <span style={{ color: '#fff' }}>{wager.title}</span>
                </div>

                {/* Competitors Matchup Card */}
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  gap: '10px'
                }}>
                  {/* Creator */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center' }}>
                    <img 
                      src={creatorProfile.avatar} 
                      alt={creatorProfile.name} 
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #06b6d4' }} 
                    />
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{creatorProfile.name}</div>
                    <span style={{ fontSize: '0.72rem', color: creatorTicked ? '#10b981' : '#eab308', fontWeight: 700 }}>
                      {creatorTicked ? '✅ Checked in' : '⏳ Pending today'}
                    </span>
                  </div>

                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 900, color: '#f97316' }}>
                    VS
                  </div>

                  {/* Target */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center' }}>
                    <img 
                      src={targetProfile.avatar} 
                      alt={targetProfile.name} 
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f97316' }} 
                    />
                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{targetProfile.name}</div>
                    <span style={{ fontSize: '0.72rem', color: targetTicked ? '#10b981' : '#eab308', fontWeight: 700 }}>
                      {targetTicked ? '✅ Checked in' : '⏳ Pending today'}
                    </span>
                  </div>
                </div>

                {/* Pending Response Action Bar for Target User */}
                {isTarget && wager.status === 'pending' && (
                  <div style={{
                    background: 'rgba(249, 115, 22, 0.15)',
                    border: '1px solid rgba(249, 115, 22, 0.4)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fef08a' }}>
                      ⚡ {creatorProfile.name} challenged you to this wager!
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => onRespondWager(wager.id, 'declined')}
                        className="icon-btn"
                        style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                      >
                        <X size={14} />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={() => onRespondWager(wager.id, 'accepted')}
                        className="icon-btn primary"
                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                      >
                        <Check size={14} />
                        <span>Accept Wager!</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
