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
  orderBy 
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

// Unified Database Service Layer connecting strictly to live Firestore
export const dbService = {
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
  }
};
