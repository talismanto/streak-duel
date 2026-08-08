import React, { useState, useRef } from 'react';
import { Camera, Check, User, Pen, Search, RotateCcw, AlertTriangle, ArrowLeft } from 'lucide-react';
import { supabase, getDeviceId } from '../services/storageAdapter';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
];

const THEMES = [
  { key: 'cyan',    label: 'Cyan',    emoji: '⚡', color: '#06b6d4' },
  { key: 'orange',  label: 'Orange',  emoji: '🔥', color: '#f97316' },
  { key: 'purple',  label: 'Purple',  emoji: '💜', color: '#a855f7' },
  { key: 'emerald', label: 'Green',   emoji: '🌿', color: '#10b981' },
  { key: 'rose',    label: 'Rose',    emoji: '🌸', color: '#f43f5e' },
  { key: 'gold',    label: 'Gold',    emoji: '👑', color: '#eab308' }
];

const THEME_COLORS = {
  cyan: '#06b6d4', orange: '#f97316', purple: '#a855f7',
  emerald: '#10b981', rose: '#f43f5e', gold: '#eab308'
};

/* ── Recovery Sub-screen ───────────────────────────────────────── */
function RecoverProfile({ onRecovered, onBack }) {
  const [searchName, setSearchName]     = useState('');
  const [results, setResults]           = useState(null);  // null = not searched yet
  const [loading, setLoading]           = useState(false);
  const [claiming, setClaiming]         = useState(false);
  const [error, setError]               = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchName.trim() || !supabase) return;
    setLoading(true);
    setError('');
    setResults(null);

    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .ilike('name', `%${searchName.trim()}%`);

    setLoading(false);
    if (err) { setError('Search failed. Check your connection.'); return; }
    setResults(data || []);
  };

  const handleClaim = async (cloudProfile) => {
    setClaiming(true);
    const myNewDeviceId = getDeviceId();   // generates fresh ID if not set

    // Re-assign the profile's ID to this device's new ID in Supabase
    const { error: err } = await supabase
      .from('profiles')
      .update({ id: myNewDeviceId })
      .eq('id', cloudProfile.id);

    if (err) {
      // id column might be PK so we insert + delete instead
      const { error: insertErr } = await supabase.from('profiles').insert({
        ...cloudProfile,
        id: myNewDeviceId
      });
      if (!insertErr) {
        await supabase.from('profiles').delete().eq('id', cloudProfile.id);
      }
    }

    // Build the recovered profile object in local shape
    const recovered = {
      id:            myNewDeviceId,
      name:          cloudProfile.name,
      tagline:       cloudProfile.tagline || '',
      avatar:        cloudProfile.avatar_url || PRESET_AVATARS[0],
      colorTheme:    cloudProfile.color_theme || 'cyan',
      currentStreak: cloudProfile.current_streak || 0,
      bestStreak:    cloudProfile.best_streak    || 0,
      lastTickedDate:cloudProfile.last_ticked_date || null,
      history:       cloudProfile.history ? JSON.parse(cloudProfile.history) : {},
      isAdmin:       cloudProfile.is_admin || false
    };

    setClaiming(false);
    onRecovered(recovered);
  };

  return (
    <div className="profile-builder-screen">
      <div className="profile-builder-card">
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, padding: 0 }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div>
          <span className="step-label">Account Recovery</span>
          <h2><RotateCcw size={20} color="#06b6d4" /> Recover Your Profile</h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>
            Search for your old account by name. We'll transfer it to your current device.
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Type your name..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            style={{ flex: 1 }}
            required
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
              border: 'none', color: '#fff', borderRadius: '12px',
              padding: '12px 16px', cursor: loading ? 'wait' : 'pointer',
              fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Search size={16} />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px', fontSize: '0.85rem', color: '#fca5a5', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AlertTriangle size={15} /> {error}
          </div>
        )}

        {results !== null && results.length === 0 && (
          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.88rem', padding: '12px 0' }}>
            No profiles found with that name. Try a different spelling or create a new profile.
          </div>
        )}

        {results && results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Found {results.length} profile{results.length > 1 ? 's' : ''}
            </div>
            {results.map(p => {
              const color = THEME_COLORS[p.color_theme] || '#06b6d4';
              return (
                <div key={p.id} style={{
                  background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}44`,
                  borderRadius: '14px', padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                  <img
                    src={p.avatar_url || PRESET_AVATARS[0]}
                    alt={p.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color}`, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{p.tagline || '—'}</div>
                    <div style={{ fontSize: '0.75rem', color, marginTop: '3px' }}>
                      🔥 {p.current_streak || 0} day streak &bull; Best: {p.best_streak || 0}
                    </div>
                  </div>
                  <button
                    onClick={() => handleClaim(p)}
                    disabled={claiming}
                    style={{
                      background: `linear-gradient(135deg, ${color}, ${color}aa)`,
                      border: 'none', color: '#fff', borderRadius: '10px',
                      padding: '8px 14px', cursor: claiming ? 'wait' : 'pointer',
                      fontSize: '0.82rem', fontWeight: 800, flexShrink: 0
                    }}
                  >
                    {claiming ? 'Claiming...' : 'This is me!'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main ProfileBuilder ────────────────────────────────────────── */
export function ProfileBuilder({ existingProfile, onSave, isEditMode = false }) {
  const [mode, setMode]       = useState('create'); // 'create' | 'recover'
  const [name, setName]       = useState(existingProfile?.name || '');
  const [tagline, setTagline] = useState(existingProfile?.tagline || '');
  const [colorTheme, setColorTheme] = useState(existingProfile?.colorTheme || 'cyan');
  const [avatar, setAvatar]   = useState(existingProfile?.avatar || PRESET_AVATARS[0]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (evt) => { setAvatar(evt.target.result); setUploading(false); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), tagline: tagline.trim(), colorTheme, avatar });
  };

  const selectedTheme = THEMES.find(t => t.key === colorTheme);

  // Show recovery sub-screen
  if (mode === 'recover') {
    return (
      <RecoverProfile
        onRecovered={onSave}
        onBack={() => setMode('create')}
      />
    );
  }

  return (
    <div className={isEditMode ? '' : 'profile-builder-screen'}>
      <div className={isEditMode ? '' : 'profile-builder-card'}>
        {!isEditMode && (
          <div>
            <span className="step-label">Step 1 of 1 — Create Your Profile</span>
            <h2><User size={22} color="#06b6d4" /> Build Your Duel Identity</h2>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Avatar Upload */}
          <div className="avatar-upload-area">
            <div className="avatar-upload-ring" onClick={() => fileInputRef.current?.click()}>
              <img
                src={avatar}
                alt="Profile"
                className="avatar-upload-img"
                style={{ border: `3px solid ${selectedTheme?.color || '#06b6d4'}`, boxShadow: `0 0 20px ${selectedTheme?.color || '#06b6d4'}55` }}
              />
              <div className="avatar-upload-overlay">
                <Camera size={20} color="#fff" />
                <span>{uploading ? 'Uploading...' : 'Change Photo'}</span>
              </div>
            </div>
            <div className="avatar-upload-hint">Tap your photo to upload from camera or gallery</div>
            <input ref={fileInputRef} type="file" accept="image/*" capture="user" onChange={handleFileChange} style={{ display: 'none' }} />
            {/* Preset Avatars */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {PRESET_AVATARS.map((url, i) => (
                <button key={i} type="button" className={`avatar-preset-btn ${avatar === url ? 'selected' : ''}`}
                  onClick={() => setAvatar(url)}
                  style={{ borderColor: avatar === url ? selectedTheme?.color : 'transparent' }}>
                  <img src={url} alt={`preset ${i}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="form-group">
            <label>Your Name</label>
            <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Alex, Jordan, Sam..." maxLength={20} required />
          </div>

          {/* Tagline */}
          <div className="form-group">
            <label>Tagline / Motto <span style={{ opacity: 0.5, fontWeight: 400 }}>(optional)</span></label>
            <input type="text" className="form-input" value={tagline} onChange={e => setTagline(e.target.value)}
              placeholder="e.g. Never miss a day 💪" maxLength={35} />
          </div>

          {/* Color Theme */}
          <div className="form-group">
            <label>Card Color Theme</label>
            <div className="theme-picker">
              {THEMES.map((theme) => (
                <button key={theme.key} type="button" className="theme-option"
                  onClick={() => setColorTheme(theme.key)}
                  style={{
                    borderColor: colorTheme === theme.key ? theme.color : 'transparent',
                    background: colorTheme === theme.key ? `${theme.color}22` : 'rgba(255,255,255,0.04)',
                    color: colorTheme === theme.key ? theme.color : '#94a3b8'
                  }}>
                  <div className="theme-dot" style={{ background: theme.color }} />
                  {theme.emoji} {theme.label}
                  {colorTheme === theme.key && <Check size={10} />}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="giant-tick-btn can-tick"
            style={{
              background: `linear-gradient(135deg, ${selectedTheme?.color}, ${selectedTheme?.color}aa)`,
              boxShadow: `0 8px 25px ${selectedTheme?.color}55`,
              color: colorTheme === 'gold' ? '#000' : '#fff',
              fontSize: '1rem', marginTop: '4px'
            }}>
            {isEditMode ? <Pen size={18} /> : <Check size={18} />}
            <span>{isEditMode ? 'Save Changes' : 'Start Dueling!'}</span>
          </button>
        </form>

        {/* Recovery link — only on first-time setup */}
        {!isEditMode && supabase && (
          <button
            onClick={() => setMode('recover')}
            style={{
              background: 'none', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', color: '#64748b', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 700, padding: '10px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', transition: 'all 0.2s', marginTop: '4px', width: '100%'
            }}
          >
            <RotateCcw size={14} />
            Already had an account? Recover it here
          </button>
        )}
      </div>
    </div>
  );
}
