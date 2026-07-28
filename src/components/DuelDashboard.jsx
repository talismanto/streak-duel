import React from 'react';
import { UserCard } from './UserCard';
import { getLeaderboardStatus } from '../services/streakEngine';

export function DuelDashboard({ 
  users, 
  activeUserId, 
  onTick, 
  onSwitchUser 
}) {
  const friendA = users.user_a;
  const friendB = users.user_b;
  const leaderboard = getLeaderboardStatus(friendA, friendB);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Leaderboard Summary Banner */}
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
        <UserCard 
          user={friendA} 
          activeUserId={activeUserId} 
          onTick={onTick} 
          onSwitchUser={onSwitchUser} 
        />
        <UserCard 
          user={friendB} 
          activeUserId={activeUserId} 
          onTick={onTick} 
          onSwitchUser={onSwitchUser} 
        />
      </div>
    </div>
  );
}
