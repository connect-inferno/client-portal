import React from "react";
import { Pencil, Trash2, AlertTriangle, ExternalLink, Globe, FileText, FileCheck } from "lucide-react";

export default function ClientCard({ client, onEdit, onDelete, onOpenAgreement }) {
  // Helper to format date from YYYY-MM-DD to M/D/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
  };

  // Calculate dynamic progress based on set milestones
  let progressPercent = 0;
  if (client.dealClosedDate) progressPercent = 20;
  if (client.workStartedDate) progressPercent = 40;
  if (client.payment40Date) progressPercent = 60;
  if (client.payment60Date) progressPercent = 80;
  if (client.deploymentDate) progressPercent = 100;

  const isComplete = progressPercent === 100;

  const agreement = client.agreement;
  const agreementStatus = agreement?.status || "None";

  // Render currency formatted deal value
  const formattedDealValue = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(client.dealValue || 0);

  // Group milestones to map through them cleanly
  const milestones = [
    { label: "Deal Closed", date: client.dealClosedDate },
    { label: "Work Started", date: client.workStartedDate },
    { label: "40% Payment", date: client.payment40Date },
    { label: "60% Payment", date: client.payment60Date },
    { label: "Deployment", date: client.deploymentDate }
  ];

  const formattedDemoUrl = client.demoUrl?.startsWith("http") 
    ? client.demoUrl 
    : `https://${client.demoUrl}`;

  return (
    <div className={`client-card ${isComplete ? "complete" : ""}`}>
      {/* Header with Edit/Delete & Agreement */}
      <div className="client-card-header">
        <div className="client-title-area">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h3 className="client-name">{client.name}</h3>
            {/* Agreement Badge */}
            <span
              className={`client-agreement-pill status-${agreementStatus.toLowerCase().replace(" ", "-")}`}
              onClick={() => onOpenAgreement(client)}
              title="Click to open Agreement Builder for this client"
            >
              <FileCheck size={12} />
              {agreement ? `Agreement: ${agreementStatus}` : "＋ Add Agreement"}
            </span>
          </div>
          <p className="client-description">{client.description}</p>
        </div>
        <div className="client-actions">
          <button 
            className="action-icon-btn agreement" 
            title="Agreement Builder for this Client"
            onClick={() => onOpenAgreement(client)}
          >
            <FileText size={16} />
          </button>
          <button 
            className="action-icon-btn edit" 
            title="Edit Client"
            onClick={() => onEdit(client)}
          >
            <Pencil size={16} />
          </button>
          <button 
            className="action-icon-btn delete" 
            title="Delete Client"
            onClick={() => onDelete(client.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Payment Warning Banner */}
      {client.deploymentDate && !client.payment60Date && (
        <div className="payment-warning-banner">
          <AlertTriangle size={16} />
          <span>Warning: Project is marked as Deployed, but final 60% payment is still pending.</span>
        </div>
      )}

      {/* Info Details Grid */}
      <div className="client-info-grid">
        <div>
          <span>Deal Value: </span>
          <span className="deal-value-label">{formattedDealValue}</span>
        </div>
        <div>
          <span>Contact: </span>
          <span className="info-item-highlight">{client.contactNumber || "N/A"}</span>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <span>Address: </span>
          <span className="info-item-highlight">{client.address || "N/A"}</span>
        </div>
        {client.demoUrl && (
          <div style={{ gridColumn: "1 / -1", marginTop: "4px" }}>
            <span>Demo Link: </span>
            <a 
              href={formattedDemoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="client-demo-link-badge"
            >
              <Globe size={13} />
              <span>{client.demoUrl.replace(/^https?:\/\//, "")}</span>
              <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>

      {/* Milestones Timeline Details */}
      <div className="timeline-stages">
        {milestones.map((step, idx) => {
          if (!step.date) return null;
          return (
            <div key={idx} className="stage-item">
              <span className="stage-dot" />
              <span>
                {step.label}: <span className="info-item-highlight">{formatDate(step.date)}</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress Bar Container */}
      <div className="progress-section">
        <div className="progress-label-row">
          <span className="progress-title">Progress</span>
          <span className="progress-percent">{progressPercent}%</span>
        </div>
        <div className="progress-track-bar">
          <div 
            className="progress-fill-bar" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
