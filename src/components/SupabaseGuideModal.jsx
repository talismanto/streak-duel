import React, { useState } from 'react';
import { X, Database, Copy, Check } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA, SUPABASE_SETUP_GUIDE } from '../services/supabaseSchema';

export function SupabaseGuideModal({ onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Database size={20} color="#10b981" />
            <span>Supabase Cloud Integration Guide</span>
          </h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', color: '#cbd5e1' }}>
          <p>
            StreakDuel comes with built-in multi-tab real-time sync for demo mode out-of-the-box. When you are ready for a production cloud backend, run the SQL schema below in Supabase:
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ color: '#fff' }}>PostgreSQL Migration & Midnight Cron Schema</strong>
            <button className="icon-btn" onClick={handleCopy}>
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? 'Copied SQL!' : 'Copy SQL'}</span>
            </button>
          </div>

          <pre className="code-block">{SUPABASE_SQL_SCHEMA}</pre>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h4 style={{ color: '#06b6d4', marginBottom: '6px' }}>Features included in this SQL schema:</h4>
            <ul style={{ paddingLeft: '20px', fontSize: '0.82rem', color: '#94a3b8' }}>
              <li>Row Level Security (RLS) policies for linked friends.</li>
              <li>Unique constraint preventing retroactive duplicate check-ins on the same day.</li>
              <li>Automated server-side midnight cron job resetting inactive streaks to 0.</li>
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button className="icon-btn primary" onClick={onClose}>Close Guide</button>
        </div>
      </div>
    </div>
  );
}
