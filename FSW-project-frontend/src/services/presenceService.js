/**
 * presenceService — lightweight online/offline tracking via localStorage.
 *
 * DEMO/ASSIGNMENT ONLY. Not suitable for multi-tab or multi-device scenarios.
 * Uses localStorage key defined in storageKeys.js.
 *
 * Presence shape: { [accountId]: { status: "online"|"offline", lastSeenAt: ISO string } }
 */
import STORAGE_KEYS from "../constants/storageKeys";

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 min stale = offline

const read = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ONLINE_USERS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const write = (map) => {
  localStorage.setItem(STORAGE_KEYS.ONLINE_USERS, JSON.stringify(map));
};

const presenceService = {
  /** Call on login — marks account as online */
  markOnline(accountId) {
    if (!accountId) return;
    const map = read();
    map[accountId] = { status: "online", lastSeenAt: new Date().toISOString() };
    write(map);
  },

  /** Call on logout — marks account as offline */
  markOffline(accountId) {
    if (!accountId) return;
    const map = read();
    map[accountId] = { status: "offline", lastSeenAt: new Date().toISOString() };
    write(map);
  },

  /** Heartbeat — refreshes lastSeenAt for active users */
  heartbeat(accountId) {
    if (!accountId) return;
    const map = read();
    if (map[accountId]?.status === "online") {
      map[accountId].lastSeenAt = new Date().toISOString();
      write(map);
    }
  },

  /** Returns true if account is considered online (seen within threshold) */
  isOnline(accountId) {
    if (!accountId) return false;
    const map = read();
    const entry = map[accountId];
    if (!entry || entry.status === "offline") return false;
    const age = Date.now() - new Date(entry.lastSeenAt).getTime();
    return age < ONLINE_THRESHOLD_MS;
  },

  /** Returns the full presence map for all accounts */
  getAll() {
    return read();
  },

  /** Returns { status, lastSeenAt } for a single account */
  getFor(accountId) {
    if (!accountId) return { status: "offline", lastSeenAt: null };
    const map = read();
    return map[accountId] ?? { status: "offline", lastSeenAt: null };
  },
};

export default presenceService;
