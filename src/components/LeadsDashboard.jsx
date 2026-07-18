import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Calendar,
  Phone,
  Mail,
  User,
  MessageSquare,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import MetricCard from "./MetricCard";

export default function LeadsDashboard({
  leads,
  onAddLeadClick,
  onEditLead,
  onDeleteLead
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Helper to format date and time
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      });
    } catch {
      return dateTimeStr;
    }
  };

  // Helper to get status label human-readable
  const getStatusLabel = (status) => {
    switch (status) {
      case "interested": return "Interested";
      case "meeting-scheduled": return "Meeting Scheduled";
      case "followed-up": return "Followed Up";
      case "converted": return "Converted";
      case "lost": return "Lost";
      default: return status;
    }
  };

  // Helper to check if a callback is overdue
  const isCallbackOverdue = (callbackDateStr, status) => {
    if (!callbackDateStr) return false;
    if (status === "converted" || status === "lost") return false;
    try {
      return new Date(callbackDateStr) < new Date();
    } catch {
      return false;
    }
  };

  // Calculate Lead metrics dynamically
  const metrics = useMemo(() => {
    const totalLeads = leads.length;
    const activeMeetings = leads.filter(l => l.status === "meeting-scheduled" || !!l.meetingDate).length;
    const followUps = leads.filter(l => l.status === "followed-up").length;
    const converted = leads.filter(l => l.status === "converted").length;
    const activeCallbacks = leads.filter(l => l.callbackDate && l.status !== "converted" && l.status !== "lost").length;

    return {
      totalLeads,
      activeMeetings,
      followUps,
      converted,
      activeCallbacks
    };
  }, [leads]);

  // Calculate overdue or today's callback alerts
  const callbackAlerts = useMemo(() => {
    const today = new Date();
    return leads.filter(lead => {
      if (!lead.callbackDate) return false;
      if (lead.status === "converted" || lead.status === "lost") return false;
      try {
        const cbDate = new Date(lead.callbackDate);
        const isPast = cbDate < today;
        const isSameDay = 
          cbDate.getDate() === today.getDate() &&
          cbDate.getMonth() === today.getMonth() &&
          cbDate.getFullYear() === today.getFullYear();
        
        return isPast || isSameDay;
      } catch {
        return false;
      }
    });
  }, [leads]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = 
        lead.name?.toLowerCase().includes(search) ||
        lead.contactPerson?.toLowerCase().includes(search) ||
        lead.notes?.toLowerCase().includes(search);

      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

  return (
    <div className="dashboard-view animate-fade-in">
      {/* 1. Leads Metrics Row */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Leads"
          value={metrics.totalLeads}
          icon={User}
          type="clients"
        />
        <MetricCard
          title="Meetings Scheduled"
          value={metrics.activeMeetings}
          icon={Calendar}
          type="deployed"
        />
        <MetricCard
          title="Callbacks Scheduled"
          value={metrics.activeCallbacks}
          icon={Phone}
          type="callbacks"
        />
        <MetricCard
          title="Follow-ups"
          value={metrics.followUps}
          icon={Clock}
          type="pending"
        />
        <MetricCard
          title="Converted Leads"
          value={metrics.converted}
          icon={CheckCircle2}
          type="deal-value"
        />
      </div>

      {/* Callback Alerts Panel */}
      {callbackAlerts.length > 0 && (
        <div className="callback-alerts-panel animate-scale-in">
          <div className="callback-alerts-header">
            <AlertCircle className="icon" size={18} />
            <h3>Action Required: Callback Alerts</h3>
            <span className="count">{callbackAlerts.length} Pending</span>
          </div>
          <div className="callback-alerts-list">
            {callbackAlerts.map(lead => {
              const isOverdue = isCallbackOverdue(lead.callbackDate, lead.status);
              return (
                <div key={lead.id} className={`callback-alert-item ${isOverdue ? "overdue" : "today"}`}>
                  <div className="alert-details">
                    <div style={{ fontWeight: 600, color: "var(--text-heading)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px" }}>
                      <span>{lead.name}</span>
                      <span style={{ color: "var(--text-light)", fontWeight: 400 }}>&bull;</span>
                      <span style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: "12px" }}>
                        Contact: {lead.contactPerson || "N/A"} ({lead.phone || "No Phone"})
                      </span>
                    </div>
                    <div className="alert-time">
                      <span>{isOverdue ? "Overdue Callback: " : "Callback Scheduled: "}</span>
                      <strong>{formatDateTime(lead.callbackDate)}</strong>
                      {lead.callbackNotes && <span className="alert-note"> &mdash; "{lead.callbackNotes}"</span>}
                    </div>
                  </div>
                  <button 
                    type="button"
                    className="btn-alert-action"
                    onClick={() => onEditLead(lead)}
                  >
                    <Phone size={12} /> Call & Edit
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Filter Strip */}
      <div className="filter-bar">
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search leads by name, contact, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sort-select-wrapper">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="sort-select"
            style={{ paddingRight: "36px" }}
          >
            <option value="all">All Statuses</option>
            <option value="interested">Interested</option>
            <option value="meeting-scheduled">Meeting Scheduled</option>
            <option value="followed-up">Followed Up</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* 3. Leads Cards List */}
      <div className="client-list">
        {filteredLeads.length > 0 ? (
          filteredLeads.map(lead => {
            const lastCall = lead.calls && lead.calls.length > 0 
              ? lead.calls[lead.calls.length - 1] 
              : null;

            return (
              <div key={lead.id} className={`lead-card ${lead.status || "interested"}`}>
                {/* Card Header */}
                <div className="lead-card-header">
                  <div className="lead-card-title-area">
                    <h3 className="lead-card-name">{lead.name}</h3>
                    <span className="lead-card-contact-name">Contact: {lead.contactPerson || "N/A"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className={`lead-status-badge ${lead.status || "interested"}`}>
                      {getStatusLabel(lead.status || "interested")}
                    </span>
                    <div className="client-actions">
                      <button
                        className="action-icon-btn edit"
                        type="button"
                        title="Edit / View Lead Details"
                        onClick={() => onEditLead(lead)}
                      >
                        <MessageSquare size={16} />
                      </button>
                      <button
                        className="action-icon-btn delete"
                        type="button"
                        title="Delete Lead"
                        onClick={() => onDeleteLead(lead.id)}
                      >
                        <Flame size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Contact Info Grid */}
                <div className="lead-card-grid">
                  <div className="lead-card-info-item">
                    <Phone size={14} className="icon" />
                    <span>{lead.phone || "No phone listed"}</span>
                  </div>
                  <div className="lead-card-info-item">
                    <Mail size={14} className="icon" />
                    <span>{lead.email || "No email listed"}</span>
                  </div>
                </div>

                {/* Scheduled Meeting Banner */}
                {lead.meetingDate && (
                  <div className="lead-card-meeting-banner">
                    <Calendar size={15} className="icon" />
                    <span>Meeting Scheduled: {formatDateTime(lead.meetingDate)}</span>
                  </div>
                )}

                {/* Scheduled Callback Banner */}
                {lead.callbackDate && lead.status !== "converted" && lead.status !== "lost" && (
                  <div className={`lead-card-callback-banner ${isCallbackOverdue(lead.callbackDate, lead.status) ? "overdue" : ""}`}>
                    <Phone size={15} className="icon" />
                    <div className="callback-banner-content">
                      <span className="callback-time">
                        {isCallbackOverdue(lead.callbackDate, lead.status) ? "Overdue Callback: " : "Scheduled Callback: "}
                        {formatDateTime(lead.callbackDate)}
                        {isCallbackOverdue(lead.callbackDate, lead.status) && (
                          <span className="callback-overdue-badge">Overdue</span>
                        )}
                      </span>
                      {lead.callbackNotes && (
                        <p className="callback-notes">"{lead.callbackNotes}"</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Last Follow-up Call Details */}
                <div className="lead-card-last-call">
                  <div className="lead-card-last-call-header">
                    <span>Outreach Call Log</span>
                    <span style={{ fontSize: "11px", color: "var(--text-light)" }}>
                      {lastCall ? new Date(lastCall.date).toLocaleDateString("en-IN") : ""}
                    </span>
                  </div>
                  {lastCall ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "11px" }}>
                        Employee <strong style={{ color: "var(--primary-coral)" }}>{lastCall.employeeName}</strong> called:
                      </span>
                      <p style={{ margin: 0, fontStyle: "italic", fontSize: "12px" }}>
                        "{lastCall.notes.length > 90 ? `${lastCall.notes.slice(0, 90)}...` : lastCall.notes}"
                      </p>
                    </div>
                  ) : (
                    <span style={{ fontStyle: "italic", color: "var(--text-light)" }}>No follow-up calls logged yet. Click edit to log calls.</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{
            textAlign: "center",
            padding: "48px",
            backgroundColor: "white",
            borderRadius: "12px",
            border: "1px solid var(--border-slate)",
            color: "var(--text-muted)"
          }}>
            No leads found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
