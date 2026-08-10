import React, { useMemo } from "react";
import { BarChart3, TrendingUp, CheckCircle2, AlertCircle, PieChart, Users } from "lucide-react";
import MetricCard from "./MetricCard";
import { removeDuplicateTeamMembers } from "../utils/teamUtils";

export default function AnalyticsDashboard({
  tasks = [],
  teamMembers = [],
  ideas = []
}) {
  const uniqueMembers = removeDuplicateTeamMembers(teamMembers);
  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => t.status === "Completed").length;
  const overdueCount = tasks.filter(t => t.status === "Overdue").length;
  const pendingCount = tasks.filter(t => t.status === "Pending").length;

  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const overdueRate = totalTasks > 0 ? Math.round((overdueCount / totalTasks) * 100) : 0;

  // Workload by member
  const workloadByMember = useMemo(() => {
    return uniqueMembers.map(m => {
      const mTasks = tasks.filter(t => t.assignedTo === m.name);
      return {
        name: m.name,
        count: mTasks.length,
        completed: mTasks.filter(t => t.status === "Completed").length
      };
    });
  }, [teamMembers, tasks]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const counts = {};
    tasks.forEach(t => {
      const cat = t.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([cat, count]) => ({ cat, count }));
  }, [tasks]);

  // Dynamic 7-day completion trend calculation
  const weeklyTrend = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      
      const dayCompleted = tasks.filter(t => {
        const compDate = t.completedDate ? t.completedDate.split("T")[0] : null;
        return t.status === "Completed" && compDate === dateStr;
      }).length;

      const maxCount = Math.max(...Array.from({ length: 7 }, (_, k) => {
        const subD = new Date(now);
        subD.setDate(subD.getDate() - k);
        const subIso = subD.toISOString().split("T")[0];
        return tasks.filter(t => t.status === "Completed" && t.completedDate && t.completedDate.split("T")[0] === subIso).length;
      }), 5);

      const pct = Math.max(10, Math.min(100, Math.round((dayCompleted / maxCount) * 100)));

      result.push({
        day: dayName,
        count: dayCompleted,
        pct: dayCompleted > 0 ? pct : 8
      });
    }
    return result;
  }, [tasks]);

  return (
    <div className="dashboard-view animate-fade-in">
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "8px" }}>
          <BarChart3 size={20} color="var(--primary-coral)" />
          Executive Analytics & Workload Visualizer
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
          Comprehensive operational metrics, completion trends, and team capacity distribution.
        </p>
      </div>

      {/* Top Analytics Metrics Cards */}
      <div className="metrics-grid">
        <MetricCard
          title="Overall Completion Rate"
          value={`${completionRate}%`}
          icon={CheckCircle2}
          type="deployed"
        />
        <MetricCard
          title="Overdue Rate"
          value={`${overdueRate}%`}
          icon={AlertCircle}
          type="deal-value"
        />
        <MetricCard
          title="Active Execution Tasks"
          value={pendingCount}
          icon={TrendingUp}
          type="pending"
        />
        <MetricCard
          title="Idea Pipeline Backlog"
          value={ideas.length}
          icon={PieChart}
          type="clients"
        />
      </div>

      {/* Visual SVG Chart Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "24px" }}>
        {/* Weekly Productivity Trend Bar Chart */}
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-slate)", borderRadius: "16px", padding: "20px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-heading)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <TrendingUp size={18} color="var(--primary-coral)" />
            7-Day Execution Completion Trend
          </h3>
          <div style={{ height: "180px", display: "flex", alignItems: "flex-end", gap: "16px", padding: "10px 0" }}>
            {weeklyTrend.map(item => (
              <div key={item.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>{item.count}</span>
                <div 
                  style={{ 
                    width: "100%", 
                    height: `${item.pct}%`, 
                    background: "linear-gradient(180deg, var(--primary-coral), #f97316)", 
                    borderRadius: "6px 6px 0 0" 
                  }} 
                />
                <span style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Workload Capacity */}
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-slate)", borderRadius: "16px", padding: "20px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-heading)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={18} color="var(--success-teal)" />
            Team Workload & Capacity Distribution
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {workloadByMember.map(m => {
              const max = 10;
              const pct = Math.min(100, Math.round((m.count / max) * 100));
              return (
                <div key={m.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px", color: "var(--text-heading)", fontWeight: 600 }}>
                    <span>{m.name}</span>
                    <span>{m.completed}/{m.count} tasks ({pct}% load)</span>
                  </div>
                  <div className="progress-bar-bg" style={{ margin: 0, height: "10px" }}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Breakdown Strip */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-slate)", borderRadius: "16px", padding: "20px", marginTop: "24px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-heading)", marginBottom: "16px" }}>
          Task Category Distribution
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
          {categoryBreakdown.map(item => (
            <div key={item.cat} style={{ background: "var(--bg-slate)", border: "1px solid var(--border-slate)", padding: "12px", borderRadius: "10px", textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary-coral)" }}>
                {item.count}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{item.cat}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
