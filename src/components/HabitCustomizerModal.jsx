import React, { useState } from 'react';
import { X, Sparkles, Target, Check, Flame, Trophy, Coins } from 'lucide-react';

export function HabitCustomizerModal({ habit, onSave, onClose }) {
  const [title, setTitle] = useState(habit.title || '');
  const [category, setCategory] = useState(habit.category || 'Fitness & Health');
  const [description, setDescription] = useState(habit.description || '');
  const [wager, setWager] = useState(habit.wager || '☕ Loser buys coffee');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      wager: wager.trim() || '☕ Loser buys coffee'
    });
    onClose();
  };

  const presetHabits = [
    { title: 'Daily 30-Min Workout', category: 'Fitness & Health', desc: 'Exercise or gym session every calendar day.', wager: '☕ Loser buys coffee' },
    { title: 'Read 20 Pages Daily', category: 'Personal Growth', desc: 'Read non-fiction or educational book.', wager: '🍕 Loser buys dinner' },
    { title: 'No Junk Food & 3L Water', category: 'Nutrition', desc: 'Clean eating and hydration streak.', wager: '🥤 Loser buys Boba' },
    { title: '1 Hour Side-Project Code', category: 'Career & Tech', desc: 'Ship code or learn new tech daily.', wager: '💵 $10 Cash Bet' },
    { title: '15-Min Mindfulness Meditation', category: 'Mental Health', desc: 'Daily calm meditation session.', wager: '🧹 Loser cleans the house' },
  ];

  const presetWagers = [
    '☕ Loser buys coffee',
    '🍕 Loser buys dinner',
    '🥤 Loser buys Boba tea',
    '💵 $10 Cash wager',
    '💵 $20 Stakes',
    '🧹 Loser does dishes / chores',
    '💪 50 Punishment pushups',
    '🍦 Loser buys ice cream'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h3>
            <Sparkles size={20} color="#06b6d4" />
            <span>Customize Habit & Wager Stakes</span>
          </h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Custom Stakes / Wager Input */}
          <div className="form-group" style={{
            background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.1), rgba(249, 115, 22, 0.1))',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            borderRadius: '16px',
            padding: '16px'
          }}>
            <label style={{ color: '#eab308', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
              <Coins size={18} color="#eab308" />
              <span>STAKES / WAGER FOR THE DUEL</span>
            </label>
            <input 
              type="text" 
              className="form-input"
              style={{ marginTop: '8px', borderColor: 'rgba(234, 179, 8, 0.4)', background: 'rgba(0,0,0,0.5)', fontWeight: 700 }}
              value={wager}
              onChange={(e) => setWager(e.target.value)}
              placeholder="e.g. ☕ Loser buys coffee / 💵 $10 / 🍕 Loser buys pizza"
              required 
            />

            {/* Quick Wager Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              {presetWagers.map((w) => (
                <button
                  type="button"
                  key={w}
                  onClick={() => setWager(w)}
                  style={{
                    background: wager === w ? 'rgba(234, 179, 8, 0.25)' : 'rgba(0,0,0,0.3)',
                    border: wager === w ? '1px solid #eab308' : '1px solid rgba(255,255,255,0.1)',
                    color: wager === w ? '#fef08a' : '#cbd5e1',
                    borderRadius: '20px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Habit Title / Challenge Name</label>
            <input 
              type="text" 
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Daily 30-Min Gym Workout"
              required 
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input 
              type="text" 
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Fitness, Learning, Coding"
            />
          </div>

          <div className="form-group">
            <label>Description / Rules</label>
            <textarea 
              className="form-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What counts as completing this daily habit?"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Quick Presets
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {presetHabits.map((preset) => (
                <button
                  type="button"
                  key={preset.title}
                  className="icon-btn"
                  style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  onClick={() => {
                    setTitle(preset.title);
                    setCategory(preset.category);
                    setDescription(preset.desc);
                    setWager(preset.wager);
                  }}
                >
                  <Target size={12} color="#06b6d4" />
                  <span>{preset.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="icon-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="icon-btn primary">
              <Check size={16} />
              <span>Save Challenge & Stakes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
