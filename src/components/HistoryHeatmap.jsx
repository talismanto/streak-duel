import React from 'react';
import { Calendar, CheckCircle } from 'lucide-react';
import { formatDate } from '../services/streakEngine';

export function HistoryHeatmap({ users, simulatedDateOffset = 0 }) {
  const friendA = users.user_a;
  const friendB = users.user_b;

  // Generate last 14 calendar days
  const days = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + simulatedDateOffset);

  for (let i = 13; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);
    
    // Format display string e.g. "Jul 26" or "Sun 26"
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = d.getDate();
    const isToday = i === 0;

    const aTicked = Boolean(friendA.history && friendA.history[dateStr]);
    const bTicked = Boolean(friendB.history && friendB.history[dateStr]);

    days.push({
      dateStr,
      label: `${month} ${dayNum}`,
      isToday,
      aTicked,
      bTicked
    });
  }

  return (
    <div className="history-section">
      <div className="section-title-bar">
        <h2>
          <Calendar size={20} color="#06b6d4" />
          <span>14-Day Duel Consistency Tracker</span>
        </h2>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#94a3b8' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="dot-indicator a-ticked" /> {friendA.name}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="dot-indicator b-ticked" /> {friendB.name}
          </span>
        </div>
      </div>

      <div className="heatmap-grid">
        {days.map((day) => (
          <div 
            key={day.dateStr} 
            className={`heatmap-cell ${day.isToday ? 'is-today' : ''}`}
            title={`${day.label}: ${friendA.name} (${day.aTicked ? 'Ticked' : 'Missed'}), ${friendB.name} (${day.bTicked ? 'Ticked' : 'Missed'})`}
          >
            <span className="cell-date-label">{day.isToday ? 'Today' : day.label}</span>
            <div className="cell-indicators">
              <span className={`dot-indicator ${day.aTicked ? 'a-ticked' : ''}`} />
              <span className={`dot-indicator ${day.bTicked ? 'b-ticked' : ''}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
