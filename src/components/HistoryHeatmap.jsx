import React from 'react';
import { Calendar } from 'lucide-react';
import { formatDate } from '../services/streakEngine';

export function HistoryHeatmap({ profiles }) {
  const profileList = Object.values(profiles || {});

  // Generate last 14 calendar days
  const days = [];
  const baseDate = new Date();

  for (let i = 13; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);
    
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = d.getDate();
    const isToday = i === 0;

    // Map checkin status for each profile
    const profileStatuses = profileList.map((user) => {
      const isTicked = Boolean(
        user.history?.[dateStr] || 
        (user.lastTickedDate === dateStr)
      );
      return {
        id: user.id,
        name: user.name,
        colorTheme: user.colorTheme || 'cyan',
        isTicked
      };
    });

    days.push({
      dateStr,
      label: `${month} ${dayNum}`,
      isToday,
      profileStatuses
    });
  }

  return (
    <div className="history-section">
      <div className="section-title-bar">
        <h2>
          <Calendar size={20} color="#06b6d4" />
          <span>14-Day Duel Consistency Heatmap</span>
        </h2>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#94a3b8', flexWrap: 'wrap' }}>
          {profileList.map((u) => (
            <span key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className={`dot-indicator ${u.colorTheme || 'cyan'}-ticked`} style={{ background: u.colorTheme === 'orange' ? '#f97316' : u.colorTheme === 'emerald' ? '#10b981' : u.colorTheme === 'purple' ? '#a855f7' : u.colorTheme === 'gold' ? '#eab308' : '#06b6d4' }} /> {u.name}
            </span>
          ))}
        </div>
      </div>

      <div className="heatmap-grid">
        {days.map((day) => (
          <div 
            key={day.dateStr} 
            className={`heatmap-cell ${day.isToday ? 'is-today' : ''}`}
            title={`${day.label}: ${day.profileStatuses.map(p => `${p.name} (${p.isTicked ? 'Ticked' : 'Pending'})`).join(', ')}`}
          >
            <span className="cell-date-label">{day.isToday ? 'Today' : day.label}</span>
            <div className="cell-indicators">
              {day.profileStatuses.map((p) => (
                <span 
                  key={p.id} 
                  className={`dot-indicator ${p.isTicked ? 'a-ticked' : ''}`}
                  style={{
                    opacity: p.isTicked ? 1 : 0.25,
                    background: p.isTicked
                      ? (p.colorTheme === 'orange' ? '#f97316' : p.colorTheme === 'emerald' ? '#10b981' : p.colorTheme === 'purple' ? '#a855f7' : p.colorTheme === 'gold' ? '#eab308' : '#06b6d4')
                      : 'rgba(255,255,255,0.2)'
                  }} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
