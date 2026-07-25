import React, { useState } from "react";
import { ExternalLink, Copy, Check, Pencil, Trash2, Globe } from "lucide-react";

export default function DemoCard({ demo, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);

  const websiteName = demo.name || demo.title || "Website Demo";
  const rawUrl = demo.url || "";

  // Ensure formatted URL starts with protocol
  const formattedUrl = rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
    ? rawUrl
    : `https://${rawUrl}`;

  // Display URL (without protocol)
  const displayUrl = rawUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!rawUrl) return;
    navigator.clipboard.writeText(formattedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="simple-demo-card animate-fade-in">
      {/* Top Header Row with Icon, Name & URL */}
      <div className="simple-demo-header">
        <div className="simple-demo-icon-box">
          <Globe size={22} />
        </div>

        <div className="simple-demo-info">
          <h3 className="simple-demo-name" title={websiteName}>
            {websiteName}
          </h3>
          <a
            href={formattedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="simple-demo-url"
            title={formattedUrl}
          >
            {displayUrl}
          </a>
        </div>

        {/* Edit & Delete Action Buttons */}
        <div className="simple-demo-actions">
          <button
            type="button"
            className="action-icon-btn edit"
            title="Edit Demo"
            onClick={() => onEdit(demo)}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            className="action-icon-btn delete"
            title="Delete Demo"
            onClick={() => onDelete(demo.id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="simple-demo-footer">
        <a
          href={formattedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-visit-demo"
        >
          <span>Visit Website</span>
          <ExternalLink size={14} />
        </a>

        <button
          type="button"
          className={`btn-copy-simple ${copied ? "copied" : ""}`}
          onClick={handleCopy}
          title="Copy Link"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
