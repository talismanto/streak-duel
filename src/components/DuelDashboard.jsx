import React from 'react';
import { UserCard } from './UserCard';
import { getLeaderboardStatus } from '../services/streakEngine';

export function DuelDashboard({ 
  profiles, 
  myDeviceId, 
  onTick 
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
