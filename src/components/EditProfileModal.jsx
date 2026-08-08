import React from 'react';
import { X, Pen } from 'lucide-react';
import { ProfileBuilder } from './ProfileBuilder';

export function EditProfileModal({ currentProfile, onSave, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <Pen size={18} color="#06b6d4" />
            Edit Your Profile
          </h3>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <ProfileBuilder
          existingProfile={currentProfile}
          onSave={onSave}
          isEditMode={true}
        />
      </div>
    </div>
  );
}
