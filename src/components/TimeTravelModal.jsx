import React from 'react';
import { X, Clock, FastForward, RotateCcw, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function TimeTravelModal({ 
  simulatedDateOffset, 
  onAdvanceDays, 
  onResetSimulatedTime, 
  onResetDemoState,
  onClose 
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Clock size={20} color="#eab308" />
            <span>Strict Reset Verification & Time Travel</span>
          </h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="rules-alert">
          <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={16} color="#ef4444" />
            Strict Reset & No Backdating Logic Verification
          </div>
          <ul>
            <li><strong>Midnight Wipe:</strong> If a user does not tick before midnight, their streak resets to 0.</li>
            <li><strong>No Catching Up:</strong> Missed days are closed forever. No backdating allowed.</li>
            <li><strong>All-Time Record:</strong> Highest record is preserved forever even after a reset.</li>
          </ul>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>
            Current Simulated Offset: <span style={{ color: '#eab308', fontSize: '1rem' }}>+{simulatedDateOffset} Days</span>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button className="icon-btn" onClick={() => onAdvanceDays(1)}>
              <FastForward size={16} color="#06b6d4" />
              <span>Advance +1 Day (Midnight)</span>
            </button>
            <button className="icon-btn" onClick={() => onAdvanceDays(2)}>
              <FastForward size={16} color="#f97316" />
              <span>Advance +2 Days (Skip Day)</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            {simulatedDateOffset > 0 && (
              <button className="icon-btn" style={{ flex: 1 }} onClick={onResetSimulatedTime}>
                <RotateCcw size={16} />
                <span>Return to Real Time (0d)</span>
              </button>
            )}

            <button className="icon-btn" style={{ flex: 1, borderColor: '#ef4444', color: '#fca5a5' }} onClick={onResetDemoState}>
              <RotateCcw size={16} color="#ef4444" />
              <span>Reset All Demo Data</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button className="icon-btn primary" onClick={onClose}>
            <CheckCircle2 size={16} />
            <span>Done Testing</span>
          </button>
        </div>
      </div>
    </div>
  );
}
