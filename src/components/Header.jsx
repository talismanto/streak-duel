import React, { useState, useEffect } from 'react';
import { Flame, Clock, Settings, Share2, ShieldCheck, Crown } from 'lucide-react';
import { getTimeUntilMidnight } from '../services/streakEngine';

export function Header({ 
  habit, 
  myProfile,
  onOpenEditProfile,
  onOpenHabitModal, 
  onOpenInviteModal,
  onOpenAdminPanel
}) {
  const [countdown, setCountdown] = useState(getTimeUntilMidnight().formatted);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnight().formatted);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isAdmin = myProfile?.isAdmin || false;

  return (
    <header className="app-header">
      <div className="header-top">
        {/* Brand */}
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

        {/* Controls */}
        <div className="header-controls">

          {/* Invite button */}
          <button
            className="icon-btn"
            onClick={onOpenInviteModal}
            style={{ color: '#06b6d4', borderColor: 'rgba(6,182,212,0.3)', background: 'rgba(6,182,212,0.08)' }}
          >
            <Share2 size={15} />
            <span>Invite</span>
          </button>

          {/* Admin button — only visible to admin */}
          {isAdmin && (
            <button
              className="icon-btn"
              onClick={onOpenAdminPanel}
              style={{ color: '#eab308', borderColor: 'rgba(234,179,8,0.3)', background: 'rgba(234,179,8,0.08)' }}
              title="Admin Panel — manage players"
            >
              <Crown size={15} />
              <span>Admin</span>
            </button>
          )}

          {/* Profile pill */}
          {myProfile && (
            <button className="profile-pill" onClick={onOpenEditProfile} title="Edit your profile">
              <img
                src={myProfile.avatar}
                alt={myProfile.name}
                className="profile-pill-avatar"
              />
              <span className="profile-pill-name">{myProfile.name}</span>
              {isAdmin && <Crown size={11} color="#eab308" />}
              <Settings size={12} color="#94a3b8" />
            </button>
          )}
        </div>
      </div>

      {/* Countdown */}
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
