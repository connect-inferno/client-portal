import React, { useState, useMemo } from "react";
import { 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  AlertCircle, 
  BellOff, 
  CalendarPlus, 
  Trash2, 
  Edit3 
} from "lucide-react";
import TaskModal from "./TaskModal";

export default function MyTasks({
  tasks = [],
  currentUser = "Alex Rivers",
  teamMembers = [],
  onSaveTask,
  onUpdateTaskStatus,
  onDeleteTask
}) {
  const [activeTab, setActiveTab] = useState("today"); // 'today' | 'tomorrow' | 'upcoming' | 'completed' | 'overdue'
  const [userFilter, setUserFilter] = useState(currentUser);
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split("T")[0];

  // Filter user specific tasks
  const myTasks = useMemo(() => {
    return tasks.filter(t => t.assignedTo === userFilter);
  }, [tasks, userFilter]);

  // Tab categorization
  const categorised = useMemo(() => {
    return {
      today: myTasks.filter(t => t.dueDate === todayStr && t.status !== "Completed"),
      tomorrow: myTasks.filter(t => t.dueDate === tomorrowStr && t.status !== "Completed"),
      upcoming: myTasks.filter(t => t.dueDate > tomorrowStr && t.status !== "Completed"),
      completed: myTasks.filter(t => t.status === "Completed"),
      overdue: myTasks.filter(t => t.status === "Overdue" || (t.dueDate < todayStr && t.status !== "Completed"))
    };
  }, [myTasks, todayStr, tomorrowStr]);

  const currentTabTasks = categorised[activeTab] || [];

  // Reschedule helper
  const handleReschedule = (task, daysToAdd) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    const newDueDate = d.toISOString().split("T")[0];
    onSaveTask({
      ...task,
      dueDate: newDueDate,
      status: "Pending"
    });
  };

  // Snooze helper
  const handleSnooze = (task) => {
    handleReschedule(task, 1);
  };

  return (
    <div className="dashboard-view animate-fade-in">
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "8px" }}>
            <UserCheck size={20} color="var(--primary-coral)" />
            Personalized Workspace - My Tasks
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
            Focused task stream assigned directly to you.
          </p>
        </div>

        {/* User Switcher Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>Active Member:</span>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="sort-select"
          >
            {teamMembers.map(m => (
              <option key={m.id} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="subnav-bar" style={{ marginBottom: "20px" }}>
        {[
          { id: "today", label: `Today (${categorised.today.length})`, icon: Clock },
          { id: "tomorrow", label: `Tomorrow (${categorised.tomorrow.length})`, icon: Calendar },
          { id: "upcoming", label: `Upcoming (${categorised.upcoming.length})`, icon: CalendarPlus },
          { id: "overdue", label: `Overdue (${categorised.overdue.length})`, icon: AlertCircle },
          { id: "completed", label: `Completed (${categorised.completed.length})`, icon: CheckCircle2 },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`subnav-tab ${isActive ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tasks Stream List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {currentTabTasks.length > 0 ? (
          currentTabTasks.map((t) => (
            <div 
              key={t.id}
              style={{
                background: "var(--card-bg)",
                border: "1px solid var(--border-slate)",
                borderRadius: "14px",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "var(--shadow-sm)",
                transition: "all var(--transition-fast)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
                <button
                  type="button"
                  onClick={() => onUpdateTaskStatus(t.id, t.status === "Completed" ? "Pending" : "Completed")}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: t.status === "Completed" ? "#10b981" : "var(--text-light)"
                  }}
                >
                  <CheckCircle2 size={22} />
                </button>
                <div>
                  <h4 style={{ 
                    fontSize: "15px", 
                    fontWeight: 600, 
                    color: "var(--text-heading)",
                    textDecoration: t.status === "Completed" ? "line-through" : "none" 
                  }}>
                    {t.title}
                  </h4>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                    <span style={{ background: "var(--bg-slate)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border-slate)" }}>
                      {t.category}
                    </span>
                    <span>Due: {t.dueDate} at {t.dueTime || "17:00"}</span>
                    <span>Duration: {t.estimatedDuration || "1h"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  title="Reschedule to Tomorrow"
                  className="btn-secondary"
                  style={{ padding: "6px 10px", fontSize: "12px" }}
                  onClick={() => handleReschedule(t, 1)}
                >
                  <CalendarPlus size={14} />
                  Tomorrow
                </button>

                <button
                  type="button"
                  title="Snooze 1 Day"
                  className="btn-secondary"
                  style={{ padding: "6px 10px", fontSize: "12px" }}
                  onClick={() => handleSnooze(t)}
                >
                  <BellOff size={14} />
                  Snooze
                </button>

                <button
                  type="button"
                  title="Edit Task"
                  className="icon-button"
                  style={{ width: "32px", height: "32px" }}
                  onClick={() => { setEditingTask(t); setIsModalOpen(true); }}
                >
                  <Edit3 size={15} />
                </button>

                <button
                  type="button"
                  title="Delete Task"
                  className="icon-button"
                  style={{ width: "32px", height: "32px", color: "#ef4444" }}
                  onClick={() => onDeleteTask(t.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "var(--card-bg)",
            border: "1px dashed var(--border-slate)",
            borderRadius: "16px",
            color: "var(--text-muted)"
          }}>
            No tasks in "{activeTab}" for {userFilter}. You are all clear! 🎉
          </div>
        )}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
        teamMembers={teamMembers}
        onSaveTask={onSaveTask}
        onDeleteTask={onDeleteTask}
      />
    </div>
  );
}
