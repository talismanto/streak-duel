import React from 'react';
import { Flame, Trophy, CheckCircle2, Hourglass, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export function UserCard({ 
  user, 
  activeUserId, 
  onTick, 
  onSwitchUser 
}) {
  const isActor = activeUserId === user.id;
  const isTicked = user.isTickedToday;

  const handleTickClick = () => {
    if (!isActor) {
      onSwitchUser(user.id);
      return;
    }
    if (isTicked) return;

    // Trigger audio celebration tone using Web Audio API
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      // Audio fallback
    }

    // Trigger celebratory confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    onTick(user.id);
  };

  return (
    <div className={`user-card ${user.colorTheme}-theme ${isActor ? 'is-active-actor' : ''}`}>
      {/* Header */}
      <div className="card-user-header">
        <div className="user-profile-info">
          <div className="avatar-wrapper">
            <img src={user.avatar} alt={user.name} className="user-avatar-img" />
          </div>
          <div className="user-meta">
            <h3>{user.name}</h3>
            <span className="user-tagline">{user.tagline}</span>
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

      {/* Tick Action Button */}
      <div className="tick-action-wrapper">
        {isTicked ? (
          <button className="giant-tick-btn ticked-already" disabled>
            <CheckCircle2 size={20} />
            <span>Checked In For Today!</span>
          </button>
        ) : isActor ? (
          <button className={`giant-tick-btn can-tick ${user.colorTheme}`} onClick={handleTickClick}>
            <Flame size={20} />
            <span>TICK FOR TODAY (+1)</span>
          </button>
        ) : (
          <button className="giant-tick-btn disabled-actor" onClick={handleTickClick}>
            <span>Switch to {user.name} to Tick</span>
            <ArrowRight size={16} />
          </button>
        )}

        {!isActor && (
          <div className="actor-switch-hint">
            Logged in as {activeUserId === 'user_a' ? 'Alex' : 'Sam'}. Click button to switch actor to {user.name}.
          </div>
        )}
      </div>
    </div>
  );
}
