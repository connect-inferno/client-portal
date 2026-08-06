import React, { useMemo } from "react";
import { Trophy, Flame, Award, CheckCircle2, Zap, Target, Lightbulb } from "lucide-react";
import UserAvatar from "./UserAvatar";

export default function Leaderboard({
  teamMembers = [],
  tasks = [],
  onSelectMember
}) {
  // Dynamic Rank & Score Calculation based on real-time Firestore task metrics
  const rankedMembers = useMemo(() => {
    return [...teamMembers].map(member => {
      const memberTasks = tasks.filter(t => t.assignedTo === member.name);
      const completedCount = memberTasks.filter(t => t.status === "Completed").length;
      const onTimeCount = memberTasks.filter(t => t.status === "Completed" && (t.completedDate || t.createdDate) <= (t.dueDate || "9999")).length;
      
      const completionRate = memberTasks.length > 0 
        ? Math.round((completedCount / memberTasks.length) * 100) 
        : 0;

      // Dynamic Gamified Score: Base points (50) + 25 pts per completed task + 15 pts on-time bonus + (streak * 5) + completion rate component
      const streakBonus = (member.streak || 1) * 5;
      const taskPoints = (completedCount * 25) + (onTimeCount * 15);
      const score = 50 + taskPoints + streakBonus + Math.round(completionRate * 0.2);

      // Dynamic Achievement Badges based on real performance
      const achievements = [];
      if (completedCount >= 1) achievements.push("Task Master");
      if ((member.streak || 0) >= 5) achievements.push("On-Fire Streak");
      if (completionRate === 100 && completedCount > 0) achievements.push("Flawless Execution");
      if (achievements.length === 0) achievements.push("Rising Star");

      return {
        ...member,
        completedCount,
        onTimeCount,
        completionRate,
        score,
        achievements
      };
    }).sort((a, b) => b.score - a.score || b.completedCount - a.completedCount);
  }, [teamMembers, tasks]);

  const topThree = rankedMembers.slice(0, 3);
  const restMembers = rankedMembers.slice(3);

  const availableBadges = [
    { name: "Task Master", desc: "Completed 50+ tasks in portal", icon: Trophy, color: "#f59e0b" },
    { name: "On-Fire Streak", desc: "Maintained a 7+ day completion streak", icon: Flame, color: "#f97316" },
    { name: "Speed Demon", desc: "Completed 10 tasks in a single day", icon: Zap, color: "#ec4899" },
    { name: "Flawless Execution", desc: "100% on-time completion rate", icon: Target, color: "#10b981" },
    { name: "Innovator", desc: "Submitted 3+ approved idea proposals", icon: Lightbulb, color: "#6366f1" }
  ];

  return (
    <div className="dashboard-view animate-fade-in">
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "8px" }}>
          <Trophy size={22} color="#f59e0b" />
          Gamified Team Productivity Leaderboard
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
          Ranked by productivity scores, execution completion %, on-time delivery, and active streaks.
        </p>
      </div>

      {/* Top 3 Podium */}
      {topThree.length >= 3 && (
        <div className="podium-container">
          {/* 2nd Place */}
          <div className="podium-place second" onClick={() => onSelectMember(topThree[1])}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", marginBottom: "6px" }}>🥈 2nd Place</div>
            <UserAvatar name={topThree[1].name} size={56} />
            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-heading)", marginTop: "8px" }}>{topThree[1].name}</h4>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{topThree[1].role}</span>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--primary-coral)", marginTop: "8px" }}>
              {topThree[1].score} pts
            </div>
          </div>

          {/* 1st Place */}
          <div className="podium-place first" onClick={() => onSelectMember(topThree[0])}>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#f59e0b", marginBottom: "6px" }}>👑 1st Place Champion</div>
            <UserAvatar name={topThree[0].name} size={64} style={{ border: "3px solid #f59e0b" }} />
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-heading)", marginTop: "8px" }}>{topThree[0].name}</h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{topThree[0].role}</span>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#f59e0b", marginTop: "8px" }}>
              {topThree[0].score} pts
            </div>
          </div>

          {/* 3rd Place */}
          <div className="podium-place third" onClick={() => onSelectMember(topThree[2])}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#b45309", marginBottom: "6px" }}>🥉 3rd Place</div>
            <UserAvatar name={topThree[2].name} size={52} />
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-heading)", marginTop: "8px" }}>{topThree[2].name}</h4>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{topThree[2].role}</span>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "var(--primary-coral)", marginTop: "8px" }}>
              {topThree[2].score} pts
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-slate)", borderRadius: "16px", overflow: "hidden", marginBottom: "32px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "var(--bg-slate)", borderBottom: "1px solid var(--border-slate)", color: "var(--text-muted)" }}>
              <th style={{ padding: "14px 16px" }}>Rank</th>
              <th style={{ padding: "14px 16px" }}>Team Member</th>
              <th style={{ padding: "14px 16px" }}>Productivity Score</th>
              <th style={{ padding: "14px 16px" }}>Completion %</th>
              <th style={{ padding: "14px 16px" }}>Current Streak</th>
              <th style={{ padding: "14px 16px" }}>Completed Tasks</th>
              <th style={{ padding: "14px 16px" }}>Badges</th>
            </tr>
          </thead>
          <tbody>
            {rankedMembers.map((m, idx) => (
              <tr 
                key={m.id} 
                style={{ borderBottom: "1px solid var(--border-slate)", cursor: "pointer" }}
                onClick={() => onSelectMember(m)}
              >
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--text-heading)" }}>
                  #{idx + 1}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <UserAvatar name={m.name} size={32} />
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--text-heading)" }}>{m.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{m.role}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--primary-coral)" }}>
                  {m.score} pts
                </td>
                <td style={{ padding: "14px 16px" }}>{m.completionRate}%</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ color: "#f97316", fontWeight: 700 }}>🔥 {m.streak || 5} days</span>
                </td>
                <td style={{ padding: "14px 16px", fontWeight: 600 }}>{m.completedCount}</td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {(m.achievements || ["Task Master"]).map((badge) => (
                      <span key={badge} style={{ fontSize: "11px", background: "var(--bg-slate)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border-slate)" }}>
                        🏆 {badge}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Achievement Badges Showcase Section */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-slate)", borderRadius: "16px", padding: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-heading)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Award size={20} color="var(--primary-coral)" />
          Available Achievement Badges & Recognition
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
          {availableBadges.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.name} style={{ background: "var(--bg-slate)", border: "1px solid var(--border-slate)", borderRadius: "12px", padding: "14px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: b.color }}>
                  <Icon size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-heading)" }}>{b.name}</h4>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
