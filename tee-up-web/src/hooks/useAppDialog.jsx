import { useCallback, useRef, useState } from 'react';
import AppDialog from '../components/AppDialog';

/**
 * Replaces window.confirm / window.alert with styled in-app dialogs.
 */
export function useAppDialog() {
  const resolverRef = useRef(null);
  const [dialog, setDialog] = useState(null);

  const closeDialog = useCallback((result) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setDialog(null);
  }, []);

  const showConfirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        mode: 'confirm',
        variant: options.variant || 'primary',
        title: options.title || 'Are you sure?',
        message: options.message || '',
        confirmLabel: options.confirmLabel || 'Confirm',
        cancelLabel: options.cancelLabel || 'Cancel',
        loading: false,
      });
    });
  }, []);

  const showAlert = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        mode: 'alert',
        variant: options.variant || 'info',
        title: options.title || 'Notice',
        message: options.message || '',
        confirmLabel: options.confirmLabel || 'OK',
        cancelLabel: 'Cancel',
        loading: false,
      });
    });
  }, []);

  const AppDialogHost = useCallback(
    function AppDialogHostComponent() {
      if (!dialog) return null;

      return (
        <AppDialog
          open
          mode={dialog.mode}
          variant={dialog.variant}
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          cancelLabel={dialog.cancelLabel}
          loading={dialog.loading}
          onClose={() => closeDialog(false)}
          onConfirm={() => closeDialog(true)}
        />
      );
    },
    [dialog, closeDialog]
  );

  return { showConfirm, showAlert, AppDialogHost };
}
