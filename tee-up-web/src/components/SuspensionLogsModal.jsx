import { ClipboardList, ShieldAlert, X } from 'lucide-react';
import { Button } from './ui/button';
import './SuspensionLogsModal.css';

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getDurationBadge(log) {
  if (!log.suspended_until) {
    return { label: 'Permanent', className: 'suspension-logs-modal__badge--permanent' };
  }
  const until = new Date(log.suspended_until);
  if (until < new Date()) {
    return { label: 'Expired', className: 'suspension-logs-modal__badge--expired' };
  }
  return { label: 'Active', className: 'suspension-logs-modal__badge--active' };
}

function getAdminRoleBadge(role) {
  if (role === 'superadmin') {
    return { label: 'Super Admin', className: 'suspension-logs-modal__badge--superadmin' };
  }
  if (role === 'admin') {
    return { label: 'Admin', className: 'suspension-logs-modal__badge--admin' };
  }
  return null;
}

export default function SuspensionLogsModal({
  open,
  onClose,
  logs = [],
  loading = false,
  error = '',
  userId = null,
}) {
  if (!open) return null;

  const isUserScope = Boolean(userId);
  const title = isUserScope ? 'User suspension history' : 'Suspension logs';
  const subtitle = isUserScope
    ? 'Review every suspension action recorded for this account.'
    : 'Audit trail of suspensions across all users on the platform.';

  const handleOverlayClick = () => {
    if (!loading) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="presentation">
      <div
        className="suspension-logs-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="suspension-logs-modal-title"
      >
        <button
          type="button"
          className="modal-close suspension-logs-modal__close"
          onClick={onClose}
          disabled={loading}
          aria-label="Close suspension logs"
        >
          <X size={20} strokeWidth={2} />
        </button>

        <header className="suspension-logs-modal__header">
          <div className="suspension-logs-modal__header-main">
            <div className="suspension-logs-modal__icon-wrap" aria-hidden>
              <ShieldAlert size={24} strokeWidth={2} />
            </div>
            <div>
              <h2 id="suspension-logs-modal-title" className="suspension-logs-modal__title">
                {title}
              </h2>
              <p className="suspension-logs-modal__subtitle">{subtitle}</p>
            </div>
          </div>
        </header>

        {!loading && !error && (
          <div className="suspension-logs-modal__stats" aria-live="polite">
            <span className="suspension-logs-modal__stat-pill">
              <strong>{logs.length}</strong>
              {logs.length === 1 ? ' record' : ' records'}
            </span>
            {isUserScope && (
              <span className="suspension-logs-modal__stat-pill">Filtered to one user</span>
            )}
          </div>
        )}

        <div className="suspension-logs-modal__body">
          {loading ? (
            <div className="suspension-logs-modal__loading">
              <div className="loading-spinner" aria-hidden />
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                Loading suspension logs…
              </p>
            </div>
          ) : error ? (
            <p className="suspension-logs-modal__error" role="alert">
              {error}
            </p>
          ) : logs.length === 0 ? (
            <div className="suspension-logs-modal__empty">
              <div className="suspension-logs-modal__empty-icon" aria-hidden>
                <ClipboardList size={28} strokeWidth={1.75} />
              </div>
              <h3 className="suspension-logs-modal__empty-title">No suspension logs found</h3>
              <p className="suspension-logs-modal__empty-text">
                {isUserScope
                  ? 'This user has no suspension history on record.'
                  : 'There are no suspension records to display yet.'}
              </p>
            </div>
          ) : (
            <ul className="suspension-logs-modal__list">
              {logs.map((log) => {
                const durationBadge = getDurationBadge(log);
                const roleBadge = getAdminRoleBadge(log.admin_role);

                return (
                  <li key={log.id} className="suspension-logs-modal__card">
                    <div className="suspension-logs-modal__card-top">
                      <div className="suspension-logs-modal__user-block">
                        <p className="suspension-logs-modal__user-name">
                          {log.user_name || 'Unknown user'}
                        </p>
                        {log.user_email && (
                          <p className="suspension-logs-modal__user-email">{log.user_email}</p>
                        )}
                        {!isUserScope && log.user_id != null && (
                          <p className="suspension-logs-modal__user-id">User ID: {log.user_id}</p>
                        )}
                      </div>
                      <time className="suspension-logs-modal__datetime" dateTime={log.created_at}>
                        {formatDateTime(log.created_at)}
                      </time>
                    </div>

                    <div className="suspension-logs-modal__card-body">
                      <p className="suspension-logs-modal__reason-label">Reason</p>
                      <p className="suspension-logs-modal__reason-text">
                        {log.reason || 'No reason provided'}
                      </p>
                    </div>

                    <div className="suspension-logs-modal__card-footer">
                      <div className="suspension-logs-modal__admin">
                        <span>
                          <strong>By:</strong> {log.admin_name || 'Unknown'}
                        </span>
                        {roleBadge && (
                          <span className={`suspension-logs-modal__badge ${roleBadge.className}`}>
                            {roleBadge.label}
                          </span>
                        )}
                      </div>
                      <div className="suspension-logs-modal__duration">
                        <span
                          className={`suspension-logs-modal__badge ${durationBadge.className}`}
                        >
                          {durationBadge.label}
                        </span>
                        {log.suspended_until ? (
                          <span>
                            Until <strong>{formatDate(log.suspended_until)}</strong>
                          </span>
                        ) : (
                          <span>No end date</span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="suspension-logs-modal__footer">
          <Button
            type="button"
            variant="outline"
            className="suspension-logs-modal__footer-btn"
            onClick={onClose}
            disabled={loading}
          >
            Close
          </Button>
        </footer>
      </div>
    </div>
  );
}
