import React, { useState } from "react";
import html2pdf from "html2pdf.js";
import logoImg from "../assets/logo.png";
import { storageService } from "../supabase";
import {
  X,
  FileText,
  Save,
  Printer,
  Copy,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Building2,
  UserCheck,
  Calendar,
  IndianRupee,
  Layers,
  Eye,
  Edit3,
  Download
} from "lucide-react";

const DEFAULT_TEMPLATES = {
  software: {
    title: "Master Software Development Agreement",
    agreementType: "Software Development",
    scopeOfWork: "Development and deployment of customized web application and client management portal as per specified milestones and technical requirements.",
    paymentTerms: "40% advance payment upon contract signing and work initiation; 60% final payment upon successful deployment and production launch.",
    deliverables: [
      { description: "System Architecture & Portal Setup", amount: "", dueDate: "" },
      { description: "Core Feature Development & Database Integration", amount: "", dueDate: "" },
      { description: "QA Testing, UAT, and Deployment", amount: "", dueDate: "" }
    ],
    clauses: [
      {
        title: "1. Intellectual Property Rights",
        content: "Upon full payment of all fees due hereunder, all custom source code, documentation, and final deliverables produced specifically for the Client shall belong exclusively to the Client."
      },
      {
        title: "2. Confidentiality & Non-Disclosure",
        content: "Both parties agree to treat all business data, customer details, algorithms, and financial terms disclosed during the term of this agreement as strictly confidential."
      },
      {
        title: "3. Warranty & Bug Fixes",
        content: "The Provider guarantees 30 days of post-deployment support to resolve critical software defects or bugs at no additional cost."
      },
      {
        title: "4. Termination",
        content: "Either party may terminate this agreement with 15 days written notice. In case of early termination, the Client shall pay for all work completed up to the date of notice."
      }
    ]
  },
  retainer: {
    title: "Monthly Support & SLA Retainer Agreement",
    agreementType: "Monthly Retainer",
    scopeOfWork: "Ongoing software maintenance, infrastructure monitoring, security updates, feature enhancements, and dedicated technical support.",
    paymentTerms: "100% upfront monthly retainer fee due on the 1st day of each billing cycle.",
    deliverables: [
      { description: "Monthly System Upgrades & Security Audits", amount: "", dueDate: "" },
      { description: "Dedicated 20 Hours Technical Development Support", amount: "", dueDate: "" }
    ],
    clauses: [
      {
        title: "1. Service Level Agreement (SLA)",
        content: "The Provider commits to a 99.9% uptime target and critical issue response time within 4 hours during standard business operating hours."
      },
      {
        title: "2. Scope Rollover",
        content: "Unused support hours do not roll over to subsequent billing months unless agreed upon in writing."
      },
      {
        title: "3. Confidentiality",
        content: "All operational and analytical data accessed during support functions will remain strictly confidential."
      }
    ]
  },
  consulting: {
    title: "UI/UX Design & Strategic Consulting Agreement",
    agreementType: "Design & Consulting",
    scopeOfWork: "Product design strategy, wireframing, high-fidelity UI/UX mockups, and interactive prototype delivery for portal modules.",
    paymentTerms: "50% deposit prior to kickoff, 50% upon final design handoff.",
    deliverables: [
      { description: "User Flow Diagrams & Low-Fidelity Wireframes", amount: "", dueDate: "" },
      { description: "Figma High-Fidelity UI Component Library & Prototype", amount: "", dueDate: "" }
    ],
    clauses: [
      {
        title: "1. Asset Ownership",
        content: "Final vector assets, Figma design tokens, and exportable graphics belong to the Client upon final invoice clearance."
      },
      {
        title: "2. Revision Policy",
        content: "Up to 3 design revision cycles per deliverable are included. Additional structural changes will be billed at standard hourly rates."
      }
    ]
  }
};

