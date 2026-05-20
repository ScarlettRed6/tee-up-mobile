import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useLoginPrompt } from '../context/LoginPromptContext';
import ReportModal from './ReportModal';
import './ReportIconButton.css';

/**
 * Flag icon that opens the report modal. Prompts guests to sign in.
 */
export default function ReportIconButton({
  reportType,
  targetId,
  targetLabel = '',
  user,
  className,
  disabled = false,
  title = 'Report',
  onSuccess,
}) {
  const [open, setOpen] = useState(false);
  const { openLogin } = useLoginPrompt();

  const handleClick = () => {
    if (disabled || !targetId) return;
    if (!user?.id) {
      openLogin({ tab: 'login' });
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('report-icon-btn', className)}
        onClick={handleClick}
        disabled={disabled || !targetId}
        aria-label={title}
        title={title}
      >
        <Flag className="h-5 w-5" aria-hidden />
      </Button>
      <ReportModal
        open={open}
        reportType={reportType}
        targetId={targetId}
        targetLabel={targetLabel}
        onClose={() => setOpen(false)}
        onSuccess={onSuccess}
      />
    </>
  );
}
