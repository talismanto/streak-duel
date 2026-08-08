import React from 'react';
import { UserCard } from './UserCard';
import { CommentsBanner } from './CommentsBanner';
import { getLeaderboardStatus, formatDate } from '../services/streakEngine';
import { Coins, Edit3, AlertCircle, CheckCircle2, Flame, Swords, Plus, Check, X } from 'lucide-react';

export function DuelDashboard({ 
  profiles, 
  myDeviceId, 
  myProfile,
  onTick,
  habit,
  wagers = [],
  comments = [],
  onAddComment,
  onDeleteComment,
  onOpenHabitModal,
  onOpenCreateWager,
  onOpenWagersTab,
  onRespondWager
}) {
  const rawProfiles = Object.values(profiles || {});
  const todayStr = formatDate();

  // Sort profiles so current device's own profile ALWAYS appears FIRST at top/top-left!
  const profileList = rawProfiles.sort((a, b) => {
    if (a.id === myDeviceId) return -1;
    if (b.id === myDeviceId) return 1;
    return 0;
  });

  // Find active accepted wagers involving me, or overall active wagers
  const myActiveWager = wagers.find(w => 
    w.status === 'accepted' && (w.creatorId === myDeviceId || w.targetId === myDeviceId)
  ) || wagers.find(w => w.status === 'accepted');

  // Pending wager sent TO me
  const pendingForMe = wagers.filter(w => w.targetId === myDeviceId && w.status === 'pending');

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
  const currentWagerText = myActiveWager ? myActiveWager.wager : (habit?.wager || '☕ Loser buys coffee');

  if (myActiveWager) {
    const creatorP = profiles[myActiveWager.creatorId] || { name: myActiveWager.creatorName, lastTickedDate: null };
    const targetP = profiles[myActiveWager.targetId] || { name: myActiveWager.targetName, lastTickedDate: null };

    const cTicked = creatorP.lastTickedDate === todayStr;
    const tTicked = targetP.lastTickedDate === todayStr;

    if (cTicked && !tTicked) {
      wagerRiskText = `⚠️ ${targetP.name} hasn't checked in today! On the hook for: ${currentWagerText}`;
      wagerStatusIcon = <AlertCircle size={18} color="#f97316" />;
    } else if (tTicked && !cTicked) {
      wagerRiskText = `⚠️ ${creatorP.name} hasn't checked in today! On the hook for: ${currentWagerText}`;
      wagerStatusIcon = <AlertCircle size={18} color="#f97316" />;
    } else if (cTicked && tTicked) {
      wagerRiskText = `✅ Both players checked in today! Safe from the wager today!`;
      wagerStatusIcon = <CheckCircle2 size={18} color="#10b981" />;
    } else {
      wagerRiskText = `⏳ Race is on between ${creatorP.name} & ${targetP.name}! Wager: ${currentWagerText}`;
      wagerStatusIcon = <Flame size={18} color="#eab308" />;
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Pending Wager Challenges Sent to Me Alert Banner */}
      {pendingForMe.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 179, 8, 0.2))',
          border: '2px solid #f97316',
          borderRadius: '20px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 8px 30px rgba(249, 115, 22, 0.3)'
        }}>
          {pendingForMe.map(pw => (
            <div key={pw.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Swords size={24} color="#f97316" />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
                    ⚡ <span style={{ color: '#f97316' }}>{pw.creatorName}</span> challenged you to a Wager!
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#fef08a', fontWeight: 700, marginTop: '2px' }}>
                    Stakes: {pw.wager} &bull; Habit: {pw.title}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onRespondWager(pw.id, 'declined')}
                  className="icon-btn"
                  style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                >
                  <X size={14} />
                  <span>Decline</span>
                </button>
                <button
                  onClick={() => onRespondWager(pw.id, 'accepted')}
                  className="icon-btn primary"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  <Check size={14} />
                  <span>Accept Wager!</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard Banner */}
      <div className="leaderboard-banner">
        <div className="leader-headline">
          {leaderboard.headline}
        </div>
        <div className="leader-subtext">
          {leaderboard.subtext}
        </div>
      </div>

      {/* Side-by-Side User Cards (Current Device User ALWAYS First on Top!) */}
      <div className="duel-grid">
        {profileList.map((user) => (
          <UserCard 
            key={user.id} 
            user={user} 
            myDeviceId={myDeviceId}
            myProfile={myProfile}
            comments={comments}
            onTick={onTick}
            onAddComment={onAddComment}
            onDeleteComment={onDeleteComment}
          />
        ))}
      </div>

      {/* Expandable Activity & Comments Banner */}
      <CommentsBanner
        comments={comments}
        myProfile={myProfile}
        myDeviceId={myDeviceId}
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
      />
      
      {/* Active Duel Wager Banner (AT THE BOTTOM OF THE PAGE!) */}
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
                ACTIVE DUEL WAGER
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>
                {currentWagerText}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="icon-btn"
              onClick={onOpenCreateWager}
              style={{
                background: 'rgba(249, 115, 22, 0.15)',
                borderColor: 'rgba(249, 115, 22, 0.4)',
                color: '#fb923c',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              <Plus size={14} />
              <span>Propose Wager</span>
            </button>
            <button 
              className="icon-btn"
              onClick={onOpenWagersTab}
              style={{
                background: 'rgba(234, 179, 8, 0.15)',
                borderColor: 'rgba(234, 179, 8, 0.4)',
                color: '#fef08a',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              <Swords size={14} />
              <span>All Wagers</span>
            </button>
          </div>
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

    </div>
  );
}
