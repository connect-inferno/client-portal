import React, { useState } from "react";
import { X, Calendar, Clock, User, Tag, AlertCircle, Paperclip, MessageSquare, History, Plus } from "lucide-react";

export default function TaskModal({
  isOpen,
  onClose,
  task = null,
  teamMembers = [],
  onSaveTask,
  onDeleteTask
}) {
  if (!isOpen) return null;

  const isEditing = !!task;

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [category, setCategory] = useState(task?.category || "Client Work");
  const [priority, setPriority] = useState(task?.priority || "Medium"); // Low, Medium, High, Urgent
  const [dueDate, setDueDate] = useState(task?.dueDate || new Date().toISOString().split("T")[0]);
  const [dueTime, setDueTime] = useState(task?.dueTime || "17:00");
  const [estimatedDuration, setEstimatedDuration] = useState(task?.estimatedDuration || "1h");
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo || teamMembers[0]?.name || "Alex Rivers");
  const [repeatSchedule, setRepeatSchedule] = useState(task?.repeatSchedule || "None"); // None, Daily, Weekly, Monthly
  const [notes, setNotes] = useState(task?.notes || "");
  const [attachments, setAttachments] = useState(task?.attachments || []);
  const [comments, setComments] = useState(task?.comments || []);
  const [newCommentText, setNewCommentText] = useState("");
  const [newAttachmentUrl, setNewAttachmentUrl] = useState("");
  const [newAttachmentName, setNewAttachmentName] = useState("");

  const categories = ["Client Work", "Development", "Design", "Sales", "Marketing", "Operations", "Admin"];
  const priorities = ["Low", "Medium", "High", "Urgent"];

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    const comment = {
      id: `c-${Date.now()}`,
      author: "Alex Rivers",
      text: newCommentText.trim(),
      createdAt: new Date().toISOString()
    };
    setComments([...comments, comment]);
    setNewCommentText("");
  };

  const handleAddAttachment = () => {
    if (!newAttachmentName.trim() || !newAttachmentUrl.trim()) return;
    setAttachments([...attachments, { name: newAttachmentName.trim(), url: newAttachmentUrl.trim() }]);
    setNewAttachmentName("");
    setNewAttachmentUrl("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    const assignedMember = teamMembers.find(m => m.name === assignedTo);

    const taskPayload = {
      ...task,
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      dueDate,
      dueTime,
      estimatedDuration,
      assignedTo,
      assignedAvatar: assignedMember?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      repeatSchedule,
      notes,
      attachments,
      comments,
      status: task?.status || (dueDate < new Date().toISOString().split("T")[0] ? "Overdue" : "Pending")
    };

    onSaveTask(taskPayload);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-heading)" }}>
            {isEditing ? "Edit Task Details" : "Create New Execution Task"}
          </h2>
          <button type="button" onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Audit Firebase Security Rules"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="search-input"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border-slate)", borderRadius: "8px" }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Detail key acceptance criteria and steps..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border-slate)", borderRadius: "8px", background: "var(--card-bg)", color: "var(--text-main)", fontFamily: "inherit" }}
            />
          </div>

          {/* Grid of Selectors */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="sort-select"
                style={{ width: "100%" }}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="sort-select"
                style={{ width: "100%" }}
              >
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-slate)", background: "var(--card-bg)", color: "var(--text-main)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                Due Time & Duration
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid var(--border-slate)", background: "var(--card-bg)", color: "var(--text-main)" }}
                />
                <input
                  type="text"
                  placeholder="e.g. 1.5h"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  style={{ width: "80px", padding: "8px", borderRadius: "8px", border: "1px solid var(--border-slate)", background: "var(--card-bg)", color: "var(--text-main)" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                Assigned Team Member
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="sort-select"
                style={{ width: "100%" }}
              >
                {teamMembers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                Repeat Schedule
              </label>
              <select
                value={repeatSchedule}
                onChange={(e) => setRepeatSchedule(e.target.value)}
                className="sort-select"
                style={{ width: "100%" }}
              >
                <option value="None">None</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Attachments Section */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
              Attachments & Links ({attachments.length})
            </label>
            {attachments.map((att, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-slate)", padding: "6px 10px", borderRadius: "6px", marginBottom: "4px", fontSize: "12px" }}>
                <a href={att.url} target="_blank" rel="noreferrer" style={{ color: "var(--primary-coral)", fontWeight: 500 }}>
                  🔗 {att.name}
                </a>
                <button type="button" onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))} style={{ border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}>
                  <X size={14} />
                </button>
              </div>
            ))}
            <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
              <input
                type="text"
                placeholder="Link Name"
                value={newAttachmentName}
                onChange={(e) => setNewAttachmentName(e.target.value)}
                style={{ flex: 1, padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border-slate)", fontSize: "12px" }}
              />
              <input
                type="url"
                placeholder="https://..."
                value={newAttachmentUrl}
                onChange={(e) => setNewAttachmentUrl(e.target.value)}
                style={{ flex: 1, padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border-slate)", fontSize: "12px" }}
              />
              <button type="button" onClick={handleAddAttachment} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                Add
              </button>
            </div>
          </div>

          {/* Comments Thread */}
          {isEditing && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                Comments & Discussion
              </label>
              <div style={{ maxHeight: "140px", overflowY: "auto", background: "var(--bg-slate)", borderRadius: "8px", padding: "8px", marginBottom: "8px" }}>
                {comments.map((c) => (
                  <div key={c.id} style={{ marginBottom: "6px", fontSize: "12px" }}>
                    <span style={{ fontWeight: 600, color: "var(--text-heading)" }}>{c.author}: </span>
                    <span style={{ color: "var(--text-main)" }}>{c.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  style={{ flex: 1, padding: "6px 10px", borderRadius: "6px", border: "1px solid var(--border-slate)", fontSize: "12px" }}
                />
                <button type="button" onClick={handleAddComment} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                  Comment
                </button>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid var(--border-slate)" }}>
            {isEditing ? (
              <button
                type="button"
                onClick={() => { onDeleteTask(task.id); onClose(); }}
                style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
              >
                Delete Task
              </button>
            ) : <div />}

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {isEditing ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
