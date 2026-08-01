import React from "react";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Flame, 
  TrendingUp, 
  Award,
  ChevronRight,
  Shield
} from "lucide-react";
import UserAvatar from "./UserAvatar";
import MetricCard from "./MetricCard";

export default function TeamDashboard({
  teamMembers = [],
  tasks = [],
  onSelectMember,
  onOpenTeamManagement
}) {
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Calculate overall summary metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const pendingTasks = tasks.filter(t => t.status === "Pending").length;
  const overdueTasks = tasks.filter(t => t.status === "Overdue").length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="dashboard-view animate-fade-in">
      {/* Top Metrics Row */}
      <div className="metrics-grid">
        <MetricCard
          title="Team Members"
          value={teamMembers.length}
          icon={Users}
          type="clients"
        />
        <MetricCard
          title="Team Completion Rate"
          value={`${completionPercentage}%`}
          icon={CheckCircle2}
          type="deployed"
        />
        <MetricCard
          title="Pending Team Tasks"
          value={pendingTasks}
          icon={Clock}
          type="pending"
        />
        <MetricCard
          title="Overdue Tasks"
          value={overdueTasks}
          icon={AlertCircle}
          type="deal-value"
        />
      </div>

      {/* Section Title & Action Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-heading)" }}>
            Daily Team Productivity & Transparency Overview
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
            Real-time individual task execution, streaks, and completion progress.
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={onOpenTeamManagement}
          style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <Shield size={15} color="var(--primary-coral)" />
          + Manage Team Members
        </button>
      </div>

      {/* Team Productivity Grid */}
      <div className="team-grid">
        {teamMembers.map((member) => {
          // Member specific task calculations
          const memberTasks = tasks.filter(t => t.assignedTo === member.name);
          const memberTodayTasks = memberTasks.filter(t => t.dueDate === todayStr);
          const memberCompleted = memberTasks.filter(t => t.status === "Completed").length;
          const memberPending = memberTasks.filter(t => t.status === "Pending").length;
          const memberOverdue = memberTasks.filter(t => t.status === "Overdue").length;
          const memberScore = memberTasks.length > 0 
            ? Math.round((memberCompleted / memberTasks.length) * 100) 
            : 0;

          return (
            <div 
              key={member.id} 
              className="member-card"
              onClick={() => onSelectMember(member)}
            >
              {/* Member Profile Header */}
              <div className="member-header">
                <UserAvatar name={member.name} size={48} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-heading)" }}>{member.name}</h3>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{member.role || "Team Member"}</span>
                </div>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "4px", 
                  background: "var(--primary-coral-light)", 
                  padding: "4px 8px", 
                  borderRadius: "8px", 
                  color: "var(--primary-coral)", 
                  fontSize: "12px", 
                  fontWeight: 700 
                }}>
                  <Flame size={14} fill="currentColor" />
                  {member.streak || 5}d
                </div>
              </div>

              {/* Today's Tasks Progress Bar */}
              <div style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-main)" }}>
                  <span>Today's Execution ({memberTodayTasks.length} tasks)</span>
                  <span style={{ fontWeight: 600 }}>{memberScore}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${memberScore}%` }} />
                </div>
              </div>

              {/* Status Color Counters Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "12px" }}>
                {/* Green - Completed */}
                <div className="status-badge completed" style={{ justifyContent: "center", padding: "6px" }}>
                  <CheckCircle2 size={13} />
                  <span>{memberCompleted} Done</span>
                </div>

                {/* Yellow - Pending */}
                <div className="status-badge pending" style={{ justifyContent: "center", padding: "6px" }}>
                  <Clock size={13} />
                  <span>{memberPending} Pend</span>
                </div>

                {/* Red - Overdue */}
                <div className="status-badge overdue" style={{ justifyContent: "center", padding: "6px" }}>
                  <AlertCircle size={13} />
                  <span>{memberOverdue} Due</span>
                </div>
              </div>

              {/* Click indicator */}
              <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "4px", marginTop: "14px", fontSize: "12px", color: "var(--primary-coral)", fontWeight: 600 }}>
                <span>View Full Profile</span>
                <ChevronRight size={14} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
