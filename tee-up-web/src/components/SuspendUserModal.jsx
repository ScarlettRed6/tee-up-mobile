import { ShieldAlert, X } from 'lucide-react';
import { Button } from './ui/button';
import './SuspendUserModal.css';

function getRoleLabel(role) {
  if (role === 'superadmin') return 'Super Admin';
  if (role === 'admin') return 'Admin';
  return 'User';
}

function getRoleBadgeClass(role) {
  if (role === 'superadmin') return 'suspend-user-modal__role-badge suspend-user-modal__role-badge--superadmin';
  if (role === 'admin') return 'suspend-user-modal__role-badge suspend-user-modal__role-badge--admin';
  return 'suspend-user-modal__role-badge';
}

export default function SuspendUserModal({
  open,
  user,
  formData,
  onFormChange,
  error,
  loading,
  onClose,
  onSubmit,
}) {
  if (!open || !user) return null;

  const handleOverlayClick = () => {
    if (!loading) onClose();
  };

  const handlePermanentChange = (checked) => {
    onFormChange({
      ...formData,
      isPermanent: checked,
      duration: checked ? '' : formData.duration,
    });
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="presentation">
      <div
        className="suspend-user-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="suspend-user-modal-title"
      >
        <button
          type="button"
          className="modal-close suspend-user-modal__close"
          onClick={onClose}
          disabled={loading}
          aria-label="Close suspend user dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <header className="suspend-user-modal__header">
          <div className="suspend-user-modal__header-main">
            <span className="suspend-user-modal__icon-wrap" aria-hidden>
              <ShieldAlert className="h-6 w-6" />
            </span>
            <div>
              <h2 id="suspend-user-modal-title" className="suspend-user-modal__title">
                Suspend user
              </h2>
              <p className="suspend-user-modal__subtitle">
                Restrict this account from using the platform. The reason is saved in suspension
                history.
              </p>
            </div>
          </div>
        </header>

        <form className="suspend-user-modal__form-wrap" onSubmit={onSubmit}>
          <div className="suspend-user-modal__body">
            <div className="suspend-user-modal__user-card">
              <div className="suspend-user-modal__user-row">
                <span className="suspend-user-modal__user-label">Name</span>
                <span className="suspend-user-modal__user-value">{user.name || '—'}</span>
              </div>
              <div className="suspend-user-modal__user-row">
                <span className="suspend-user-modal__user-label">Email</span>
                <span className="suspend-user-modal__user-value">{user.email || '—'}</span>
              </div>
              <div className="suspend-user-modal__user-row">
                <span className="suspend-user-modal__user-label">Role</span>
                <span className={getRoleBadgeClass(user.role)}>{getRoleLabel(user.role)}</span>
              </div>
            </div>

            {error ? (
              <div className="app-form-error" role="alert">
                {error}
              </div>
            ) : null}

            <div className="suspend-user-modal__form">
              <label className="suspend-user-modal__toggle-card">
                <input
                  type="checkbox"
                  checked={formData.isPermanent}
                  onChange={(e) => handlePermanentChange(e.target.checked)}
                  disabled={loading}
                />
                <span className="suspend-user-modal__toggle-text">
                  <span className="suspend-user-modal__toggle-title">Permanent suspension</span>
                  <span className="suspend-user-modal__hint">
                    When enabled, the account stays suspended until an admin unsuspends it.
                  </span>
                </span>
              </label>

              {!formData.isPermanent ? (
                <div className="suspend-user-modal__field">
                  <label htmlFor="suspend-duration" className="suspend-user-modal__label">
                    Duration (days){' '}
                    <span className="suspend-user-modal__label-required" aria-hidden>
                      *
                    </span>
                  </label>
                  <input
                    type="number"
                    id="suspend-duration"
                    className="suspend-user-modal__input"
                    placeholder="e.g. 7"
                    min="1"
                    value={formData.duration}
                    onChange={(e) =>
                      onFormChange({ ...formData, duration: e.target.value })
                    }
                    disabled={loading}
                    required
                  />
                  <p className="suspend-user-modal__hint">
                    How many days the suspension should remain active.
                  </p>
                </div>
              ) : null}

              <div className="suspend-user-modal__field">
                <label htmlFor="suspend-reason" className="suspend-user-modal__label">
                  Reason{' '}
                  <span className="suspend-user-modal__label-required" aria-hidden>
                    *
                  </span>
                </label>
                <textarea
                  id="suspend-reason"
                  className="suspend-user-modal__textarea"
                  placeholder="Describe why this account is being suspended…"
                  rows={4}
                  value={formData.reason}
                  onChange={(e) => onFormChange({ ...formData, reason: e.target.value })}
                  disabled={loading}
                  required
                />
                <p className="suspend-user-modal__hint">
                  Visible in suspension logs for auditing and support.
                </p>
              </div>
            </div>
          </div>

          <footer className="suspend-user-modal__footer">
            <Button
              type="button"
              variant="outline"
              className="suspend-user-modal__btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="suspend-user-modal__btn-submit" disabled={loading}>
              {loading ? 'Suspending…' : 'Suspend user'}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
}
