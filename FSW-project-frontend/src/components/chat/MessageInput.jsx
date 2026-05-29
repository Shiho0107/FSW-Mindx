import { useState } from "react";
import "./MessageInput.css";

/**
 * MessageInput — chat message composer with send button.
 * Validates non-empty body before calling onSend.
 * Supports Enter to send, Shift+Enter for newline.
 *
 * Props:
 *   onSend   - async fn(body: string) → void
 *   disabled - bool
 */
const MessageInput = ({ onSend, disabled = false }) => {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const trimmed = body.trim();
    if (!trimmed) return; // validated — no empty messages
    setSending(true);
    try {
      await onSend(trimmed);
      setBody("");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="messageInputBar">
      <textarea
        className="messageInputField"
        placeholder="Write your message… (Enter to send)"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || sending}
        rows={1}
      />
      <button
        className="messageSendBtn"
        onClick={handleSend}
        disabled={disabled || sending || !body.trim()}
        title="Send message"
      >
        {sending ? "…" : "➤"}
      </button>
    </div>
  );
};

export default MessageInput;
