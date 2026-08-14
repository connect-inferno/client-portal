import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  onSnapshot 
} from "firebase/firestore";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase App & Firestore Database directly
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initial 7 Real Team Members Seeder (executes strictly if collection is empty)
const INITIAL_REAL_TEAM_MEMBERS = [
  {
    name: "Shreyas",
    email: "shreyas@connectinferno.com",
    role: "Lead Architect",
    department: "Engineering",
    activeStatus: "active",
    joinedDate: "2024-01-15",
    streak: 7,
    permissions: ["admin", "manage_tasks", "manage_clients"]
  },
  {
    name: "Sarthak",
    email: "sarthak@connectinferno.com",
    role: "Full Stack Engineer",
    department: "Engineering",
    activeStatus: "active",
    joinedDate: "2024-02-01",
    streak: 5,
    permissions: ["manage_tasks"]
  },
  {
    name: "Soham",
    email: "soham@connectinferno.com",
    role: "Product Designer",
    department: "Design",
    activeStatus: "active",
    joinedDate: "2024-02-15",
    streak: 6,
    permissions: ["manage_tasks", "manage_ideas"]
  },
  {
    name: "Atharva",
    email: "atharva@connectinferno.com",
    role: "Growth & Marketing Lead",
    department: "Marketing",
    activeStatus: "active",
    joinedDate: "2024-03-01",
    streak: 4,
    permissions: ["manage_tasks"]
  },
  {
    name: "Amit",
    email: "amit@connectinferno.com",
    role: "Operations & Sales Lead",
    department: "Sales",
    activeStatus: "active",
    joinedDate: "2024-01-10",
    streak: 5,
    permissions: ["manage_leads", "manage_clients"]
  },
  {
    name: "Yogini",
    email: "yogini@connectinferno.com",
    role: "QA & Operations Manager",
    department: "Operations",
    activeStatus: "active",
    joinedDate: "2024-03-10",
    streak: 3,
    permissions: ["manage_tasks"]
  },
  {
    name: "Sai",
    email: "sai@connectinferno.com",
    role: "Client Success Specialist",
    department: "Support",
    activeStatus: "active",
    joinedDate: "2024-04-01",
    streak: 4,
    permissions: ["manage_clients"]
  }
];

