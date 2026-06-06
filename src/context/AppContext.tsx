/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, UserProfile, Vendor, RFQ, Quotation, 
  ApprovalWorkflow, PurchaseOrder, Invoice, AuditActivity, 
  SystemNotification, RFQItem, QuotationItem 
} from '../types';
import { 
  INITIAL_USER_PROFILES, INITIAL_VENDORS, INITIAL_RFQS, 
  INITIAL_QUOTATIONS, INITIAL_APPROVALS, INITIAL_PURCHASE_ORDERS, 
  INITIAL_INVOICES, INITIAL_ACTIVITIES, INITIAL_NOTIFICATIONS 
} from '../data';

interface AppContextType {
  // Theme State
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Auth State
  currentUser: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;
  login: (email: string, role: UserRole) => boolean;
  register: (profile: Omit<UserProfile, 'id'>) => boolean;
  logout: () => void;
  fastSwitchRole: (role: UserRole) => void;

  // UI States
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // ERP Entities State
  vendors: Vendor[];
  rfqs: RFQ[];
  quotations: Quotation[];
  approvals: ApprovalWorkflow[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  activities: AuditActivity[];
  notifications: SystemNotification[];

  // Actions
  // Vendor Actions
  addVendor: (vendor: Omit<Vendor, 'id' | 'rating' | 'completedOrdersCount' | 'averageDeliveryDays'>) => void;
  updateVendor: (vendor: Vendor) => void;
  deleteVendor: (id: string) => void;

  // RFQ Actions
  createRFQ: (rfqData: Omit<RFQ, 'id' | 'createdAt' | 'status'>) => RFQ;
  publishRFQ: (id: string) => void;
  deleteRFQ: (id: string) => void;

  // Quotation/Bid Actions
  submitQuotation: (rfqId: string, vendorId: string, deliveryTimeline: number, notes: string, itemPrices: Record<string, number>) => Quotation;
  acceptQuotation: (quotationId: string) => void;

  // Approval Workflow Actions
  triggerApprovalRequest: (targetType: 'RFQ' | 'QUOTATION', targetId: string, title: string, requester: string) => void;
  processApproval: (approvalId: string, status: 'Approved' | 'Rejected', remarks: string, managerName: string) => void;
  
  // Invoice Actions
  updateInvoiceStatus: (invoiceId: string, status: 'Paid' | 'Unpaid' | 'Overdue') => void;

  // Notification Actions
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Demo Mode Actions
  isDemoModeActive: boolean;
  triggerJudgeDemoMode: () => void;
  resetToBaseline: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to determine if server APIs are currently responsive
const checkServerHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch("/api/health");
    return res.ok;
  } catch {
    return false;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- 1. Theme Configuration ---
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('vendorbridge-theme');
    return (saved as 'dark' | 'light') || 'dark'; // Dark is default
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('vendorbridge-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // --- Demo Mode State ---
  const [isDemoModeActive, setIsDemoModeActive] = useState<boolean>(() => {
    return localStorage.getItem('vb-demomode-active') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('vb-demomode-active', isDemoModeActive ? 'true' : 'false');
  }, [isDemoModeActive]);

  // --- 2. Auth Configuration ---
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('vendorbridge-user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_USER_PROFILES[1]; // Default to Procurement Jenkins for first view
  });

  const updateProfile = (profile: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...profile };
      localStorage.setItem('vendorbridge-user', JSON.stringify(updated));
      return updated;
    });
    // Log Activity
    addActivityLog('AUTH', `User profile fields modified for ${profile.firstName || currentUser.firstName}`, currentUser.firstName, currentUser.role);

    fetch('/api/auth/profile', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    }).catch(err => console.warn("Backend updateProfile failed", err));
  };

  const login = (email: string, role: UserRole): boolean => {
    const matchingProfile = INITIAL_USER_PROFILES.find(u => u.email === email && u.role === role) || {
      id: `user-${Date.now()}`,
      firstName: email.split('@')[0],
      lastName: 'User',
      email,
      role
    };
    setCurrentUser(matchingProfile);
    localStorage.setItem('vendorbridge-user', JSON.stringify(matchingProfile));
    
    // Log Activity
    addActivityLog('AUTH', `${matchingProfile.firstName} ${matchingProfile.lastName} logged in as ${role}.`, matchingProfile.firstName, role);

    // Call REST login API
    fetch('/api/auth/login', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role, rememberMe: true })
    }).catch(err => console.warn("Backend dynamic login trace inactive", err));

    return true;
  };

  const register = (profileData: Omit<UserProfile, 'id'>): boolean => {
    const newProfile: UserProfile = {
      ...profileData,
      id: `user-${Date.now()}`,
    };
    setCurrentUser(newProfile);
    localStorage.setItem('vendorbridge-user', JSON.stringify(newProfile));
    addActivityLog('AUTH', `New profile registered for ${profileData.firstName} (${profileData.role}).`, profileData.firstName, profileData.role);

    fetch('/api/auth/register', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: profileData.email,
        password: "password123",
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        role: profileData.role
      })
    }).catch(err => console.warn("Backend dynamic register trace inactive", err));

    return true;
  };

  const logout = () => {
    setCurrentUser(INITIAL_USER_PROFILES[1]); // fallback to Procurement
    localStorage.removeItem('vendorbridge-user');
  };

  const fastSwitchRole = (role: UserRole) => {
    let match = INITIAL_USER_PROFILES.find(u => u.role === role);
    if (!match) {
      match = {
        id: `user-temp-${role.toLowerCase()}`,
        firstName: role.charAt(0) + role.slice(1).toLowerCase(),
        lastName: 'Specialist',
        email: `${role.toLowerCase()}@vendorbridge.com`,
        role,
      };
    }
    setCurrentUser(match);
    localStorage.setItem('vendorbridge-user', JSON.stringify(match));
    addActivityLog('AUTH', `Switched workspace perspective to ${role}.`, match.firstName, role);
  };

  // --- 3. UI Flags ---
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // --- 4. ERP Entities state ---
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('vb-vendors');
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [rfqs, setRfqs] = useState<RFQ[]>(() => {
    const saved = localStorage.getItem('vb-rfqs');
    return saved ? JSON.parse(saved) : INITIAL_RFQS;
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem('vb-quotations');
    return saved ? JSON.parse(saved) : INITIAL_QUOTATIONS;
  });

  const [approvals, setApprovals] = useState<ApprovalWorkflow[]>(() => {
    const saved = localStorage.getItem('vb-approvals');
    return saved ? JSON.parse(saved) : INITIAL_APPROVALS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('vb-pos');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('vb-invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [activities, setActivities] = useState<AuditActivity[]>(() => {
    const saved = localStorage.getItem('vb-activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('vb-notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Background Database Sync and Hydration Loop on First Load
  useEffect(() => {
    const initializeFullStackSync = async () => {
      const active = await checkServerHealth();
      if (active) {
        console.log("[AppContext Sync] Database server detected. Synchronizing localized data arrays...");
        try {
          const payload = {
            vendors: JSON.parse(localStorage.getItem('vb-vendors') || '[]'),
            rfqs: JSON.parse(localStorage.getItem('vb-rfqs') || '[]'),
            quotations: JSON.parse(localStorage.getItem('vb-quotations') || '[]'),
            approvals: JSON.parse(localStorage.getItem('vb-approvals') || '[]'),
            purchaseOrders: JSON.parse(localStorage.getItem('vb-pos') || '[]'),
            invoices: JSON.parse(localStorage.getItem('vb-invoices') || '[]'),
            activities: JSON.parse(localStorage.getItem('vb-activities') || '[]'),
            notifications: JSON.parse(localStorage.getItem('vb-notifications') || '[]'),
          };

          // Post sync to PostgreSQL database fallback server
          await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          // Fetch fresh server-driven data queries
          const [resV, resR, resQ, resA, resP, resI, resAc, resN] = await Promise.all([
            fetch('/api/vendors').then(r => r.json()),
            fetch('/api/rfqs').then(r => r.json()),
            fetch('/api/quotations').then(r => r.json()),
            fetch('/api/approvals').then(r => r.json()),
            fetch('/api/purchase-orders').then(r => r.json()),
            fetch('/api/invoices').then(r => r.json()),
            fetch('/api/activities').then(r => r.json()),
            fetch('/api/notifications').then(r => r.json())
          ]);

          if (Array.isArray(resV) && resV.length > 0) setVendors(resV);
          if (Array.isArray(resR) && resR.length > 0) setRfqs(resR);
          if (Array.isArray(resQ) && resQ.length > 0) setQuotations(resQ);
          if (Array.isArray(resA) && resA.length > 0) setApprovals(resA);
          if (Array.isArray(resP) && resP.length > 0) setPurchaseOrders(resP);
          if (Array.isArray(resI) && resI.length > 0) setInvoices(resI);
          if (Array.isArray(resAc) && resAc.length > 0) setActivities(resAc);
          if (Array.isArray(resN) && resN.length > 0) setNotifications(resN);
        } catch (e) {
          console.warn("[AppContext Sync] Server fetching failed. Running on high-fidelity localized cache fallbacks.", e);
        }
      } else {
        console.log("[AppContext Sync] Database server is unreachable. Running on robust cached local storage.");
      }
    };

    initializeFullStackSync();
  }, []);

  // --- Real-time LocalStorage Synchronization backups ---
  useEffect(() => { localStorage.setItem('vb-vendors', JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem('vb-rfqs', JSON.stringify(rfqs)); }, [rfqs]);
  useEffect(() => { localStorage.setItem('vb-quotations', JSON.stringify(quotations)); }, [quotations]);
  useEffect(() => { localStorage.setItem('vb-approvals', JSON.stringify(approvals)); }, [approvals]);
  useEffect(() => { localStorage.setItem('vb-pos', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem('vb-invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('vb-activities', JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem('vb-notifications', JSON.stringify(notifications)); }, [notifications]);

  // Logging & Alerts helpers
  const addActivityLog = (
    type: AuditActivity['type'], 
    description: string, 
    user: string = currentUser.firstName, 
    role: UserRole = currentUser.role
  ) => {
    const newAct: AuditActivity = {
      id: `act-${Date.now()}`,
      type,
      description,
      user,
      role,
      date: new Date().toISOString(),
    };
    setActivities(prev => [newAct, ...prev]);

    fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAct)
    }).catch(err => console.warn("Activity synchronization inactive", err));
  };

  const spawnNotification = (title: string, message: string, type: SystemNotification['type']) => {
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);

    fetch('/api/notifications', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNotif)
    }).catch(err => console.warn("Notification sync inactive", err));
  };

  // --- Actions ---

  // Vendors CRUD
  const addVendor = (vData: Omit<Vendor, 'id' | 'rating' | 'completedOrdersCount' | 'averageDeliveryDays'>) => {
    const newVendor: Vendor = {
      ...vData,
      id: `vendor-${Date.now()}`,
      rating: 5.0, // starts flatly high
      completedOrdersCount: 0,
      averageDeliveryDays: 7,
    };
    setVendors(prev => [newVendor, ...prev]);
    addActivityLog('VENDOR', `Vendor registered: "${vData.companyName}" under representative ${vData.name}.`);
    spawnNotification('Vendor Registered', `"${vData.companyName}" successfully recorded in system.`, 'success');

    // Post in background to Express REST APIs
    fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVendor)
    }).catch(err => console.warn("Vendor POST request failed, falling back to cache", err));
  };

  const updateVendor = (updated: Vendor) => {
    setVendors(prev => prev.map(v => v.id === updated.id ? updated : v));
    addActivityLog('VENDOR', `Vendor specifications updated for "${updated.companyName}".`);

    fetch(`/api/vendors/${updated.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(err => console.warn("Vendor update failed", err));
  };

  const deleteVendor = (id: string) => {
    const target = vendors.find(v => v.id === id);
    setVendors(prev => prev.filter(v => v.id !== id));
    if (target) {
      addActivityLog('VENDOR', `Vendor deleted: "${target.companyName}".`);
      spawnNotification('Vendor Removed', `"${target.companyName}" deleted from register.`, 'warning');
    }

    fetch(`/api/vendors/${id}`, {
      method: 'DELETE'
    }).catch(err => console.warn("Vendor deletion failed", err));
  };

  // RFQs Creation & Publishing
  const createRFQ = (rfqData: Omit<RFQ, 'id' | 'createdAt' | 'status'>) => {
    const newRfq: RFQ = {
      ...rfqData,
      id: `rfq-00${rfqs.length + 1}`,
      createdAt: new Date().toISOString(),
      status: 'Draft',
    };
    setRfqs(prev => [newRfq, ...prev]);
    addActivityLog('RFQ', `Draft Request for Quotation created: "${rfqData.title}"`);
    spawnNotification('RFQ Draft Saved', `"${rfqData.title}" initialized as draft.`, 'info');

    fetch('/api/rfqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRfq)
    }).catch(err => console.warn("RFQ creation failed to publish to db", err));

    return newRfq;
  };

  const publishRFQ = (id: string) => {
    setRfqs(prev => prev.map(rfq => {
      if (rfq.id === id) {
        addActivityLog('RFQ', `RFQ published to public market: "${rfq.title}"`);
        spawnNotification('RFQ Opened for Bids', `"${rfq.title}" is now open for responses.`, 'success');
        return { ...rfq, status: 'Open' as const };
      }
      return rfq;
    }));

    fetch(`/api/rfqs/${id}/publish`, {
      method: 'POST'
    }).catch(err => console.warn("RFQ publishing request failed", err));
  };

  const deleteRFQ = (id: string) => {
    const rfq = rfqs.find(r => r.id === id);
    setRfqs(prev => prev.filter(r => r.id !== id));
    if (rfq) {
      addActivityLog('RFQ', `RFQ permanently removed : "${rfq.title}"`);
    }

    fetch(`/api/rfqs/${id}`, {
      method: 'DELETE'
    }).catch(err => console.warn("RFQ deletion request failed", err));
  };

  // Submit Bid (Quotation) from Vendor portal
  const submitQuotation = (
    rfqId: string, 
    vendorId: string, 
    deliveryTimeline: number, 
    notes: string, 
    itemPrices: Record<string, number>
  ) => {
    const rfq = rfqs.find(r => r.id === rfqId);
    const vendor = vendors.find(v => v.id === vendorId);

    if (!rfq || !vendor) {
      throw new Error("Specified RFQ or Vendor does not exist");
    }

    const compiledItems: QuotationItem[] = rfq.items.map(rfqItem => {
      const unitPrice = itemPrices[rfqItem.id] || 0;
      return {
        id: `q-item-${Date.now()}-${rfqItem.id}`,
        rfqItemId: rfqItem.id,
        productName: rfqItem.productName,
        quantity: rfqItem.quantity,
        unitPrice,
        totalPrice: rfqItem.quantity * unitPrice,
      };
    });

    const subtotal = compiledItems.reduce((acc, current) => acc + current.totalPrice, 0);
    const tax = Math.round(subtotal * 0.18); // standard 18% tax
    const grandTotal = subtotal + tax;

    const newQuotation: Quotation = {
      id: `quote-${vendor.id.split('-')[1]}-${Date.now().toString().slice(-4)}`,
      rfqId,
      rfqTitle: rfq.title,
      vendorId,
      vendorName: vendor.companyName,
      deliveryTimeline,
      notes,
      items: compiledItems,
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
      subtotal,
      tax,
      grandTotal,
    };

    setQuotations(prev => [newQuotation, ...prev]);
    addActivityLog('QUOTATION', `Quotation submitted by "${vendor.companyName}" for RFQ: "${rfq.title}". Total price $${grandTotal.toLocaleString()}.`, vendor.companyName, UserRole.VENDOR);
    spawnNotification('Quotation Submitted', `"${vendor.companyName}" submitted a quote costing $${grandTotal.toLocaleString()}.`, 'success');

    // Post bid quotation in background
    fetch('/api/quotations', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newQuotation)
    }).catch(err => console.warn("Quotation posting database trace inactive", err));

    // Automatically file an approval flow request for managers to sign off
    triggerApprovalRequest('QUOTATION', newQuotation.id, `Quotation Approval: ${vendor.companyName} for ${rfq.title}`, currentUser.firstName);

    return newQuotation;
  };

  // Create standard approval flow request for high visibility on Management dashboards
  const triggerApprovalRequest = (
    targetType: 'RFQ' | 'QUOTATION', 
    targetId: string, 
    title: string, 
    requester: string,
    amount?: number
  ) => {
    let quoteAmount = amount;
    if (targetType === 'QUOTATION' && !quoteAmount) {
      // Look up target quotation in current local array
      const q = quotations.find(item => item.id === targetId);
      if (q) quoteAmount = q.grandTotal;
    }

    const isAutoApproved = targetType === 'QUOTATION' && quoteAmount && quoteAmount < 5000;
    const isMultiStage = targetType === 'QUOTATION' && quoteAmount && quoteAmount >= 50000;

    let initStatus: ApprovalWorkflow['status'] = 'Pending';
    let labelTitle = title;
    
    if (isAutoApproved) {
      initStatus = 'Approved';
      labelTitle = `[Value Auto Approved] ${title}`;
    } else if (isMultiStage) {
      initStatus = 'Pending';
      labelTitle = `[Dual Stage Authorization Required] ${title}`;
    }

    const newWorkflow: ApprovalWorkflow = {
      id: `appr-00${approvals.length + 1}`,
      targetType,
      targetId,
      title: labelTitle,
      requesterName: requester,
      status: initStatus,
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: 'INITIATED',
          remark: 'Requested executive sign-off for critical transaction.',
          user: requester,
          date: new Date().toISOString(),
        }
      ]
    };

    if (isAutoApproved) {
      newWorkflow.timeline.push({
        status: 'AUTO_APPROVED',
        remark: `System Autonomous Signoff: quote sum of $${quoteAmount?.toLocaleString()} satisfies rules for low-value auto-clearance (< $5,000).`,
        user: 'Autonomous System Sourcing',
        date: new Date().toISOString(),
      });
      newWorkflow.managerRemarks = 'System-approved contract below ₹50,000 signature thresholds.';
      newWorkflow.updatedBy = 'Autonomous AI Engine';
    } else if (isMultiStage) {
      newWorkflow.timeline.push({
        status: 'PENDING_LEVEL_1',
        remark: `High-value procurement contract ($${quoteAmount?.toLocaleString()} >= $50,000 threshold). Multi-stage dual audit initialized.`,
        user: 'Compliance Engine',
        date: new Date().toISOString(),
      });
    }

    setApprovals(prev => [newWorkflow, ...prev]);

    fetch('/api/approvals', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newWorkflow)
    }).catch(err => console.warn("Approval workflow post inactive", err));

    // Apply side effects of auto-approval immediately to generate PO and Invoices
    if (isAutoApproved && targetType === 'QUOTATION') {
      const winningQuote = quotations.find(q => q.id === targetId);
      if (winningQuote) {
        setQuotations(prev => prev.map(q => {
          if (q.id === targetId) return { ...q, status: 'Accepted' as const };
          if (q.rfqId === winningQuote.rfqId && q.id !== targetId) return { ...q, status: 'Rejected' as const };
          return q;
        }));

        setRfqs(prev => prev.map(r => r.id === winningQuote.rfqId ? { ...r, status: 'Approved' as const } : r));

        const poId = `po-00${purchaseOrders.length + 1}`;
        const poNumber = `PO-2026-00${purchaseOrders.length + 1}`;
        const newPO: PurchaseOrder = {
          id: poId,
          poNumber,
          rfqId: winningQuote.rfqId,
          rfqTitle: winningQuote.rfqTitle,
          quotationId: winningQuote.id,
          vendorId: winningQuote.vendorId,
          vendorName: winningQuote.vendorName,
          items: winningQuote.items.map(qi => ({
            productName: qi.productName,
            quantity: qi.quantity,
            unit: 'Units',
            unitPrice: qi.unitPrice,
            total: qi.totalPrice,
          })),
          subTotal: winningQuote.subtotal,
          tax: winningQuote.tax,
          totalAmount: winningQuote.grandTotal,
          status: 'Approved',
          createdAt: new Date().toISOString(),
        };
        setPurchaseOrders(prevPO => [newPO, ...prevPO]);

        const invId = `inv-${Date.now()}`;
        const invoiceNumber = `INV-2026-00${invoices.length + 1}`;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);

        const newInvoice: Invoice = {
          id: invId,
          invoiceNumber,
          poNumber,
          rfqId: winningQuote.rfqId,
          rfqTitle: winningQuote.rfqTitle,
          quotationId: winningQuote.id,
          vendorId: winningQuote.vendorId,
          vendorName: winningQuote.vendorName,
          items: winningQuote.items.map(qi => ({
            productName: qi.productName,
            quantity: qi.quantity,
            unit: 'Units',
            price: qi.unitPrice,
            total: qi.totalPrice,
          })),
          subtotal: winningQuote.subtotal,
          tax: winningQuote.tax,
          grandTotal: winningQuote.grandTotal,
          status: 'Unpaid',
          createdAt: new Date().toISOString(),
          dueDate: dueDate.toISOString(),
        };
        setInvoices(prevInv => [newInvoice, ...prevInv]);

        spawnNotification('Autonomous Approve', `Pricing limits within ₹50,000 threshold. Contract auto-awarded to ${winningQuote.vendorName}.`, 'success');
        addActivityLog('APPROVAL', `Auto-Approved quote of ${winningQuote.vendorName} costing $${winningQuote.grandTotal.toLocaleString()}. PO Created.`);
      }
    }
  };

  const acceptQuotation = (quotationId: string) => {
    setQuotations(prev => prev.map(q => {
      if (q.id === quotationId) {
        return { ...q, status: 'Accepted' as const };
      }
      return q;
    }));
  };

  // Process approval triggers ERP transaction resolution
  const processApproval = (
    approvalId: string, 
    status: 'Approved' | 'Rejected', 
    remarks: string, 
    managerName: string
  ) => {
    let targetType: 'RFQ' | 'QUOTATION' = 'QUOTATION';
    let targetId = '';
    let isFinalApproved = false;

    const currentAppr = approvals.find(a => a.id === approvalId);
    if (!currentAppr) return;

    targetType = currentAppr.targetType;
    targetId = currentAppr.targetId;

    let quoteAmount = 0;
    if (targetType === 'QUOTATION') {
      const q = quotations.find(item => item.id === targetId);
      if (q) quoteAmount = q.grandTotal;
    }
    const isMultiStage = targetType === 'QUOTATION' && quoteAmount >= 50000;

    let nextStatus: ApprovalWorkflow['status'] = status;
    let timelineRemark = remarks;

    if (status === 'Approved') {
      if (isMultiStage) {
        if ((currentAppr.status as string) === 'Pending') {
          nextStatus = 'Approved (Level 1 Passed)' as any;
          timelineRemark = `[Level 1 Clearance] approved by ${managerName}. ${remarks || 'Review satisfactory. Awaiting Level 2 Admin signature.'}`;
        } else if ((currentAppr.status as string) === 'Approved (Level 1 Passed)') {
          nextStatus = 'Approved';
          timelineRemark = `[Level 2 Authorization] cleared by ${managerName}. ${remarks || 'Final executive signature granted.'}`;
          isFinalApproved = true;
        }
      } else {
        isFinalApproved = true;
      }
    }

    setApprovals(prev => prev.map(appr => {
      if (appr.id === approvalId) {
        const updatedTimeline = [
          ...appr.timeline,
          {
            status: status === 'Rejected' ? 'REJECTED' : nextStatus.toUpperCase(),
            remark: timelineRemark,
            user: managerName,
            date: new Date().toISOString(),
          }
        ];

        return {
          ...appr,
          status: status === 'Rejected' ? 'Rejected' : nextStatus,
          managerRemarks: remarks,
          updatedBy: managerName,
          updatedAt: new Date().toISOString(),
          timeline: updatedTimeline,
        };
      }
      return appr;
    }));

    // Perform state transition changes depending on target type
    if (status === 'Approved') {
      if (isFinalApproved) {
        if (targetType === 'QUOTATION') {
          // Find quotation and accept it. Reject sibling quotations for the same RFQ!
          const winningQuote = quotations.find(q => q.id === targetId);
          if (winningQuote) {
            // Accept winner
            setQuotations(prev => prev.map(q => {
              if (q.id === targetId) return { ...q, status: 'Accepted' as const };
              if (q.rfqId === winningQuote.rfqId && q.id !== targetId) return { ...q, status: 'Rejected' as const };
              return q;
            }));

            // Mark RFQ as Approved
            setRfqs(prev => prev.map(r => r.id === winningQuote.rfqId ? { ...r, status: 'Approved' as const } : r));

            // AUTO-GENERATE PURCHASE ORDER (PO-*) as requested!
            const poId = `po-00${purchaseOrders.length + 1}`;
            const poNumber = `PO-2026-00${purchaseOrders.length + 1}`;
            const newPO: PurchaseOrder = {
              id: poId,
              poNumber,
              rfqId: winningQuote.rfqId,
              rfqTitle: winningQuote.rfqTitle,
              quotationId: winningQuote.id,
              vendorId: winningQuote.vendorId,
              vendorName: winningQuote.vendorName,
              items: winningQuote.items.map(qi => ({
                productName: qi.productName,
                quantity: qi.quantity,
                unit: 'Units', // defaulted
                unitPrice: qi.unitPrice,
                total: qi.totalPrice,
              })),
              subTotal: winningQuote.subtotal,
              tax: winningQuote.tax,
              totalAmount: winningQuote.grandTotal,
              status: 'Approved',
              createdAt: new Date().toISOString(),
            };

            setPurchaseOrders(prev => [newPO, ...prev]);

            // AUTO-GENERATE INVOICE (INV-*) as well!
            const invId = `inv-${Date.now()}`;
            const invoiceNumber = `INV-2026-00${invoices.length + 1}`;
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30); // 30 days due

            const newInvoice: Invoice = {
              id: invId,
              invoiceNumber,
              poNumber,
              rfqId: winningQuote.rfqId,
              rfqTitle: winningQuote.rfqTitle,
              quotationId: winningQuote.id,
              vendorId: winningQuote.vendorId,
              vendorName: winningQuote.vendorName,
              items: winningQuote.items.map(qi => ({
                productName: qi.productName,
                quantity: qi.quantity,
                unit: 'Units',
                price: qi.unitPrice,
                total: qi.totalPrice,
              })),
              subtotal: winningQuote.subtotal,
              tax: winningQuote.tax,
              grandTotal: winningQuote.grandTotal,
              status: 'Unpaid',
              createdAt: new Date().toISOString(),
              dueDate: dueDate.toISOString(),
            };

            setInvoices(prev => [newInvoice, ...prev]);

            // Notify vendor
            spawnNotification('Contract Awarded!', `Vendor "${winningQuote.vendorName}" has been awarded the contract. PO & Invoice generated.`, 'success');
            addActivityLog('APPROVAL', `Approval granted on ${winningQuote.vendorName} quotation. PO "${poNumber}" created.`);
          }
        } else if (targetType === 'RFQ') {
          setRfqs(prev => prev.map(r => r.id === targetId ? { ...r, status: 'Approved' as const } : r));
          addActivityLog('APPROVAL', `RFP specification "${targetId}" signed off by executive management.`);
        }
      } else {
        // Just level 1 cleared, notify that Level 2 is required!
        spawnNotification('Level 1 Passed', `Transaction cleared by manager. Now requires final executive authorization.`, 'info');
        addActivityLog('APPROVAL', `Level 1 manager clearance granted. Dual Stage authorization is in-progress.`);
      }
    } else {
      // Rejected
      if (targetType === 'QUOTATION') {
        setQuotations(prev => prev.map(q => q.id === targetId ? { ...q, status: 'Rejected' as const } : q));
        addActivityLog('APPROVAL', `Quotation block target ${targetId} rejected. Reason: ${remarks}`);
      } else if (targetType === 'RFQ') {
        setRfqs(prev => prev.map(r => r.id === targetId ? { ...r, status: 'Rejected' as const } : r));
        addActivityLog('APPROVAL', `RFP spec target ${targetId} rejected.`);
      }
      spawnNotification('Transaction Rejected', `Approval request declined by administrative panel.`, 'error');
    }

    // Submit workflow update to backend database
    fetch(`/api/approvals/${approvalId}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, remarks, managerName })
    }).catch(err => console.warn("Backend approval process request failed", err));
  };

  const updateInvoiceStatus = (invoiceId: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        addActivityLog('INVOICE', `Invoice "${inv.invoiceNumber}" status set to ${status.toUpperCase()}.`);
        return { ...inv, status };
      }
      return inv;
    }));

    fetch(`/api/invoices/${invoiceId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    }).catch(err => console.warn("Invoice status update sync failed", err));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

    fetch(`/api/notifications/${id}/read`, {
      method: "POST"
    }).catch(err => console.warn("Notification read submission trace failed", err));
  };

  const clearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    fetch('/api/notifications/clear', {
      method: "POST"
    }).catch(err => console.warn("Clear notifications database request failed", err));
  };

  const triggerJudgeDemoMode = () => {
    // 1. Build rich, high-profile demo database
    const demoVendors: Vendor[] = [
      {
        id: 'vendor-cisco-demo',
        name: 'Eleanor Vance',
        companyName: 'Cisco Systems Enterprise',
        gstNumber: 'GST884029419',
        email: 'emea-sourcing@cisco.com',
        phone: '+49 (89) 555-4019',
        address: 'Milbertshofen-Am Hart, Munich, Germany',
        category: 'IT Infrastructure',
        rating: 4.9,
        status: 'Active',
        completedOrdersCount: 142,
        averageDeliveryDays: 4,
      },
      {
        id: 'vendor-juniper-demo',
        name: 'Kenji Takahashi',
        companyName: 'Juniper Networks Global',
        gstNumber: 'GST481940192',
        email: 'enterprise@juniper.net',
        phone: '+1 (555) 0192-384',
        address: '1133 Innovation Way, Sunnyvale, CA',
        category: 'IT Infrastructure',
        rating: 4.7,
        status: 'Active',
        completedOrdersCount: 94,
        averageDeliveryDays: 8,
      },
      ...INITIAL_VENDORS.filter(v => v.id !== 'vendor-horizon'),
      {
        id: 'vendor-horizon',
        name: 'Eleanor Sterling',
        companyName: 'Horizon TechCorp',
        gstNumber: 'GST481940192',
        email: 'contracts@horizontech.jp',
        phone: '+81 (3) 5555-0149',
        address: '6-2 Roppongi, Minato City, Tokyo',
        category: 'IT Infrastructure',
        rating: 4.6,
        status: 'Active',
        completedOrdersCount: 34,
        averageDeliveryDays: 5,
      }
    ];

    const demoRfqs: RFQ[] = [
      {
        id: 'rfq-cisco-demo',
        title: 'Cisco Corporate Network Spine Upgrade (EMEA HQ)',
        description: 'Consolidated upgrade program targeting core switching matrix, security gateways, and high frequency routing appliances at our main European operations center.',
        category: 'IT Infrastructure',
        deadline: '2026-06-30T23:59:59Z',
        assignedVendors: ['vendor-cisco-demo', 'vendor-juniper-demo', 'vendor-horizon'],
        items: [
          {
            id: 'cisco-item-1',
            productName: 'Cisco Nexus 9300-GX Switch Chassis (48p 100G modular)',
            quantity: 8,
            unit: 'Units',
            description: 'High performance high density SDN server switch chassis with 1.8Tbps capability',
            expectedPrice: 8500,
          },
          {
            id: 'cisco-item-2',
            productName: 'Cisco Firepower 4112 Security Next-Gen Firewall',
            quantity: 2,
            unit: 'Units',
            description: 'Carrier-grade threat defense clustering firewall with inline deep inspection telemetry',
            expectedPrice: 22000,
          }
        ],
        status: 'Open',
        createdAt: new Date().toISOString(),
      },
      ...INITIAL_RFQS
    ];

    const demoQuotes: Quotation[] = [
      {
        id: 'quote-cisco',
        rfqId: 'rfq-cisco-demo',
        rfqTitle: 'Cisco Corporate Network Spine Upgrade (EMEA HQ)',
        vendorId: 'vendor-cisco-demo',
        vendorName: 'Cisco Systems Enterprise',
        deliveryTimeline: 4,
        notes: 'Direct certified hardware delivery from Cisco Munich Central Hub. Standard 36-month enterprise TAC SLA level-4 support contract included with zero-cost dispatch and premium packaging.',
        status: 'Submitted',
        submittedAt: new Date().toISOString(),
        items: [
          {
            id: 'q-cisco-it-1',
            rfqItemId: 'cisco-item-1',
            productName: 'Cisco Nexus 9300-GX Switch Chassis (48p 100G modular)',
            quantity: 8,
            unitPrice: 8200,
            totalPrice: 65600,
          },
          {
            id: 'q-cisco-it-2',
            rfqItemId: 'cisco-item-2',
            productName: 'Cisco Firepower 4112 Security Next-Gen Firewall',
            quantity: 2,
            unitPrice: 21700,
            totalPrice: 43400,
          }
        ],
        subtotal: 109000,
        tax: 19620,
        grandTotal: 128620,
      },
      {
        id: 'quote-juniper',
        rfqId: 'rfq-cisco-demo',
        rfqTitle: 'Cisco Corporate Network Spine Upgrade (EMEA HQ)',
        vendorId: 'vendor-juniper-demo',
        vendorName: 'Juniper Networks Global',
        deliveryTimeline: 8,
        notes: 'Alternative high performance Juniper routing cluster solution utilizing Juniper EX-9300-class chassis paired with SRX-4112 equivalent security gateway. Comprehensive redundant controller modules configured.',
        status: 'Submitted',
        submittedAt: new Date().toISOString(),
        items: [
          {
            id: 'q-juniper-it-1',
            rfqItemId: 'cisco-item-1',
            productName: 'Cisco Nexus 9300-GX Switch Chassis (48p 100G modular)',
            quantity: 8,
            unitPrice: 8900,
            totalPrice: 71200,
          },
          {
            id: 'q-juniper-it-2',
            rfqItemId: 'cisco-item-2',
            productName: 'Cisco Firepower 4112 Security Next-Gen Firewall',
            quantity: 2,
            unitPrice: 23400,
            totalPrice: 46800,
          }
        ],
        subtotal: 118000,
        tax: 21240,
        grandTotal: 139240,
      },
      ...INITIAL_QUOTATIONS
    ];

    const demoApprovals: ApprovalWorkflow[] = [
      {
        id: 'appr-cisco',
        targetType: 'QUOTATION',
        targetId: 'quote-cisco',
        title: '[Dual Stage Authorization Required] Quotation Approval: Cisco Systems Enterprise Sourcing Proposal',
        requesterName: 'Sarah Jenkins',
        status: 'Pending',
        updatedAt: new Date().toISOString(),
        timeline: [
          {
            status: 'INITIATED',
            remark: 'Requested executive level sign-off on critical backbone enterprise networking contract.',
            user: 'Sarah Jenkins',
            date: new Date().toISOString(),
          }
        ]
      },
      ...INITIAL_APPROVALS
    ];

    const demoActivities: AuditActivity[] = [
      {
        id: 'act-demo-1',
        type: 'APPROVAL',
        description: 'Sourcing recommendation for "Cisco Corporate Network Spine Upgrade" published and posted for multi-stage Management Sign-off.',
        user: 'Sarah Jenkins',
        role: UserRole.PROCUREMENT,
        date: new Date().toISOString(),
      },
      {
        id: 'act-demo-2',
        type: 'QUOTATION',
        description: 'Active quotation bid quote-cisco submitted by Cisco Systems Enterprise ($128,620 grand total with certified certification SLA).',
        user: 'Eleanor Vance',
        role: UserRole.VENDOR,
        date: new Date().toISOString(),
      },
      {
        id: 'act-demo-3',
        type: 'QUOTATION',
        description: 'Active quotation bid quote-juniper submitted by Juniper Networks Global ($139,240 with redundant setup options).',
        user: 'Kenji Takahashi',
        role: UserRole.VENDOR,
        date: new Date().toISOString(),
      },
      {
        id: 'act-demo-4',
        type: 'RFQ',
        description: 'RFP "Cisco Corporate Network Spine Upgrade (EMEA HQ)" successfully published to premium net-hardware vendors.',
        user: 'Sarah Jenkins',
        role: UserRole.PROCUREMENT,
        date: new Date().toISOString(),
      },
      ...INITIAL_ACTIVITIES
    ];

    const demoNotifs: SystemNotification[] = [
      {
        id: 'notif-demo-1',
        title: 'Actionable Bid Comparison Ready',
        message: 'Cisco Systems Enterprise and Juniper Networks have both submitted active bids for "Cisco Corporate Network Spine Upgrade (EMEA HQ)".',
        type: 'warning',
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'notif-demo-2',
        title: 'Priority Review Requested',
        message: 'Sarah Jenkins requested priority Dual-Stage review on Cisco Systems Enterprise Sourcing Proposal (exceeds $50,000 threshold).',
        type: 'info',
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...INITIAL_NOTIFICATIONS
    ];

    setIsDemoModeActive(true);
    setVendors(demoVendors);
    setRfqs(demoRfqs);
    setQuotations(demoQuotes);
    setApprovals(demoApprovals);
    // Keep POs & invoices as base init so user can watch the approvals auto-generate PO-002 and corresponding invoices!
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setInvoices(INITIAL_INVOICES);
    setActivities(demoActivities);
    setNotifications(demoNotifs);
    
    // Auto switch persona to Procurement Jenkins to give them the correct starting perspective
    fastSwitchRole(UserRole.PROCUREMENT);

    spawnNotification('Judge Demo Mode Activated', 'Pristine end-to-end Cisco networking spine dataset seeded. Step-by-step instructions loaded!', 'success');
  };

  const resetToBaseline = () => {
    setIsDemoModeActive(false);
    setVendors(INITIAL_VENDORS);
    setRfqs(INITIAL_RFQS);
    setQuotations(INITIAL_QUOTATIONS);
    setApprovals(INITIAL_APPROVALS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setInvoices(INITIAL_INVOICES);
    setActivities(INITIAL_ACTIVITIES);
    setNotifications(INITIAL_NOTIFICATIONS);
    
    localStorage.removeItem('vb-vendors');
    localStorage.removeItem('vb-rfqs');
    localStorage.removeItem('vb-quotations');
    localStorage.removeItem('vb-approvals');
    localStorage.removeItem('vb-pos');
    localStorage.removeItem('vb-invoices');
    localStorage.removeItem('vb-activities');
    localStorage.removeItem('vb-notifications');
    localStorage.removeItem('vb-demomode-active');
    
    spawnNotification('Workspace Reset', 'VendorBridge restored to default sandbox state.', 'info');
  };

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      currentUser,
      updateProfile,
      login,
      register,
      logout,
      fastSwitchRole,
      sidebarOpen,
      setSidebarOpen,
      commandPaletteOpen,
      setCommandPaletteOpen,
      vendors,
      rfqs,
      quotations,
      approvals,
      purchaseOrders,
      invoices,
      activities,
      notifications,
      addVendor,
      updateVendor,
      deleteVendor,
      createRFQ,
      publishRFQ,
      deleteRFQ,
      submitQuotation,
      acceptQuotation,
      triggerApprovalRequest,
      processApproval,
      updateInvoiceStatus,
      markNotificationRead,
      clearNotifications,
      isDemoModeActive,
      triggerJudgeDemoMode,
      resetToBaseline,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
