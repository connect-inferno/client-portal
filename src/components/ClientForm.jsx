import React, { useState, useRef } from "react";
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
  Globe,
  Pencil,
  Printer,
  Plus,
  FolderOpen,
  Upload,
  Trash2,
  Download,
  FilePlus2,
  ExternalLink
} from "lucide-react";
import { storageService } from "../supabase";

export default function ClientForm({ client, onSave, onCancel, onOpenAgreement, onSaveDocuments }) {
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
    teamLeaderName: client?.teamLeaderName || "",
    teamLeaderContact: client?.teamLeaderContact || "",
    dealClosedDate: client?.dealClosedDate || "",
    workStartedDate: client?.workStartedDate || "",
    payment40Date: client?.payment40Date || "",
    payment60Date: client?.payment60Date || "",
    deploymentDate: client?.deploymentDate || ""
  });

  // --- Documents Vault State (Supabase Storage) ---
  const MAX_DOCS = 5;
  const initDocSlots = () => {
    const saved = client?.documents || [];
    // Each slot: { label, fileName, fileType, fileSize, supabasePath, publicUrl, uploadedAt }
    const slots = saved.map(d => ({ ...d }));
    while (slots.length < MAX_DOCS)
      slots.push({ label: "", fileName: "", fileType: "", fileSize: 0, supabasePath: "", publicUrl: "", uploadedAt: "" });
    return slots;
  };
  const [docSlots, setDocSlots] = useState(initDocSlots);
  const [docUploading, setDocUploading] = useState(Array(5).fill(false));
  const [docSaving, setDocSaving] = useState(false);
  const [docSaveMsg, setDocSaveMsg] = useState("");
  const fileInputRefs = useRef([]);

  const handleDocLabelChange = (idx, value) => {
    setDocSlots(prev => prev.map((s, i) => i === idx ? { ...s, label: value } : s));
    setDocSaveMsg("");
  };

  const handleDocFileChange = async (idx, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF and Word documents (.pdf, .doc, .docx) are allowed.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5MB.");
      e.target.value = "";
      return;
    }

    // Delete old file from Supabase if replacing
    const oldPath = docSlots[idx]?.supabasePath;
    if (oldPath) await storageService.deleteFile(oldPath);

    // Upload to Supabase
    setDocUploading(prev => { const a = [...prev]; a[idx] = true; return a; });
    setDocSaveMsg("");
    try {
      const { path, publicUrl } = await storageService.uploadClientDoc(client.id, idx, file);
      setDocSlots(prev => prev.map((s, i) => i === idx ? {
        ...s,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        supabasePath: path,
        publicUrl,
        uploadedAt: new Date().toISOString()
      } : s));
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setDocUploading(prev => { const a = [...prev]; a[idx] = false; return a; });
      if (fileInputRefs.current[idx]) fileInputRefs.current[idx].value = "";
    }
  };

  const handleRemoveDoc = async (idx) => {
    const path = docSlots[idx]?.supabasePath;
    if (path) await storageService.deleteFile(path);
    setDocSlots(prev => prev.map((s, i) => i === idx
      ? { label: s.label, fileName: "", fileType: "", fileSize: 0, supabasePath: "", publicUrl: "", uploadedAt: "" }
      : s));
    if (fileInputRefs.current[idx]) fileInputRefs.current[idx].value = "";
    setDocSaveMsg("");
  };

  const handleClearDocSlot = async (idx) => {
    const path = docSlots[idx]?.supabasePath;
    if (path) await storageService.deleteFile(path);
    setDocSlots(prev => prev.map((s, i) => i === idx
      ? { label: "", fileName: "", fileType: "", fileSize: 0, supabasePath: "", publicUrl: "", uploadedAt: "" }
      : s));
    if (fileInputRefs.current[idx]) fileInputRefs.current[idx].value = "";
    setDocSaveMsg("");
  };

  const handleSaveDocuments = async () => {
    const toSave = docSlots.filter(s => s.label.trim() || s.fileName);
    if (toSave.length === 0) {
      setDocSaveMsg("Add at least one document to save.");
      return;
    }
    setDocSaving(true);
    setDocSaveMsg("");
    try {
      await onSaveDocuments(docSlots);
      setDocSaveMsg("\u2713 Documents saved successfully!");
    } catch (err) {
      setDocSaveMsg("Failed to save documents: " + err.message);
    } finally {
      setDocSaving(false);
    }
  };

  const handleDownloadDoc = (slot) => {
    if (!slot.publicUrl) return;
    window.open(slot.publicUrl, "_blank", "noopener,noreferrer");
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

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
        {isEditing && onOpenAgreement && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onOpenAgreement(client)}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <FileText size={16} />
            {client?.agreement ? "View / Edit Agreement" : "＋ Build Agreement"}
          </button>
        )}
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
                  Team Leader's Name
                </label>
                <div className="client-dashboard-input-wrapper">
                  <User className="client-dashboard-input-icon" size={16} />
                  <input
                    type="text"
                    name="teamLeaderName"
                    value={formData.teamLeaderName}
                    onChange={handleChange}
                    placeholder="Enter team leader's name"
                    className="client-dashboard-input"
                  />
                </div>
              </div>

              <div className="client-dashboard-field-group">
                <label className="client-dashboard-label">
                  Team Leader's Contact Number
                </label>
                <div className="client-dashboard-input-wrapper">
                  <Phone className="client-dashboard-input-icon" size={16} />
                  <input
                    type="text"
                    name="teamLeaderContact"
                    value={formData.teamLeaderContact}
                    onChange={handleChange}
                    placeholder="Team leader's contact number"
                    className="client-dashboard-input"
                  />
                </div>
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

        {/* 4. Stored Client Agreement Section */}
        {isEditing && (
          <div className="client-dashboard-card animate-scale-in" style={{ marginTop: "20px" }}>
            <div className="client-dashboard-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FileText className="client-dashboard-card-icon" size={20} />
                <div>
                  <h3 className="client-dashboard-card-title" style={{ margin: 0 }}>Stored Client Agreement</h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                    Official contract agreement stored strictly under this client's profile information.
                  </p>
                </div>
              </div>

              {client?.agreement ? (
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onOpenAgreement(client)}
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Pencil size={14} /> Edit Agreement
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onOpenAgreement({ client, initialTab: "preview" })}
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Printer size={14} /> Download PDF File
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => onOpenAgreement(client)}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Plus size={14} /> Create & Attach Agreement
                </button>
              )}
            </div>

            {client?.agreement ? (
              <div className="stored-agreement-card-body" style={{
                backgroundColor: "var(--bg-slate)",
                border: "1px solid var(--border-slate)",
                borderRadius: "10px",
                padding: "18px",
                marginTop: "16px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", fontWeight: "700", color: "var(--text-heading)" }}>
                      {client.agreement.title}
                    </h4>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Type: <strong>{client.agreement.agreementType}</strong> &bull; Effective: <strong>{client.agreement.effectiveDate || "N/A"}</strong>
                    </span>
                  </div>
                  <span className="client-agreement-pill status-signed" style={{ fontSize: "12px", padding: "4px 12px" }}>
                    <CheckCircle2 size={13} /> Agreement Stored
                  </span>
                </div>

                <div style={{ fontSize: "13px", color: "var(--text-main)", marginBottom: "14px", lineHeight: "1.5" }}>
                  <strong>Scope Summary:</strong> {client.agreement.scopeOfWork}
                </div>

                <div style={{ display: "flex", gap: "24px", fontSize: "12.5px", color: "var(--text-muted)", flexWrap: "wrap", borderTop: "1px solid var(--border-slate)", paddingTop: "12px" }}>
                  <span>Contract Value: <strong style={{ color: "var(--text-heading)" }}>₹{Number(client.agreement.totalValue || client.dealValue || 0).toLocaleString('en-IN')}</strong></span>
                  <span>Deliverables: <strong style={{ color: "var(--text-heading)" }}>{client.agreement.deliverables?.length || 0} milestones</strong></span>
                  <span>Clauses: <strong style={{ color: "var(--text-heading)" }}>{client.agreement.clauses?.length || 0} legal clauses</strong></span>
                  <span>Provider: <strong style={{ color: "var(--text-heading)" }}>Infernos IT Solutions</strong></span>
                </div>
                {client?.agreementPdfUrl && (
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-slate)", display: "flex", alignItems: "center", gap: "10px" }}>
                    <ExternalLink size={14} style={{ color: "var(--success-teal)", flexShrink: 0 }} />
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Agreement PDF stored in Supabase:</span>
                    <a
                      href={client.agreementPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "12.5px",
                        fontWeight: 600,
                        color: "var(--success-teal)",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      &#9729; Open Agreement PDF
                    </a>
                  </div>
                )}
              </div>

            ) : (
              <div style={{
                textAlign: "center",
                padding: "24px",
                backgroundColor: "var(--bg-slate)",
                borderRadius: "10px",
                border: "1px dashed var(--border-slate)",
                color: "var(--text-muted)",
                marginTop: "16px"
              }}>
                No agreement created for this client yet. Click <strong>"Create & Attach Agreement"</strong> to draft, save, and attach the official contract agreement.
              </div>
            )}
          </div>
        )}

        {/* 5. Client Documents Vault Section */}
        {isEditing && (
          <div className="client-dashboard-card animate-scale-in client-docs-vault" style={{ marginTop: "20px" }}>
            <div className="client-dashboard-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FolderOpen className="client-dashboard-card-icon" size={20} style={{ color: "var(--primary-coral)" }} />
                <div>
                  <h3 className="client-dashboard-card-title" style={{ margin: 0 }}>Client Documents Vault</h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                    Upload up to 5 files (PDF / Word) — requirements, cost estimates, contracts &amp; more.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleSaveDocuments}
                disabled={docSaving}
                style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "130px" }}
              >
                {docSaving ? (
                  <><span className="doc-spinner" /> Saving…</>
                ) : (
                  <><Save size={14} /> Save Documents</>
                )}
              </button>
            </div>

            {docSaveMsg && (
              <div className={`doc-save-message ${docSaveMsg.startsWith("✓") ? "success" : "error"}`}>
                {docSaveMsg}
              </div>
            )}

            <div className="doc-slots-grid">
              {docSlots.map((slot, idx) => {
                const hasFile = !!slot.fileName;
                const isUploading = docUploading[idx];
                const isPdf = slot.fileType === "application/pdf";
                return (
                  <div key={idx} className={`doc-slot-card ${hasFile ? "has-file" : ""} ${isUploading ? "uploading" : ""}`}>
                    {/* Slot number badge */}
                    <div className="doc-slot-number">Doc {idx + 1}</div>

                    {/* Label field */}
                    <div className="doc-slot-label-group">
                      <label className="doc-slot-label-text">Document Name / Label</label>
                      <input
                        type="text"
                        className="client-dashboard-input doc-slot-name-input"
                        placeholder={`e.g. Client Requirements, Cost Estimate…`}
                        value={slot.label}
                        onChange={e => handleDocLabelChange(idx, e.target.value)}
                        maxLength={60}
                      />
                    </div>

                    {/* File upload area */}
                    {isUploading ? (
                      <div className="doc-slot-dropzone doc-slot-uploading">
                        <span className="doc-spinner" style={{ width: "22px", height: "22px", borderWidth: "3px" }} />
                        <span className="doc-dropzone-label">Uploading to Supabase…</span>
                        <span className="doc-dropzone-hint">Please wait</span>
                      </div>
                    ) : hasFile ? (
                      <div className="doc-slot-file-preview">
                        <div className="doc-file-icon-wrap">
                          {isPdf ? (
                            <span className="doc-file-type-badge pdf">PDF</span>
                          ) : (
                            <span className="doc-file-type-badge docx">DOC</span>
                          )}
                        </div>
                        <div className="doc-file-info">
                          <span className="doc-file-name" title={slot.fileName}>{slot.fileName}</span>
                          <span className="doc-file-meta">{formatFileSize(slot.fileSize)}</span>
                          {slot.uploadedAt && (
                            <span className="doc-file-meta">
                              Uploaded {new Date(slot.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          )}
                          <span className="doc-file-meta" style={{ color: "var(--success-teal)", fontWeight: 600 }}>&#9729; Stored in Supabase</span>
                        </div>
                        <div className="doc-file-actions">
                          <button
                            type="button"
                            className="doc-action-btn download"
                            title="Open file in new tab"
                            onClick={() => handleDownloadDoc(slot)}
                          >
                            <ExternalLink size={14} />
                          </button>
                          <button
                            type="button"
                            className="doc-action-btn replace"
                            title="Replace file"
                            onClick={() => fileInputRefs.current[idx]?.click()}
                          >
                            <Upload size={14} />
                          </button>
                          <button
                            type="button"
                            className="doc-action-btn remove"
                            title="Remove file"
                            onClick={() => handleRemoveDoc(idx)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <input
                          ref={el => fileInputRefs.current[idx] = el}
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          style={{ display: "none" }}
                          onChange={e => handleDocFileChange(idx, e)}
                        />
                      </div>
                    ) : (
                      <div
                        className="doc-slot-dropzone"
                        onClick={() => fileInputRefs.current[idx]?.click()}
                      >
                        <FilePlus2 size={24} className="doc-dropzone-icon" />
                        <span className="doc-dropzone-label">Click to upload</span>
                        <span className="doc-dropzone-hint">PDF or Word · Max 5MB</span>
                        <input
                          ref={el => fileInputRefs.current[idx] = el}
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          style={{ display: "none" }}
                          onChange={e => handleDocFileChange(idx, e)}
                        />
                      </div>
                    )}

                    {/* Clear entire slot */}
                    {(slot.label || hasFile) && (
                      <button
                        type="button"
                        className="doc-slot-clear-btn"
                        title="Clear this slot"
                        onClick={() => handleClearDocSlot(idx)}
                      >
                        <X size={12} /> Clear slot
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Action bar footer */}
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
