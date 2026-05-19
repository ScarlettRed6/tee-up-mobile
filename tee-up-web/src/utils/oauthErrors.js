/** Remove OAuth query params so back/forward does not resurrect old errors. */
export function stripOAuthQueryParams() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('error') && !params.has('auth')) return;
  params.delete('error');
  params.delete('auth');
  const qs = params.toString();
  window.history.replaceState({}, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
}

const DEV_OAUTH_HINTS = [
  'redirect_uri_mismatch',
  'google cloud',
  'authorized redirect',
  'javascript origins',
  'oauth client ending',
  'copy both for will',
  '9oumv',
];

const SHORT_ERRORS = {
  unauthorized: 'Google sign-in was cancelled or denied.',
  oauth_failed: 'Google sign-in failed. Please try again.',
  server_error: 'Something went wrong during Google sign-in. Please try again.',
  google_callback_failed: 'Could not complete Google sign-in. Please try again.',
};

/** User-facing message only — never show Google Cloud setup instructions in the UI. */
export function normalizeOAuthErrorParam(raw) {
  if (!raw) return null;

  if (SHORT_ERRORS[raw]) return SHORT_ERRORS[raw];

  let msg = raw;
  try {
    msg = decodeURIComponent(raw.replace(/\+/g, ' '));
  } catch {
    msg = raw;
  }

  const lower = msg.toLowerCase();
  if (DEV_OAUTH_HINTS.some((hint) => lower.includes(hint))) {
    return 'Google sign-in could not be completed. Please try again.';
  }

  if (msg.length > 240) {
    return 'Google sign-in failed. Please try again.';
  }

  return msg;
}
