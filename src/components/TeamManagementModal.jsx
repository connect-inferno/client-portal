import React, { useState } from "react";
import { X, UserPlus, Trash2, Edit2, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import UserAvatar from "./UserAvatar";
import { removeDuplicateTeamMembers } from "../utils/teamUtils";

export default function TeamManagementModal({
  isOpen,
  onClose,
  teamMembers = [],
  onAddMember,
  onUpdateMember,
  onDeleteMember
}) {
  const [editingMember, setEditingMember] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [activeStatus, setActiveStatus] = useState("active");

  if (!isOpen) return null;

  const uniqueMembers = removeDuplicateTeamMembers(teamMembers);

  const handleOpenAdd = () => {
    setEditingMember(null);
    setName("");
    setEmail("");
    setRole("");
    setDepartment("Engineering");
    setActiveStatus("active");
    setErrorMessage("");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMember(m);
    setName(m.name);
    setEmail(m.email || "");
    setRole(m.role || "");
    setDepartment(m.department || "Engineering");
    setActiveStatus(m.activeStatus || "active");
    setErrorMessage("");
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    // Check for duplicate names (excluding current editing member)
    const isDuplicate = uniqueMembers.some(
      m => m.name.trim().toLowerCase() === trimmedName.toLowerCase() && m.id !== editingMember?.id
    );

    if (isDuplicate) {
      setErrorMessage(`A team member named "${trimmedName}" already exists.`);
      return;
    }

    const payload = {
      name: trimmedName,
      email: email.trim() || `${trimmedName.toLowerCase()}@connectinferno.com`,
      role: role.trim() || "Team Member",
      department,
      activeStatus
    };

    if (editingMember) {
      await onUpdateMember(editingMember.id, payload);
    } else {
      await onAddMember(payload);
    }
    setErrorMessage("");
    setIsFormOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-large" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "620px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Shield size={20} color="var(--primary-coral)" />
              Manage Firestore Team Members
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Add, edit roles, disable, or remove team members without touching codebase.
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)" }}>
            <X size={20} />
          </button>
        </div>

        {/* Action Button */}
        {!isFormOpen && (
          <button
            type="button"
            className="btn-primary"
            onClick={handleOpenAdd}
            style={{ width: "100%", justifyContent: "center", marginBottom: "20px" }}
          >
            <UserPlus size={16} />
            Add New Team Member
          </button>
        )}

        {/* Member Add/Edit Form */}
        {isFormOpen && (
          <form onSubmit={handleSubmit} style={{ background: "var(--bg-slate)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-slate)", marginBottom: "20px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-heading)", marginBottom: "12px" }}>
              {editingMember ? `Edit ${editingMember.name}` : "Create New Team Member"}
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shreyas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-slate)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="shreyas@connectinferno.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-slate)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>
                  Role Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead Architect"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid var(--border-slate)" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="sort-select"
                  style={{ width: "100%" }}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Support">Support</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-main)", marginBottom: "4px" }}>
                  Status
                </label>
                <select
                  value={activeStatus}
                  onChange={(e) => setActiveStatus(e.target.value)}
                  className="sort-select"
                  style={{ width: "100%" }}
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>

            {errorMessage && (
              <div style={{ color: "#ef4444", fontSize: "12px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertCircle size={14} />
                {errorMessage}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                Save Member to Firestore
              </button>
            </div>
          </form>
        )}

        {/* Existing Team Members List */}
        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          {uniqueMembers.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid var(--border-slate)", background: "var(--card-bg)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <UserAvatar name={m.name} size={36} />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: "6px" }}>
                    {m.name}
                    {m.activeStatus === "disabled" && (
                      <span style={{ fontSize: "10px", color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", padding: "1px 6px", borderRadius: "4px" }}>
                        Disabled
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {m.role || "Member"} • {m.department || "Engineering"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" onClick={() => handleOpenEdit(m)} className="icon-button" style={{ width: "30px", height: "30px" }}>
                  <Edit2 size={14} />
                </button>
                <button type="button" onClick={() => onDeleteMember(m.id)} className="icon-button" style={{ width: "30px", height: "30px", color: "#ef4444" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
