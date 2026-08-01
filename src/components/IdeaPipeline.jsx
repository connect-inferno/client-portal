import React, { useState, useMemo } from "react";
import { 
  Lightbulb, 
  Plus, 
  Search, 
  DollarSign, 
  Calendar, 
  User, 
  ArrowRight, 
  Archive, 
  Copy, 
  Trash2, 
  CheckCircle2,
  BellOff
} from "lucide-react";
import IdeaModal from "./IdeaModal";
import UserAvatar from "./UserAvatar";

export default function IdeaPipeline({
  ideas = [],
  teamMembers = [],
  onSaveIdea,
  onUpdateIdeaStage,
  onDeleteIdea,
  onConvertIdeaToTask
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState("All");
  const [activeIdeaModal, setActiveIdeaModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const stages = [
    "Idea Created",
    "Research",
    "Planning",
    "Ready for Execution",
    "In Progress",
    "Completed"
  ];

  // Filter ideas
  const filteredIdeas = useMemo(() => {
    return ideas.filter(i => {
      if (!showArchived && (i.stage === "Archived" || i.isArchived)) return false;
      if (showArchived && !(i.stage === "Archived" || i.isArchived)) return false;

      const matchSearch = i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStage = selectedStage === "All" || i.stage === selectedStage;
      return matchSearch && matchStage;
    });
  }, [ideas, searchTerm, selectedStage, showArchived]);

  // Group by stage for Kanban
  const kanbanColumns = useMemo(() => {
    const cols = {};
    stages.forEach(stg => {
      cols[stg] = filteredIdeas.filter(i => i.stage === stg);
    });
    return cols;
  }, [filteredIdeas, stages]);

  const handleDragStart = (e, ideaId) => {
    e.dataTransfer.setData("text/plain", ideaId);
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const ideaId = e.dataTransfer.getData("text/plain");
    if (ideaId) {
      onUpdateIdeaStage(ideaId, targetStage);
    }
  };

  const handleDuplicate = (idea) => {
    onSaveIdea({
      ...idea,
      id: undefined,
      title: `${idea.title} (Copy)`,
      stage: "Idea Created",
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="dashboard-view animate-fade-in">
      {/* Header Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Lightbulb size={20} color="var(--primary-coral)" />
            Business & Product Idea Innovation Pipeline
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
            Track business ideas through structured validation lifecycle stages into actionable tasks.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowArchived(!showArchived)}
            style={{ fontSize: "13px" }}
          >
            <Archive size={15} />
            {showArchived ? "Show Active Ideas" : "Show Archived"}
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={() => { setActiveIdeaModal(null); setIsModalOpen(true); }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Propose Idea
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div className="search-wrapper" style={{ flex: 1, minWidth: "260px" }}>
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search ideas by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value)}
          className="sort-select"
        >
          <option value="All">All Stages</option>
          {stages.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Stage Kanban Board */}
      <div className="kanban-board" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(240px, 1fr))`, overflowX: "auto" }}>
        {stages.map(stage => {
          const colIdeas = kanbanColumns[stage] || [];
          return (
            <div
              key={stage}
              className="kanban-column"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {/* Column Header */}
              <div className="kanban-column-header">
                <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-heading)" }}>
                  {stage}
                </span>
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                  ({colIdeas.length})
                </span>
              </div>

              {/* Ideas Cards */}
              {colIdeas.length > 0 ? (
                colIdeas.map(idea => (
                  <div
                    key={idea.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idea.id)}
                    className="task-card"
                    style={{ borderLeft: "4px solid var(--primary-coral)" }}
                    onClick={() => { setActiveIdeaModal(idea); setIsModalOpen(true); }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-heading)" }}>
                        {idea.title}
                      </h4>
                    </div>

                    {idea.problemStatement && (
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        Problem: {idea.problemStatement}
                      </p>
                    )}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px" }}>
                      <span>Est. Rev: ₹{(idea.expectedRevenue || 0).toLocaleString()}</span>
                      <span>Timeline: {idea.timeline || "N/A"}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid var(--border-slate)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <UserAvatar name={idea.owner} size={20} />
                        <span style={{ fontSize: "11px", color: "var(--text-main)" }}>{idea.owner}</span>
                      </div>

                      <div style={{ display: "flex", gap: "4px" }} onClick={(e) => e.stopPropagation()}>
                        <button type="button" title="Duplicate" onClick={() => handleDuplicate(idea)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)" }}>
                          <Copy size={13} />
                        </button>
                        <button type="button" title="Archive" onClick={() => onUpdateIdeaStage(idea.id, "Archived")} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)" }}>
                          <Archive size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", padding: "32px 8px", color: "var(--text-muted)", fontSize: "12px" }}>
                  No ideas in {stage}.
                </div>
              )}
            </div>
          );
        })}
      </div>

      <IdeaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        idea={activeIdeaModal}
        teamMembers={teamMembers}
        onSaveIdea={onSaveIdea}
        onDeleteIdea={onDeleteIdea}
        onConvertIdeaToTask={onConvertIdeaToTask}
      />
    </div>
  );
}
