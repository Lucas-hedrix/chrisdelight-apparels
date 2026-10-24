const KNOWN_TYPES: Record<string, string> = {
  user_invalid_credentials: 'Wrong email or password.',
  user_already_exists: 'An account with this email already exists.',
  user_not_found: 'No account found with that email.',
  general_rate_limited: 'Too many attempts. Try again in a minute.',
  user_session_already_exists: "You're already signed in.",
};

const NETWORK_HINTS = ['failed to fetch', 'load failed', 'networkerror', 'network request failed'];

export function logError(err: unknown) {
  console.error('[Cybernexus]', err);
}

// Full error detail goes to the console; only clean copy reaches the UI.
export function friendlyError(err: any, fallback = 'Something went wrong. Please try again.'): string {
  logError(err);
  const byType = KNOWN_TYPES[err?.type] ?? KNOWN_TYPES[err?.code];
  if (byType) return byType;
  const msg = String(err?.message ?? '').toLowerCase();
  if (NETWORK_HINTS.some((h) => msg.includes(h))) {
    return "Can't reach the server. Check your connection and try again.";
  }
  if (err?.code === 429 || msg.includes('rate limit')) {
    return 'Too many attempts. Try again in a minute.';
  }
  return fallback;
}
