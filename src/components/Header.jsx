import React, { useState, useEffect } from 'react';
import { Flame, Clock, Settings, Database, RefreshCw, Zap, ShieldAlert } from 'lucide-react';
import { getTimeUntilMidnight } from '../services/streakEngine';

export function Header({ 
  habit, 
  activeUserId, 
  users, 
  onSwitchUser, 
  onOpenHabitModal, 
  onOpenSupabaseModal, 
  onOpenTimeTravelModal,
  simulatedDateOffset
}) {
  const [countdown, setCountdown] = useState(getTimeUntilMidnight().formatted);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnight().formatted);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeUser = users[activeUserId] || users.user_a;

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
          <button className="icon-btn" onClick={onOpenTimeTravelModal} title="Time Travel & Debug strict midnight resets">
            <Clock size={16} />
            <span>Time Travel</span>
            {simulatedDateOffset > 0 && (
              <span style={{ background: '#eab308', color: '#000', borderRadius: '10px', padding: '1px 6px', fontSize: '0.7rem', fontWeight: 800 }}>
                +{simulatedDateOffset}d
              </span>
            )}
          </button>

          <button className="icon-btn" onClick={onOpenSupabaseModal} title="Supabase Database Integration SQL & Guide">
            <Database size={16} />
            <span>Cloud SQL</span>
          </button>
        </div>
      </div>

      {/* User Switch Bar */}
      <div className="user-switch-bar">
        <div className="current-actor-label">
          <ShieldAlert size={14} color="#06b6d4" />
          <span>Active Device Actor: <strong>{activeUser.name}</strong></span>
        </div>

        <div className="user-selector-pills">
          <button 
            className={`pill-btn cyan ${activeUserId === 'user_a' ? 'active' : ''}`}
            onClick={() => onSwitchUser('user_a')}
          >
            ⚡ {users.user_a.name}
          </button>

          <button 
            className={`pill-btn orange ${activeUserId === 'user_b' ? 'active' : ''}`}
            onClick={() => onSwitchUser('user_b')}
          >
            🔥 {users.user_b.name}
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
