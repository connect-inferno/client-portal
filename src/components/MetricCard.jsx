import React from "react";

export default function MetricCard({ title, value, icon: Icon, type }) {
  return (
    <div className={`metric-card ${type}`}>
      <div className="metric-icon-wrapper">
        <Icon size={22} strokeWidth={2.2} />
      </div>
      <div className="metric-info">
        <span className="metric-label">{title}</span>
        <span className="metric-value">{value}</span>
      </div>
    </div>
  );
}
