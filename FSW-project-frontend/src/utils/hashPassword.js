/**
 * hashPassword — SHA-256 via browser Web Crypto API.
 * Returns a hex string. Async.
 *
 * Option C hybrid auth for assignment.
 * Accounts stored in mock API /accounts;
 * localStorage only holds the current session under cijs_current_user.
 */
export const hashPassword = async (plaintext) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};
