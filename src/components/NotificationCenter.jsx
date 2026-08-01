import React, { useState } from "react";
import { Bell, CheckCheck, Trash2, X, AlertTriangle, CheckCircle2, Info } from "lucide-react";

export default function NotificationCenter({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllRead,
  onClearAll
}) {
  const [filter, setFilter] = useState("all"); // 'all' | 'unread'

  if (!isOpen) return null;

  const filtered = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case "warning":
        return <AlertTriangle size={18} color="#ef4444" />;
      case "success":
        return <CheckCircle2 size={18} color="#10b981" />;
      default:
        return <Info size={18} color="var(--primary-coral)" />;
    }
  };

  return (
    <div className="notification-popover" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="notification-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Bell size={18} color="var(--primary-coral)" />
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-heading)" }}>Notifications</h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button 
            type="button" 
            onClick={onMarkAllRead} 
            title="Mark all as read"
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)" }}
          >
            <CheckCheck size={16} />
          </button>
          <button 
            type="button" 
            onClick={onClearAll} 
            title="Clear all notifications"
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)" }}
          >
            <Trash2 size={16} />
          </button>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)" }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-slate)", padding: "4px 12px", background: "var(--bg-slate)" }}>
        <button
          type="button"
          style={{
            padding: "6px 12px",
            border: "none",
            background: "transparent",
            fontSize: "12px",
            fontWeight: filter === "all" ? 600 : 400,
            color: filter === "all" ? "var(--primary-coral)" : "var(--text-muted)",
            cursor: "pointer"
          }}
          onClick={() => setFilter("all")}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          style={{
            padding: "6px 12px",
            border: "none",
            background: "transparent",
            fontSize: "12px",
            fontWeight: filter === "unread" ? 600 : 400,
            color: filter === "unread" ? "var(--primary-coral)" : "var(--text-muted)",
            cursor: "pointer"
          }}
          onClick={() => setFilter("unread")}
        >
          Unread ({notifications.filter(n => !n.read).length})
        </button>
      </div>

      {/* Notification List */}
      <div className="notification-list">
        {filtered.length > 0 ? (
          filtered.map((n) => (
            <div key={n.id} className={`notification-item ${!n.read ? "unread" : ""}`}>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ marginTop: "2px" }}>{getIcon(n.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-heading)" }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-main)", marginTop: "2px" }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)", fontSize: "13px" }}>
            No notifications to display.
          </div>
        )}
      </div>
    </div>
  );
}
