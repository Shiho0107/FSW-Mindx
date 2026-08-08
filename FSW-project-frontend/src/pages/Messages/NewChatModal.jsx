import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import accountApi from "../../api/accountApi";
import groupApi from "../../api/groupApi";
import conversationApi from "../../api/conversationApi";
import { initials } from "../../utils/format";
import { Search, X, Users, UserCheck, MessageSquare, Plus } from "lucide-react";

const NewChatModal = ({ isOpen, onClose, currentUserId, onSelectConversation }) => {
  const { user, role } = useAuth();
  const isStudent = role === "student";

  const [tab, setTab] = useState("direct"); // "direct" | "group"
  const [accounts, setAccounts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Group creation state
  const [groupName, setGroupName] = useState("");
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [presetGroupSearch, setPresetGroupSearch] = useState("");

  const activeUserId = currentUserId || user?._id || user?.id;

  useEffect(() => {
    if (!isOpen) return;
    if (isStudent) setTab("direct");
    setGroupName("");
    setSelectedAccountIds([]);
    setPresetGroupSearch("");
    setLoading(true);

    Promise.all([
      activeUserId ? accountApi.getScoped({ userId: activeUserId }) : accountApi.getAll(),
      groupApi.getAll(),
    ])
      .then(([accs, grps]) => {
        setAccounts((accs || []).filter((a) => a._id !== activeUserId));
        setGroups(grps || []);
      })
      .catch((err) => console.error("Failed to load users:", err))
      .finally(() => setLoading(false));
  }, [isOpen, activeUserId, isStudent]);

  if (!isOpen) return null;

  const handleStartDirectChat = async (targetUserId) => {
    if (!activeUserId) {
      toast.error("Invalid session. Please log in again.");
      return;
    }
    try {
      const conv = await conversationApi.getOrCreateDirect(activeUserId, targetUserId);
      onSelectConversation(conv);
      onClose();
    } catch (err) {
      console.error("Failed to create direct chat:", err);
      toast.error(err.response?.data?.error || "Failed to start direct chat.");
    }
  };

  const handleCreateGroupChat = async (e) => {
    e.preventDefault();
    if (isStudent) return;
    if (!groupName.trim()) {
      toast.error("Please enter a group name.");
      return;
    }
    if (selectedAccountIds.length === 0) {
      toast.error("Please select at least one member.");
      return;
    }
    if (!activeUserId) {
      toast.error("Invalid session. Please log in again.");
      return;
    }

    setCreatingGroup(true);
    try {
      const validParticipants = Array.from(
        new Set(
          [activeUserId, ...selectedAccountIds].filter(
            (id) => id && typeof id === "string" && id !== "undefined"
          )
        )
      );

      const conv = await conversationApi.createGroup({
        name: groupName.trim(),
        participants: validParticipants,
        groupAdmin: activeUserId,
      });

      toast.success("Group chat created successfully!");
      onSelectConversation(conv);
      onClose();
    } catch (err) {
      console.error("Failed to create group chat:", err);
      toast.error(err.response?.data?.error || err.message || "Failed to create group chat.");
    } finally {
      setCreatingGroup(false);
    }
  };

  const filteredAccounts = accounts.filter(
    (a) =>
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.role?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPresetGroups = groups.filter(
    (g) =>
      g.name?.toLowerCase().includes(presetGroupSearch.toLowerCase()) ||
      g.grade?.toLowerCase().includes(presetGroupSearch.toLowerCase()) ||
      g.description?.toLowerCase().includes(presetGroupSearch.toLowerCase())
  );

  return (
    <div className="filterModalOverlay" onClick={onClose}>
      <div className="filterModal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
        <div className="filterModalHeader">
          <h3>
            <MessageSquare size={18} style={{ color: "#4D44B5" }} />
            Start New Conversation
          </h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={20} color="#a098ae" />
          </button>
        </div>

        {/* Tab Switcher (Only visible to Admin & Teacher) */}
        {!isStudent && (
          <div style={{ display: "flex", padding: "12px 24px 0", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setTab("direct")}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "8px",
                border: "none",
                background: tab === "direct" ? "#4D44B5" : "#f1f5f9",
                color: tab === "direct" ? "#fff" : "#64748b",
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <UserCheck size={15} /> Direct Message
            </button>
            <button
              type="button"
              onClick={() => setTab("group")}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "8px",
                border: "none",
                background: tab === "group" ? "#4D44B5" : "#f1f5f9",
                color: tab === "group" ? "#fff" : "#64748b",
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <Users size={15} /> New Group Chat
            </button>
          </div>
        )}

        <div className="filterModalBody">
          {tab === "direct" ? (
            <>
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  type="text"
                  placeholder="Search user by name, email, or role..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 36px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "10px",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "300px", overflowY: "auto" }}>
                {filteredAccounts.map((acc) => (
                  <div
                    key={acc._id}
                    className="filterModalOption"
                    onClick={() => handleStartDirectChat(acc._id)}
                    style={{ padding: "10px 14px" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div className="userAvatar" style={{ width: "36px", height: "36px", fontSize: "13px" }}>
                        {initials(acc.name || acc.email)}
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#303972" }}>{acc.name || "User"}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                          {acc.email} • <span style={{ textTransform: "capitalize" }}>{acc.role}</span>
                        </div>
                      </div>
                    </div>
                    <Plus size={16} color="#4D44B5" />
                  </div>
                ))}
                {filteredAccounts.length === 0 && !loading && (
                  <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: "13px" }}>
                    No users matching "{search}"
                  </div>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleCreateGroupChat} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Quick Pre-fill from Preset Cohort/Group */}
              {groups.length > 0 && (
                <div style={{ background: "#F8FAFC", padding: "12px", borderRadius: "10px", border: "1.5px dashed #CBD5E1" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#303972", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Users size={15} style={{ color: "#4D44B5" }} /> Quick Import Preset Student Group
                    </label>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>{filteredPresetGroups.length} group(s)</span>
                  </div>

                  {/* Preset Group Search Input */}
                  <div style={{ position: "relative", marginBottom: "8px" }}>
                    <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="text"
                      placeholder="Search preset group by name or grade..."
                      value={presetGroupSearch}
                      onChange={(e) => setPresetGroupSearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "7px 10px 7px 30px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "12px",
                        background: "#ffffff",
                        outline: "none"
                      }}
                    />
                  </div>

                  <select
                    value=""
                    onChange={(e) => {
                      const groupId = e.target.value;
                      if (!groupId) return;
                      const selectedGroup = groups.find((g) => g._id === groupId);
                      if (!selectedGroup) return;

                      // Auto-fill Group Chat Name if empty
                      if (!groupName.trim()) {
                        setGroupName(selectedGroup.name);
                      }

                      // Match accounts belonging to this group
                      const groupStudentProfileIds = new Set(
                        (selectedGroup.students || []).map((s) => (typeof s === "object" ? s._id : s))
                      );

                      const matchingAccountIds = accounts
                        .filter((acc) => groupStudentProfileIds.has(acc.linkedProfileId) || groupStudentProfileIds.has(acc._id))
                        .map((acc) => acc._id);

                      setSelectedAccountIds((prev) => Array.from(new Set([...prev, ...matchingAccountIds])));
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "12px",
                      background: "#fff",
                      cursor: "pointer",
                      color: "#303972"
                    }}
                  >
                    <option value="">-- Choose a Preset Group to Auto-Select Members --</option>
                    {filteredPresetGroups.map((g) => (
                      <option key={g._id} value={g._id}>
                        👥 {g.name} ({g.students?.length || 0} students) {g.grade ? `• ${g.grade}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#303972" }}>Group Name *</label>
                <input
                  required
                  placeholder="e.g. Science Class Cohort A"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "13px",
                    marginTop: "4px",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#303972" }}>
                  Select Group Members * ({selectedAccountIds.length} selected)
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto", marginTop: "4px" }}>
                  {accounts.map((acc) => {
                    const isSelected = selectedAccountIds.includes(acc._id);
                    return (
                      <div
                        key={acc._id}
                        onClick={() =>
                          setSelectedAccountIds((prev) =>
                            isSelected ? prev.filter((id) => id !== acc._id) : [...prev, acc._id]
                          )
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 12px",
                          border: isSelected ? "1.5px solid #4D44B5" : "1px solid #e2e8f0",
                          borderRadius: "8px",
                          background: isSelected ? "#F5F5FF" : "#ffffff",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div className="userAvatar" style={{ width: "30px", height: "30px", fontSize: "11px" }}>
                            {initials(acc.name || acc.email)}
                          </div>
                          <div>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "#303972" }}>{acc.name}</span>
                            <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "6px" }}>({acc.role})</span>
                          </div>
                        </div>
                        <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: "#4D44B5" }} />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", fontSize: "12px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingGroup || !groupName.trim() || selectedAccountIds.length === 0}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: "none",
                    background: groupName.trim() && selectedAccountIds.length > 0 ? "#4D44B5" : "#e2e8f0",
                    color: groupName.trim() && selectedAccountIds.length > 0 ? "#fff" : "#94a3b8",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: groupName.trim() && selectedAccountIds.length > 0 ? "pointer" : "not-allowed",
                  }}
                >
                  {creatingGroup ? "Creating..." : "Create Group Chat"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
