import React, { useState, useEffect } from "react";
import { Plus, Flame } from "lucide-react";
import { dbService } from "./firebase";
import Dashboard from "./components/Dashboard";
import ClientForm from "./components/ClientForm";
import LeadsDashboard from "./components/LeadsDashboard";
import LeadForm from "./components/LeadForm";
import ConfirmModal from "./components/ConfirmModal";

export default function App() {
  const [tab, setTab] = useState("clients"); // 'clients' | 'leads'
  const [view, setView] = useState("dashboard"); // 'dashboard' | 'add' | 'edit'
  
  // Clients state
  const [clients, setClients] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [deleteClientId, setDeleteClientId] = useState(null);

  // Leads state
  const [leads, setLeads] = useState([]);
  const [activeLead, setActiveLead] = useState(null);
  const [deleteLeadId, setDeleteLeadId] = useState(null);

  const [loading, setLoading] = useState(true);

  // Load clients & leads on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const clientsData = await dbService.getClients();
        setClients(clientsData);
        const leadsData = await dbService.getLeads();
        setLeads(leadsData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Save (Create or Update) Client
  const handleSaveClient = async (clientData) => {
    try {
      if (view === "edit" && activeClient) {
        const updated = await dbService.updateClient(activeClient.id, clientData);
        setClients(prev => prev.map(c => (c.id === activeClient.id ? updated : c)));
      } else {
        const added = await dbService.addClient(clientData);
        setClients(prev => [...prev, added]);
      }
      setView("dashboard");
      setActiveClient(null);
    } catch (error) {
      alert("Failed to save client: " + error.message);
    }
  };

  // Save (Create or Update) Lead
  const handleSaveLead = async (leadData) => {
    try {
      if (view === "edit" && activeLead) {
        const updated = await dbService.updateLead(activeLead.id, leadData);
        setLeads(prev => prev.map(l => (l.id === activeLead.id ? updated : l)));
      } else {
        const added = await dbService.addLead(leadData);
        setLeads(prev => [...prev, added]);
      }
      setView("dashboard");
      setActiveLead(null);
    } catch (error) {
      alert("Failed to save lead: " + error.message);
    }
  };

  // Switch Tabs safely resetting sub-states
  const handleTabChange = (targetTab) => {
    setTab(targetTab);
    setView("dashboard");
    setActiveClient(null);
    setActiveLead(null);
  };

  // Trigger edit view
  const handleEditClick = (client) => {
    setActiveClient(client);
    setView("edit");
  };

  const handleEditLeadClick = (lead) => {
    setActiveLead(lead);
    setView("edit");
  };

  // Open deletion modal
  const handleDeleteRequest = (id) => {
    setDeleteClientId(id);
  };

  const handleDeleteLeadRequest = (id) => {
    setDeleteLeadId(id);
  };

  // Execute deletion
  const handleDeleteConfirm = async () => {
    if (!deleteClientId) return;
    try {
      await dbService.deleteClient(deleteClientId);
      setClients(prev => prev.filter(c => c.id !== deleteClientId));
      setDeleteClientId(null);
    } catch (error) {
      alert("Failed to delete client: " + error.message);
    }
  };

  const handleDeleteLeadConfirm = async () => {
    if (!deleteLeadId) return;
    try {
      await dbService.deleteLead(deleteLeadId);
      setLeads(prev => prev.filter(l => l.id !== deleteLeadId));
      setDeleteLeadId(null);
    } catch (error) {
      alert("Failed to delete lead: " + error.message);
    }
  };

  // Cancel deletion
  const handleDeleteCancel = () => {
    setDeleteClientId(null);
  };

  return (
    <div className="app-container">
      {/* Top Navigation Bar with Tabs */}
      <header className="app-header">
        <div className="logo-container" onClick={() => handleTabChange("clients")}>
          <Flame className="logo-icon" fill="currentColor" />
          <h1 className="logo-text">Infernos Ledger</h1>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {view === "dashboard" && (
            <div className="nav-tabs-container">
              <button 
                type="button"
                className={`nav-tab-btn ${tab === "clients" ? "active" : ""}`}
                onClick={() => handleTabChange("clients")}
              >
                Client Ledger
              </button>
              <button 
                type="button"
                className={`nav-tab-btn ${tab === "leads" ? "active" : ""}`}
                onClick={() => handleTabChange("leads")}
              >
                Leads Manager
              </button>
            </div>
          )}

          {view === "dashboard" && tab === "clients" && (
            <button 
              className="btn-primary" 
              onClick={() => { setView("add"); setActiveClient(null); }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Client
            </button>
          )}

          {view === "dashboard" && tab === "leads" && (
            <button 
              className="btn-primary" 
              onClick={() => { setView("add"); setActiveLead(null); }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Lead
            </button>
          )}
        </div>
      </header>

      {/* Main View Container */}
      <main>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)", fontSize: "16px" }}>
            Loading dashboard data...
          </div>
        ) : (
          <>
            {/* Clients Module Views */}
            {tab === "clients" && (
              <>
                {view === "dashboard" && (
                  <Dashboard 
                    clients={clients}
                    onAddClientClick={() => setView("add")}
                    onEditClient={handleEditClick}
                    onDeleteClient={handleDeleteRequest}
                  />
                )}

                {(view === "add" || view === "edit") && (
                  <ClientForm 
                    key={activeClient ? activeClient.id : "new"}
                    client={activeClient}
                    onSave={handleSaveClient}
                    onCancel={() => { setView("dashboard"); setActiveClient(null); }}
                  />
                )}
              </>
            )}

            {/* Leads Module Views */}
            {tab === "leads" && (
              <>
                {view === "dashboard" && (
                  <LeadsDashboard 
                    leads={leads}
                    onAddLeadClick={() => setView("add")}
                    onEditLead={handleEditLeadClick}
                    onDeleteLead={handleDeleteLeadRequest}
                  />
                )}

                {(view === "add" || view === "edit") && (
                  <LeadForm 
                    key={activeLead ? activeLead.id : "new-lead"}
                    lead={activeLead}
                    onSave={handleSaveLead}
                    onCancel={() => { setView("dashboard"); setActiveLead(null); }}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Custom Client Deletion Dialog Modal */}
      <ConfirmModal 
        isOpen={!!deleteClientId}
        title="Confirm Client Deletion"
        message="Are you sure you want to delete this client record? This action will permanently remove the client and all associated transaction milestones from your portal ledger."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Custom Leads Deletion Dialog Modal */}
      <ConfirmModal 
        isOpen={!!deleteLeadId}
        title="Confirm Lead Deletion"
        message="Are you sure you want to delete this client lead record? This action will permanently remove the lead profile and all associated outreach communication call history logs."
        onConfirm={handleDeleteLeadConfirm}
        onCancel={() => setDeleteLeadId(null)}
      />
    </div>
  );
}
