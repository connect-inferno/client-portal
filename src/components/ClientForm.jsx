import React, { useState } from "react";
import {
  ArrowLeft,
  Flame,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  FileText,
  Phone,
  MapPin,
  Calendar,
  Save,
  X,
  Globe
} from "lucide-react";

export default function ClientForm({ client, onSave, onCancel }) {
  const isEditing = !!client;

  // Helper to format currency values in Real-time
  const getFormattedAmount = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const [formData, setFormData] = useState({
    name: client?.name || "",
    description: client?.description || "",
    dealValue: client?.dealValue !== undefined ? client.dealValue : "",
    address: client?.address || "",
    contactNumber: client?.contactNumber || "",
    demoUrl: client?.demoUrl || "",
    dealClosedDate: client?.dealClosedDate || "",
    workStartedDate: client?.workStartedDate || "",
    payment40Date: client?.payment40Date || "",
    payment60Date: client?.payment60Date || "",
    deploymentDate: client?.deploymentDate || ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Client Name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (formData.dealValue === "" || isNaN(formData.dealValue) || Number(formData.dealValue) < 0) {
      newErrors.dealValue = "Valid Deal Value is required";
    }
    if (!formData.address.trim()) newErrors.address = "Business Address is required";
    if (!formData.contactNumber.trim()) newErrors.contactNumber = "Contact Number is required";
    if (!formData.dealClosedDate) newErrors.dealClosedDate = "Deal Closed date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave({
      ...formData,
      dealValue: Number(formData.dealValue)
    });
  };

  // Real-time Dashboard computations
  const progressPercent = (() => {
    let percent = 0;
    if (formData.dealClosedDate) percent = 20;
    if (formData.workStartedDate) percent = 40;
    if (formData.payment40Date) percent = 60;
    if (formData.payment60Date) percent = 80;
    if (formData.deploymentDate) percent = 100;
    return percent;
  })();

  const activeStage = (() => {
    if (formData.deploymentDate) return "Deployment";
    if (formData.payment60Date) return "60% Payment";
    if (formData.payment40Date) return "40% Payment";
    if (formData.workStartedDate) return "Work Started";
    if (formData.dealClosedDate) return "Deal Closed";
    return "Lead Generated";
  })();

  const paymentStatus = (() => {
    if (formData.deploymentDate && !formData.payment60Date) {
      return "Payment Alert";
    }
    if (formData.payment60Date) {
      return "Settled";
    }
    return "In Progress";
  })();

  // Milestone list config
  const milestoneConfig = [
    { key: "dealClosedDate", label: "Deal Closed", desc: "Agreement signed, project finalized" },
    { key: "workStartedDate", label: "Work Started", desc: "Development work kicked off" },
    { key: "payment40Date", label: "40% Payment", desc: "Advance/midway invoice payment" },
    { key: "payment60Date", label: "60% Payment", desc: "Final outstanding invoice payment" },
    { key: "deploymentDate", label: "Deployment", desc: "Production launch and hand-off" }
  ];

  return (
    <div className="client-dashboard-container">
      {/* 1. Dashboard Breadcrumb & Title Header Row */}
      <div className="client-dashboard-header-row">
        <div className="client-dashboard-header-left">
          <div className="client-dashboard-breadcrumbs" onClick={onCancel}>
            <ArrowLeft size={14} /> Back to main dashboard
          </div>
          <div className="client-dashboard-title-area">
            <h2 className="client-dashboard-title">
              {isEditing ? formData.name || "Edit Client Profile" : "Create New Client Profile"}
            </h2>
            <span className={`client-status-badge ${progressPercent === 100 ? "completed" : progressPercent > 0 ? "in-progress" : "draft"}`}>
              {progressPercent === 100 ? "Fully Active" : progressPercent > 0 ? "Active Project" : "Setup Mode"}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* 2. Client Dashboard Top Metric Cards Row */}
        <div className="client-dashboard-metrics">
          <div className="metric-card deal-value">
            <div className="metric-icon-wrapper">
              <IndianRupee size={22} strokeWidth={2.2} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Deal Value</span>
              <span className="metric-value" style={{ color: "var(--primary-coral)" }}>
                {getFormattedAmount(Number(formData.dealValue))}
              </span>
            </div>
          </div>

          <div className="metric-card pending">
            <div className="metric-icon-wrapper">
              <Clock size={22} strokeWidth={2.2} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Current Stage</span>
              <span className="metric-value" style={{ fontSize: "18px", marginTop: "4px" }}>{activeStage}</span>
            </div>
          </div>

          <div className="metric-card deployed">
            <div className="metric-icon-wrapper">
              {paymentStatus === "Payment Alert" ? (
                <AlertTriangle size={22} strokeWidth={2.2} style={{ color: "var(--pending-gold)" }} />
              ) : paymentStatus === "Settled" ? (
                <CheckCircle2 size={22} strokeWidth={2.2} style={{ color: "var(--success-teal)" }} />
              ) : (
                <Flame size={22} strokeWidth={2.2} style={{ color: "var(--primary-coral)" }} />
              )}
            </div>
            <div className="metric-info">
              <span className="metric-label">Status Check</span>
              <span className="metric-value" style={{ 
                fontSize: "18px", 
                marginTop: "4px",
                color: paymentStatus === "Payment Alert" ? "var(--pending-gold)" : paymentStatus === "Settled" ? "var(--success-teal)" : "inherit"
              }}>
                {paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Main Dashboard Grid Layout */}
        <div className="client-dashboard-grid">
          {/* Main Content Area (Left side) */}
          <div className="client-dashboard-main">
            {/* Project Details & Profile Card */}
            <div className="client-dashboard-card animate-scale-in">
              <div className="client-dashboard-card-header">
                <FileText className="client-dashboard-card-icon" size={18} />
                <h3 className="client-dashboard-card-title">Business Profile & Details</h3>
              </div>

              <div className="client-dashboard-field-group">
                <label className="client-dashboard-label">
                  Client / Business Name <span>*</span>
                </label>
                <div className="client-dashboard-input-wrapper">
                  <User className="client-dashboard-input-icon" size={16} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter client name"
                    className="client-dashboard-input"
                  />
                </div>
                {errors.name && <span style={{ color: "hsl(0, 84%, 60%)", fontSize: "12px" }}>{errors.name}</span>}
              </div>

              <div className="client-dashboard-field-group">
                <label className="client-dashboard-label">
                  Project Description / Scope of Work <span>*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide details about the deal, scope, and services required"
                  className="client-dashboard-input"
                />
                {errors.description && <span style={{ color: "hsl(0, 84%, 60%)", fontSize: "12px" }}>{errors.description}</span>}
              </div>

              <div className="client-dashboard-field-group">
                <label className="client-dashboard-label">
                  Deal Value Amount (₹) <span>*</span>
                </label>
                <div className="client-dashboard-input-wrapper">
                  <IndianRupee className="client-dashboard-input-icon" size={16} />
                  <input
                    type="number"
                    name="dealValue"
                    value={formData.dealValue}
                    onChange={handleChange}
                    placeholder="Total contract amount"
                    className="client-dashboard-input"
                  />
                </div>
                {errors.dealValue && <span style={{ color: "hsl(0, 84%, 60%)", fontSize: "12px" }}>{errors.dealValue}</span>}
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="client-dashboard-card animate-scale-in">
              <div className="client-dashboard-card-header">
                <Phone className="client-dashboard-card-icon" size={18} />
                <h3 className="client-dashboard-card-title">Contact Information</h3>
              </div>

              <div className="client-dashboard-field-group">
                <label className="client-dashboard-label">
                  Business Address <span>*</span>
                </label>
                <div className="client-dashboard-input-wrapper">
                  <MapPin className="client-dashboard-input-icon" size={16} />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Registered business address"
                    className="client-dashboard-input"
                  />
                </div>
                {errors.address && <span style={{ color: "hsl(0, 84%, 60%)", fontSize: "12px" }}>{errors.address}</span>}
              </div>

              <div className="client-dashboard-field-group">
                <label className="client-dashboard-label">
                  Contact Phone Number <span>*</span>
                </label>
                <div className="client-dashboard-input-wrapper">
                  <Phone className="client-dashboard-input-icon" size={16} />
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="Primary phone number / mobile"
                    className="client-dashboard-input"
                  />
                </div>
                {errors.contactNumber && <span style={{ color: "hsl(0, 84%, 60%)", fontSize: "12px" }}>{errors.contactNumber}</span>}
              </div>

              <div className="client-dashboard-field-group">
                <label className="client-dashboard-label">
                  Website Demo Link (URL)
                </label>
                <div className="client-dashboard-input-wrapper">
                  <Globe className="client-dashboard-input-icon" size={16} />
                  <input
                    type="text"
                    name="demoUrl"
                    value={formData.demoUrl}
                    onChange={handleChange}
                    placeholder="e.g. https://client-website-demo.com"
                    className="client-dashboard-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area (Right side) */}
          <div className="client-dashboard-sidebar">
            {/* Timeline Milestones Setup */}
            <div className="client-dashboard-card animate-scale-in">
              <div className="client-dashboard-card-header">
                <Calendar className="client-dashboard-card-icon" size={18} />
                <h3 className="client-dashboard-card-title">Milestones Timeline</h3>
              </div>

              {/* Dynamic visual timeline indicators */}
              <div className="client-timeline-wrapper">
                <div className="client-timeline-line" />
                
                {milestoneConfig.map((milestone) => {
                  const dateVal = formData[milestone.key];
                  const hasDate = !!dateVal;
                  const isDealClosed = milestone.key === "dealClosedDate";
                  
                  return (
                    <div 
                      key={milestone.key} 
                      className={`client-timeline-item ${hasDate ? "completed" : isDealClosed ? "active" : ""}`}
                    >
                      <div className="client-timeline-dot" />
                      <div className="client-timeline-content">
                        <div className="client-timeline-label-area">
                          <span className="client-timeline-step-title">{milestone.label} {isDealClosed && <span>*</span>}</span>
                          <span className="client-timeline-step-desc">{milestone.desc}</span>
                        </div>
                        <input
                          type="date"
                          name={milestone.key}
                          value={dateVal}
                          onChange={handleChange}
                          className="client-timeline-date-input"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {errors.dealClosedDate && (
                <div style={{ color: "hsl(0, 84%, 60%)", fontSize: "12px", marginTop: "12px" }}>
                  {errors.dealClosedDate}
                </div>
              )}
            </div>

            {/* Financial Invoice Schedule */}
            <div className="client-dashboard-card animate-scale-in">
              <div className="client-dashboard-card-header">
                <IndianRupee className="client-dashboard-card-icon" size={18} />
                <h3 className="client-dashboard-card-title">Billing Schedule Breakdown</h3>
              </div>

              <div className="financial-schedule">
                {/* 40% Milestone payment */}
                <div className={`financial-schedule-row ${formData.payment40Date ? "paid" : "pending"}`}>
                  <div className="financial-schedule-info">
                    <span className="financial-schedule-title">Advance Deposit (40%)</span>
                    <span className="financial-schedule-subtitle">
                      {formData.payment40Date ? `Cleared: ${formData.payment40Date}` : "Payment pending kickoff"}
                    </span>
                  </div>
                  <div className="financial-schedule-amount-area">
                    <span className="financial-schedule-amount">
                      {getFormattedAmount(Number(formData.dealValue) * 0.4)}
                    </span>
                    <span className={`financial-status-pill ${formData.payment40Date ? "paid" : "pending"}`}>
                      {formData.payment40Date ? "Paid" : "Pending"}
                    </span>
                  </div>
                </div>

                {/* 60% Milestone payment */}
                <div className={`financial-schedule-row ${formData.payment60Date ? "paid" : "pending"}`}>
                  <div className="financial-schedule-info">
                    <span className="financial-schedule-title">Final Outstanding (60%)</span>
                    <span className="financial-schedule-subtitle">
                      {formData.payment60Date ? `Cleared: ${formData.payment60Date}` : "Payment pending delivery"}
                    </span>
                  </div>
                  <div className="financial-schedule-amount-area">
                    <span className="financial-schedule-amount">
                      {getFormattedAmount(Number(formData.dealValue) * 0.6)}
                    </span>
                    <span className={`financial-status-pill ${formData.payment60Date ? "paid" : "pending"}`}>
                      {formData.payment60Date ? "Paid" : "Pending"}
                    </span>
                  </div>
                </div>

                {/* Payment warning warning bar in sidebar */}
                {formData.deploymentDate && !formData.payment60Date && (
                  <div className="payment-warning-banner" style={{ marginTop: "12px" }}>
                    <AlertTriangle size={16} />
                    <span>Deployment active but 60% final payment is pending.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Action bar footer */}
        <div className="client-dashboard-actions">
          <button type="submit" className="btn-primary" style={{ padding: "12px 24px", fontSize: "14px" }}>
            <Save size={16} /> {isEditing ? "Save Profile Changes" : "Create Client Project"}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel} style={{ padding: "12px 24px", fontSize: "14px" }}>
            <X size={16} /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
