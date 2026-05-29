import { useEffect, useRef } from "react";
import { makeConversationId } from "../../services/chatService";
import "./MessageThread.css";

/**
 * MessageThread — renders message bubbles for a conversation.
 * Relies on React text rendering (no dangerouslySetInnerHTML) → XSS-safe.
 *
 * Props:
 *   messages      - array of message objects
 *   myAccountId   - current user's account _id (required for privacy filter)
 *   contactId     - selected contact's _id (required for privacy filter)
 *   contact       - contact account object { name, email }
 *   loading       - bool
 *
 * PRIVACY: renders ONLY messages where (from=me,to=contact) OR (from=contact,to=me).
 * This is defense-in-depth — caller should already pass filtered data.
 */
const MessageThread = ({ messages = [], myAccountId, contactId, contact, loading }) => {
  const bottomRef = useRef(null);

  // PRIVACY: secondary filter — only render messages for this exact conversation
  const conversationId = myAccountId && contactId
    ? makeConversationId(myAccountId, contactId)
    : null;
  const safe = conversationId
    ? messages.filter(
        (m) =>
          m.conversationId === conversationId &&
          ((m.fromAccountId === myAccountId && m.toAccountId === contactId) ||
           (m.fromAccountId === contactId   && m.toAccountId === myAccountId))
      )
    : [];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [safe]);

  if (loading) {
    return <div className="threadLoading"><div className="spinner" /></div>;
  }

  if (safe.length === 0) {
    return (
      <div className="threadEmpty">
        <span style={{ fontSize: 36 }}>💬</span>
        <p>No messages yet. Say hello!</p>
      </div>
    );
  }

  return (
    <div className="messageThread">
      {safe.map((msg) => {
        const isMe = msg.fromAccountId === myAccountId;
        const time = new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div key={msg.id} className={`msgRow ${isMe ? "mine" : "theirs"}`}>
            {!isMe && (
              <div className="msgAvatarSmall">
                {(contact?.name ?? "?")[0].toUpperCase()}
              </div>
            )}
            <div className="msgBubbleGroup">
              {/* body is plain text from React — no dangerouslySetInnerHTML */}
              <div className="msgBubble">{msg.body}</div>
              <span className="msgTime">
                {time}
                {isMe && <span className="readIndicator">{msg.readAt ? " ✓✓" : " ✓"}</span>}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageThread;
