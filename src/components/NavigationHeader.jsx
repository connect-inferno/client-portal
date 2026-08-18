import React from "react";
import logoImg from "../assets/logo.png";
import { 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  Plus, 
  Users, 
  CheckSquare, 
  UserCheck, 
  CalendarDays, 
  CalendarRange, 
  Trophy, 
  BarChart3, 
  Lightbulb,
  Building2,
  PhoneCall,
  Globe
} from "lucide-react";

export default function NavigationHeader({
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
  unreadNotifCount,
  onToggleNotifications,
  onOpenSearch,
  onOpenNewTask,
  onOpenNewIdea,
  onOpenNewClient,
  onOpenNewLead,
  onOpenNewDemo,
  onOpenTeamManagement
}) {
  const tabs = [
    { id: "clients", label: "Client Ledger", icon: Building2, group: "Ledger" },
    { id: "leads", label: "Leads Manager", icon: PhoneCall, group: "Ledger" },
    { id: "demos", label: "Website Demos", icon: Globe, group: "Ledger" },
    { id: "team", label: "Team Dashboard", icon: Users, group: "Execution" },
    { id: "tasks", label: "Tasks", icon: CheckSquare, group: "Execution" },
    { id: "mytasks", label: "My Tasks", icon: UserCheck, group: "Execution" },
    { id: "planner", label: "Weekly Planner", icon: CalendarDays, group: "Execution" },
    { id: "calendar", label: "Calendar", icon: CalendarRange, group: "Execution" },
    { id: "ideas", label: "Idea Pipeline", icon: Lightbulb, group: "Strategy" },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy, group: "Strategy" },
    { id: "analytics", label: "Analytics", icon: BarChart3, group: "Strategy" },
  ];

  // Dynamic context-aware action based on current section
  const getSectionAction = () => {
    switch (activeTab) {
      case "clients":
        return {
          label: "New Client",
          icon: Plus,
          onClick: onOpenNewClient
        };
      case "leads":
        return {
          label: "New Lead",
          icon: Plus,
          onClick: onOpenNewLead
        };
      case "demos":
        return {
          label: "New Demo",
          icon: Plus,
          onClick: onOpenNewDemo
        };
      case "team":
        return {
          label: "Add Member",
          icon: Plus,
          onClick: onOpenTeamManagement
        };
      case "ideas":
        return {
          label: "New Idea",
          icon: Lightbulb,
          onClick: onOpenNewIdea
        };
      case "tasks":
      case "mytasks":
      case "planner":
      case "calendar":
      case "leaderboard":
      case "analytics":
      default:
        return {
          label: "New Task",
          icon: Plus,
          onClick: onOpenNewTask
        };
    }
  };

  const currentAction = getSectionAction();
  const ActionIcon = currentAction?.icon || Plus;

  return (
    <header className="app-header" style={{ flexDirection: "column", gap: "16px", alignItems: "stretch", paddingBottom: "16px" }}>
      {/* Top Main Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        {/* Brand Logo */}
        <div className="logo-container" onClick={() => onTabChange("clients")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}>
          <img 
            src={logoImg} 
            alt="Infernos Ledger Logo" 
            style={{ height: "42px", width: "auto", objectFit: "contain", borderRadius: "8px" }} 
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h1 className="logo-text" style={{ lineHeight: 1.1, fontSize: "20px", fontWeight: 800 }}>Infernos Ledger</h1>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 500, letterSpacing: "0.5px" }}>
              BUSINESS OPERATING SYSTEM
            </span>
          </div>
        </div>

        {/* Global Search Bar & Quick Shortcuts */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, maxWidth: "420px", margin: "0 16px" }}>
          <button 
            type="button"
            className="search-wrapper" 
            style={{ width: "100%", border: "1px solid var(--border-slate)", background: "var(--card-bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px" }}
            onClick={onOpenSearch}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "13px" }}>
              <Search size={16} />
              <span>Search clients, leads, tasks, ideas...</span>
            </div>
            <kbd style={{ background: "var(--bg-slate)", border: "1px solid var(--border-slate)", borderRadius: "4px", padding: "2px 6px", fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Header Action Buttons */}
        <div className="header-actions-group">
          {/* Dynamic Section-Specific Quick Action */}
          {currentAction && (
            <button 
              className="btn-primary" 
              style={{ padding: "8px 14px", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
              onClick={currentAction.onClick}
            >
              <ActionIcon size={15} strokeWidth={2.5} />
              <span>{currentAction.label}</span>
            </button>
          )}

          {/* Quick Add Idea (hidden when already in Idea Pipeline) */}
          {activeTab !== "ideas" && (
            <button 
              className="btn-secondary" 
              style={{ padding: "8px 14px", fontSize: "13px" }}
              onClick={onOpenNewIdea}
              title="Quick Capture Idea"
            >
              <Lightbulb size={15} color="var(--primary-coral)" />
              Idea
            </button>
          )}

          {/* Theme Toggle Button */}
          <button 
            type="button"
            className="icon-button" 
            onClick={onToggleTheme} 
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} color="#f59e0b" />}
          </button>

          {/* Notification Bell */}
          <button 
            type="button"
            className="icon-button" 
            onClick={onToggleNotifications} 
            title="In-App Notifications"
          >
            <Bell size={18} />
            {unreadNotifCount > 0 && (
              <span className="badge-counter">{unreadNotifCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <nav className="subnav-bar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`subnav-tab ${isActive ? "active" : ""}`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
