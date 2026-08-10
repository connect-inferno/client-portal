import React, { useState } from "react";
import { X, Lightbulb, DollarSign, Calendar, User, Tag, ArrowRight, Paperclip, MessageSquare } from "lucide-react";
import { removeDuplicateTeamMembers } from "../utils/teamUtils";

export default function IdeaModal({
  isOpen,
  onClose,
  idea = null,
  teamMembers = [],
  onSaveIdea,
  onDeleteIdea,
  onConvertIdeaToTask
}) {
  if (!isOpen) return null;

  const uniqueMembers = removeDuplicateTeamMembers(teamMembers);
  const isEditing = !!idea;

  const [title, setTitle] = useState(idea?.title || "");
  const [description, setDescription] = useState(idea?.description || "");
  const [problemStatement, setProblemStatement] = useState(idea?.problemStatement || "");
  const [proposedSolution, setProposedSolution] = useState(idea?.proposedSolution || "");
  const [owner, setOwner] = useState(idea?.owner || teamMembers[0]?.name || "Alex Rivers");
  const [budget, setBudget] = useState(idea?.budget || 50000);
  const [expectedRevenue, setExpectedRevenue] = useState(idea?.expectedRevenue || 250000);
  const [timeline, setTimeline] = useState(idea?.timeline || "4 Weeks");
  const [reminderDate, setReminderDate] = useState(idea?.reminderDate || "");
  const [priority, setPriority] = useState(idea?.priority || "Medium");
  const [category, setCategory] = useState(idea?.category || "Product Enhancement");
  const [stage, setStage] = useState(idea?.stage || "Idea Created");

  const stages = [
    "Idea Created",
    "Research",
    "Planning",
    "Ready for Execution",
    "In Progress",
    "Completed",
    "Archived"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter an idea title.");
      return;
    }

    const ownerMember = teamMembers.find(m => m.name === owner);

    onSaveIdea({
      ...idea,
      title: title.trim(),
      description: description.trim(),
      problemStatement: problemStatement.trim(),
      proposedSolution: proposedSolution.trim(),
      owner,
      ownerAvatar: ownerMember?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      budget: Number(budget) || 0,
      expectedRevenue: Number(expectedRevenue) || 0,
      timeline,
      reminderDate,
      priority,
      category,
      stage,
      isArchived: stage === "Archived"
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Lightbulb size={20} color="var(--primary-coral)" />
            {isEditing ? "Edit Idea Proposal" : "Submit New Product / Business Idea"}
          </h2>
          <button type="button" onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
              Idea Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AI-Powered Lead Scoring System"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="search-input"
              style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border-slate)", borderRadius: "8px" }}
            />
          </div>

          {/* Problem & Solution */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                Problem Statement
              </label>
              <textarea
                rows={3}
                placeholder="What operational pain point does this solve?"
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-slate)", background: "var(--card-bg)", color: "var(--text-main)", fontFamily: "inherit" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                Proposed Solution
              </label>
              <textarea
                rows={3}
                placeholder="What is the high-level implementation strategy?"
                value={proposedSolution}
                onChange={(e) => setProposedSolution(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border-slate)", background: "var(--card-bg)", color: "var(--text-main)", fontFamily: "inherit" }}
              />
            </div>
          </div>

          {/* Selectors Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                Workflow Stage
              </label>
              <select value={stage} onChange={(e) => setStage(e.target.value)} className="sort-select" style={{ width: "100%" }}>
                {stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                Idea Owner
              </label>
              <select value={owner} onChange={(e) => setOwner(e.target.value)} className="sort-select" style={{ width: "100%" }}>
                {uniqueMembers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                Estimated Budget (₹)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--border-slate)", background: "var(--card-bg)", color: "var(--text-main)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                Expected Revenue (₹)
              </label>
              <input
                type="number"
                value={expectedRevenue}
                onChange={(e) => setExpectedRevenue(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--border-slate)", background: "var(--card-bg)", color: "var(--text-main)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                Timeline / Duration
              </label>
              <input
                type="text"
                placeholder="e.g. 4 Weeks"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--border-slate)", background: "var(--card-bg)", color: "var(--text-main)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-main)", marginBottom: "6px" }}>
                Reminder Date
              </label>
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid var(--border-slate)", background: "var(--card-bg)", color: "var(--text-main)" }}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid var(--border-slate)" }}>
            <div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    onConvertIdeaToTask(idea);
                    onClose();
                  }}
                  className="btn-secondary"
                  style={{ fontSize: "12px", background: "var(--primary-coral-light)", color: "var(--primary-coral)", borderColor: "var(--primary-coral-border)" }}
                >
                  ⚡ Convert Idea to Execution Task
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {isEditing ? "Save Changes" : "Submit Proposal"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