export default function AgreementBuilderModal({ client, onSave, onClose, onSavePdfUrl, initialTab = "edit" }) {
  const existingAgreement = client?.agreement || {};

  // Form State initialized strictly with current client's data
  const [agreement, setAgreement] = useState({
    agreementId: existingAgreement.agreementId || `AGR-${client.id.slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`,
    title: existingAgreement.title || `Master Service Agreement - ${client.name}`,
    agreementType: existingAgreement.agreementType || "Software Development",
    status: existingAgreement.status || "Draft",
    effectiveDate: existingAgreement.effectiveDate || client.dealClosedDate || new Date().toISOString().split("T")[0],
    expiryDate: existingAgreement.expiryDate || "",
    totalValue: existingAgreement.totalValue !== undefined ? existingAgreement.totalValue : client.dealValue || 0,
    scopeOfWork: existingAgreement.scopeOfWork || `Provision of professional services and project execution for ${client.name}.`,
    paymentTerms: existingAgreement.paymentTerms || "40% advance upon contract kickoff, 60% upon deployment.",
    deliverables: existingAgreement.deliverables || [
      { description: "Project Kickoff & Architecture Setup", amount: client.dealValue ? Math.round(client.dealValue * 0.4) : "", dueDate: client.workStartedDate || "" },
      { description: "Final Project Delivery & Deployment", amount: client.dealValue ? Math.round(client.dealValue * 0.6) : "", dueDate: client.deploymentDate || "" }
    ],
    clauses: existingAgreement.clauses || DEFAULT_TEMPLATES.software.clauses,
    clientSignatory: existingAgreement.clientSignatory || {
      name: client.name || "",
      title: "Authorized Representative",
      signed: false,
      date: ""
    },
    companySignatory: existingAgreement.companySignatory || {
      name: client.teamLeaderName || "Lead Architect",
      title: "Company Representative",
      signed: true,
      date: new Date().toISOString().split("T")[0]
    }
  });

  const [activeTab, setActiveTab] = useState(initialTab); // 'edit' | 'preview'
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Apply template defaults
  const handleApplyTemplate = (templateKey) => {
    const tmpl = DEFAULT_TEMPLATES[templateKey];
    if (!tmpl) return;
    setAgreement(prev => ({
      ...prev,
      title: `${tmpl.title} - ${client.name}`,
      agreementType: tmpl.agreementType,
      scopeOfWork: tmpl.scopeOfWork,
      paymentTerms: tmpl.paymentTerms,
      deliverables: tmpl.deliverables.map(d => ({
        ...d,
        amount: d.amount || Math.round(prev.totalValue / (tmpl.deliverables.length || 1))
      })),
      clauses: tmpl.clauses
    }));
  };

  const handleFieldChange = (field, value) => {
    setAgreement(prev => ({ ...prev, [field]: value }));
  };

  const handleSignatoryChange = (party, field, value) => {
    setAgreement(prev => ({
      ...prev,
      [party]: {
        ...prev[party],
        [field]: value
      }
    }));
  };

  // Deliverables handlers
  const handleAddDeliverable = () => {
    setAgreement(prev => ({
      ...prev,
      deliverables: [
        ...prev.deliverables,
        { description: "", amount: "", dueDate: "" }
      ]
    }));
  };

  const handleUpdateDeliverable = (index, field, value) => {
    const updated = [...agreement.deliverables];
    updated[index] = { ...updated[index], [field]: value };
    setAgreement(prev => ({ ...prev, deliverables: updated }));
  };

  const handleRemoveDeliverable = (index) => {
    setAgreement(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  // Clause handlers
  const handleAddClause = () => {
    setAgreement(prev => ({
      ...prev,
      clauses: [
        ...prev.clauses,
        { title: `${prev.clauses.length + 1}. Custom Clause`, content: "" }
      ]
    }));
  };

  const handleUpdateClause = (index, field, value) => {
    const updated = [...agreement.clauses];
    updated[index] = { ...updated[index], [field]: value };
    setAgreement(prev => ({ ...prev, clauses: updated }));
  };

  const handleRemoveClause = (index) => {
    setAgreement(prev => ({
      ...prev,
      clauses: prev.clauses.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(agreement);
      onClose();
    } catch (err) {
      console.error("Failed to save agreement:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);

    if (activeTab !== "preview") {
      setActiveTab("preview");
      await new Promise((res) => setTimeout(res, 250));
    }

    const element = document.getElementById("printable-agreement-document");
    if (element) {
      const sanitizedName = (client?.name || "Client").replace(/[^a-zA-Z0-9_-]/g, "_");
      const opt = {
        margin: [10, 10, 10, 10],
        filename: "Agreement_" + sanitizedName + "_" + agreement.agreementId + ".pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };

      try {
        // Generate PDF as blob — used for both local download and Supabase upload
        const pdfBlob = await html2pdf().set(opt).from(element).output("blob");

        // 1. Trigger local browser download
        const downloadUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = opt.filename;
        link.click();
        URL.revokeObjectURL(downloadUrl);

        // 2. Upload to Supabase Storage and save URL in Firestore
        if (client?.id && onSavePdfUrl) {
          try {
            const { publicUrl } = await storageService.uploadAgreementPDF(client.id, pdfBlob);
            await onSavePdfUrl(publicUrl);
          } catch (uploadErr) {
            console.warn("Supabase PDF upload failed (local download still succeeded):", uploadErr.message);
          }
        }
      } catch (err) {
        console.error("html2pdf error, fallback to window.print():", err);
        window.print();
      }
    } else {
      window.print();
    }
    setIsGeneratingPDF(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const textContent = `
AGREEMENT REFERENCE: ${agreement.agreementId}
CLIENT: ${client.name}
AGREEMENT TITLE: ${agreement.title}
EFFECTIVE DATE: ${agreement.effectiveDate}
TOTAL VALUE: ₹${Number(agreement.totalValue).toLocaleString('en-IN')}

1. SCOPE OF WORK
${agreement.scopeOfWork}

2. PAYMENT TERMS
${agreement.paymentTerms}

3. DELIVERABLES
${agreement.deliverables.map(d => `- ${d.description}: ₹${Number(d.amount || 0).toLocaleString('en-IN')} (Due: ${d.dueDate || 'N/A'})`).join('\n')}

4. TERMS & CONDITIONS
${agreement.clauses.map(c => `${c.title}\n${c.content}`).join('\n\n')}

SIGNATORIES:
Client: ${agreement.clientSignatory.name} (${agreement.clientSignatory.title}) - ${agreement.clientSignatory.signed ? 'SIGNED' : 'PENDING'}
Company: ${agreement.companySignatory.name} (${agreement.companySignatory.title}) - ${agreement.companySignatory.signed ? 'SIGNED' : 'PENDING'}
    `.trim();

    navigator.clipboard.writeText(textContent);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const formattedValue = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(agreement.totalValue || 0);

  return (
    <div className="modal-overlay animate-fade-in" style={{ zIndex: 1100 }}>
      <div className="modal-container agreement-modal" style={{ maxWidth: "960px", width: "95vw", maxHeight: "90vh" }}>
        
        {/* Header */}
        <div className="modal-header agreement-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="agreement-icon-badge">
              <FileCheck size={22} className="text-primary" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 className="modal-title" style={{ margin: 0 }}>Client Agreement Builder</h3>
                <span className="client-id-pill">Client: <strong>{client.name}</strong></span>
              </div>
              <p className="modal-subtitle" style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                Bound strictly to Client Profile: <strong>{client.name}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* View Mode Toggle */}
            <div className="agreement-tab-toggle">
              <button
                type="button"
                className={`tab-btn ${activeTab === "edit" ? "active" : ""}`}
                onClick={() => setActiveTab("edit")}
              >
                <Edit3 size={14} /> Builder / Edit
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "preview" ? "active" : ""}`}
                onClick={() => setActiveTab("preview")}
              >
                <Eye size={14} /> Official Preview
              </button>
            </div>

            <button type="button" className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body agreement-body" style={{ overflowY: "auto", padding: "20px 24px" }}>
          
          {activeTab === "edit" ? (
            <div className="agreement-edit-mode">
              
              {/* Presets & Templates Bar */}
              <div className="template-bar">
                <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Layers size={14} /> Load Presets:
                </span>
                <button
                  type="button"
                  className="template-btn"
                  onClick={() => handleApplyTemplate("software")}
                >
                  Software Development
                </button>
                <button
                  type="button"
                  className="template-btn"
                  onClick={() => handleApplyTemplate("retainer")}
                >
                  Monthly Retainer
                </button>
                <button
                  type="button"
                  className="template-btn"
                  onClick={() => handleApplyTemplate("consulting")}
                >
                  UI/UX & Consulting
                </button>
              </div>

              {/* Core Information Grid */}
              <div className="form-section-card">
                <h4 className="section-subtitle"><FileText size={16} /> Agreement Details</h4>
                <div className="form-grid-3">
                  <div className="form-group">
                    <label>Agreement Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={agreement.title}
                      onChange={(e) => handleFieldChange("title", e.target.value)}
                      placeholder="e.g. Master Service Agreement"
                    />
                  </div>

                  <div className="form-group">
                    <label>Agreement Type</label>
                    <select
                      className="form-control"
                      value={agreement.agreementType}
                      onChange={(e) => handleFieldChange("agreementType", e.target.value)}
                    >
                      <option value="Software Development">Software Development</option>
                      <option value="Monthly Retainer">Monthly Retainer</option>
                      <option value="Design & Consulting">Design & Consulting</option>
                      <option value="Custom Project">Custom Project</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Effective Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={agreement.effectiveDate}
                      onChange={(e) => handleFieldChange("effectiveDate", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Expiry / End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={agreement.expiryDate}
                      onChange={(e) => handleFieldChange("expiryDate", e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Total Contract Value (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={agreement.totalValue}
                      onChange={(e) => handleFieldChange("totalValue", Number(e.target.value))}
                      placeholder="e.g. 150000"
                    />
                  </div>
                </div>
              </div>

              {/* Scope of Work & Payment Terms */}
              <div className="form-section-card">
                <h4 className="section-subtitle"><Building2 size={16} /> Scope & Financial Terms</h4>
                <div className="form-group mb-16">
                  <label>Scope of Work Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={agreement.scopeOfWork}
                    onChange={(e) => handleFieldChange("scopeOfWork", e.target.value)}
                    placeholder="Describe detailed project deliverables and client requirements..."
                  />
                </div>

                <div className="form-group">
                  <label>Payment Terms & Schedule</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={agreement.paymentTerms}
                    onChange={(e) => handleFieldChange("paymentTerms", e.target.value)}
                    placeholder="e.g. 40% upfront advance, 60% upon deployment clearance..."
                  />
                </div>
              </div>

              {/* Deliverables Breakdown */}
              <div className="form-section-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 className="section-subtitle" style={{ margin: 0 }}>
                    <IndianRupee size={16} /> Deliverables & Milestone Breakdown
                  </h4>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddDeliverable}
                  >
                    <Plus size={14} /> Add Milestone
                  </button>
                </div>

                {agreement.deliverables.map((item, idx) => (
                  <div key={idx} className="deliverable-row">
                    <div style={{ flex: 2 }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Deliverable description"
                        value={item.description}
                        onChange={(e) => handleUpdateDeliverable(idx, "description", e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Amount (₹)"
                        value={item.amount}
                        onChange={(e) => handleUpdateDeliverable(idx, "amount", e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input
                        type="date"
                        className="form-control"
                        value={item.dueDate}
                        onChange={(e) => handleUpdateDeliverable(idx, "dueDate", e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="icon-danger-btn"
                      onClick={() => handleRemoveDeliverable(idx)}
                      title="Remove deliverable"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Legal Clauses Section */}
              <div className="form-section-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 className="section-subtitle" style={{ margin: 0 }}>
                    <FileText size={16} /> Terms, Conditions & Clauses
                  </h4>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddClause}
                  >
                    <Plus size={14} /> Add Clause
                  </button>
                </div>

                {agreement.clauses.map((clause, idx) => (
                  <div key={idx} className="clause-edit-card mb-12">
                    <div style={{ display: "flex", gap: "10px", marginBottom: "6px" }}>
                      <input
                        type="text"
                        className="form-control font-weight-bold"
                        value={clause.title}
                        onChange={(e) => handleUpdateClause(idx, "title", e.target.value)}
                        placeholder="Clause Title (e.g. 1. Confidentiality)"
                        style={{ fontWeight: "600" }}
                      />
                      <button
                        type="button"
                        className="icon-danger-btn"
                        onClick={() => handleRemoveClause(idx)}
                        title="Remove clause"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={clause.content}
                      onChange={(e) => handleUpdateClause(idx, "content", e.target.value)}
                      placeholder="Clause body content..."
                    />
                  </div>
                ))}
              </div>

              {/* Signatories Section */}
              <div className="form-section-card">
                <h4 className="section-subtitle"><UserCheck size={16} /> Authorized Signatories</h4>
                <div className="form-grid-2">
                  {/* Client Signatory */}
                  <div className="signatory-box">
                    <h5 className="signatory-title">Client Representative</h5>
                    <div className="form-group mb-8">
                      <label>Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={agreement.clientSignatory.name}
                        onChange={(e) => handleSignatoryChange("clientSignatory", "name", e.target.value)}
                      />
                    </div>
                    <div className="form-group mb-8">
                      <label>Designation / Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={agreement.clientSignatory.title}
                        onChange={(e) => handleSignatoryChange("clientSignatory", "title", e.target.value)}
                      />
                    </div>
                    <div className="checkbox-row mt-8">
                      <input
                        type="checkbox"
                        id="clientSignedCheck"
                        checked={agreement.clientSignatory.signed}
                        onChange={(e) => {
                          handleSignatoryChange("clientSignatory", "signed", e.target.checked);
                          if (e.target.checked && !agreement.clientSignatory.date) {
                            handleSignatoryChange("clientSignatory", "date", new Date().toISOString().split("T")[0]);
                          }
                        }}
                      />
                      <label htmlFor="clientSignedCheck">Mark as Signed by Client</label>
                    </div>
                  </div>

                  {/* Company Signatory */}
                  <div className="signatory-box">
                    <h5 className="signatory-title">Company Representative</h5>
                    <div className="form-group mb-8">
                      <label>Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={agreement.companySignatory.name}
                        onChange={(e) => handleSignatoryChange("companySignatory", "name", e.target.value)}
                      />
                    </div>
                    <div className="form-group mb-8">
                      <label>Designation / Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={agreement.companySignatory.title}
                        onChange={(e) => handleSignatoryChange("companySignatory", "title", e.target.value)}
                      />
                    </div>
                    <div className="checkbox-row mt-8">
                      <input
                        type="checkbox"
                        id="companySignedCheck"
                        checked={agreement.companySignatory.signed}
                        onChange={(e) => {
                          handleSignatoryChange("companySignatory", "signed", e.target.checked);
                          if (e.target.checked && !agreement.companySignatory.date) {
                            handleSignatoryChange("companySignatory", "date", new Date().toISOString().split("T")[0]);
                          }
                        }}
                      />
                      <label htmlFor="companySignedCheck">Mark as Signed by Company</label>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* OFFICIAL PREVIEW MODE (PRINTABLE / EXPORTABLE) */
            <div className="printable-agreement-document" id="printable-agreement-document">
              
              {/* Official Brand Header with Logo */}
              <div className="doc-brand-header">
                <div className="doc-brand-left">
                  <img src={logoImg} alt="Infernos IT Solutions Logo" className="doc-brand-logo" />
                  <div>
                    <h1 className="doc-brand-name">Infernos IT Solutions</h1>
                    <p className="doc-brand-sub">Enterprise Technology & Software Services</p>
                  </div>
                </div>
                <div className="doc-brand-right">
                  <span className="doc-brand-date">Effective Date: <strong>{agreement.effectiveDate}</strong></span>
                </div>
              </div>

              <hr className="doc-divider" />

              {/* Document Title */}
              <div className="doc-top-bar">
                <h2 className="doc-main-title">{agreement.title}</h2>
              </div>

              {/* Parties Header */}
              <div className="doc-parties-grid">
                <div className="party-card">
                  <h4>PREPARED FOR (CLIENT)</h4>
                  <p className="party-name">{client.name}</p>
                  <p className="party-detail">{client.address || "Address on File"}</p>
                  <p className="party-detail">Contact: {client.contactNumber || "N/A"}</p>
                </div>
                <div className="party-card">
                  <h4>PREPARED BY (PROVIDER)</h4>
                  <p className="party-name">Infernos IT Solutions</p>
                  <p className="party-detail">Client Relations & Engineering Division</p>
                  <p className="party-detail">Representative: {agreement.companySignatory.name}</p>
                </div>
              </div>

              {/* Contract Summary Box */}
              <div className="doc-summary-box">
                <div className="summary-item">
                  <span>Contract Value:</span>
                  <strong>{formattedValue}</strong>
                </div>
                <div className="summary-item">
                  <span>Effective Date:</span>
                  <strong>{agreement.effectiveDate || "N/A"}</strong>
                </div>
                <div className="summary-item">
                  <span>Agreement Type:</span>
                  <strong>{agreement.agreementType}</strong>
                </div>
              </div>

              {/* 1. Scope of Work */}
              <div className="doc-section">
                <h3 className="doc-section-title">1. SCOPE OF WORK</h3>
                <p className="doc-text">{agreement.scopeOfWork}</p>
              </div>

              {/* 2. Payment Terms */}
              <div className="doc-section">
                <h3 className="doc-section-title">2. PAYMENT TERMS</h3>
                <p className="doc-text">{agreement.paymentTerms}</p>
              </div>

              {/* 3. Deliverables Table */}
              {agreement.deliverables.length > 0 && (
                <div className="doc-section">
                  <h3 className="doc-section-title">3. DELIVERABLES & MILESTONES</h3>
                  <table className="doc-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Deliverable Description</th>
                        <th style={{ textAlign: "right" }}>Amount (₹)</th>
                        <th>Target Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agreement.deliverables.map((item, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{item.description}</td>
                          <td style={{ textAlign: "right", fontWeight: "600" }}>
                            {item.amount ? `₹${Number(item.amount).toLocaleString('en-IN')}` : "Included"}
                          </td>
                          <td>{item.dueDate || "As scheduled"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 4. Terms & Clauses */}
              <div className="doc-section">
                <h3 className="doc-section-title">4. TERMS & CONDITIONS</h3>
                {agreement.clauses.map((clause, idx) => (
                  <div key={idx} className="doc-clause-block mb-16">
                    <h4 className="doc-clause-title">{clause.title}</h4>
                    <p className="doc-clause-text">{clause.content}</p>
                  </div>
                ))}
              </div>

              {/* 5. Signature Blocks */}
              <div className="doc-section doc-signatures-section">
                <h3 className="doc-section-title">5. AUTHORIZATION & SIGNATURES</h3>
                <div className="doc-signatures-grid">
                  <div className="signature-box">
                    <p className="sig-label">FOR CLIENT: {client.name}</p>
                    <div className="sig-line-area">
                      {agreement.clientSignatory.signed ? (
                        <div className="digital-signature-badge">
                          <CheckCircle2 size={18} className="text-success" />
                          <div>
                            <span className="sig-name">{agreement.clientSignatory.name}</span>
                            <span className="sig-date">Digitally Verified on {agreement.clientSignatory.date || "Record"}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="pending-sig-text">[ Pending Signature ]</span>
                      )}
                    </div>
                    <p className="sig-title">{agreement.clientSignatory.title}</p>
                  </div>

                  <div className="signature-box">
                    <p className="sig-label">FOR PROVIDER: Infernos IT Solutions</p>
                    <div className="sig-line-area">
                      {agreement.companySignatory.signed ? (
                        <div className="digital-signature-badge">
                          <CheckCircle2 size={18} className="text-success" />
                          <div>
                            <span className="sig-name">{agreement.companySignatory.name}</span>
                            <span className="sig-date">Digitally Verified on {agreement.companySignatory.date || "Record"}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="pending-sig-text">[ Pending Signature ]</span>
                      )}
                    </div>
                    <p className="sig-title">{agreement.companySignatory.title}</p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="modal-footer agreement-footer">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {activeTab === "preview" && (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Download size={15} />
                  {isGeneratingPDF ? "Downloading PDF..." : "Download PDF File"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handlePrint}>
                  <Printer size={15} /> Print Document
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCopyText}>
                  <Copy size={15} /> {copiedNotification ? "Copied Text!" : "Copy Text"}
                </button>
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save size={16} /> {isSaving ? "Saving Agreement..." : `Save Agreement for ${client.name}`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
