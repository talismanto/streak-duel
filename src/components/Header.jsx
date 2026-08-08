import React, { useState, useEffect } from 'react';
import { Flame, Clock, Settings, Share2, Crown, Swords, LayoutGrid, Plus } from 'lucide-react';
import { getTimeUntilMidnight } from '../services/streakEngine';

export function Header({ 
  habit, 
  myProfile,
  currentTab,
  onTabChange,
  pendingWagersCount = 0,
  onOpenEditProfile,
  onOpenHabitModal, 
  onOpenInviteModal,
  onOpenAdminPanel,
  onOpenCreateWager
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

        {/* Header Navigation Tabs & Controls */}
        <div className="header-controls">

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => onTabChange('dashboard')}
              style={{
                background: currentTab === 'dashboard' ? 'rgba(6,182,212,0.25)' : 'transparent',
                color: currentTab === 'dashboard' ? '#38bdf8' : '#94a3b8',
                border: 'none',
                borderRadius: '9px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <LayoutGrid size={14} />
              <span>Arena</span>
            </button>

            <button
              onClick={() => onTabChange('wagers')}
              style={{
                background: currentTab === 'wagers' ? 'rgba(249,115,22,0.25)' : 'transparent',
                color: currentTab === 'wagers' ? '#fb923c' : '#94a3b8',
                border: 'none',
                borderRadius: '9px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                position: 'relative',
                transition: 'all 0.2s'
              }}
            >
              <Swords size={14} />
              <span>Wagers</span>
              {pendingWagersCount > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  borderRadius: '10px',
                  padding: '1px 6px',
                  marginLeft: '2px'
                }}>
                  {pendingWagersCount}
                </span>
              )}
            </button>
          </div>

          {/* New Wager Button */}
          <button
            className="icon-btn"
            onClick={onOpenCreateWager}
            style={{ color: '#f97316', borderColor: 'rgba(249,115,22,0.3)', background: 'rgba(249,115,22,0.08)' }}
            title="Challenge a player to a wager"
          >
            <Plus size={15} />
            <span>Challenge</span>
          </button>

          {/* Invite button */}
          <button
            className="icon-btn"
            onClick={onOpenInviteModal}
            style={{ color: '#06b6d4', borderColor: 'rgba(6,182,212,0.3)', background: 'rgba(6,182,212,0.08)' }}
          >
            <Share2 size={15} />
            <span>Invite</span>
          </button>

          {/* Admin button */}
          {isAdmin && (
            <button
              className="icon-btn"
              onClick={onOpenAdminPanel}
              style={{ color: '#eab308', borderColor: 'rgba(234,179,8,0.3)', background: 'rgba(234,179,8,0.08)' }}
              title="Admin Panel"
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

      {/* Countdown Banner */}
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
