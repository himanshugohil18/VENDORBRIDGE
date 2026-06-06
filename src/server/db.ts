import { PrismaClient } from "@prisma/client";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";

// Initialize Prisma Client lazily to prevent crashing on startup when DATABASE_URL is not set or invalid.
let prisma: PrismaClient | null = null;
let useDatabaseFallback = true;

// Firebase Admin Firestore SDK integration
let firebaseAdminApp: any = null;
let firestoreDb: any = null;

try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const rawConfig = fs.readFileSync(configPath, "utf8");
    const firebaseConfig = JSON.parse(rawConfig);
    if (!getApps().length) {
      firebaseAdminApp = initializeApp({
        projectId: firebaseConfig.projectId,
      });
    } else {
      firebaseAdminApp = getApps()[0];
    }
    const dbId = firebaseConfig.firestoreDatabaseId;
    firestoreDb = dbId ? getFirestore(firebaseAdminApp, dbId) : getFirestore(firebaseAdminApp);
    // Allow saving/retrieving documents with optional fields safely
    firestoreDb.settings({ ignoreUndefinedProperties: true });
    console.log("[Firebase Admin] Firestore database successfully connected with dbId:", dbId || "(default)");
  } else {
    console.warn("[Firebase Admin Warning] firebase-applet-config.json not found. Running database fallback layer.");
  }
} catch (error) {
  console.error("[Firebase Admin Error] Failed to initialize Firestore SDK connection:", error);
}

const FALLBACK_DB_PATH = path.join(process.cwd(), "database-fallback.json");

// Default database structure for fallback mode
interface FallbackData {
  users: any[];
  vendors: any[];
  rfqs: any[];
  quotations: any[];
  approvals: any[];
  purchaseOrders: any[];
  invoices: any[];
  activities: any[];
  notifications: any[];
}

let fallbackData: FallbackData = {
  users: [],
  vendors: [],
  rfqs: [],
  quotations: [],
  approvals: [],
  purchaseOrders: [],
  invoices: [],
  activities: [],
  notifications: []
};

// Seed fallback data if JSON file doesn't exist
function initFallbackFile() {
  try {
    if (fs.existsSync(FALLBACK_DB_PATH)) {
      const raw = fs.readFileSync(FALLBACK_DB_PATH, "utf-8");
      fallbackData = JSON.parse(raw);
    } else {
      saveFallbackData();
    }
  } catch (error) {
    console.error("[Fallback DB] Error loading fallback database JSON. Initializing empty structures.", error);
  }
}

function saveFallbackData() {
  try {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(fallbackData, null, 2), "utf-8");
  } catch (error) {
    console.error("[Fallback DB] Error writing database JSON to server disk.", error);
  }
}

export function getPrismaClient(): PrismaClient | null {
  if (!prisma && process.env.DATABASE_URL) {
    try {
      console.log("[DB] Conforming DATABASE_URL is set. Spawning active PrismaClient...");
      prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      });
      useDatabaseFallback = false;
    } catch (e) {
      console.error("[DB] Prisma spawning failed. Falling back to in-memory/Firestore layer.", e);
      prisma = null;
      useDatabaseFallback = true;
    }
  }
  return prisma;
}

// Check database connection and verify table existence
export async function testDatabaseConnection() {
  const client = getPrismaClient();
  if (client) {
    try {
      await client.$connect();
      console.log("[DB Success] PostgreSQL successfully connected via Prisma Client!");
      useDatabaseFallback = false;
      return true;
    } catch (error) {
      console.warn("[DB Warnings] Failed to connect to PostgreSQL database. Checking Google Firestore...");
    }
  }
  
  useDatabaseFallback = true;
  if (firestoreDb) {
    console.log("[DB Success] Cloud Firestore connected active for durable database storage.");
    return true;
  }
  
  console.log("[DB Info] Running in High-Fidelity local JSON File-Fallback Mode.");
  initFallbackFile();
  return false;
}

