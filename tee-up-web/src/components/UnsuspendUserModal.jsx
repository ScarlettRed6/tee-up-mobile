import { UserCheck } from 'lucide-react';
import { Button } from './ui/button';
import './UnsuspendUserModal.css';

export default function UnsuspendUserModal({
  open,
  user,
  loading = false,
  error = '',
  onClose,
  onConfirm,
}) {
  if (!open || !user) return null;

  const displayName = user.name?.trim() || 'this user';
  const displayEmail = user.email?.trim();

  return (
    <div
      className="unsuspend-modal-overlay"
      onClick={() => {
        if (!loading) onClose();
      }}
      role="presentation"
    >
      <div
        className="unsuspend-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsuspend-modal-title"
      >
        <span className="unsuspend-modal-icon-wrap" aria-hidden>
          <UserCheck className="h-5 w-5" />
        </span>
        <h2 id="unsuspend-modal-title" className="unsuspend-modal-title">
          Unsuspend user?
        </h2>
        <p className="unsuspend-modal-message">
          This will restore full access to the platform for this account.
        </p>
        <div className="unsuspend-modal-user">
          <strong>{displayName}</strong>
          {displayEmail ? (
            <>
              <br />
              {displayEmail}
            </>
          ) : null}
        </div>

        {error ? (
          <div className="app-form-error unsuspend-modal-error" role="alert">
            {error}
          </div>
        ) : null}

        <div className="unsuspend-modal-actions">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="unsuspend-modal-action-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="lg"
            className="unsuspend-modal-confirm-btn unsuspend-modal-action-btn"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Restoring…' : 'Unsuspend user'}
          </Button>
        </div>
      </div>
    </div>
  );
}
