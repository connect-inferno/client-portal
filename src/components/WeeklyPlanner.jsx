import React, { useMemo } from "react";
import { CalendarDays, CheckCircle2, Clock } from "lucide-react";

export default function WeeklyPlanner({
  tasks = [],
  onUpdateTaskDate,
  onUpdateTaskStatus
}) {
  // Generate 7 days for current week (Monday to Sunday)
  const daysOfWeek = useMemo(() => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const week = [];
    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isoDate = d.toISOString().split("T")[0];
      const isToday = isoDate === new Date().toISOString().split("T")[0];
      
      week.push({
        name: dayNames[i],
        dateStr: isoDate,
        displayDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        isToday
      });
    }

    return week;
  }, []);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDrop = (e, targetDateStr) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onUpdateTaskDate(taskId, targetDateStr);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="dashboard-view animate-fade-in">
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "8px" }}>
          <CalendarDays size={20} color="var(--primary-coral)" />
          Weekly Execution Drag-and-Drop Planner
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
          Drag task cards across Monday to Sunday columns to instantly reschedule their due dates.
        </p>
      </div>

      <div className="weekly-planner-grid">
        {daysOfWeek.map((day) => {
          const dayTasks = tasks.filter(t => t.dueDate === day.dateStr);
          const completedCount = dayTasks.filter(t => t.status === "Completed").length;
          const completionPct = dayTasks.length > 0 ? Math.round((completedCount / dayTasks.length) * 100) : 0;

          return (
            <div
              key={day.dateStr}
              className={`day-column ${day.isToday ? "today" : ""}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day.dateStr)}
            >
              {/* Header */}
              <div style={{ borderBottom: "1px solid var(--border-slate)", paddingBottom: "8px", marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: day.isToday ? "var(--primary-coral)" : "var(--text-heading)" }}>
                    {day.name}
                  </span>
                  {day.isToday && (
                    <span style={{ fontSize: "10px", background: "var(--primary-coral)", color: "white", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                      TODAY
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {day.displayDate} • {dayTasks.length} tasks
                </div>

                {/* Daily Workload Progress */}
                {dayTasks.length > 0 && (
                  <div style={{ marginTop: "6px" }}>
                    <div style={{ height: "4px", background: "var(--border-slate)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${completionPct}%`, background: "var(--primary-coral)" }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Task List in Column */}
              <div style={{ overflowY: "auto", height: "calc(100% - 60px)" }}>
                {dayTasks.length > 0 ? (
                  dayTasks.map(t => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t.id)}
                      className="task-card"
                      style={{ padding: "10px", marginBottom: "8px", borderLeft: t.status === "Completed" ? "3px solid #10b981" : "3px solid var(--primary-coral)" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-heading)", textDecoration: t.status === "Completed" ? "line-through" : "none" }}>
                          {t.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateTaskStatus(t.id, t.status === "Completed" ? "Pending" : "Completed")}
                          style={{ border: "none", background: "transparent", cursor: "pointer", color: t.status === "Completed" ? "#10b981" : "var(--text-light)" }}
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", fontSize: "11px", color: "var(--text-muted)" }}>
                        <span>{t.assignedTo}</span>
                        <span>{t.dueTime || "17:00"}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", padding: "32px 4px", color: "var(--text-muted)", fontSize: "11px" }}>
                    No tasks. Drag tasks here to assign to {day.name}.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
