import React, { useState, useEffect } from "react";
import { dbService } from "./firebase";
import { runSmartAutomation } from "./utils/automation";
import { removeDuplicateTeamMembers } from "./utils/teamUtils";

// Existing Components
import Dashboard from "./components/Dashboard";
import ClientForm from "./components/ClientForm";
import LeadsDashboard from "./components/LeadsDashboard";
import LeadForm from "./components/LeadForm";
import DemosDashboard from "./components/DemosDashboard";
import DemoForm from "./components/DemoForm";
import ConfirmModal from "./components/ConfirmModal";
import AgreementBuilderModal from "./components/AgreementBuilderModal";

// Core Infrastructure Components
import NavigationHeader from "./components/NavigationHeader";
import GlobalSearchModal from "./components/GlobalSearchModal";
import NotificationCenter from "./components/NotificationCenter";
import UserProfileModal from "./components/UserProfileModal";
import TeamManagementModal from "./components/TeamManagementModal";

// Module Components
import TeamDashboard from "./components/TeamDashboard";
import TaskManager from "./components/TaskManager";
import TaskModal from "./components/TaskModal";
import MyTasks from "./components/MyTasks";
import WeeklyPlanner from "./components/WeeklyPlanner";
import CalendarView from "./components/CalendarView";
import Leaderboard from "./components/Leaderboard";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import IdeaPipeline from "./components/IdeaPipeline";

