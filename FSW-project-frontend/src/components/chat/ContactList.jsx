import presenceService from "../../services/presenceService";
import "./ContactList.css";

/**
 * ContactList — renders pre-filtered contact list with online/offline badges.
 * Filtering is done by the parent (Chat page) using useMemo + debounce.
 *
 * Props:
 *   contacts       - already-filtered array of account objects
 *   selected       - currently selected contact._id
 *   onSelect       - fn(contact) called on click
 *   searchQuery    - raw search input value (for controlled input display only)
 *   onSearchChange - fn(e) called when search changes (debounced in parent)
 */
const ROLE_COLORS = {
  admin:   "#4D44B5",
  teacher: "#f57c00",
  student: "#2e7d32",
};

const ContactList = ({ contacts = [], selected, onSelect, searchQuery = "", onSearchChange }) => {
  return (
    <div className="contactList">
      <div className="contactSearchBox">
        <input
          type="text"
          placeholder="Search contacts…"
          value={searchQuery}
          onChange={onSearchChange}
          className="contactSearchInput"
        />
      </div>

      {contacts.length === 0 ? (
        <p className="contactEmpty">No contacts found.</p>
      ) : (
        contacts.map((contact) => {
          const online = presenceService.isOnline(contact._id);
          const initials = (contact.name ?? contact.email ?? "?")
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
          const roleColor = ROLE_COLORS[contact.role] ?? "#4D44B5";

          return (
            <button
              key={contact._id}
              className={`contactItem${selected === contact._id ? " active" : ""}`}
              onClick={() => onSelect(contact)}
              title={contact.email}
            >
              {/* Avatar */}
              <div className="contactAvatar" style={{ background: roleColor }}>
                {initials}
                <span className={`presenceDot ${online ? "online" : "offline"}`} />
              </div>

              {/* Info */}
              <div className="contactInfo">
                <span className="contactName">{contact.name ?? contact.email}</span>
                <span className="contactMeta">
                  <span className="contactRole" style={{ color: roleColor }}>
                    {contact.role}
                  </span>
                  {" · "}
                  <span className={`presenceLabel ${online ? "online" : "offline"}`}>
                    {online ? "Online" : "Offline"}
                  </span>
                </span>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
};

export default ContactList;
