import React, { useState } from "react";
import { ArrowLeft, Globe, Link as LinkIcon, Save, X } from "lucide-react";

export default function DemoForm({ demo, onSave, onCancel }) {
  const isEditing = !!demo;

  const [formData, setFormData] = useState({
    name: demo?.name || demo?.title || "",
    url: demo?.url || ""
  });

  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Website Name is required";
    if (!formData.url.trim()) {
      newErrors.url = "Website Link (URL) is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSave({
      name: formData.name.trim(),
      url: formData.url.trim()
    });
  };

  return (
    <div className="form-card animate-fade-in" style={{ maxWidth: "540px" }}>
      {/* Header */}
      <div className="form-header-row">
        <button type="button" className="back-btn" onClick={onCancel} title="Go back">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="form-title">
            <Globe size={20} style={{ color: "var(--primary-coral)" }} />
            {isEditing ? "Edit Demo Link" : "Add Website Demo Link"}
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
            Enter the website name and demo URL to save it to your showcase.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Website Name */}
          <div className="form-group">
            <label className="form-label">
              Website / Project Name <span>*</span>
            </label>
            <div className="input-with-icon-wrapper">
              <Globe className="input-field-icon" size={16} />
              <input
                type="text"
                name="name"
                placeholder="e.g. Apex Logistics or Restaurant Portal"
                value={formData.name}
                onChange={handleChange}
                className={`input-field ${errors.name ? "input-error" : ""}`}
                autoFocus
              />
            </div>
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          {/* Website Link (URL) */}
          <div className="form-group">
            <label className="form-label">
              Website Link (URL) <span>*</span>
            </label>
            <div className="input-with-icon-wrapper">
              <LinkIcon className="input-field-icon" size={16} />
              <input
                type="text"
                name="url"
                placeholder="e.g. https://apex-logistics.netlify.app"
                value={formData.url}
                onChange={handleChange}
                className={`input-field ${errors.url ? "input-error" : ""}`}
              />
            </div>
            {errors.url && <span className="error-message">{errors.url}</span>}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          gap: "12px", 
          marginTop: "32px",
          paddingTop: "20px",
          borderTop: "1px solid var(--border-slate)"
        }}>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            <X size={16} />
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            <Save size={16} />
            {isEditing ? "Update Link" : "Save Demo Link"}
          </button>
        </div>
      </form>
    </div>
  );
}
