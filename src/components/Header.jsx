import React, { useState, useEffect } from 'react';
import { Flame, Clock, Settings, User, Database, Zap, Share2 } from 'lucide-react';
import { getTimeUntilMidnight } from '../services/streakEngine';

export function Header({ 
  habit, 
  myProfile,
  onOpenProfileModal,
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
            <Flame size={24} />
          </div>
          <div className="brand-title-group">
            <h1>StreakDuel</h1>
            <button className="habit-tag" onClick={onOpenHabitModal} title="Click to customize daily habit">
              <Zap size={14} />
              {habit.title}
              <Settings size={12} style={{ opacity: 0.7 }} />
            </button>
          </div>
        </div>

        <div className="header-controls">
          <button className="icon-btn" onClick={onOpenInviteModal} style={{ background: 'rgba(6,182,212,0.15)', borderColor: '#06b6d4', color: '#06b6d4' }}>
            <Share2 size={16} />
            <span>Invite Friend</span>
          </button>

          {myProfile && (
            <button className="icon-btn primary" onClick={onOpenProfileModal} title="Edit your device profile">
              <User size={16} />
              <span>{myProfile.name}</span>
              <Settings size={12} />
            </button>
          )}

          <button className="icon-btn" onClick={onOpenSupabaseModal} title="Supabase Database Status">
            <Database size={16} />
            <span>Cloud SQL</span>
          </button>
        </div>
      </div>

      {/* Midnight Reset Countdown */}
      <div className="countdown-banner">
        <span>⏰ <strong>Daily Check-in Window Closes At Midnight:</strong></span>
        <div className="countdown-timer">
          <Clock size={16} />
          <span>{countdown}</span>
        </div>
      </div>
    </header>
  );
}
