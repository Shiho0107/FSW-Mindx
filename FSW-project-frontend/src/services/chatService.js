/**
 * chatService — message persistence layer.
 *
 * PRIVACY: Messages are STRICTLY filtered to the two participants only.
 * User A can NEVER see messages between B and C.
 *
 * Storage: localStorage["cijs_messages"] ONLY.
 *
 * NOTE — why not the /messages API:
 *   The mock /messages API returns HTTP 200 with seeded data that uses an
 *   INCOMPATIBLE schema: { senderId, senderName, timestamp, isRead }.
 *   This seed data lacks fromAccountId/toAccountId, which broke privacy
 *   filtering — the seeded messages appeared in every conversation.
 *
 *   Fix: we bypass the API entirely and use localStorage for all
 *   app-created messages. No mock seed data is ever displayed.
 *
 *   If /messages is later updated to the correct schema, restore API calls
 *   and re-enable the tryApi path.
 *
 * Message schema (our app):
 *   { id, conversationId, fromAccountId, toAccountId, body, createdAt, readAt }
 *
 * Privacy rule:
 *   A message is visible to user A viewing contact B ONLY when:
 *     (msg.fromAccountId === A && msg.toAccountId === B) OR
 *     (msg.fromAccountId === B && msg.toAccountId === A)
 *
 * DEMO/ASSIGNMENT ONLY.
 */
import STORAGE_KEYS from "../constants/storageKeys";

// ─── Deterministic conversation ID (order-independent) ───────────────────────
/**
 * makeConversationId — produces the same ID regardless of argument order.
 * Used to index both sides of a conversation to the same thread.
 */
export const makeConversationId = (idA, idB) => [idA, idB].sort().join("__");

// ─── Privacy filter helper ────────────────────────────────────────────────────
/**
 * isParticipant — returns true ONLY if both accountA and accountB are the
 * exact sender/receiver pair for this message. Defense against schema drift.
 */
const isParticipant = (msg, accountA, accountB) =>
  (msg.fromAccountId === accountA && msg.toAccountId === accountB) ||
  (msg.fromAccountId === accountB && msg.toAccountId === accountA);

// ─── localStorage helpers ─────────────────────────────────────────────────────
const lsRead = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const lsWrite = (messages) =>
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));

// ─── Public API ───────────────────────────────────────────────────────────────
const chatService = {
  /**
   * getMessages — returns ONLY messages where currentUserId and contactId
   * are the exact two participants. No other messages are returned.
   *
   * Filter is applied on BOTH conversationId AND explicit fromAccountId/toAccountId
   * for defense-in-depth.
   */
  async getMessages(currentUserId, contactId) {
    if (!currentUserId || !contactId) return [];
    const conversationId = makeConversationId(currentUserId, contactId);

    // Always read from localStorage — never read from the incompatible mock API
    return lsRead().filter(
      (m) =>
        m.conversationId === conversationId &&
        isParticipant(m, currentUserId, contactId)
    );
  },

  /**
   * sendMessage — creates a message with all required privacy fields.
   * Validates non-empty body. Persists to localStorage only.
   */
  async sendMessage(currentUserId, contactId, body) {
    const trimmed = body?.trim();
    if (!trimmed) throw new Error("Message body cannot be empty.");
    if (!currentUserId || !contactId) throw new Error("Invalid participants.");

    const msg = {
      id:            `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      conversationId: makeConversationId(currentUserId, contactId),
      fromAccountId:  currentUserId,
      toAccountId:    contactId,
      body:           trimmed,
      createdAt:      new Date().toISOString(),
      readAt:         null,
    };

    const all = lsRead();
    all.push(msg);
    lsWrite(all);
    return msg;
  },

  /**
   * markRead — marks a message as read in localStorage.
   */
  async markRead(messageId) {
    const all = lsRead();
    const idx = all.findIndex((m) => m.id === messageId);
    if (idx !== -1) {
      all[idx].readAt = new Date().toISOString();
      lsWrite(all);
    }
  },
};

export default chatService;
