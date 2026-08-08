import React from 'react';
import { Flame, Zap, Trophy, Shield, Bell, ArrowRight } from 'lucide-react';

const FEATURES = [
  {
    icon: '🔥',
    bg: 'linear-gradient(135deg, #f97316, #dc2626)',
    title: 'Daily Habit Streaks',
    desc: 'Check in every day to build your longest streak. Miss a day — streak resets to zero!'
  },
  {
    icon: '⚔️',
    bg: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
    title: 'Real-Time Duel',
    desc: 'Compete side-by-side with a friend. See their streak update live on your screen.'
  },
  {
    icon: '👑',
    bg: 'linear-gradient(135deg, #eab308, #ca8a04)',
    title: 'Milestone Badges',
    desc: 'Unlock On Fire, Weekly Master, Iron Discipline, and Legend status as you grow.'
  }
];

export function WelcomeScreen({ onGetStarted }) {
  return (
    <div className="welcome-screen">
      {/* Logo & Brand */}
      <div className="welcome-logo-area">
        <div className="welcome-big-icon">
          <Flame size={48} color="#fff" />
        </div>
        <div>
          <div className="welcome-app-name">StreakDuel</div>
          <div className="welcome-tagline">2-Player Daily Habit Competition</div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="welcome-feature-cards">
        {FEATURES.map((f, i) => (
          <div className="welcome-feature-card" key={i}>
            <div className="feature-icon-badge" style={{ background: f.bg }}>
              {f.icon}
            </div>
            <div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button className="get-started-btn" onClick={onGetStarted} id="get-started-btn">
        <Zap size={20} />
        <span>Get Started — Create Your Profile</span>
        <ArrowRight size={18} />
      </button>

      <p style={{ marginTop: '16px', fontSize: '0.75rem', color: '#64748b', maxWidth: '340px' }}>
        No account or password needed. Each device creates its own profile and syncs live across the internet.
      </p>
    </div>
  );
}
