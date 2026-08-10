import React from "react";
import { X, Flame, Award, CheckCircle2, Clock, AlertCircle, TrendingUp } from "lucide-react";
import UserAvatar from "./UserAvatar";
import { calculateMemberStreak } from "../utils/teamUtils";

export default function UserProfileModal({ member, isOpen, onClose, tasks = [] }) {
  if (!isOpen || !member) return null;

  const streak = calculateMemberStreak(member.name, tasks);

  // Calculate member specific task metrics
  const memberTasks = tasks.filter(t => t.assignedTo === member.name);
  const completedCount = memberTasks.filter(t => t.status === "Completed").length;
  const pendingCount = memberTasks.filter(t => t.status === "Pending").length;
  const overdueCount = memberTasks.filter(t => t.status === "Overdue").length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "540px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <UserAvatar name={member.name} size={60} />
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-heading)" }}>{member.name}</h2>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>{member.role}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", color: "#f97316", fontSize: "12px", fontWeight: 600 }}>
                <Flame size={14} fill="#f97316" />
                <span>{streak} Day Productivity Streak</span>
              </div>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scores Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
          <div style={{ background: "var(--bg-slate)", border: "1px solid var(--border-slate)", padding: "14px", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--primary-coral)" }}>
              {member.weeklyScore || 90}%
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Weekly Score</div>
          </div>
          <div style={{ background: "var(--bg-slate)", border: "1px solid var(--border-slate)", padding: "14px", borderRadius: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--success-teal)" }}>
              {member.monthlyScore || 88}%
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Monthly Score</div>
          </div>
        </div>

        {/* Execution Breakdown */}
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-slate)", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
          <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-heading)", marginBottom: "12px" }}>Execution Statistics</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            <div style={{ textAlign: "center" }}>
              <CheckCircle2 size={18} color="#10b981" style={{ margin: "0 auto 4px" }} />
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-heading)" }}>{completedCount}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Completed</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <Clock size={18} color="#f59e0b" style={{ margin: "0 auto 4px" }} />
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-heading)" }}>{pendingCount}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Pending</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <AlertCircle size={18} color="#ef4444" style={{ margin: "0 auto 4px" }} />
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-heading)" }}>{overdueCount}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Overdue</div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-heading)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Award size={16} color="var(--primary-coral)" />
            Unlocked Badges
          </h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {(member.achievements || ["Task Master", "On-Fire Streak"]).map((badge) => (
              <span key={badge} className="achievement-badge">
                🏆 {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Productivity Trend */}
        <div>
          <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-heading)", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            <TrendingUp size={16} color="var(--success-teal)" />
            7-Day Productivity Trend
          </h4>
          <div style={{ height: "40px", display: "flex", alignItems: "flex-end", gap: "6px", background: "var(--bg-slate)", padding: "8px 12px", borderRadius: "8px" }}>
            {(member.productivityTrend || [80, 85, 88, 92, 90, 95, 98]).map((val, idx) => (
              <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div 
                  style={{ 
                    width: "100%", 
                    height: `${(val / 100) * 24}px`, 
                    backgroundColor: "var(--primary-coral)", 
                    borderRadius: "2px" 
                  }} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
