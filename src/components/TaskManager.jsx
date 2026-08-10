import React, { useState, useMemo, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Kanban, 
  List, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles,
  Trash2,
  Check,
  User,
  Tag,
  Flame,
  Calendar
} from "lucide-react";
import TaskModal from "./TaskModal";

import UserAvatar from "./UserAvatar";
import { removeDuplicateTeamMembers } from "../utils/teamUtils";

export default function TaskManager({
  tasks = [],
  teamMembers = [],
  onSaveTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onBulkUpdate
}) {
  const uniqueMembers = removeDuplicateTeamMembers(teamMembers);
  const [viewMode, setViewMode] = useState("kanban"); // 'kanban' | 'list'
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [activeTaskModal, setActiveTaskModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [celebratingTaskId, setCelebratingTaskId] = useState(null);

  // Quick Add State
  const [quickTitle, setQuickTitle] = useState("");

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === "All" || t.category === categoryFilter;
      const matchAssignee = assigneeFilter === "All" || t.assignedTo === assigneeFilter;
      return matchSearch && matchCategory && matchAssignee;
    });
  }, [tasks, searchTerm, categoryFilter, assigneeFilter]);

  // Group by Status for Kanban
  const kanbanColumns = useMemo(() => {
    return {
      Pending: filteredTasks.filter(t => t.status === "Pending"),
      Completed: filteredTasks.filter(t => t.status === "Completed"),
      Overdue: filteredTasks.filter(t => t.status === "Overdue"),
      Future: filteredTasks.filter(t => t.status === "Future")
    };
  }, [filteredTasks]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        setActiveTaskModal(null);
        setIsModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onSaveTask({
      title: quickTitle.trim(),
      category: "Client Work",
      priority: "Medium",
      dueDate: new Date().toISOString().split("T")[0],
      assignedTo: teamMembers[0]?.name || "Alex Rivers"
    });
    setQuickTitle("");
  };

  const handleToggleTaskComplete = (task) => {
    const newStatus = task.status === "Completed" ? "Pending" : "Completed";
    if (newStatus === "Completed") {
      setCelebratingTaskId(task.id);
      setTimeout(() => setCelebratingTaskId(null), 1000);
    }
    onUpdateTaskStatus(task.id, newStatus);
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      if (targetStatus === "Completed") {
        setCelebratingTaskId(taskId);
        setTimeout(() => setCelebratingTaskId(null), 1000);
      }
      onUpdateTaskStatus(taskId, targetStatus);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Bulk Actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTaskIds(filteredTasks.map(t => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleSelectTask = (id) => {
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkComplete = () => {
    selectedTaskIds.forEach(id => onUpdateTaskStatus(id, "Completed"));
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = () => {
    selectedTaskIds.forEach(id => onDeleteTask(id));
    setSelectedTaskIds([]);
  };

  return (
    <div className="dashboard-view animate-fade-in">
      {/* Controls Bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        {/* Search and Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "280px" }}>
          <div className="search-wrapper" style={{ flex: 1 }}>
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="sort-select"
          >
            <option value="All">All Categories</option>
            <option value="Client Work">Client Work</option>
            <option value="Development">Development</option>
            <option value="Design">Design</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="sort-select"
          >
            <option value="All">All Assignees</option>
            {uniqueMembers.map(m => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* View Mode Toggle & Add Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", background: "var(--card-bg)", border: "1px solid var(--border-slate)", borderRadius: "8px", padding: "3px" }}>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              style={{
                padding: "6px 12px",
                border: "none",
                background: viewMode === "kanban" ? "var(--primary-coral-light)" : "transparent",
                color: viewMode === "kanban" ? "var(--primary-coral)" : "var(--text-muted)",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 600
              }}
            >
              <Kanban size={15} />
              Kanban
            </button>

            <button
              type="button"
              onClick={() => setViewMode("list")}
              style={{
                padding: "6px 12px",
                border: "none",
                background: viewMode === "list" ? "var(--primary-coral-light)" : "transparent",
                color: viewMode === "list" ? "var(--primary-coral)" : "var(--text-muted)",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 600
              }}
            >
              <List size={15} />
              List
            </button>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={() => { setActiveTaskModal(null); setIsModalOpen(true); }}
          >
            <Plus size={16} strokeWidth={2.5} />
            New Task (N)
          </button>
        </div>
      </div>

      {/* Quick Task Add Row */}
      <form onSubmit={handleQuickAdd} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="⚡ Quick Task: Type task title and press Enter to instantly create..."
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          className="search-input"
          style={{ flex: 1, border: "1px dashed var(--border-slate)", background: "var(--card-bg)" }}
        />
        <button type="submit" className="btn-secondary" style={{ whiteSpace: "nowrap" }}>
          Quick Add
        </button>
      </form>

      {/* Bulk Action Bar */}
      {selectedTaskIds.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--primary-coral-light)", border: "1px solid var(--primary-coral-border)", padding: "10px 16px", borderRadius: "10px", marginBottom: "16px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--primary-coral)" }}>
            {selectedTaskIds.length} tasks selected
          </span>
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={handleBulkComplete} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
              <Check size={14} /> Mark Completed
            </button>
            <button type="button" onClick={handleBulkDelete} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px", color: "#ef4444" }}>
              <Trash2 size={14} /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* KANBAN BOARD VIEW */}
      {viewMode === "kanban" && (
        <div className="kanban-board">
          {Object.entries(kanbanColumns).map(([status, columnTasks]) => {
            const statusClass = status.toLowerCase();
            return (
              <div 
                key={status} 
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="kanban-column-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className={`status-badge ${statusClass}`}>
                      {status}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)" }}>
                      ({columnTasks.length})
                    </span>
                  </div>
                </div>

                {columnTasks.length > 0 ? (
                  columnTasks.map(task => {
                    const isHighPriority = task.priority === "High" || task.priority === "Urgent";
                    const isCelebrating = celebratingTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={`task-card ${isHighPriority ? "high-priority-border" : ""} ${isCelebrating ? "celebrate-animation" : ""}`}
                        onClick={() => { setActiveTaskModal(task); setIsModalOpen(true); }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "8px" }}>
                          <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-heading)", textDecoration: task.status === "Completed" ? "line-through" : "none" }}>
                            {task.title}
                          </h4>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleToggleTaskComplete(task); }}
                            style={{
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              color: task.status === "Completed" ? "#10b981" : "var(--text-light)"
                            }}
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        </div>

                        {task.description && (
                          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px", lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {task.description}
                          </p>
                        )}

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)" }}>
                          <span style={{ background: "var(--bg-slate)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border-slate)" }}>
                            {task.category || "General"}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Calendar size={12} />
                            <span>{task.dueDate}</span>
                          </div>
                        </div>

                        {/* Assignee Avatar */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px", paddingTop: "8px", borderTop: "1px solid var(--border-slate)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <UserAvatar name={task.assignedTo} size={22} />
                            <span style={{ fontSize: "11px", color: "var(--text-main)", fontWeight: 500 }}>{task.assignedTo}</span>
                          </div>
                          {isHighPriority && (
                            <span style={{ color: "#f97316", fontSize: "10px", fontWeight: 700, background: "rgba(249, 115, 22, 0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                              {task.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: "center", padding: "32px 8px", color: "var(--text-muted)", fontSize: "12px" }}>
                    No tasks in {status}. Drop items here!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-slate)", borderRadius: "16px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "var(--bg-slate)", borderBottom: "1px solid var(--border-slate)", color: "var(--text-muted)" }}>
                <th style={{ padding: "12px 16px" }}>
                  <input type="checkbox" onChange={handleSelectAll} checked={selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0} />
                </th>
                <th style={{ padding: "12px 16px" }}>Task Title</th>
                <th style={{ padding: "12px 16px" }}>Category</th>
                <th style={{ padding: "12px 16px" }}>Priority</th>
                <th style={{ padding: "12px 16px" }}>Assignee</th>
                <th style={{ padding: "12px 16px" }}>Due Date</th>
                <th style={{ padding: "12px 16px" }}>Status</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map(t => (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--border-slate)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <input type="checkbox" checked={selectedTaskIds.includes(t.id)} onChange={() => handleSelectTask(t.id)} />
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-heading)", textDecoration: t.status === "Completed" ? "line-through" : "none", cursor: "pointer" }} onClick={() => { setActiveTaskModal(t); setIsModalOpen(true); }}>
                      {t.title}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{t.category}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: t.priority === "High" || t.priority === "Urgent" ? "#ef4444" : "var(--text-main)" }}>
                        {t.priority}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>{t.assignedTo}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{t.dueDate}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span className={`status-badge ${t.status.toLowerCase()}`}>{t.status}</span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button type="button" onClick={() => handleToggleTaskComplete(t)} className="btn-secondary" style={{ padding: "4px 8px", fontSize: "11px" }}>
                        {t.status === "Completed" ? "Reopen" : "Done"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                    No tasks match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={activeTaskModal}
        teamMembers={teamMembers}
        onSaveTask={onSaveTask}
        onDeleteTask={onDeleteTask}
      />
    </div>
  );
}
