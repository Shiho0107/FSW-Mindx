import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import accountApi from "../../api/accountApi";
import chatService from "../../services/chatService";
import presenceService from "../../services/presenceService";
import ContactList from "../../components/chat/ContactList";
import MessageThread from "../../components/chat/MessageThread";
import MessageInput from "../../components/chat/MessageInput";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { SkeletonCard } from "../../components/common/Skeleton";
import "./Chat.css";

/**
 * Chat page — account-to-account direct messaging.
 *
 * Perf improvements:
 *   - contacts memoised with useMemo (no re-filter on every keystroke)
 *   - search debounced 200ms to avoid per-keystroke re-render of contact list
 *   - handleSelectContact, handleSend wrapped in useCallback
 *   - presence tick drives badge refresh at 60s intervals only
 *   - loadMessages is stable via useCallback
 *
 * Privacy: passwordHash stripped from contacts; chatService enforces participant filter.
 * DEMO/ASSIGNMENT ONLY.
 */
const HEARTBEAT_INTERVAL_MS = 60_000;
const SEARCH_DEBOUNCE_MS    = 200;

const Chat = () => {
  const { user } = useAuth();

  // Contacts (raw, stripped of passwordHash)
  const [contacts, setContacts]       = useState([]);
  const [contactsErr, setContactsErr] = useState(null);
  const [contactsLoading, setContactsLoading] = useState(true);

  // Selected contact
  const [selected, setSelected]       = useState(null);

  // Messages
  const [messages, setMessages]       = useState([]);
  const [msgLoading, setMsgLoading]   = useState(false);

  // Search input (raw) + debounced value
  const [searchRaw, setSearchRaw]     = useState("");
  const [search, setSearch]           = useState("");
  const debounceRef = useRef(null);

  // Presence tick — only causes re-render, not data fetch
  const [presenceTick, setPresenceTick] = useState(0);

  // ── Debounce search input ───────────────────────────────────────────────────
  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setSearchRaw(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(val), SEARCH_DEBOUNCE_MS);
  }, []);

  // ── Contacts filtered by debounced search — memoised ───────────────────────
  const filteredContacts = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.role?.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  // ── Load contacts ───────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setContactsLoading(true);
        const all = await accountApi.getAll();
        if (!cancelled) {
          setContacts(
            (all ?? [])
              .filter((a) => a._id !== user?._id)
              .map(({ passwordHash: _ph, ...safe }) => safe) // never render passwordHash
          );
        }
      } catch (err) {
        if (!cancelled) setContactsErr(err.message ?? "Failed to load contacts.");
      } finally {
        if (!cancelled) setContactsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?._id]);

  // ── Presence heartbeat — 60s interval ──────────────────────────────────────
  useEffect(() => {
    if (!user?._id) return;
    presenceService.markOnline(user._id);
    const hb = setInterval(() => {
      presenceService.heartbeat(user._id);
      setPresenceTick((t) => t + 1); // minimal re-render to refresh presence badges
    }, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(hb);
  }, [user?._id]);

  // ── Load messages when contact changes ─────────────────────────────────────
  const loadMessages = useCallback(async (contact) => {
    if (!user?._id || !contact?._id) return;
    setMsgLoading(true);
    try {
      const msgs = await chatService.getMessages(user._id, contact._id);
      setMessages(msgs);
    } catch {
      setMessages([]);
    } finally {
      setMsgLoading(false);
    }
  }, [user?._id]);

  const handleSelectContact = useCallback((contact) => {
    setSelected(contact);
    setMessages([]); // clear immediately to avoid flash of old messages
    loadMessages(contact);
  }, [loadMessages]);

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = useCallback(async (body) => {
    if (!selected || !user?._id) return;
    const sent = await chatService.sendMessage(user._id, selected._id, body);
    // Append only — no full reload needed
    setMessages((prev) => [...prev, sent]);
  }, [selected, user?._id]);

  // presenceTick drives badge refresh — suppress unused-variable lint
  void presenceTick;

  const contactOnline = useMemo(
    () => (selected ? presenceService.isOnline(selected._id) : false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, presenceTick] // re-evaluate when tick fires
  );

  // ── Skeleton rows for initial load ────────────────────────────────────────
  const contactSkeletons = Array.from({ length: 4 }, (_, i) => (
    <SkeletonCard key={i} />
  ));

  return (
    <div className="chatPage">
      {/* Contact sidebar */}
      <div className="card chatSidebar">
        <h2 className="chatSidebarTitle">Messages</h2>
        {contactsLoading ? (
          <div style={{ padding: "8px 16px" }}>{contactSkeletons}</div>
        ) : contactsErr ? (
          <div className="errorMsg" style={{ padding: 16 }}>{contactsErr}</div>
        ) : (
          <ContactList
            contacts={filteredContacts}
            selected={selected?._id}
            onSelect={handleSelectContact}
            searchQuery={searchRaw}
            onSearchChange={handleSearchChange}
          />
        )}
      </div>

      {/* Chat window */}
      <div className="card chatWindow">
        {selected ? (
          <>
            {/* Chat header */}
            <div className="chatHeader">
              <div className="chatHeaderAvatar">
                {(selected.name ?? "?")[0].toUpperCase()}
                <span className={`presenceDot ${contactOnline ? "online" : "offline"}`} />
              </div>
              <div className="chatHeaderInfo">
                <h3 className="chatHeaderName">{selected.name ?? selected.email}</h3>
                <span className={`chatHeaderStatus ${contactOnline ? "online" : "offline"}`}>
                  {contactOnline ? "● Online" : "○ Offline"}
                </span>
              </div>
            </div>

            {/* Messages — contactId for defense-in-depth privacy filter */}
            <MessageThread
              messages={messages}
              myAccountId={user._id}
              contactId={selected._id}
              contact={selected}
              loading={msgLoading}
            />

            <MessageInput onSend={handleSend} />
          </>
        ) : (
          <div className="chatEmpty">
            <span style={{ fontSize: 52 }}>💬</span>
            <p>Select a contact to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
