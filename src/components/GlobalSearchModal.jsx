import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  X, 
  Building2, 
  PhoneCall, 
  Globe, 
  CheckSquare, 
  Lightbulb, 
  User, 
  ArrowRight 
} from "lucide-react";

export default function GlobalSearchModal({
  isOpen,
  onClose,
  clients = [],
  leads = [],
  demos = [],
  tasks = [],
  ideas = [],
  teamMembers = [],
  onNavigate
}) {
  const [query, setQuery] = useState("");

  // Global keydown handler for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Aggregate and filter search results
  const results = useMemo(() => {
    if (!query.trim()) return [];

    const search = query.toLowerCase().trim();
    const matches = [];

    // Search Clients
    clients.forEach(c => {
      if (
        c.name?.toLowerCase().includes(search) || 
        c.description?.toLowerCase().includes(search) ||
        c.contactPerson?.toLowerCase().includes(search)
      ) {
        matches.push({
          type: "Client",
          id: c.id,
          title: c.name,
          subtitle: `Deal: ₹${(c.dealValue || 0).toLocaleString()} • ${c.contactPerson || "No contact"}`,
          icon: Building2,
          tab: "clients"
        });
      }
    });

    // Search Leads
    leads.forEach(l => {
      if (
        l.name?.toLowerCase().includes(search) ||
        l.company?.toLowerCase().includes(search) ||
        l.status?.toLowerCase().includes(search)
      ) {
        matches.push({
          type: "Lead",
          id: l.id,
          title: l.name,
          subtitle: `${l.company || "Individual"} • Status: ${l.status || "New"}`,
          icon: PhoneCall,
          tab: "leads"
        });
      }
    });

    // Search Tasks
    tasks.forEach(t => {
      if (
        t.title?.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search) ||
        t.category?.toLowerCase().includes(search) ||
        t.assignedTo?.toLowerCase().includes(search)
      ) {
        matches.push({
          type: "Task",
          id: t.id,
          title: t.title,
          subtitle: `Assigned: ${t.assignedTo || "Unassigned"} • Status: ${t.status} • Due: ${t.dueDate}`,
          icon: CheckSquare,
          tab: "tasks"
        });
      }
    });

    // Search Ideas
    ideas.forEach(i => {
      if (
        i.title?.toLowerCase().includes(search) ||
        i.description?.toLowerCase().includes(search) ||
        i.category?.toLowerCase().includes(search) ||
        i.stage?.toLowerCase().includes(search)
      ) {
        matches.push({
          type: "Idea",
          id: i.id,
          title: i.title,
          subtitle: `Stage: ${i.stage} • Owner: ${i.owner || "Team"}`,
          icon: Lightbulb,
          tab: "ideas"
        });
      }
    });

    // Search Demos
    demos.forEach(d => {
      if (
        d.title?.toLowerCase().includes(search) ||
        d.description?.toLowerCase().includes(search) ||
        d.techStack?.toLowerCase().includes(search)
      ) {
        matches.push({
          type: "Demo",
          id: d.id,
          title: d.title,
          subtitle: `Stack: ${d.techStack || "Web"}`,
          icon: Globe,
          tab: "demos"
        });
      }
    });

    // Search Team Members
    teamMembers.forEach(m => {
      if (
        m.name?.toLowerCase().includes(search) ||
        m.role?.toLowerCase().includes(search)
      ) {
        matches.push({
          type: "Team Member",
          id: m.id,
          title: m.name,
          subtitle: `Role: ${m.role} • Score: ${m.weeklyScore}%`,
          icon: User,
          tab: "team"
        });
      }
    });

    return matches.slice(0, 15);
  }, [query, clients, leads, demos, tasks, ideas, teamMembers]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content-large" 
        style={{ maxWidth: "620px", padding: 0, overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", borderBottom: "1px solid var(--border-slate)" }}>
          <Search size={20} color="var(--primary-coral)" />
          <input
            type="text"
            autoFocus
            placeholder="Type to search across clients, leads, tasks, ideas, team..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              fontSize: "16px",
              color: "var(--text-heading)",
              outline: "none"
            }}
          />
          <button 
            type="button" 
            onClick={onClose} 
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-muted)" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: "380px", overflowY: "auto", padding: "12px 16px" }}>
          {query.trim() === "" ? (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)", fontSize: "14px" }}>
              Quick search through all portal records. Try searching for "Firebase", "Alex", "Design", or "Lead".
            </div>
          ) : results.length > 0 ? (
            results.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                    marginBottom: "4px"
                  }}
                  className="search-result-item"
                  onClick={() => {
                    onNavigate(item.tab);
                    onClose();
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ 
                      width: "36px", 
                      height: "36px", 
                      borderRadius: "8px", 
                      backgroundColor: "var(--primary-coral-light)", 
                      color: "var(--primary-coral)", 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center" 
                    }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-heading)" }}>
                          {item.title}
                        </span>
                        <span style={{ 
                          fontSize: "11px", 
                          padding: "2px 6px", 
                          borderRadius: "4px", 
                          background: "var(--bg-slate)", 
                          color: "var(--text-muted)", 
                          border: "1px solid var(--border-slate)" 
                        }}>
                          {item.type}
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={16} color="var(--text-light)" />
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-muted)" }}>
              No matches found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
