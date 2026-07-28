import React from 'react';
import { Flame, Trophy, CheckCircle2, Hourglass, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

export function UserCard({ 
  user, 
  myDeviceId, 
  onTick 
}) {
  const isMyProfile = user.id === myDeviceId;
  const isTicked = user.isTickedToday;

  const handleTickClick = () => {
    if (!isMyProfile || isTicked) return;

    // Confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    onTick(user);
  };

  return (
    <div className={`user-card ${user.colorTheme || 'cyan'}-theme ${isMyProfile ? 'is-active-actor' : ''}`}>
      {/* Header */}
      <div className="card-user-header">
        <div className="user-profile-info">
          <div className="avatar-wrapper">
            <img src={user.avatar} alt={user.name} className="user-avatar-img" />
          </div>
          <div className="user-meta">
            <h3>
              {user.name} {isMyProfile && <span style={{ fontSize: '0.75rem', background: 'rgba(6,182,212,0.2)', color: '#06b6d4', padding: '2px 8px', borderRadius: '10px' }}>(You)</span>}
            </h3>
            <span className="user-tagline">{user.tagline || 'Daily Streak Competitor'}</span>
          </div>
        </div>

        <div className={`status-badge ${isTicked ? 'ticked' : 'pending'}`}>
          {isTicked ? (
            <>
              <CheckCircle2 size={14} />
              <span>Ticked ✅</span>
            </>
          ) : (
            <>
              <Hourglass size={14} />
              <span>Pending ⏳</span>
            </>
          )}
        </div>
      </div>

      {/* Main Streak Meter */}
      <div className="streak-stat-box">
        <Flame className="flame-icon-animated" size={40} />
        <div className="streak-number-giant">{user.currentStreak || 0}</div>
        <div className="streak-label">Day Streak</div>

        <div className="best-streak-pill">
          <Trophy size={14} />
          <span>All-Time Best: <strong>{user.bestStreak || 0} Days</strong></span>
        </div>
      </div>

      {/* Action Button */}
      <div className="tick-action-wrapper">
        {isTicked ? (
          <button className="giant-tick-btn ticked-already" disabled>
            <CheckCircle2 size={20} />
            <span>Checked In For Today!</span>
          </button>
        ) : isMyProfile ? (
          <button className={`giant-tick-btn can-tick ${user.colorTheme || 'cyan'}`} onClick={handleTickClick}>
            <Flame size={20} />
            <span>TICK FOR TODAY (+1)</span>
          </button>
        ) : (
          <button className="giant-tick-btn disabled-actor" disabled style={{ cursor: 'default', opacity: 0.8 }}>
            <Hourglass size={18} />
            <span>Waiting for {user.name} to check in</span>
          </button>
        )}
      </div>
    </div>
  );
}
