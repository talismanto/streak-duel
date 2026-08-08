import React, { useState } from 'react';
import { Flame, Trophy, CheckCircle2, Hourglass } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CheckinNoteModal } from './CheckinNoteModal';
import { UserCardComments } from './UserCardComments';

export function UserCard({ 
  user, 
  myDeviceId, 
  myProfile,
  comments = [],
  onTick,
  onAddComment,
  onDeleteComment
}) {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const isMyProfile = user.id === myDeviceId;
  const isTicked = user.isTickedToday;

  const handleTickClick = () => {
    if (!isMyProfile || isTicked) return;
    setShowNoteModal(true);
  };

  const handleConfirmCheckin = (checkinData) => {
    // Mobile haptic vibration feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([40, 60, 40]); } catch (e) {}
    }

    // Confetti celebration burst
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    onTick(user, checkinData);
  };

  // Streak milestone badge calculation
  const getStreakBadge = (streak) => {
    if (streak >= 30) return { title: '👑 Legend', color: '#eab308' };
    if (streak >= 14) return { title: '🛡️ Iron Discipline', color: '#a855f7' };
    if (streak >= 7) return { title: '⚡ Weekly Master', color: '#06b6d4' };
    if (streak >= 3) return { title: '🔥 On Fire!', color: '#f97316' };
    return null;
  };

  const badge = getStreakBadge(user.currentStreak || 0);

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

        {badge && (
          <div style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${badge.color}`, color: badge.color, padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, marginTop: '2px' }}>
            {badge.title}
          </div>
        )}

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

      {/* Dedicated Per-Person Comments Section */}
      <UserCardComments
        targetUser={user}
        comments={comments}
        myProfile={myProfile}
        myDeviceId={myDeviceId}
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
      />

      {/* Checkin Note Modal */}
      {showNoteModal && (
        <CheckinNoteModal
          user={user}
          onConfirmCheckin={handleConfirmCheckin}
          onClose={() => setShowNoteModal(false)}
        />
      )}
    </div>
  );
}
