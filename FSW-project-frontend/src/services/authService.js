/**
 * authService — Option C hybrid mode.
 *
 * Account persistence: mock API /accounts (via accountApi).
 * Current session: localStorage["cijs_current_user"] only.
 * Password storage: SHA-256 hash only — plain password is NEVER stored.
 * Online presence: presenceService updated on login/logout.
 *
 * DEMO/ASSIGNMENT ONLY — not production-safe.
 */
import accountApi from "../api/accountApi";
import { hashPassword } from "../utils/hashPassword";
import presenceService from "./presenceService";
import STORAGE_KEYS from "../constants/storageKeys";

// ─── Session helpers ──────────────────────────────────────────────────────────

const saveSession = (user) =>
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const logout = (accountId) => {
  const id = accountId ?? getCurrentUser()?._id;
  if (id) presenceService.markOffline(id);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  // Clean up old localStorage account DB key from previous implementation
  localStorage.removeItem("cijs_accounts");
};

// ─── Login ────────────────────────────────────────────────────────────────────

const login = async (email, password) => {
  let accounts;
  try {
    accounts = await accountApi.getAll();
  } catch (err) {
    const msg = String(err?.message ?? "").toLowerCase();
    if (
      msg.includes("500") ||
      msg.includes("not found") ||
      msg.includes("something went wrong")
    ) {
      throw new Error(
        "Accounts resource not initialized. Please use the seed button to create the admin account."
      );
    }
    throw new Error("Unable to reach account service. Please try again.");
  }

  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new Error(
      "No accounts exist yet. Please use the seed button to create the admin account."
    );
  }

  const hashed = await hashPassword(password);
  const match  = accounts.find(
    (a) =>
      a.email?.toLowerCase() === email.trim().toLowerCase() &&
      a.passwordHash === hashed
  );

  if (!match) throw new Error("Invalid email or password.");

  // Store only safe session fields — never store passwordHash
  const session = {
    _id:             match._id,
    email:           match.email,
    role:            match.role,
    name:            match.name,
    linkedProfileId: match.linkedProfileId ?? null,
  };
  saveSession(session);
  presenceService.markOnline(match._id);
  return session;
};

// ─── Admin seed ───────────────────────────────────────────────────────────────

const seedAdmin = async () => {
  const passwordHash = await hashPassword("admin123");

  try {
    const existing = await accountApi.getAll();
    if (
      Array.isArray(existing) &&
      existing.some((a) => a.email === "admin@school.com")
    ) {
      return { alreadyExists: true };
    }
  } catch {
    // Collection may not exist yet — proceed to create
  }

  const result = await accountApi.create({
    email:           "admin@school.com",
    passwordHash,
    role:            "admin",
    name:            "Admin",
    linkedProfileId: null,
  });

  return { alreadyExists: false, result };
};

// ─── Account creation (used after profile creation) ───────────────────────────

/**
 * Create a login account on mock API /accounts.
 * plainPassword is hashed before storing — never persisted in plain text.
 */
const createAccount = async ({ email, plainPassword, role, name, linkedProfileId }) => {
  const passwordHash = await hashPassword(plainPassword);
  return accountApi.create({
    email,
    passwordHash,
    role,
    name,
    linkedProfileId: linkedProfileId ?? null,
  });
};

// ─── Exports ──────────────────────────────────────────────────────────────────

const authService = {
  login,
  logout,
  getCurrentUser,
  seedAdmin,
  createAccount,
  isLoggedIn: () => Boolean(getCurrentUser()),
  getRole:    () => getCurrentUser()?.role ?? null,
};

export default authService;
