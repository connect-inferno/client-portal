import React, { useState } from "react";
import {
  ArrowLeft,
  Flame,
  Phone,
  Mail,
  User,
  Calendar,
  FileText,
  Save,
  X,
  MessageSquare,
  Clock,
  PlusCircle
} from "lucide-react";

export default function LeadForm({ lead, onSave, onCancel }) {
  const isEditing = !!lead;

  const [formData, setFormData] = useState({
    name: lead?.name || "",
    contactPerson: lead?.contactPerson || "",
    phone: lead?.phone || "",
    email: lead?.email || "",
    status: lead?.status || "interested",
    meetingDate: lead?.meetingDate || "",
    notes: lead?.notes || "",
    calls: lead?.calls || [],
    callbackDate: lead?.callbackDate || "",
    callbackNotes: lead?.callbackNotes || ""
  });

  const [errors, setErrors] = useState({});

  // Sub-form state for logging a new call
  const [newCall, setNewCall] = useState({
    employeeName: "",
    date: new Date().toISOString().split("T")[0],
    notes: ""
  });
  const [callError, setCallError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleCallChange = (e) => {
    const { name, value } = e.target;
    setNewCall(prev => ({
      ...prev,
      [name]: value
    }));
    setCallError("");
  };

  // Add Call Log to Lead form state in memory
  const handleAddCallLog = () => {
    if (!newCall.employeeName.trim()) {
      setCallError("Employee Name is required to log a call.");
      return;
    }
    if (!newCall.notes.trim()) {
      setCallError("Call discussion notes are required.");
      return;
    }

    const logEntry = {
      employeeName: newCall.employeeName.trim(),
      date: newCall.date || new Date().toISOString(),
      notes: newCall.notes.trim()
    };

    setFormData(prev => ({
      ...prev,
      calls: [...prev.calls, logEntry],
      // If we are logging a call, we can also auto-transition status to 'followed-up' if it was just 'interested'
      status: prev.status === "interested" ? "followed-up" : prev.status
    }));

    // Reset sub-form
    setNewCall({
      employeeName: "",
      date: new Date().toISOString().split("T")[0],
      notes: ""
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Lead / Company Name is required";
    if (!formData.contactPerson.trim()) newErrors.contactPerson = "Contact Person name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone Number is required";
    if (!formData.email.trim()) newErrors.email = "Email Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave(formData);
  };

  return (
    <div className="client-dashboard-container">
      {/* 1. Header Navigation */}
      <div className="client-dashboard-header-row">
        <div className="client-dashboard-header-left">
          <div className="client-dashboard-breadcrumbs" onClick={onCancel}>
            <ArrowLeft size={14} /> Back to Leads Dashboard
          </div>
          <div className="client-dashboard-title-area">
            <h2 className="client-dashboard-title">
              {isEditing ? `Lead: ${formData.name}` : "Create New Lead Profile"}
            </h2>
            <span className={`lead-status-badge ${formData.status}`}>
              {formData.status.replace("-", " ")}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* 2. Main Dashboard Form Grid */}
        <div className="client-dashboard-grid">
          {/* Main Content (Left Panel) */}
          <div className="client-dashboard-main">
            {/* General Lead Card */}
            <div className="client-dashboard-card animate-scale-in">
              <div className="client-dashboard-card-header">
                <User className="client-dashboard-card-icon" size={18} />
                <h3 className="client-dashboard-card-title">Lead Information</h3>
              </div>

              <div className="client-dashboard-field-group">
                <label className="client-dashboard-label">
                  Company / Lead Name <span>*</span>
                </label>
                <div className="client-dashboard-input-wrapper">
                  <User className="client-dashboard-input-icon" size={16} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter company or lead name"
                    className="client-dashboard-input"
                  />
                </div>
                {errors.name && <span style={{ color: "hsl(0, 84%, 60%)", fontSize: "12px" }}>{errors.name}</span>}
              </div>

              <div className="client-dashboard-field-group">
                <label className="client-dashboard-label">
                  Primary Contact Person Name <span>*</span>
                </label>
                <div className="client-dashboard-input-wrapper">
                  <User className="client-dashboard-input-icon" size={16} />
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="Full name of contact"
                    className="client-dashboard-input"
                  />
                </div>
                {errors.contactPerson && <span style={{ color: "hsl(0, 84%, 60%)", fontSize: "12px" }}>{errors.contactPerson}</span>}
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="client-dashboard-card animate-scale-in">
              <div className="client-dashboard-card-header">
                <Phone className="client-dashboard-card-icon" size={18} />
                <h3 className="client-dashboard-card-title">Contact Channels</h3>
              </div>

              <div className="client-dashboard-field-group">
                <label className="client-dashboard-label">
                  Contact Phone Number <span>*</span>
                </label>
                <div className="client-dashboard-input-wrapper">
                  <Phone className="client-dashboard-input-icon" size={16} />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="client-dashboard-input"
                  />
                </div>
                {errors.phone && <span style={{ color: "hsl(0, 84%, 60%)", fontSize: "12px" }}>{errors.phone}</span>}
              </div>

              <div className="client-dashboard-field-group">
                <label className="client-dashboard-label">
                  Email Address <span>*</span>
                </label>
                <div className="client-dashboard-input-wrapper">
                  <Mail className="client-dashboard-input-icon" size={16} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@company.com"
                    className="client-dashboard-input"
                  />
                </div>
                {errors.email && <span style={{ color: "hsl(0, 84%, 60%)", fontSize: "12px" }}>{errors.email}</span>}
              </div>
            </div>

            {/* Lead Status & Scheduled Meeting Cards */}
            <div className="client-dashboard-card animate-scale-in">
              <div className="client-dashboard-card-header">
                <Calendar className="client-dashboard-card-icon" size={18} />
                <h3 className="client-dashboard-card-title">Lead Management State</h3>
              </div>

              <div className="client-dashboard-field-group">
                <label className="client-dashboard-label">Lead Outreach Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="client-dashboard-input"
                  style={{ paddingLeft: "14px" }}
                >
                  <option value="interested">Interested</option>
                  <option value="meeting-scheduled">Meeting Scheduled</option>
                  <option value="followed-up">Followed Up</option>
                  <option value="converted">Converted (Moved to ledger)</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div className="client-dashboard-field-group">
                <label className="client-dashboard-label">
                  Scheduled Meeting Date & Time
                </label>
                <div className="client-dashboard-input-wrapper">
                  <Calendar className="client-dashboard-input-icon" size={16} />
                  <input
                    type="datetime-local"
                    name="meetingDate"
                    value={formData.meetingDate}
                    onChange={handleChange}
                    className="client-dashboard-input"
                  />
                </div>
              </div>

              <div className="client-dashboard-field-group">
                <label className="client-dashboard-label">
                  Scheduled Callback Date & Time
                </label>
                <div className="client-dashboard-input-wrapper">
                  <Phone className="client-dashboard-input-icon" size={16} />
                  <input
                    type="datetime-local"
                    name="callbackDate"
                    value={formData.callbackDate || ""}
                    onChange={handleChange}
                    className="client-dashboard-input"
                  />
                </div>
              </div>

              <div className="client-dashboard-field-group">
                <label className="client-dashboard-label">
                  Callback Notes / Instructions
                </label>
                <textarea
                  name="callbackNotes"
                  value={formData.callbackNotes || ""}
                  onChange={handleChange}
                  placeholder="Instructions/context for the callback (e.g. Call after 2 PM)"
                  className="client-dashboard-input"
                  style={{ paddingLeft: "14px", minHeight: "60px" }}
                />
              </div>
            </div>

            {/* Background Notes Card */}
            <div className="client-dashboard-card animate-scale-in">
              <div className="client-dashboard-card-header">
                <FileText className="client-dashboard-card-icon" size={18} />
                <h3 className="client-dashboard-card-title">General Scope / Conversation Notes</h3>
              </div>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Details of the lead conversation, project interests, deal size etc."
                className="client-dashboard-input"
                style={{ paddingLeft: "14px" }}
              />
            </div>
          </div>

          {/* Call Logging Timeline & History (Right Panel - Sidebar) */}
          <div className="client-dashboard-sidebar">
            <div className="client-dashboard-card animate-scale-in">
              <div className="client-dashboard-card-header">
                <MessageSquare className="client-dashboard-card-icon" size={18} />
                <h3 className="client-dashboard-card-title">Outreach Log Timeline</h3>
              </div>

              {/* Call Timeline List */}
              <div className="call-log-timeline-wrapper">
                <div className="call-log-timeline-line" />
                {formData.calls && formData.calls.length > 0 ? (
                  [...formData.calls].reverse().map((call, idx) => (
                    <div key={idx} className="call-log-timeline-item">
                      <div className="call-log-timeline-dot" />
                      <div className="call-log-timeline-content">
                        <div className="call-log-timeline-meta">
                          <span className="call-log-timeline-caller">{call.employeeName}</span>
                          <span>{new Date(call.date).toLocaleDateString("en-IN")}</span>
                        </div>
                        <div className="call-log-timeline-bubble">{call.notes}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ fontStyle: "italic", fontSize: "13px", color: "var(--text-light)", padding: "12px 0" }}>
                    No communication calls logged yet. Add one below to track activities.
                  </p>
                )}
              </div>

              {/* Nested Call Log Form */}
              <div className="add-call-form-card">
                <h4 className="add-call-form-title">Log New Outreach Call</h4>
                <div className="client-dashboard-field-group">
                  <input
                    type="text"
                    name="employeeName"
                    value={newCall.employeeName}
                    onChange={handleCallChange}
                    placeholder="Employee Name"
                    className="client-dashboard-input"
                    style={{ paddingLeft: "12px" }}
                  />
                </div>
                <div className="client-dashboard-field-group">
                  <input
                    type="date"
                    name="date"
                    value={newCall.date}
                    onChange={handleCallChange}
                    className="client-timeline-date-input"
                  />
                </div>
                <div className="client-dashboard-field-group">
                  <textarea
                    name="notes"
                    value={newCall.notes}
                    onChange={handleCallChange}
                    placeholder="Discussed requirements, scheduled meeting, etc."
                    className="client-dashboard-input add-call-textarea"
                    style={{ paddingLeft: "12px" }}
                  />
                </div>
                {callError && <span style={{ color: "hsl(0, 84%, 60%)", fontSize: "11px" }}>{callError}</span>}
                <button
                  type="button"
                  className="btn-add-call"
                  onClick={handleAddCallLog}
                >
                  <PlusCircle size={14} /> Log Call Activity
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Action bar footer */}
        <div className="client-dashboard-actions">
          <button type="submit" className="btn-primary" style={{ padding: "12px 24px", fontSize: "14px" }}>
            <Save size={16} /> {isEditing ? "Save Lead Profile" : "Create Lead Entry"}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel} style={{ padding: "12px 24px", fontSize: "14px" }}>
            <X size={16} /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