export default function App() {
  const [tab, setTab] = useState("team"); // Default to Team Dashboard to highlight real team members
  const [view, setView] = useState("dashboard"); // 'dashboard' | 'add' | 'edit'
  
  // Theme State
  const [theme, setTheme] = useState("light");

  // Clients state
  const [clients, setClients] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [deleteClientId, setDeleteClientId] = useState(null);
  const [activeClientForAgreement, setActiveClientForAgreement] = useState(null);

  // Leads state
  const [leads, setLeads] = useState([]);
  const [activeLead, setActiveLead] = useState(null);
  const [deleteLeadId, setDeleteLeadId] = useState(null);

  // Demos state
  const [demos, setDemos] = useState([]);
  const [activeDemo, setActiveDemo] = useState(null);
  const [deleteDemoId, setDeleteDemoId] = useState(null);

  // Real-time Firestore Modules State
  const [tasks, setTasks] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Modals & Popover UI States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedMemberForProfile, setSelectedMemberForProfile] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeTaskForModal, setActiveTaskForModal] = useState(null);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [isTeamManagementOpen, setIsTeamManagementOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  // Toggle Theme
  const handleToggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  // Real-time Subscriptions to All 7 Firestore Collections
  useEffect(() => {
    setLoading(true);

    // Purge any existing mock/sample data from Firestore
    dbService.purgeSampleData();

    const unsubscribeClients = dbService.subscribeToClients((fetchedClients) => {
      setClients(fetchedClients);
      setLoading(false);
    });

    const unsubscribeLeads = dbService.subscribeToLeads((fetchedLeads) => {
      setLeads(fetchedLeads);
    });

    const unsubscribeDemos = dbService.subscribeToDemos((fetchedDemos) => {
      setDemos(fetchedDemos);
    });

    const unsubscribeMembers = dbService.subscribeToTeamMembers((members) => {
      setTeamMembers(removeDuplicateTeamMembers(members));
    });

    const unsubscribeTasks = dbService.subscribeToTasks((fetchedTasks) => {
      setTasks(fetchedTasks);
    });

    const unsubscribeIdeas = dbService.subscribeToIdeas((fetchedIdeas) => {
      setIdeas(fetchedIdeas);
    });

    const unsubscribeNotifs = dbService.subscribeToNotifications((fetchedNotifs) => {
      setNotifications(fetchedNotifs);
    });

    return () => {
      if (unsubscribeClients) unsubscribeClients();
      if (unsubscribeLeads) unsubscribeLeads();
      if (unsubscribeDemos) unsubscribeDemos();
      if (unsubscribeMembers) unsubscribeMembers();
      if (unsubscribeTasks) unsubscribeTasks();
      if (unsubscribeIdeas) unsubscribeIdeas();
      if (unsubscribeNotifs) unsubscribeNotifs();
    };
  }, []);

  // --- Team Member Operations ---
  const handleAddTeamMember = async (memberData) => {
    await dbService.addTeamMember(memberData);
  };

  const handleUpdateTeamMember = async (id, memberData) => {
    await dbService.updateTeamMember(id, memberData);
  };

  const handleDeleteTeamMember = async (id) => {
    await dbService.deleteTeamMember(id);
  };

  // --- Clients CRUD ---
  const handleSaveClient = async (clientData) => {
    try {
      if (view === "edit" && activeClient) {
        await dbService.updateClient(activeClient.id, clientData);
      } else {
        await dbService.addClient(clientData);
      }
      setView("dashboard");
      setActiveClient(null);
    } catch (error) {
      alert("Failed to save client: " + error.message);
    }
  };

  const handleSaveClientDocuments = async (documents) => {
    if (!activeClient) throw new Error("No active client selected.");
    await dbService.saveClientDocuments(activeClient.id, documents);
  };

  // --- Leads CRUD ---
  const handleSaveLead = async (leadData) => {
    try {
      if (view === "edit" && activeLead) {
        await dbService.updateLead(activeLead.id, leadData);
      } else {
        await dbService.addLead(leadData);
      }
      setView("dashboard");
      setActiveLead(null);
    } catch (error) {
      alert("Failed to save lead: " + error.message);
    }
  };

  // --- Demos CRUD ---
  const handleSaveDemo = async (demoData) => {
    try {
      if (view === "edit" && activeDemo) {
        await dbService.updateDemo(activeDemo.id, demoData);
      } else {
        await dbService.addDemo(demoData);
      }
      setView("dashboard");
      setActiveDemo(null);
    } catch (error) {
      alert("Failed to save demo link: " + error.message);
    }
  };

  // --- Tasks Operations ---
  const handleSaveTask = async (taskData) => {
    try {
      if (taskData.id) {
        await dbService.updateTask(taskData.id, taskData);
      } else {
        const added = await dbService.addTask(taskData);

        // Real Firestore Notification Trigger for Task Assignment
        const assignedMember = teamMembers.find(m => m.name === added.assignedTo);
        await dbService.addNotification({
          userId: assignedMember?.id || "",
          type: "task_assigned",
          title: "New Task Assigned",
          message: `'${added.title}' assigned to ${added.assignedTo}.`
        });
      }
    } catch (e) {
      console.error("Failed to save task to Firestore:", e);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const updatedTask = {
      ...target,
      status: newStatus,
      completedDate: newStatus === "Completed" ? new Date().toISOString() : null
    };

    await dbService.updateTask(taskId, updatedTask);

    if (newStatus === "Completed") {
      await dbService.addNotification({
        type: "completed",
        title: "Task Completed",
        message: `'${target.title}' completed by ${target.assignedTo}!`
      });
    }
  };

  const handleUpdateTaskDate = async (taskId, newDateIso) => {
    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const newStatus = target.status === "Completed" 
      ? "Completed" 
      : newDateIso < todayStr 
        ? "Overdue" 
        : "Pending";

    const updatedTask = {
      ...target,
      dueDate: newDateIso,
      status: newStatus
    };

    await dbService.updateTask(taskId, updatedTask);
  };

  const handleDeleteTask = async (taskId) => {
    await dbService.deleteTask(taskId);
  };

  // --- Ideas Operations ---
  const handleSaveIdea = async (ideaData) => {
    try {
      if (ideaData.id) {
        await dbService.updateIdea(ideaData.id, ideaData);
      } else {
        const added = await dbService.addIdea(ideaData);
        await dbService.addNotification({
          type: "info",
          title: "New Idea Proposed",
          message: `'${added.title}' proposed by ${added.owner}.`
        });
      }
    } catch (e) {
      console.error("Failed to save idea to Firestore:", e);
    }
  };

  const handleUpdateIdeaStage = async (ideaId, newStage) => {
    const target = ideas.find(i => i.id === ideaId);
    if (!target) return;

    const updated = {
      ...target,
      stage: newStage,
      isArchived: newStage === "Archived"
    };

    await dbService.updateIdea(ideaId, updated);
  };

  const handleDeleteIdea = async (ideaId) => {
    await dbService.deleteIdea(ideaId);
  };

  const handleConvertIdeaToTask = async (idea) => {
    await handleSaveTask({
      title: `Execute: ${idea.title}`,
      description: `Problem: ${idea.problemStatement}\nSolution: ${idea.proposedSolution}`,
      category: "Development",
      priority: idea.priority || "High",
      dueDate: new Date().toISOString().split("T")[0],
      assignedTo: idea.owner || teamMembers[0]?.name || "Shreyas"
    });
    await handleUpdateIdeaStage(idea.id, "In Progress");
    setTab("tasks");
  };

  // Switch Tabs safely
  const handleTabChange = (targetTab) => {
    setTab(targetTab);
    setView("dashboard");
    setActiveClient(null);
    setActiveLead(null);
    setActiveDemo(null);
  };

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const handleMarkAllNotifsRead = () => {
    notifications.forEach(n => {
      if (!n.read) dbService.markNotificationAsRead(n.id);
    });
  };

  const handleClearNotifs = () => {
    notifications.forEach(n => dbService.deleteNotification(n.id));
  };

  return (
    <div className="app-container" style={{ position: "relative" }}>
      {/* Top Navigation Header */}
      <NavigationHeader
        activeTab={tab}
        onTabChange={handleTabChange}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        unreadNotifCount={unreadNotifCount}
        onToggleNotifications={() => setIsNotifOpen(!isNotifOpen)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNewTask={() => { setActiveTaskForModal(null); setIsTaskModalOpen(true); }}
        onOpenNewIdea={() => setIsIdeaModalOpen(true)}
        onOpenNewClient={() => { setTab("clients"); setActiveClient(null); setView("add"); }}
        onOpenNewLead={() => { setTab("leads"); setActiveLead(null); setView("add"); }}
        onOpenNewDemo={() => { setTab("demos"); setActiveDemo(null); setView("add"); }}
        onOpenTeamManagement={() => setIsTeamManagementOpen(true)}
      />

      {/* Real-time Notifications Drawer */}
      <NotificationCenter
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotifsRead}
        onClearAll={handleClearNotifs}
      />

      {/* Main Content Area */}
      <main style={{ marginTop: "16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)", fontSize: "16px" }}>
            Connecting to Live Firestore Operating System...
          </div>
        ) : (
          <>
            {/* 1. Clients Module */}
            {tab === "clients" && (
              <>
                {view === "dashboard" && (
                  <Dashboard 
                    clients={clients}
                    onAddClientClick={() => setView("add")}
                    onEditClient={(client) => { setActiveClient(client); setView("edit"); }}
                    onDeleteClient={(id) => setDeleteClientId(id)}
                    onOpenAgreement={(client) => setActiveClientForAgreement(client)}
                  />
                )}

                {(view === "add" || view === "edit") && (
                  <ClientForm 
                    key={activeClient ? activeClient.id : "new"}
                    client={activeClient}
                    onSave={handleSaveClient}
                    onCancel={() => { setView("dashboard"); setActiveClient(null); }}
                    onOpenAgreement={(client) => setActiveClientForAgreement(client)}
                    onSaveDocuments={handleSaveClientDocuments}
                  />
                )}
              </>
            )}

            {/* 2. Leads Module */}
            {tab === "leads" && (
              <>
                {view === "dashboard" && (
                  <LeadsDashboard 
                    leads={leads}
                    onAddLeadClick={() => setView("add")}
                    onEditLead={(lead) => { setActiveLead(lead); setView("edit"); }}
                    onDeleteLead={(id) => setDeleteLeadId(id)}
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

            {/* 3. Demos Module */}
            {tab === "demos" && (
              <>
                {view === "dashboard" && (
                  <DemosDashboard 
                    demos={demos}
                    onAddDemoClick={() => setView("add")}
                    onEditDemo={(demo) => { setActiveDemo(demo); setView("edit"); }}
                    onDeleteDemo={(id) => setDeleteDemoId(id)}
                  />
                )}

                {(view === "add" || view === "edit") && (
                  <DemoForm 
                    key={activeDemo ? activeDemo.id : "new-demo"}
                    demo={activeDemo}
                    onSave={handleSaveDemo}
                    onCancel={() => { setView("dashboard"); setActiveDemo(null); }}
                  />
                )}
              </>
            )}

            {/* 4. Real Team Accountability Dashboard */}
            {tab === "team" && (
              <TeamDashboard
                teamMembers={teamMembers}
                tasks={tasks}
                onSelectMember={(member) => setSelectedMemberForProfile(member)}
                onOpenTeamManagement={() => setIsTeamManagementOpen(true)}
              />
            )}

            {/* 5. Firestore Task Management System */}
            {tab === "tasks" && (
              <TaskManager
                tasks={tasks}
                teamMembers={teamMembers}
                onSaveTask={handleSaveTask}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {/* 6. My Tasks Workspace */}
            {tab === "mytasks" && (
              <MyTasks
                tasks={tasks}
                currentUser={teamMembers[0]?.name || "Shreyas"}
                teamMembers={teamMembers}
                onSaveTask={handleSaveTask}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {/* 7. Firestore Weekly Planner */}
            {tab === "planner" && (
              <WeeklyPlanner
                tasks={tasks}
                onUpdateTaskDate={handleUpdateTaskDate}
                onUpdateTaskStatus={handleUpdateTaskStatus}
              />
            )}

            {/* 8. Firestore Calendar View */}
            {tab === "calendar" && (
              <CalendarView
                tasks={tasks}
                teamMembers={teamMembers}
                onSaveTask={handleSaveTask}
                onUpdateTaskDate={handleUpdateTaskDate}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {/* 9. Dynamic Leaderboard */}
            {tab === "leaderboard" && (
              <Leaderboard
                teamMembers={teamMembers}
                tasks={tasks}
                onSelectMember={(member) => setSelectedMemberForProfile(member)}
              />
            )}

            {/* 10. Dynamic Analytics Dashboard */}
            {tab === "analytics" && (
              <AnalyticsDashboard
                tasks={tasks}
                teamMembers={teamMembers}
                ideas={ideas}
              />
            )}

            {/* 11. Firestore Idea Pipeline */}
            {tab === "ideas" && (
              <IdeaPipeline
                ideas={ideas}
                teamMembers={teamMembers}
                onSaveIdea={handleSaveIdea}
                onUpdateIdeaStage={handleUpdateIdeaStage}
                onDeleteIdea={handleDeleteIdea}
                onConvertIdeaToTask={handleConvertIdeaToTask}
              />
            )}
          </>
        )}
      </main>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        clients={clients}
        leads={leads}
        demos={demos}
        tasks={tasks}
        ideas={ideas}
        teamMembers={teamMembers}
        onNavigate={(targetTab) => handleTabChange(targetTab)}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        member={selectedMemberForProfile}
        isOpen={!!selectedMemberForProfile}
        onClose={() => setSelectedMemberForProfile(null)}
        tasks={tasks}
      />

      {/* Header Quick Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={activeTaskForModal}
        teamMembers={teamMembers}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
      />

      {/* Team Member Firestore Management Modal */}
      <TeamManagementModal
        isOpen={isTeamManagementOpen}
        onClose={() => setIsTeamManagementOpen(false)}
        teamMembers={teamMembers}
        onAddMember={handleAddTeamMember}
        onUpdateMember={handleUpdateTeamMember}
        onDeleteMember={handleDeleteTeamMember}
      />

      {/* Deletion Dialog Modals for Existing Modules */}
      <ConfirmModal 
        isOpen={!!deleteClientId}
        title="Confirm Client Deletion"
        message="Are you sure you want to delete this client record? This action will permanently remove the client and all associated transaction milestones from your portal ledger."
        onConfirm={async () => {
          await dbService.deleteClient(deleteClientId);
          setClients(prev => prev.filter(c => c.id !== deleteClientId));
          setDeleteClientId(null);
        }}
        onCancel={() => setDeleteClientId(null)}
      />

      <ConfirmModal 
        isOpen={!!deleteLeadId}
        title="Confirm Lead Deletion"
        message="Are you sure you want to delete this client lead record? This action will permanently remove the lead profile and all associated outreach communication call history logs."
        onConfirm={async () => {
          await dbService.deleteLead(deleteLeadId);
          setLeads(prev => prev.filter(l => l.id !== deleteLeadId));
          setDeleteLeadId(null);
        }}
        onCancel={() => setDeleteLeadId(null)}
      />

      <ConfirmModal 
        isOpen={!!deleteDemoId}
        title="Confirm Demo Link Deletion"
        message="Are you sure you want to delete this website demo link entry? This action will permanently remove the demo link and tech stack showcase details from your portal."
        onConfirm={async () => {
          await dbService.deleteDemo(deleteDemoId);
          setDemos(prev => prev.filter(d => d.id !== deleteDemoId));
          setDeleteDemoId(null);
        }}
        onCancel={() => setDeleteDemoId(null)}
      />

      {/* Client-Scoped Agreement Builder Modal */}
      {activeClientForAgreement && (
        <AgreementBuilderModal
          client={activeClientForAgreement.client || activeClientForAgreement}
          initialTab={activeClientForAgreement.initialTab || "edit"}
          onSave={async (agreementData) => {
            const targetId = (activeClientForAgreement.client || activeClientForAgreement).id;
            await dbService.saveClientAgreement(targetId, agreementData);
            setActiveClientForAgreement(null);
          }}
          onSavePdfUrl={async (url) => {
            const targetId = (activeClientForAgreement.client || activeClientForAgreement).id;
            await dbService.saveClientAgreementPdfUrl(targetId, url);
          }}
          onClose={() => setActiveClientForAgreement(null)}
        />
      )}
    </div>
  );
}
