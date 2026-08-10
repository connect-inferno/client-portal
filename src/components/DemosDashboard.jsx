import React, { useState, useMemo } from "react";
import { Globe, Search, Plus, ExternalLink } from "lucide-react";
import DemoCard from "./DemoCard";

export default function DemosDashboard({
  demos,
  onAddDemoClick,
  onEditDemo,
  onDeleteDemo
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter Demos by Search Term
  const filteredDemos = useMemo(() => {
    return demos.filter(demo => {
      const search = searchTerm.toLowerCase();
      const name = (demo.name || demo.title || "").toLowerCase();
      const url = (demo.url || "").toLowerCase();
      return name.includes(search) || url.includes(search);
    });
  }, [demos, searchTerm]);

  return (
    <div className="dashboard-view animate-fade-in">
      {/* Top Banner / Filter Bar */}
      <div className="demos-header-bar">
        <div className="demos-header-info">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text-heading)" }}>
              Website Demos
            </h2>
            <span className="demo-count-badge">
              {demos.length} {demos.length === 1 ? "Demo Link" : "Demo Links"}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
            Paste and organize live demo links of websites you have created.
          </p>
        </div>

        {/* Search Bar & Action Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexGrow: 1, maxWidth: "600px" }}>
          <div className="search-wrapper" style={{ flexGrow: 1 }}>
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search demo links by website name or URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={onAddDemoClick}
            style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap", flexShrink: 0 }}
          >
            <Plus size={16} />
            + Add Website Demo
          </button>
        </div>
      </div>

      {/* Demos Cards Grid */}
      <div className="simple-demos-grid">
        {filteredDemos.length > 0 ? (
          filteredDemos.map(demo => (
            <DemoCard
              key={demo.id}
              demo={demo}
              onEdit={onEditDemo}
              onDelete={onDeleteDemo}
            />
          ))
        ) : (
          <div className="empty-demos-container">
            <div className="empty-demos-icon">
              <Globe size={36} />
            </div>
            <h3>{searchTerm ? "No Matching Demo Links Found" : "No Website Demos Added Yet"}</h3>
            <p>
              {searchTerm
                ? "Try searching with a different website name or link."
                : "Easily paste demo links of websites you've built to showcase them anytime."}
            </p>
            {!searchTerm && (
              <button className="btn-primary" onClick={onAddDemoClick} style={{ marginTop: "16px" }}>
                <Plus size={16} />
                Add Demo Link
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
