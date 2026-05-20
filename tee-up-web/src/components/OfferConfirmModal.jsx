import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { formatOfferMessage } from '../utils/chatOffers';
import './OfferConfirmModal.css';

export default function OfferConfirmModal({
  open,
  offerAmount,
  listingTitle,
  onCancel,
  onConfirm,
}) {
  if (!open || offerAmount == null) return null;

  const formattedOffer = formatOfferMessage(offerAmount);
  const listingLabel = listingTitle?.trim() ? `"${listingTitle.trim()}"` : 'this listing';

  return (
    <div className="offer-confirm-overlay" onClick={onCancel} role="presentation">
      <div
        className="offer-confirm-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-confirm-title"
      >
        <div className="offer-confirm-icon-wrap" aria-hidden>
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h3 id="offer-confirm-title" className="offer-confirm-title">
          Submit this offer?
        </h3>
        <p className="offer-confirm-message">
          You are about to offer <strong>{formattedOffer}</strong> on {listingLabel}.
        </p>
        <p className="offer-confirm-warning">
          Once submitted, your offer is locked and cannot be changed. Double-check the amount
          before continuing.
        </p>
        <div className="offer-confirm-actions">
          <Button
            variant="outline"
            size="lg"
            type="button"
            className="offer-confirm-action-btn"
            onClick={onCancel}
          >
            Go back
          </Button>
          <Button
            type="button"
            size="lg"
            className="offer-confirm-submit-btn offer-confirm-action-btn"
            onClick={onConfirm}
          >
            Yes, submit offer
          </Button>
        </div>
      </div>
    </div>
  );
}
