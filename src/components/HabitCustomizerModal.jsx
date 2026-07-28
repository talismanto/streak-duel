import React, { useState } from 'react';
import { X, Sparkles, Target, Check } from 'lucide-react';

export function HabitCustomizerModal({ habit, onSave, onClose }) {
  const [title, setTitle] = useState(habit.title || '');
  const [category, setCategory] = useState(habit.category || 'Fitness & Health');
  const [description, setDescription] = useState(habit.description || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      category: category.trim(),
      description: description.trim()
    });
    onClose();
  };

  const presetHabits = [
    { title: 'Daily 30-Min Workout', category: 'Fitness & Health', desc: 'Exercise or gym session every calendar day.' },
    { title: 'Read 20 Pages Daily', category: 'Personal Growth', desc: 'Read non-fiction or educational book.' },
    { title: 'No Junk Food & 3L Water', category: 'Nutrition', desc: 'Clean eating and hydration streak.' },
    { title: '1 Hour Side-Project Code', category: 'Career & Tech', desc: 'Ship code or learn new tech daily.' },
    { title: '15-Min Mindfulness Meditation', category: 'Mental Health', desc: 'Daily calm meditation session.' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Sparkles size={20} color="#06b6d4" />
            <span>Customize Duel Habit</span>
          </h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              <span>Save Challenge</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
