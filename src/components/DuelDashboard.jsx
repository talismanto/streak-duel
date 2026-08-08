import React from 'react';
import { UserCard } from './UserCard';
import { getLeaderboardStatus, formatDate } from '../services/streakEngine';
import { Coins, Edit3, AlertCircle, CheckCircle2, Flame } from 'lucide-react';

export function DuelDashboard({ 
  profiles, 
  myDeviceId, 
  onTick,
  habit,
  onOpenHabitModal
}) {
  const profileList = Object.values(profiles || {});

  let leaderboard = {
    headline: '🔥 Habit Streak Duel',
    subtext: 'Set up your profile on your device to compete!'
  };

  if (profileList.length >= 2) {
    leaderboard = getLeaderboardStatus(profileList[0], profileList[1]);
  } else if (profileList.length === 1) {
    const single = profileList[0];
    leaderboard = {
      headline: `⚡ Welcome ${single.name}! You are on a ${single.currentStreak || 0}-day streak!`,
      subtext: 'Share your website link with a friend so they can join the competition!'
    };
  }

  // Calculate Wager Risk Status
  let wagerRiskText = null;
  let wagerStatusIcon = null;
  const currentWager = habit?.wager || '☕ Loser buys coffee';

  if (profileList.length >= 2) {
    const todayStr = formatDate();
    const p1 = profileList[0];
    const p2 = profileList[1];
    const p1Ticked = p1.lastTickedDate === todayStr;
    const p2Ticked = p2.lastTickedDate === todayStr;

    if (p1Ticked && !p2Ticked) {
      wagerRiskText = `⚠️ ${p2.name} hasn't completed today's habit yet! On the hook for: ${currentWager}`;
      wagerStatusIcon = <AlertCircle size={18} color="#f97316" />;
    } else if (p2Ticked && !p1Ticked) {
      wagerRiskText = `⚠️ ${p1.name} hasn't completed today's habit yet! On the hook for: ${currentWager}`;
      wagerStatusIcon = <AlertCircle size={18} color="#f97316" />;
    } else if (p1Ticked && p2Ticked) {
      wagerRiskText = `✅ Both players checked in today! Safe from the wager (${currentWager}) today!`;
      wagerStatusIcon = <CheckCircle2 size={18} color="#10b981" />;
    } else {
      wagerRiskText = `⏳ Race is on! First to check in puts pressure on the opponent. Wager: ${currentWager}`;
      wagerStatusIcon = <Flame size={18} color="#eab308" />;
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Dynamic Stakes / Wager Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12), rgba(249, 115, 22, 0.12))',
          border: '1px solid rgba(234, 179, 8, 0.35)',
          borderRadius: '20px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: '0 8px 30px rgba(234, 179, 8, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #eab308, #f97316)',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              fontWeight: '900',
              boxShadow: '0 4px 12px rgba(234, 179, 8, 0.4)'
            }}>
              <Coins size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#eab308', textTransform: 'uppercase', letterSpacing: '1px' }}>
                CURRENT STAKES / WAGER
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
                {currentWager}
              </div>
            </div>
          </div>

          <button 
            className="icon-btn"
            onClick={onOpenHabitModal}
            style={{
              background: 'rgba(234, 179, 8, 0.15)',
              borderColor: 'rgba(234, 179, 8, 0.4)',
              color: '#fef08a',
              fontSize: '0.8rem',
              fontWeight: 700
            }}
          >
            <Edit3 size={14} />
            <span>Change Stakes</span>
          </button>
        </div>

        {/* Live Risk Alert Bar */}
        {wagerRiskText && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '12px',
            padding: '10px 14px',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {wagerStatusIcon}
            <span>{wagerRiskText}</span>
          </div>
        )}
      </div>

      {/* Leaderboard Banner */}
      <div className="leaderboard-banner">
        <div className="leader-headline">
          {leaderboard.headline}
        </div>
        <div className="leader-subtext">
          {leaderboard.subtext}
        </div>
      </div>

      {/* Side-by-Side User Cards */}
      <div className="duel-grid">
        {profileList.map((user) => (
          <UserCard 
            key={user.id} 
            user={user} 
            myDeviceId={myDeviceId} 
            onTick={onTick} 
          />
        ))}
      </div>
    </div>
  );
}
