/**
 * storageKeys — centralised localStorage key names.
 * Single source of truth to avoid typos and key collisions.
 *
 * DEMO/ASSIGNMENT ONLY — not production auth.
 */
const STORAGE_KEYS = {
  /** Current logged-in user session (no passwordHash stored) */
  CURRENT_USER:  "cijs_current_user",
  /** Online presence map { [accountId]: { status, lastSeenAt } } */
  ONLINE_USERS:  "cijs_online_users",
  /** Message store fallback when /messages API is unavailable */
  MESSAGES:      "cijs_messages",
};

export default STORAGE_KEYS;
