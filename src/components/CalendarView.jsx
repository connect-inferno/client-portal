import React, { useState, useMemo } from "react";
import { CalendarRange, ChevronLeft, ChevronRight, Plus, CheckCircle2 } from "lucide-react";
import TaskModal from "./TaskModal";

export default function CalendarView({
  tasks = [],
  teamMembers = [],
  onSaveTask,
  onUpdateTaskDate,
  onDeleteTask
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // 'month' | 'week' | 'day'
  const [selectedDateForNewTask, setSelectedDateForNewTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const todayIso = new Date().toISOString().split("T")[0];

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
    const daysCount = lastDayOfMonth.getDate();

    const days = [];
    
    // Padding days from previous month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Days of current month
    for (let d = 1; d <= daysCount; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        dateIso: iso,
        isToday: iso === todayIso
      });
    }

    return days;
  }, [year, month, todayIso]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleCellClick = (dateIso) => {
    if (!dateIso) return;
    setSelectedDateForNewTask(dateIso);
    setIsModalOpen(true);
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDrop = (e, targetDateIso) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId && targetDateIso) {
      onUpdateTaskDate(taskId, targetDateIso);
    }
  };

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  return (
    <div className="dashboard-view animate-fade-in">
      {/* Header Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "8px" }}>
            <CalendarRange size={20} color="var(--primary-coral)" />
            Interactive Calendar & Workload Schedule
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
            Monthly grid view with drag-and-drop rescheduling and date click task creation.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Month Navigation */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--card-bg)", border: "1px solid var(--border-slate)", borderRadius: "8px", padding: "4px 8px" }}>
            <button type="button" onClick={handlePrevMonth} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-main)" }}>
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontSize: "14px", fontWeight: 700, minWidth: "130px", textAlign: "center", color: "var(--text-heading)" }}>
              {monthName} {year}
            </span>
            <button type="button" onClick={handleNextMonth} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-main)" }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Days of Week Header Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", fontWeight: 600, fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Calendar Month Grid */}
      <div className="calendar-month-grid">
        {daysInMonth.map((cell, idx) => {
          if (!cell) {
            return <div key={`empty-${idx}`} style={{ background: "var(--bg-slate)", minHeight: "110px" }} />;
          }

          const cellTasks = tasks.filter(t => t.dueDate === cell.dateIso);
          const completedCount = cellTasks.filter(t => t.status === "Completed").length;

          return (
            <div
              key={cell.dateIso}
              className={`calendar-cell ${cell.isToday ? "today-cell" : ""}`}
              onClick={() => handleCellClick(cell.dateIso)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, cell.dateIso)}
            >
              {/* Day Number Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px", fontWeight: cell.isToday ? 800 : 600, color: cell.isToday ? "var(--primary-coral)" : "var(--text-heading)" }}>
                  {cell.dayNumber}
                </span>
                {cellTasks.length > 0 && (
                  <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                    {completedCount}/{cellTasks.length} done
                  </span>
                )}
              </div>

              {/* Task Cards in Date Cell */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "80px", overflowY: "auto" }}>
                {cellTasks.slice(0, 3).map(t => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, t.id)}
                    style={{
                      background: t.status === "Completed" ? "var(--status-completed-bg)" : "var(--bg-slate)",
                      border: "1px solid var(--border-slate)",
                      borderRadius: "4px",
                      padding: "2px 6px",
                      fontSize: "11px",
                      color: "var(--text-heading)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textDecoration: t.status === "Completed" ? "line-through" : "none"
                    }}
                    onClick={(e) => { e.stopPropagation(); }}
                  >
                    {t.title}
                  </div>
                ))}
                {cellTasks.length > 3 && (
                  <div style={{ fontSize: "10px", color: "var(--primary-coral)", fontWeight: 600 }}>
                    +{cellTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedDateForNewTask ? { dueDate: selectedDateForNewTask } : null}
        teamMembers={teamMembers}
        onSaveTask={onSaveTask}
        onDeleteTask={onDeleteTask}
      />
    </div>
  );
}
