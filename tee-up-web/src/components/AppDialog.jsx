import { AlertTriangle, CheckCircle2, Info, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import './AppDialog.css';

const VARIANT_CONFIG = {
  danger: { Icon: Trash2, confirmClass: 'app-dialog-confirm--danger' },
  warning: { Icon: AlertTriangle, confirmClass: 'app-dialog-confirm--danger' },
  success: { Icon: CheckCircle2, confirmClass: 'app-dialog-confirm--success' },
  primary: { Icon: Info, confirmClass: 'app-dialog-confirm--primary' },
  info: { Icon: Info, confirmClass: 'app-dialog-confirm--primary' },
};

export default function AppDialog({
  open = false,
  mode = 'alert',
  variant = 'info',
  title = '',
  message = '',
  confirmLabel,
  cancelLabel = 'Cancel',
  loading = false,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.info;
  const { Icon, confirmClass } = config;
  const isConfirm = mode === 'confirm';
  const resolvedConfirmLabel = confirmLabel || (isConfirm ? 'Confirm' : 'OK');

  const handleOverlayClick = () => {
    if (!loading) onClose?.();
  };

  const handleConfirm = () => {
    if (!loading) onConfirm?.();
  };

  return (
    <div className="app-dialog-overlay" onClick={handleOverlayClick} role="presentation">
      <div
        className="app-dialog-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-dialog-title"
      >
        <div className={`app-dialog-icon-wrap app-dialog-icon-wrap--${variant}`} aria-hidden>
          <Icon className="h-5 w-5" />
        </div>
        <h3 id="app-dialog-title" className="app-dialog-title">
          {title}
        </h3>
        {message ? <p className="app-dialog-message">{message}</p> : null}
        <div className="app-dialog-actions">
          {isConfirm ? (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="app-dialog-action-btn"
              onClick={onClose}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            size="lg"
            className={`app-dialog-action-btn ${confirmClass}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait…' : resolvedConfirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
