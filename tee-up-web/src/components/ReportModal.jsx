import { useEffect, useRef, useState } from 'react';
import { Flag, ImagePlus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { submitReportListing, submitReportUser } from '../api/reportsApi';
import './ReportModal.css';

const REASON_PRESETS = [
  'Spam or scam',
  'Inappropriate content',
  'Misleading or fake listing',
  'Harassment or abuse',
  'Other',
];

const MIN_REASON_LENGTH = 10;

export default function ReportModal({
  open = false,
  reportType = 'listing',
  targetId,
  targetLabel = '',
  onClose,
  onSuccess,
}) {
  const [reason, setReason] = useState('');
  const [preset, setPreset] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const title =
    reportType === 'listing'
      ? `Report listing${targetLabel ? `: ${targetLabel}` : ''}`
      : `Report user${targetLabel ? `: ${targetLabel}` : ''}`;

  const subjectNoun = reportType === 'listing' ? 'listing' : 'user';

  useEffect(() => {
    if (!open) return;
    setReason('');
    setPreset('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setError('');
    setSubmitted(false);
    setSubmitting(false);
  }, [open, targetId, reportType]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  if (!open) return null;

  const trimmedReason = reason.trim();
  const canSubmit = trimmedReason.length >= MIN_REASON_LENGTH && !submitting && !submitted;

  const handlePreset = (value) => {
    setPreset(value);
    if (value !== 'Other') {
      setReason(value);
    } else {
      setReason('');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5 MB or smaller.');
      return;
    }
    setError('');
    setPhotoFile(file);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!targetId) {
      setError('Missing report target.');
      return;
    }
    if (trimmedReason.length < MIN_REASON_LENGTH) {
      setError(`Please provide at least ${MIN_REASON_LENGTH} characters.`);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      if (reportType === 'listing') {
        await submitReportListing(targetId, trimmedReason, photoFile);
      } else {
        await submitReportUser(targetId, trimmedReason, photoFile);
      }
      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to submit report. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose?.();
  };

  return (
    <div className="report-modal-overlay" onClick={handleClose} role="presentation">
      <div
        className="report-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        <div className="report-modal-head">
          <div className="report-modal-icon-wrap" aria-hidden>
            <Flag className="h-5 w-5" />
          </div>
          <h3 id="report-modal-title" className="report-modal-title">
            {submitted ? 'Report submitted' : title}
          </h3>
          <button
            type="button"
            className="report-modal-close"
            onClick={handleClose}
            disabled={submitting}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <>
            <p className="report-modal-message">
              Thank you for helping keep Tee Up safe. Our team will review your report.
            </p>
            <div className="report-modal-actions app-btn-row">
              <Button type="button" size="lg" className="report-modal-submit-btn" onClick={handleClose}>
                Done
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="report-modal-message">
              Tell us why you&apos;re reporting this {subjectNoun}. Reports are reviewed by our team.
            </p>

            <div className="report-modal-presets" role="group" aria-label="Common reasons">
              {REASON_PRESETS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`report-modal-preset${preset === item ? ' report-modal-preset-active' : ''}`}
                  onClick={() => handlePreset(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="report-modal-field">
              <Label htmlFor="report-reason">Details *</Label>
              <textarea
                id="report-reason"
                className="report-modal-textarea"
                placeholder="Describe the issue in detail…"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError('');
                }}
                rows={5}
              />
              <p className="report-modal-hint">Minimum {MIN_REASON_LENGTH} characters</p>
            </div>

            <div className="report-modal-field">
              <Label>Screenshot (optional)</Label>
              <p className="report-modal-hint">Add an image to support your report (max 5 MB).</p>
              {photoPreview ? (
                <div className="report-modal-photo-preview">
                  <img src={photoPreview} alt="Report attachment preview" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemovePhoto}
                    disabled={submitting}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="report-modal-photo-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={submitting}
                >
                  <ImagePlus className="h-4 w-4" />
                  Add photo
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="report-modal-file-input"
                onChange={handlePhotoChange}
              />
            </div>

            {error ? (
              <p className="report-modal-error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="report-modal-actions app-btn-row">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="report-modal-action-btn"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="lg"
                className="report-modal-submit-btn report-modal-action-btn"
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                {submitting ? 'Submitting…' : 'Submit report'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
