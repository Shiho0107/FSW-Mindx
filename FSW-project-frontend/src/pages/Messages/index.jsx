import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import conversationApi from "../../api/conversationApi";
import messageApi from "../../api/messageApi";
import useSocket from "../../hooks/useSocket";
import NewChatModal from "./NewChatModal";
import { initials } from "../../utils/format";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Search, 
  CheckCheck, 
  Check, 
  Users, 
  UserCheck, 
  Paperclip, 
  Smile, 
  MoreVertical 
} from "lucide-react";
import "./Messages.css";

const Messages = () => {
  const { user } = useAuth();
  const userId = user?.id || user?._id;

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const [filterTab, setFilterTab] = useState("all"); // "all" | "direct" | "group"
  const [searchConv, setSearchConv] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // convId -> username

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { socket, onlineUsers } = useSocket(userId);

  // Fetch Conversations for current user
  const fetchConversations = async () => {
    if (!userId) return;
    try {
      setLoadingConv(true);
      const res = await conversationApi.getAll({ userId });
      setConversations(res || []);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [userId]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConv?._id) return;

    setLoadingMsgs(true);
    messageApi
      .getMessages({ conversationId: activeConv._id })
      .then((data) => {
        setMessages(data || []);
        // Mark as read
        if (userId) {
          conversationApi.markAsRead(activeConv._id, userId).then(() => {
            setConversations((prev) =>
              prev.map((c) =>
                c._id === activeConv._id
                  ? { ...c, unreadCounts: { ...(c.unreadCounts || {}), [userId]: 0 } }
                  : c
              )
            );
          });
        }
      })
      .catch((err) => console.error("Failed to load messages:", err))
      .finally(() => setLoadingMsgs(false));

    // Join Socket Room
    if (socket) {
      socket.emit("join_conversation", activeConv._id);
    }

    return () => {
      if (socket) {
        socket.emit("leave_conversation", activeConv._id);
      }
    };
  }, [activeConv?._id, socket, userId]);

  // Handle Socket events
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      if (msg.conversationId === activeConv?._id) {
        setMessages((prev) => [...prev, msg]);
      }
      fetchConversations();
    };

    const handleUserTyping = ({ conversationId, userName }) => {
      setTypingUsers((prev) => ({ ...prev, [conversationId]: userName }));
    };

    const handleUserStopTyping = ({ conversationId }) => {
      setTypingUsers((prev) => {
        const copy = { ...prev };
        delete copy[conversationId];
        return copy;
      });
    };

    socket.on("receive_message", handleReceiveMessage);
    socket.on("user_typing", handleUserTyping);
    socket.on("user_stop_typing", handleUserStopTyping);
    socket.on("conversation_updated", () => fetchConversations());

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("user_typing", handleUserTyping);
      socket.off("user_stop_typing", handleUserStopTyping);
      socket.off("conversation_updated");
    };
  }, [socket, activeConv?._id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  // Typing event emitter
  const handleInputChange = (e) => {
    setNewMessageText(e.target.value);

    if (socket && activeConv?._id) {
      socket.emit("typing", {
        conversationId: activeConv._id,
        userId,
        userName: user?.name || "Someone",
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop_typing", { conversationId: activeConv._id, userId });
      }, 2000);
    }
  };

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeConv?._id || !userId) return;

    const textToSend = newMessageText.trim();
    setNewMessageText("");

    if (socket) {
      socket.emit("stop_typing", { conversationId: activeConv._id, userId });
    }

    try {
      const savedMsg = await messageApi.sendMessage({
        conversationId: activeConv._id,
        sender: userId,
        content: textToSend,
      });

      setMessages((prev) => [...prev, savedMsg]);

      // Broadcast over socket
      if (socket) {
        socket.emit("send_message", savedMsg);
      }

      // Update sidebar conversation preview locally
      setConversations((prev) =>
        prev.map((c) =>
          c._id === activeConv._id
            ? { ...c, lastMessage: textToSend, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Helper to extract display name & avatar for 1-on-1 vs Group
  const getConversationDetails = (conv) => {
    if (conv.isGroup) {
      return {
        title: conv.name || "Group Chat",
        avatar: conv.groupAvatar || null,
        isOnline: false,
        subtext: `${conv.participants?.length || 0} members`,
      };
    }
    const otherUser = (conv.participants || []).find((p) => p._id !== userId) || {};
    const isOnline = onlineUsers.includes(otherUser._id);
    return {
      title: otherUser.name || otherUser.email || "Direct Chat",
      avatar: otherUser.avatar || null,
      role: otherUser.role,
      isOnline,
      subtext: isOnline ? "Online" : "Offline",
      otherUser,
    };
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (filterTab === "direct" && c.isGroup) return false;
    if (filterTab === "group" && !c.isGroup) return false;
    if (searchConv.trim()) {
      const { title } = getConversationDetails(c);
      return title.toLowerCase().includes(searchConv.toLowerCase());
    }
    return true;
  });

  return (
    <div className="messagesPageContainer">
      {/* LEFT SIDEBAR PANEL */}
      <div className="conversationSidebar">
        <div className="conversationSidebarHeader">
          <div className="sidebarTitleRow">
            <h2>Messages</h2>
            <button
              type="button"
              className="newChatBtn"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={15} /> New Chat
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchConv}
              onChange={(e) => setSearchConv(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px 8px 32px",
                border: "1.5px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
                outline: "none",
              }}
            />
          </div>

          <div className="conversationFilterTabs">
            <button
              type="button"
              className={`filterTab ${filterTab === "all" ? "active" : ""}`}
              onClick={() => setFilterTab("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`filterTab ${filterTab === "direct" ? "active" : ""}`}
              onClick={() => setFilterTab("direct")}
            >
              Direct
            </button>
            <button
              type="button"
              className={`filterTab ${filterTab === "group" ? "active" : ""}`}
              onClick={() => setFilterTab("group")}
            >
              Groups
            </button>
          </div>
        </div>

        <div className="conversationList">
          {loadingConv ? (
            <LoadingSpinner message="Loading chats…" />
          ) : filteredConversations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 15px", color: "#94a3b8", fontSize: "13px" }}>
              No conversations found.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const details = getConversationDetails(conv);
              const isActive = activeConv?._id === conv._id;
              const unreadCount = conv.unreadCounts?.[userId] || 0;

              return (
                <div
                  key={conv._id}
                  className={`conversationCard ${isActive ? "active" : ""}`}
                  onClick={() => setActiveConv(conv)}
                >
                  <div className="avatarWrapper">
                    <div className={`userAvatar ${conv.isGroup ? "groupAvatarBadge" : ""}`}>
                      {conv.isGroup ? (
                        <Users size={20} />
                      ) : details.avatar ? (
                        <img src={details.avatar} alt={details.title} />
                      ) : (
                        initials(details.title)
                      )}
                    </div>
                    {!conv.isGroup && details.isOnline && <div className="onlineIndicator" />}
                  </div>

                  <div className="conversationInfo">
                    <div className="convTopRow">
                      <span className="convName">{details.title}</span>
                      {conv.lastMessageAt && (
                        <span className="convTime">
                          {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <div className="convBottomRow">
                      <span className="convPreview">
                        {conv.lastMessage || "Started a conversation"}
                      </span>
                      {unreadCount > 0 && <span className="unreadBadge">{unreadCount}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT CHAT MAIN WINDOW */}
      <div className="chatWindow">
        {activeConv ? (
          <>
            {/* CHAT HEADER */}
            <div className="chatHeader">
              {(() => {
                const details = getConversationDetails(activeConv);
                return (
                  <>
                    <div className="chatHeaderLeft">
                      <div className="avatarWrapper">
                        <div className={`userAvatar ${activeConv.isGroup ? "groupAvatarBadge" : ""}`}>
                          {activeConv.isGroup ? (
                            <Users size={22} />
                          ) : details.avatar ? (
                            <img src={details.avatar} alt={details.title} />
                          ) : (
                            initials(details.title)
                          )}
                        </div>
                        {!activeConv.isGroup && details.isOnline && <div className="onlineIndicator" />}
                      </div>
                      <div>
                        <h3 className="chatHeaderTitle">{details.title}</h3>
                        <div className="chatHeaderSub">
                          {details.role && <span className="roleTag">{details.role}</span>}
                          <span>{details.subtext}</span>
                        </div>
                      </div>
                    </div>
                    <button type="button" style={{ background: "none", border: "none", cursor: "pointer" }}>
                      <MoreVertical size={20} color="#64748b" />
                    </button>
                  </>
                );
              })()}
            </div>

            {/* MESSAGES STREAM */}
            <div className="messagesStream">
              {loadingMsgs ? (
                <LoadingSpinner message="Loading messages…" />
              ) : messages.length === 0 ? (
                <div style={{ margin: "auto", color: "#94a3b8", fontSize: "13px", textAlign: "center" }}>
                  👋 Wave hello! Send a message to start chatting.
                </div>
              ) : (
                messages.map((msg, index) => {
                  const senderId = typeof msg.sender === "object" ? msg.sender?._id : msg.sender;
                  const isOutgoing = senderId === userId;
                  const senderName = typeof msg.sender === "object" ? msg.sender?.name : "User";

                  return (
                    <div
                      key={msg._id || index}
                      className={`messageRow ${isOutgoing ? "outgoing" : "incoming"}`}
                    >
                      {!isOutgoing && activeConv.isGroup && (
                        <div className="userAvatar" style={{ width: "30px", height: "30px", fontSize: "11px" }}>
                          {initials(senderName)}
                        </div>
                      )}
                      <div className="messageBubble">
                        {!isOutgoing && activeConv.isGroup && (
                          <div className="messageSenderName">{senderName}</div>
                        )}
                        <div>{msg.content}</div>
                        <div className="messageTime">
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {isOutgoing && <CheckCheck size={14} color="#ffffff" style={{ opacity: 0.9 }} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {typingUsers[activeConv._id] && (
                <div className="typingIndicatorRow">
                  <span>{typingUsers[activeConv._id]} is typing…</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* CHAT INPUT BAR */}
            <div className="chatInputContainer">
              <form onSubmit={handleSendMessage} className="chatInputForm">
                <button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessageText}
                  onChange={handleInputChange}
                  className="chatInputField"
                />
                <button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                  <Smile size={20} />
                </button>
                <button type="submit" className="sendMsgBtn" disabled={!newMessageText.trim()}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="emptyState">
            <MessageSquare size={48} style={{ color: "#cbd5e1" }} />
            <h3 style={{ margin: 0, color: "#303972" }}>Select a Conversation</h3>
            <p style={{ margin: 0, fontSize: "13px" }}>Choose from your existing chats or start a new conversation.</p>
          </div>
        )}
      </div>

      {/* NEW CHAT MODAL */}
      <NewChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUserId={userId}
        onSelectConversation={(conv) => {
          setConversations((prev) => [conv, ...prev.filter((c) => c._id !== conv._id)]);
          setActiveConv(conv);
        }}
      />
    </div>
  );
};

export default Messages;
