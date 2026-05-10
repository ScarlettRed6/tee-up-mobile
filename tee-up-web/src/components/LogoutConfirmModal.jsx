import { LogOut } from 'lucide-react';
import { Button } from './ui/button';
import './LogoutConfirmModal.css';

export default function LogoutConfirmModal({ open, roleLabel = 'account', onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div className="logout-modal-overlay" onClick={onCancel}>
      <div className="logout-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="logout-modal-icon-wrap" aria-hidden>
          <LogOut className="h-5 w-5" />
        </div>
        <h3 className="logout-modal-title">Sign out now?</h3>
        <p className="logout-modal-message">
          You are about to sign out of your {roleLabel} session.
        </p>
        <div className="logout-modal-actions">
          <Button variant="outline" size="lg" type="button" className="logout-modal-action-btn" onClick={onCancel}>
            Stay logged in
          </Button>
          <Button
            type="button"
            size="lg"
            className="logout-modal-confirm-btn logout-modal-action-btn"
            onClick={onConfirm}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