// Unified dbService routing. Prefers Prisma -> Firestore -> Local File Fallback.
export const dbService = {
  isFallback: () => useDatabaseFallback,
  isFirestoreEnabled: () => !!firestoreDb,

  // Users Operation
  getUsers: async () => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.user.findMany({ where: { deletedAt: null } });
      } catch (error) {
        console.error("Prisma getUsers failed", error);
      }
    }
    if (firestoreDb) {
      try {
        const snap = await firestoreDb.collection("users").get();
        const list = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        return list.filter((u: any) => !u.deletedAt);
      } catch (error) {
        console.error("Firestore getUsers failed", error);
      }
    }
    return fallbackData.users;
  },

  getUserByEmail: async (email: string) => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.user.findUnique({ where: { email } });
      } catch (error) {
        console.error("Prisma getUserByEmail failed", error);
      }
    }
    if (firestoreDb) {
      try {
        const snap = await firestoreDb.collection("users").where("email", "==", email).get();
        if (!snap.empty) {
          const doc = snap.docs[0];
          return { id: doc.id, ...doc.data() };
        }
      } catch (error) {
        console.error("Firestore getUserByEmail failed", error);
      }
    }
    return fallbackData.users.find(u => u.email === email);
  },

  createUser: async (user: any) => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.user.create({ data: user });
      } catch (error) {
        console.error("Prisma createUser failed", error);
      }
    }
    const newUser = { id: user.id || `user-${Date.now()}`, createdAt: new Date().toISOString(), ...user };
    if (firestoreDb) {
      try {
        await firestoreDb.collection("users").doc(newUser.id).set(newUser);
        return newUser;
      } catch (error) {
        console.error("Firestore createUser failed", error);
      }
    }
    fallbackData.users.push(newUser);
    saveFallbackData();
    return newUser;
  },

  // Vendors CRUD
  getVendors: async () => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.vendor.findMany({ where: { deletedAt: null } });
      } catch (error) {
        console.error("Prisma getVendors failed", error);
      }
    }
    if (firestoreDb) {
      try {
        const snap = await firestoreDb.collection("vendors").get();
        const list = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        return list.filter((v: any) => !v.deletedAt);
      } catch (error) {
        console.error("Firestore getVendors failed", error);
      }
    }
    return fallbackData.vendors;
  },

  createVendor: async (vendor: any) => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.vendor.create({ data: vendor });
      } catch (error) {
        console.error("Prisma createVendor failed", error);
      }
    }
    const newVendor = { id: vendor.id || `vendor-${Date.now()}`, rating: 5.0, completedOrdersCount: 0, averageDeliveryDays: 7, createdAt: new Date().toISOString(), ...vendor };
    if (firestoreDb) {
      try {
        await firestoreDb.collection("vendors").doc(newVendor.id).set(newVendor);
        return newVendor;
      } catch (error) {
        console.error("Firestore createVendor failed", error);
      }
    }
    fallbackData.vendors.push(newVendor);
    saveFallbackData();
    return newVendor;
  },

  updateVendor: async (id: string, data: any) => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.vendor.update({ where: { id }, data });
      } catch (error) {
        console.error("Prisma updateVendor failed", error);
      }
    }
    if (firestoreDb) {
      try {
        await firestoreDb.collection("vendors").doc(id).set(data, { merge: true });
        const snap = await firestoreDb.collection("vendors").doc(id).get();
        return { id, ...snap.data() };
      } catch (error) {
        console.error("Firestore updateVendor failed", error);
      }
    }
    fallbackData.vendors = fallbackData.vendors.map(v => v.id === id ? { ...v, ...data } : v);
    saveFallbackData();
    return fallbackData.vendors.find(v => v.id === id);
  },

  deleteVendor: async (id: string) => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.vendor.update({ where: { id }, data: { deletedAt: new Date() } });
      } catch (error) {
        console.error("Prisma deleteVendor failed", error);
      }
    }
    if (firestoreDb) {
      try {
        await firestoreDb.collection("vendors").doc(id).set({ deletedAt: new Date().toISOString() }, { merge: true });
        return true;
      } catch (error) {
        console.error("Firestore deleteVendor failed", error);
      }
    }
    fallbackData.vendors = fallbackData.vendors.filter(v => v.id !== id);
    saveFallbackData();
    return true;
  },

  // RFQs CRUD
  getRfqs: async () => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.rfq.findMany({
          where: { deletedAt: null },
          include: { items: true }
        });
      } catch (error) {
        console.error("Prisma getRfqs failed", error);
      }
    }
    if (firestoreDb) {
      try {
        const snap = await firestoreDb.collection("rfqs").get();
        const list = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        return list.filter((r: any) => !r.deletedAt);
      } catch (error) {
        console.error("Firestore getRfqs failed", error);
      }
    }
    return fallbackData.rfqs;
  },

  createRfq: async (rfq: any) => {
    const { items, ...rfqData } = rfq;
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.rfq.create({
          data: {
            ...rfqData,
            items: { create: items }
          },
          include: { items: true }
        });
      } catch (error) {
        console.error("Prisma createRfq failed", error);
      }
    }
    const newRfqId = rfq.id || `rfq-${Date.now()}`;
    const compiledItems = (items || []).map((it: any) => ({ id: it.id || `rfq-item-${Math.random()}`, rfqId: newRfqId, ...it }));
    const newRfq = {
      id: newRfqId,
      ...rfqData,
      status: rfqData.status || "DRAFT",
      createdAt: new Date().toISOString(),
      items: compiledItems
    };
    if (firestoreDb) {
      try {
        await firestoreDb.collection("rfqs").doc(newRfqId).set(newRfq);
        return newRfq;
      } catch (error) {
        console.error("Firestore createRfq failed", error);
      }
    }
    fallbackData.rfqs.push(newRfq);
    saveFallbackData();
    return newRfq;
  },

  updateRfqStatus: async (id: string, status: string) => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.rfq.update({ where: { id }, data: { status: status as any } });
      } catch (error) {
        console.error("Prisma updateRfqStatus failed", error);
      }
    }
    if (firestoreDb) {
      try {
        await firestoreDb.collection("rfqs").doc(id).set({ status }, { merge: true });
        return true;
      } catch (error) {
        console.error("Firestore updateRfqStatus failed", error);
      }
    }
    fallbackData.rfqs = fallbackData.rfqs.map(r => r.id === id ? { ...r, status } : r);
    saveFallbackData();
    return true;
  },

  deleteRfq: async (id: string) => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.rfq.update({ where: { id }, data: { deletedAt: new Date() } });
      } catch (error) {
        console.error("Prisma deleteRfq failed", error);
      }
    }
    if (firestoreDb) {
      try {
        await firestoreDb.collection("rfqs").doc(id).set({ deletedAt: new Date().toISOString() }, { merge: true });
        return true;
      } catch (error) {
        console.error("Firestore deleteRfq failed", error);
      }
    }
    fallbackData.rfqs = fallbackData.rfqs.filter(r => r.id !== id);
    saveFallbackData();
    return true;
  },

  // Quotations Bids CRUD
  getQuotations: async () => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.quotation.findMany({ include: { items: true } });
      } catch (error) {
        console.error("Prisma getQuotations failed", error);
      }
    }
    if (firestoreDb) {
      try {
        const snap = await firestoreDb.collection("quotations").get();
        return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error("Firestore getQuotations failed", error);
      }
    }
    return fallbackData.quotations;
  },

  createQuotation: async (quote: any) => {
    const { items, ...quoteData } = quote;
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.quotation.create({
          data: {
            ...quoteData,
            items: { create: items }
          },
          include: { items: true }
        });
      } catch (error) {
        console.error("Prisma createQuotation failed", error);
      }
    }
    const newQuoteId = quote.id || `quote-${Date.now()}`;
    const compiledItems = (items || []).map((it: any) => ({ id: it.id || `quote-item-${Math.random()}`, quotationId: newQuoteId, ...it }));
    const newQuote = {
      id: newQuoteId,
      ...quoteData,
      createdAt: new Date().toISOString(),
      items: compiledItems
    };
    if (firestoreDb) {
      try {
        await firestoreDb.collection("quotations").doc(newQuoteId).set(newQuote);
        return newQuote;
      } catch (error) {
        console.error("Firestore createQuotation failed", error);
      }
    }
    fallbackData.quotations.push(newQuote);
    saveFallbackData();
    return newQuote;
  },

  updateQuotationStatus: async (id: string, status: string) => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.quotation.update({ where: { id }, data: { status } });
      } catch (error) {
        console.error("Prisma updateQuotationStatus failed", error);
      }
    }
    if (firestoreDb) {
      try {
        await firestoreDb.collection("quotations").doc(id).set({ status }, { merge: true });
        return true;
      } catch (error) {
        console.error("Firestore updateQuotationStatus failed", error);
      }
    }
    fallbackData.quotations = fallbackData.quotations.map(q => q.id === id ? { ...q, status } : q);
    saveFallbackData();
    return true;
  },

  // Approvals CRUD
  getApprovals: async () => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.approval.findMany({ include: { timeline: true } });
      } catch (error) {
        console.error("Prisma getApprovals failed", error);
      }
    }
    if (firestoreDb) {
      try {
        const snap = await firestoreDb.collection("approvals").get();
        return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error("Firestore getApprovals failed", error);
      }
    }
    return fallbackData.approvals;
  },

  createApproval: async (approval: any) => {
    const { timeline, ...approvalData } = approval;
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.approval.create({
          data: {
            ...approvalData,
            timeline: { create: timeline }
          },
          include: { timeline: true }
        });
      } catch (error) {
        console.error("Prisma createApproval failed", error);
      }
    }
    const newApprId = approval.id || `appr-${Date.now()}`;
    const compiledTimeline = (timeline || []).map((tl: any) => ({ id: tl.id || `appr-timeline-${Math.random()}`, approvalId: newApprId, ...tl }));
    const newApproval = {
      id: newApprId,
      ...approvalData,
      timeline: compiledTimeline,
      createdAt: new Date().toISOString()
    };
    if (firestoreDb) {
      try {
        await firestoreDb.collection("approvals").doc(newApprId).set(newApproval);
        return newApproval;
      } catch (error) {
        console.error("Firestore createApproval failed", error);
      }
    }
    fallbackData.approvals.push(newApproval);
    saveFallbackData();
    return newApproval;
  },

  updateApproval: async (id: string, data: any) => {
    const { timeline, ...approvalFields } = data;
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.approval.update({
          where: { id },
          data: {
            ...approvalFields,
            ...(timeline ? {
              timeline: {
                create: timeline
              }
            } : {})
          },
          include: { timeline: true }
        });
      } catch (error) {
        console.error("Prisma updateApproval failed", error);
      }
    }
    if (firestoreDb) {
      try {
        const docRef = firestoreDb.collection("approvals").doc(id);
        const snap = await docRef.get();
        let appendedTimeline = timeline || [];
        if (snap.exists) {
          const currentData = snap.data() || {};
          const existingTimeline = currentData.timeline || [];
          appendedTimeline = [...existingTimeline, ...(timeline || [])];
        }
        const updateData = {
          ...approvalFields,
          timeline: appendedTimeline,
          updatedAt: new Date().toISOString()
        };
        await docRef.set(updateData, { merge: true });
        const finalSnap = await docRef.get();
        return { id, ...finalSnap.data() };
      } catch (error) {
        console.error("Firestore updateApproval failed", error);
      }
    }
    fallbackData.approvals = fallbackData.approvals.map(a => {
      if (a.id === id) {
        const appendedTimeline = timeline ? [...a.timeline, ...timeline] : a.timeline;
        return { ...a, ...approvalFields, timeline: appendedTimeline, updatedAt: new Date().toISOString() };
      }
      return a;
    });
    saveFallbackData();
    return fallbackData.approvals.find(a => a.id === id);
  },

  // Purchase Orders CRUD
  getPurchaseOrders: async () => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.purchaseOrder.findMany({ include: { items: true } });
      } catch (error) {
        console.error("Prisma getPurchaseOrders failed", error);
      }
    }
    if (firestoreDb) {
      try {
        const snap = await firestoreDb.collection("purchaseOrders").get();
        return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error("Firestore getPurchaseOrders failed", error);
      }
    }
    return fallbackData.purchaseOrders;
  },

  createPurchaseOrder: async (po: any) => {
    const { items, ...poData } = po;
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.purchaseOrder.create({
          data: {
            ...poData,
            items: { create: items }
          },
          include: { items: true }
        });
      } catch (error) {
        console.error("Prisma createPurchaseOrder failed", error);
      }
    }
    const newPoId = po.id || `po-${Date.now()}`;
    const compiledItems = (items || []).map((it: any) => ({ id: it.id || `po-item-${Math.random()}`, purchaseOrderId: newPoId, ...it }));
    const newPo = {
      id: newPoId,
      ...poData,
      createdAt: new Date().toISOString(),
      items: compiledItems
    };
    if (firestoreDb) {
      try {
        await firestoreDb.collection("purchaseOrders").doc(newPoId).set(newPo);
        return newPo;
      } catch (error) {
        console.error("Firestore createPurchaseOrder failed", error);
      }
    }
    fallbackData.purchaseOrders.push(newPo);
    saveFallbackData();
    return newPo;
  },

  // Invoices CRUD
  getInvoices: async () => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.invoice.findMany({ include: { items: true } });
      } catch (error) {
        console.error("Prisma getInvoices failed", error);
      }
    }
    if (firestoreDb) {
      try {
        const snap = await firestoreDb.collection("invoices").get();
        return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error("Firestore getInvoices failed", error);
      }
    }
    return fallbackData.invoices;
  },

  createInvoice: async (invoice: any) => {
    const { items, ...invoiceData } = invoice;
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.invoice.create({
          data: {
            ...invoiceData,
            status: invoiceData.status || "UNPAID",
            items: { create: items }
          },
          include: { items: true }
        });
      } catch (error) {
        console.error("Prisma createInvoice failed", error);
      }
    }
    const newInvId = invoice.id || `inv-${Date.now()}`;
    const compiledItems = (items || []).map((it: any) => ({ id: it.id || `invoice-item-${Math.random()}`, invoiceId: newInvId, ...it }));
    const newInvoice = {
      id: newInvId,
      ...invoiceData,
      createdAt: new Date().toISOString(),
      items: compiledItems
    };
    if (firestoreDb) {
      try {
        await firestoreDb.collection("invoices").doc(newInvId).set(newInvoice);
        return newInvoice;
      } catch (error) {
        console.error("Firestore createInvoice failed", error);
      }
    }
    fallbackData.invoices.push(newInvoice);
    saveFallbackData();
    return newInvoice;
  },

  updateInvoiceStatus: async (id: string, status: string) => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.invoice.update({ where: { id }, data: { status: status as any } });
      } catch (error) {
        console.error("Prisma updateInvoiceStatus failed", error);
      }
    }
    if (firestoreDb) {
      try {
        await firestoreDb.collection("invoices").doc(id).set({ status }, { merge: true });
        return true;
      } catch (error) {
        console.error("Firestore updateInvoiceStatus failed", error);
      }
    }
    fallbackData.invoices = fallbackData.invoices.map(i => i.id === id ? { ...i, status } : i);
    saveFallbackData();
    return true;
  },

  // Audit activities logs CRUD
  getActivities: async () => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.activityLog.findMany({ orderBy: { date: "desc" } });
      } catch (error) {
        console.error("Prisma getActivities failed", error);
      }
    }
    if (firestoreDb) {
      try {
        const snap = await firestoreDb.collection("activities").orderBy("date", "desc").get();
        return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error("Firestore getActivities failed, trying unsorted", error);
        try {
          const snap = await firestoreDb.collection("activities").get();
          const list = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
          return list.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } catch (e2) {
          console.error("Firestore unsorted getActivities failed", e2);
        }
      }
    }
    return fallbackData.activities;
  },

  createActivity: async (act: any) => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.activityLog.create({ data: act });
      } catch (error) {
        console.error("Prisma createActivity failed", error);
      }
    }
    const newAct = { id: act.id || `act-${Date.now()}`, date: act.date || new Date().toISOString(), ...act };
    if (firestoreDb) {
      try {
        await firestoreDb.collection("activities").doc(newAct.id).set(newAct);
        return newAct;
      } catch (error) {
        console.error("Firestore createActivity failed", error);
      }
    }
    fallbackData.activities.unshift(newAct); // standard desc sort fallback
    saveFallbackData();
    return newAct;
  },

  // Notifications CRUD
  getNotifications: async () => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.notification.findMany({ orderBy: { createdAt: "desc" } });
      } catch (error) {
        console.error("Prisma getNotifications failed", error);
      }
    }
    if (firestoreDb) {
      try {
        const snap = await firestoreDb.collection("notifications").orderBy("createdAt", "desc").get();
        return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error("Firestore getNotifications failed, trying unsorted", error);
        try {
          const snap = await firestoreDb.collection("notifications").get();
          const list = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
          return list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } catch (e2) {
          console.error("Firestore unsorted getNotifications failed", e2);
        }
      }
    }
    return fallbackData.notifications;
  },

  createNotification: async (notif: any) => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.notification.create({ data: notif });
      } catch (error) {
        console.error("Prisma createNotification failed", error);
      }
    }
    const newNotif = { id: `notif-${Date.now()}`, read: false, createdAt: new Date().toISOString(), ...notif };
    if (firestoreDb) {
      try {
        await firestoreDb.collection("notifications").doc(newNotif.id).set(newNotif);
        return newNotif;
      } catch (error) {
        console.error("Firestore createNotification failed", error);
      }
    }
    fallbackData.notifications.unshift(newNotif);
    saveFallbackData();
    return newNotif;
  },

  markNotificationRead: async (id: string) => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.notification.update({ where: { id }, data: { read: true } });
      } catch (error) {
        console.error("Prisma markNotificationRead failed", error);
      }
    }
    if (firestoreDb) {
      try {
        await firestoreDb.collection("notifications").doc(id).set({ read: true }, { merge: true });
        return true;
      } catch (error) {
        console.error("Firestore markNotificationRead failed", error);
      }
    }
    fallbackData.notifications = fallbackData.notifications.map(n => n.id === id ? { ...n, read: true } : n);
    saveFallbackData();
    return true;
  },

  clearNotifications: async () => {
    if (!useDatabaseFallback && prisma) {
      try {
        return await prisma.notification.updateMany({ data: { read: true } });
      } catch (error) {
        console.error("Prisma clearNotifications failed", error);
      }
    }
    if (firestoreDb) {
      try {
        const snap = await firestoreDb.collection("notifications").get();
        const batch = firestoreDb.batch();
        snap.docs.forEach((doc: any) => {
          batch.set(doc.ref, { read: true }, { merge: true });
        });
        await batch.commit();
        return true;
      } catch (error) {
        console.error("Firestore clearNotifications failed", error);
      }
    }
    fallbackData.notifications = fallbackData.notifications.map(n => ({ ...n, read: true }));
    saveFallbackData();
    return true;
  },

  // Automatic state synchronization migration function
  syncLocalStorageData: async (payload: any) => {
    console.log("[Data Sync Init] Safely initializing database with client payload...");
    const { vendors, rfqs, quotations, approvals, purchaseOrders, invoices, activities, notifications } = payload;

    // Helper to merge data while preventing duplication
    const importItems = async (sourceItems: any[], getExistingKeys: () => Promise<string[]>, insertFn: (item: any) => Promise<any>) => {
      if (!Array.isArray(sourceItems) || sourceItems.length === 0) return;
      const existingKeys = await getExistingKeys();
      for (const item of sourceItems) {
        if (!existingKeys.includes(item.id)) {
          try {
            await insertFn(item);
          } catch (err) {
            console.error(`Failed to seed record with id: ${item.id}`, err);
          }
        }
      }
    };

    // Parallel seed runs
    try {
      if (vendors) {
        await importItems(vendors, async () => {
          const list = await dbService.getVendors();
          return list.map(v => v.id);
        }, async (item) => {
          await dbService.createVendor({
            id: item.id,
            name: item.name || "",
            companyName: item.companyName,
            gstNumber: item.gstNumber || "",
            email: item.email,
            phone: item.phone || "",
            address: item.address || "",
            category: item.category || "",
            rating: Number(item.rating) || 5.0,
            status: item.status || "Active",
            completedOrdersCount: Number(item.completedOrdersCount) || 0,
            averageDeliveryDays: Number(item.averageDeliveryDays) || 7,
          });
        });
      }

      if (rfqs) {
        await importItems(rfqs, async () => {
          const list = await dbService.getRfqs();
          return list.map(r => r.id);
        }, async (item) => {
          const sanitizedItems = (item.items || []).map((it: any) => ({
            productName: it.productName,
            quantity: Number(it.quantity) || 1,
            unit: it.unit || "Units",
            description: it.description || "",
            expectedPrice: Number(it.expectedPrice) || null
          }));
          await dbService.createRfq({
            id: item.id,
            title: item.title,
            description: item.description || "",
            category: item.category || "",
            deadline: item.deadline ? new Date(item.deadline) : new Date(Date.now() + 7 * 24 * 3600 * 1000),
            status: (item.status?.toUpperCase() || "DRAFT") as any,
            items: sanitizedItems
          });
        });
      }

      if (quotations) {
        await importItems(quotations, async () => {
          const list = await dbService.getQuotations();
          return list.map(q => q.id);
        }, async (item) => {
          const sanitizedItems = (item.items || []).map((it: any) => ({
            rfqItemId: it.rfqItemId,
            productName: it.productName,
            quantity: Number(it.quantity) || 1,
            unitPrice: Number(it.unitPrice) || 0,
            totalPrice: Number(it.totalPrice) || 0
          }));
          await dbService.createQuotation({
            id: item.id,
            rfqId: item.rfqId,
            vendorId: item.vendorId,
            vendorName: item.vendorName,
            deliveryTimeline: Number(item.deliveryTimeline) || 7,
            notes: item.notes || "",
            status: item.status || "Submitted",
            subtotal: Number(item.subtotal) || 0,
            tax: Number(item.tax) || 0,
            grandTotal: Number(item.grandTotal) || 0,
            items: sanitizedItems
          });
        });
      }

      if (approvals) {
        await importItems(approvals, async () => {
          const list = await dbService.getApprovals();
          return list.map(a => a.id);
        }, async (item) => {
          const sanitizedTimeline = (item.timeline || []).map((tl: any) => ({
            status: tl.status,
            remark: tl.remark || "",
            user: tl.user || "",
            date: tl.date ? new Date(tl.date) : new Date()
          }));
          const approvalData: any = {
            id: item.id,
            targetType: item.targetType || "QUOTATION",
            title: item.title,
            requesterName: item.requesterName || "",
            status: (item.status?.toUpperCase().replace(/\s+/g, "_") || "PENDING") as any,
            managerRemarks: item.managerRemarks || null,
            updatedBy: item.updatedBy || null,
            timeline: sanitizedTimeline
          };
          if (item.targetType === "RFQ") {
            approvalData.targetRfqId = item.targetId;
          } else {
            approvalData.targetQuoteId = item.targetId;
          }
          await dbService.createApproval(approvalData);
        });
      }

      if (purchaseOrders) {
        await importItems(purchaseOrders, async () => {
          const list = await dbService.getPurchaseOrders();
          return list.map(po => po.id);
        }, async (item) => {
          const sanitizedItems = (item.items || []).map((it: any) => ({
            productName: it.productName,
            quantity: Number(it.quantity) || 1,
            unit: it.unit || "Units",
            unitPrice: Number(it.unitPrice) || 0,
            total: Number(it.total) || 0
          }));
          await dbService.createPurchaseOrder({
            id: item.id,
            poNumber: item.poNumber,
            rfqId: item.rfqId || "",
            rfqTitle: item.rfqTitle || "",
            quotationId: item.quotationId || null,
            vendorId: item.vendorId,
            vendorName: item.vendorName,
            subTotal: Number(item.subTotal) || 0,
            tax: Number(item.tax) || 0,
            totalAmount: Number(item.totalAmount) || 0,
            status: item.status || "Approved",
            items: sanitizedItems
          });
        });
      }

      if (invoices) {
        await importItems(invoices, async () => {
          const list = await dbService.getInvoices();
          return list.map(inv => inv.id);
        }, async (item) => {
          const sanitizedItems = (item.items || []).map((it: any) => ({
            productName: it.productName,
            quantity: Number(it.quantity) || 1,
            unit: it.unit || "Units",
            price: Number(it.price) || Number(it.unitPrice) || 0,
            total: Number(it.total) || 0
          }));
          await dbService.createInvoice({
            id: item.id,
            invoiceNumber: item.invoiceNumber,
            poNumber: item.poNumber,
            rfqId: item.rfqId || "",
            rfqTitle: item.rfqTitle || "",
            quotationId: item.quotationId || null,
            vendorId: item.vendorId,
            vendorName: item.vendorName,
            subtotal: Number(item.subtotal) || 0,
            tax: Number(item.tax) || 0,
            grandTotal: Number(item.grandTotal) || 0,
            status: (item.status?.toUpperCase() || "UNPAID") as any,
            dueDate: item.dueDate ? new Date(item.dueDate) : new Date(Date.now() + 30 * 24 * 3600 * 1000),
            items: sanitizedItems
          });
        });
      }

      if (activities) {
        await importItems(activities, async () => {
          const list = await dbService.getActivities();
          return list.map(a => a.id);
        }, async (item) => {
          await dbService.createActivity({
            id: item.id,
            type: item.type || "AUTH",
            description: item.description,
            user: item.user || "",
            role: item.role || "",
            date: item.date ? new Date(item.date) : new Date()
          });
        });
      }

      if (notifications) {
        await importItems(notifications, async () => {
          const list = await dbService.getNotifications();
          return list.map(n => n.id);
        }, async (item) => {
          await dbService.createNotification({
            id: item.id,
            title: item.title,
            message: item.message,
            type: item.type || "success",
            read: item.read || false,
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
          });
        });
      }

      console.log("[Data Sync Done] Successfully synthesized custom client states into persistent cloud database.");
      return { success: true, count: 1 };
    } catch (error) {
      console.error("[Data Sync Error] Error synchronized localStorage items with persistent database", error);
      return { success: false, error: String(error) };
    }
  }
};
