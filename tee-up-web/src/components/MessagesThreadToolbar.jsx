import { useState } from 'react';
import { Flag, MoreHorizontal, Pencil, Star } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useLoginPrompt } from '../context/LoginPromptContext';
import ReportModal from './ReportModal';
import './MessagesThreadToolbar.css';

/**
 * Thread header actions — spaced layout to reduce misclicks between
 * view listing, rate, and report.
 */
export default function MessagesThreadToolbar({
  listingId,
  onViewListing,
  canRate = false,
  ratingsLoading = false,
  hasRatedUser = false,
  onOpenRating,
  showReport = false,
  reportUserId,
  reportUserLabel = '',
  user,
}) {
  const [reportOpen, setReportOpen] = useState(false);
  const { openLogin } = useLoginPrompt();

  const handleReportSelect = () => {
    if (!reportUserId) return;
    if (!user?.id) {
      openLogin({ tab: 'login' });
      return;
    }
    setReportOpen(true);
  };

  const showRate = canRate && !ratingsLoading;
  const showViewListing = Boolean(listingId && onViewListing);
  const showMore = showReport;

  if (!showViewListing && !showRate && !showMore) {
    return null;
  }

  return (
    <>
      <div className="messages-thread-toolbar" role="toolbar" aria-label="Conversation actions">
        {showViewListing ? (
          <Button
            type="button"
            size="sm"
            className="messages-thread-btn messages-thread-btn-view"
            onClick={() => onViewListing(listingId)}
          >
            <span className="messages-thread-btn-view-label--long">View listing</span>
            <span className="messages-thread-btn-view-label--short">Listing</span>
          </Button>
        ) : null}

        {showRate ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="messages-thread-btn messages-thread-btn-rate"
              onClick={onOpenRating}
              aria-label={hasRatedUser ? 'Edit review' : 'Rate user'}
            >
              {hasRatedUser ? (
                <>
                  <Pencil className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="messages-thread-btn-rate-label">Edit review</span>
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="messages-thread-btn-rate-label">Rate</span>
                </>
              )}
            </Button>
          </>
        ) : null}

        {showMore ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="messages-thread-btn messages-thread-btn-more"
                  aria-label="More actions"
                >
                  <MoreHorizontal className="h-4 w-4" aria-hidden />
                  <span className="messages-thread-btn-more-label">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="messages-thread-menu">
                <DropdownMenuItem
                  variant="destructive"
                  className="messages-thread-menu-report"
                  onSelect={handleReportSelect}
                >
                  <Flag className="h-4 w-4" aria-hidden />
                  Report user
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : null}
      </div>

      {showReport ? (
        <ReportModal
          open={reportOpen}
          reportType="user"
          targetId={reportUserId}
          targetLabel={reportUserLabel}
          onClose={() => setReportOpen(false)}
        />
      ) : null}
    </>
  );
}
