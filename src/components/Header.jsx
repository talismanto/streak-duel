import React, { useState, useEffect } from 'react';
import { Flame, Clock, Settings, Database, Share2 } from 'lucide-react';
import { getTimeUntilMidnight } from '../services/streakEngine';

export function Header({ 
  habit, 
  myProfile,
  onOpenEditProfile,
  onOpenHabitModal, 
  onOpenSupabaseModal,
  onOpenInviteModal 
}) {
  const [countdown, setCountdown] = useState(getTimeUntilMidnight().formatted);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnight().formatted);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand-badge">
          <div className="brand-icon-wrapper">
            <Flame size={22} />
          </div>
          <div className="brand-title-group">
            <h1>StreakDuel</h1>
            <button className="habit-tag" onClick={onOpenHabitModal} title="Tap to customize habit">
              <Settings size={12} />
              {habit.title}
            </button>
          </div>
        </div>

        <div className="header-controls">
          <button
            className="icon-btn"
            onClick={onOpenInviteModal}
            style={{ color: '#06b6d4', borderColor: 'rgba(6,182,212,0.3)', background: 'rgba(6,182,212,0.08)' }}
          >
            <Share2 size={15} />
            <span>Invite</span>
          </button>

          {myProfile && (
            <button className="profile-pill" onClick={onOpenEditProfile} title="Edit your profile">
              <img
                src={myProfile.avatar}
                alt={myProfile.name}
                className="profile-pill-avatar"
              />
              <span className="profile-pill-name">{myProfile.name}</span>
              <Settings size={12} color="#94a3b8" />
            </button>
          )}
        </div>
      </div>

      {/* Midnight Countdown */}
      <div className="countdown-banner">
        <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
          ⏰ Daily window closes at midnight
        </span>
        <div className="countdown-timer">
          <Clock size={15} />
          <span>{countdown}</span>
        </div>
      </div>
    </header>
  );
}