// Unified Database Service Layer connecting strictly to live Firestore
export const dbService = {
  // --- Real-time Clients Service ---
  subscribeToClients: (onUpdate) => {
    const colRef = collection(db, "clients");
    const q = query(colRef, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      onUpdate(clientsData);
    }, (error) => {
      console.error("Clients snapshot error:", error);
    });
  },

  getClients: async () => {
    const q = query(collection(db, "clients"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  addClient: async (clientData) => {
    const formattedClient = {
      ...clientData,
      dealValue: Number(clientData.dealValue) || 0,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, "clients"), formattedClient);
    return { id: docRef.id, ...formattedClient };
  },

  updateClient: async (id, updatedData) => {
    const formattedData = {
      ...updatedData,
      dealValue: Number(updatedData.dealValue) || 0
    };
    const docRef = doc(db, "clients", id);
    await updateDoc(docRef, formattedData);
    return { id, ...formattedData };
  },

  deleteClient: async (id) => {
    const docRef = doc(db, "clients", id);
    await deleteDoc(docRef);
    return id;
  },

  saveClientAgreement: async (clientId, agreementData) => {
    const docRef = doc(db, "clients", clientId);
    const updatedAgreement = {
      ...agreementData,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(docRef, { agreement: updatedAgreement });
    return updatedAgreement;
  },

  saveClientDocuments: async (clientId, documents) => {
    const docRef = doc(db, "clients", clientId);
    // Strip out File objects (non-serializable) before writing to Firestore
    const serializable = documents.map(({ file, ...rest }) => rest);
    await updateDoc(docRef, { documents: serializable });
    return serializable;
  },

  saveClientAgreementPdfUrl: async (clientId, pdfUrl) => {
    const docRef = doc(db, "clients", clientId);
    await updateDoc(docRef, { agreementPdfUrl: pdfUrl });
    return pdfUrl;
  },

  // --- Real-time Leads Service ---
  subscribeToLeads: (onUpdate) => {
    const colRef = collection(db, "leads");
    const q = query(colRef, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      onUpdate(leadsData);
    }, (error) => {
      console.error("Leads snapshot error:", error);
    });
  },

  getLeads: async () => {
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  addLead: async (leadData) => {
    const formattedLead = {
      ...leadData,
      calls: leadData.calls || [],
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, "leads"), formattedLead);
    return { id: docRef.id, ...formattedLead };
  },

  updateLead: async (id, updatedData) => {
    const docRef = doc(db, "leads", id);
    await updateDoc(docRef, updatedData);
    return { id, ...updatedData };
  },

  deleteLead: async (id) => {
    const docRef = doc(db, "leads", id);
    await deleteDoc(docRef);
    return id;
  },

  // --- Real-time Demos Service ---
  subscribeToDemos: (onUpdate) => {
    const colRef = collection(db, "demos");
    const q = query(colRef, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const demosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      onUpdate(demosData);
    }, (error) => {
      console.error("Demos snapshot error:", error);
    });
  },

  getDemos: async () => {
    const q = query(collection(db, "demos"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  addDemo: async (demoData) => {
    const formattedDemo = {
      ...demoData,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, "demos"), formattedDemo);
    return { id: docRef.id, ...formattedDemo };
  },

  updateDemo: async (id, updatedData) => {
    const docRef = doc(db, "demos", id);
    await updateDoc(docRef, updatedData);
    return { id, ...updatedData };
  },

  deleteDemo: async (id) => {
    const docRef = doc(db, "demos", id);
    await deleteDoc(docRef);
    return id;
  },

  // --- Purge Sample Data Utility ---
  purgeSampleData: async () => {
    try {
      const leadsSnap = await getDocs(collection(db, "leads"));
      for (const docSnap of leadsSnap.docs) {
        if (docSnap.data().name === "Nexus Cloud Corp") {
          await deleteDoc(doc(db, "leads", docSnap.id));
        }
      }

      const clientsSnap = await getDocs(collection(db, "clients"));
      for (const docSnap of clientsSnap.docs) {
        if (["Apex Global Solutions", "Vanguard Tech Systems"].includes(docSnap.data().name)) {
          await deleteDoc(doc(db, "clients", docSnap.id));
        }
      }

      const demosSnap = await getDocs(collection(db, "demos"));
      for (const docSnap of demosSnap.docs) {
        if (docSnap.data().name === "Infernos Client Portal Live Preview") {
          await deleteDoc(doc(db, "demos", docSnap.id));
        }
      }

      const tasksSnap = await getDocs(collection(db, "tasks"));
      for (const docSnap of tasksSnap.docs) {
        if (!docSnap.data().isUserCreated) {
          await deleteDoc(doc(db, "tasks", docSnap.id));
        }
      }
    } catch (err) {
      console.error("Purge sample data error:", err);
    }
  },

  // --- Real-time Team Members Service ---
  subscribeToTeamMembers: (onUpdate) => {
    const colRef = collection(db, "teamMembers");
    return onSnapshot(colRef, async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial 7 real team members if collection is freshly created/empty
        for (const member of INITIAL_REAL_TEAM_MEMBERS) {
          await addDoc(colRef, {
            ...member,
            createdAt: new Date().toISOString()
          });
        }
        return;
      }
      const members = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        avatar: docSnap.data().profileImage || docSnap.data().avatar,
        ...docSnap.data()
      }));

      // Deduplicate team members by normalized name (retains first occurrence)
      const uniqueMembers = [];
      const seenNames = new Set();
      const duplicateDocIds = [];

      for (const m of members) {
        const normName = (m.name || "").trim().toLowerCase();
        if (normName && !seenNames.has(normName)) {
          seenNames.add(normName);
          uniqueMembers.push(m);
        } else if (normName && m.id) {
          duplicateDocIds.push(m.id);
        }
      }

      // Purge lingering duplicate documents from Firestore if present
      if (duplicateDocIds.length > 0) {
        for (const dupId of duplicateDocIds) {
          try {
            await deleteDoc(doc(db, "teamMembers", dupId));
          } catch (e) {
            console.error("Error deleting duplicate team member doc:", e);
          }
        }
      }

      onUpdate(uniqueMembers);
    }, (error) => {
      console.error("Team members snapshot error:", error);
    });
  },

  addTeamMember: async (memberData) => {
    const normName = (memberData.name || "").trim().toLowerCase();

    // Check for existing duplicate name in Firestore before creating a new entry
    try {
      const snap = await getDocs(collection(db, "teamMembers"));
      const existingDoc = snap.docs.find(d => (d.data().name || "").trim().toLowerCase() === normName);
      if (existingDoc) {
        console.warn(`Team member with name "${memberData.name}" already exists.`);
        return { id: existingDoc.id, ...existingDoc.data() };
      }
    } catch (err) {
      console.error("Check duplicate team member error:", err);
    }

    const formatted = {
      name: memberData.name.trim(),
      email: memberData.email || `${memberData.name.trim().toLowerCase()}@connectinferno.com`,
      profileImage: memberData.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      role: memberData.role || "Team Member",
      department: memberData.department || "Engineering",
      activeStatus: "active",
      joinedDate: new Date().toISOString().split("T")[0],
      streak: 0,
      permissions: memberData.permissions || ["manage_tasks"],
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, "teamMembers"), formatted);
    return { id: docRef.id, ...formatted };
  },

  updateTeamMember: async (id, memberData) => {
    const docRef = doc(db, "teamMembers", id);
    await updateDoc(docRef, { ...memberData, updatedAt: new Date().toISOString() });
    return { id, ...memberData };
  },

  deleteTeamMember: async (id) => {
    const docRef = doc(db, "teamMembers", id);
    await deleteDoc(docRef);
    return id;
  },

  // --- Real-time Tasks Service ---
  subscribeToTasks: (onUpdate) => {
    const colRef = collection(db, "tasks");
    const q = query(colRef, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      onUpdate(tasks);
    }, (error) => {
      console.error("Tasks snapshot error:", error);
    });
  },

  addTask: async (taskData) => {
    const formattedTask = {
      title: taskData.title,
      description: taskData.description || "",
      assignedMemberId: taskData.assignedMemberId || "",
      assignedTo: taskData.assignedTo || "Shreyas",
      assignedAvatar: taskData.assignedAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      createdBy: taskData.createdBy || "Shreyas",
      priority: taskData.priority || "Medium",
      category: taskData.category || "Client Work",
      dueDate: taskData.dueDate || new Date().toISOString().split("T")[0],
      dueTime: taskData.dueTime || "17:00",
      estimatedDuration: taskData.estimatedDuration || "1h",
      status: taskData.status || "Pending",
      createdDate: new Date().toISOString(),
      completedDate: null,
      notes: taskData.notes || "",
      attachments: taskData.attachments || [],
      comments: taskData.comments || [],
      repeatSchedule: taskData.repeatSchedule || "None",
      isUserCreated: true,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, "tasks"), formattedTask);
    return { id: docRef.id, ...formattedTask };
  },

  updateTask: async (id, updatedData) => {
    const docRef = doc(db, "tasks", id);
    await updateDoc(docRef, {
      ...updatedData,
      updatedAt: new Date().toISOString()
    });
    return { id, ...updatedData };
  },

  deleteTask: async (id) => {
    const docRef = doc(db, "tasks", id);
    await deleteDoc(docRef);
    return id;
  },

  // --- Real-time Ideas Service ---
  subscribeToIdeas: (onUpdate) => {
    const q = query(collection(db, "ideas"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const ideas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      onUpdate(ideas);
    }, (error) => {
      console.error("Ideas snapshot error:", error);
    });
  },

  addIdea: async (ideaData) => {
    const formattedIdea = {
      title: ideaData.title,
      description: ideaData.description || "",
      problemStatement: ideaData.problemStatement || "",
      proposedSolution: ideaData.proposedSolution || "",
      owner: ideaData.owner || "Shreyas",
      ownerAvatar: ideaData.ownerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      budget: Number(ideaData.budget) || 0,
      expectedRevenue: Number(ideaData.expectedRevenue) || 0,
      timeline: ideaData.timeline || "4 Weeks",
      reminderDate: ideaData.reminderDate || "",
      priority: ideaData.priority || "Medium",
      category: ideaData.category || "Product Innovation",
      stage: ideaData.stage || "Idea Created",
      isArchived: false,
      attachments: ideaData.attachments || [],
      comments: ideaData.comments || [],
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, "ideas"), formattedIdea);
    return { id: docRef.id, ...formattedIdea };
  },

  updateIdea: async (id, updatedData) => {
    const docRef = doc(db, "ideas", id);
    await updateDoc(docRef, { ...updatedData, updatedAt: new Date().toISOString() });
    return { id, ...updatedData };
  },

  deleteIdea: async (id) => {
    const docRef = doc(db, "ideas", id);
    await deleteDoc(docRef);
    return id;
  },

  // --- Real-time Notifications Service ---
  subscribeToNotifications: (onUpdate) => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      onUpdate(notifs);
    }, (error) => {
      console.error("Notifications snapshot error:", error);
    });
  },

  addNotification: async (notifData) => {
    const formatted = {
      type: notifData.type || "info",
      title: notifData.title || "",
      message: notifData.message || "",
      userId: notifData.userId || "",
      read: false,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, "notifications"), formatted);
    return { id: docRef.id, ...formatted };
  },

  markNotificationAsRead: async (id) => {
    const docRef = doc(db, "notifications", id);
    await updateDoc(docRef, { read: true });
    return id;
  },

  deleteNotification: async (id) => {
    const docRef = doc(db, "notifications", id);
    await deleteDoc(docRef);
    return id;
  }
};
