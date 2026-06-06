/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  PROCUREMENT = 'PROCUREMENT',
  MANAGER = 'MANAGER',
  VENDOR = 'VENDOR',
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country?: string;
  companyName?: string;
  gstNumber?: string;
  role: UserRole;
}

export interface Vendor {
  id: string;
  name: string;
  companyName: string;
  gstNumber: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number; // 1 to 5
  status: 'Active' | 'Pending' | 'Blacklisted';
  completedOrdersCount: number;
  averageDeliveryDays: number;
}

export interface RFQItem {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  description: string;
  expectedPrice: number;
}

export interface RFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  deadline: string;
  assignedVendors: string[]; // List of vendor ids
  items: RFQItem[];
  status: 'Draft' | 'Open' | 'Closed' | 'Approved' | 'Rejected'; // 'Open' means published and visible to assigned vendors
  createdAt: string;
  attachments?: string[];
}

export interface QuotationItem {
  id: string;
  rfqItemId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quotation {
  id: string;
  rfqId: string;
  rfqTitle: string;
  vendorId: string;
  vendorName: string;
  items: QuotationItem[];
  deliveryTimeline: number; // in days
  notes: string;
  status: 'Draft' | 'Submitted' | 'Revised' | 'Accepted' | 'Rejected';
  submittedAt?: string;
  subtotal: number;
  tax: number; // 18% GST standard e.g.
  grandTotal: number;
}

export interface ApprovalTimelineEvent {
  status: string;
  remark: string;
  user: string;
  date: string;
}

export interface ApprovalWorkflow {
  id: string;
  targetType: 'RFQ' | 'QUOTATION';
  targetId: string;
  title: string;
  requesterName: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
  managerRemarks?: string;
  updatedBy?: string;
  updatedAt: string;
  timeline: ApprovalTimelineEvent[];
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  rfqId: string;
  rfqTitle: string;
  quotationId: string;
  vendorId: string;
  vendorName: string;
  items: {
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }[];
  subTotal: number;
  tax: number;
  totalAmount: number;
  status: 'Pending' | 'Approved' | 'Delivered';
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  poNumber: string;
  rfqId: string;
  rfqTitle: string;
  quotationId: string;
  vendorId: string;
  vendorName: string;
  items: {
    productName: string;
    quantity: number;
    unit: string;
    price: number;
    total: number;
  }[];
  subtotal: number;
  tax: number; // standard 18% GST e.g.
  grandTotal: number;
  status: 'Draft' | 'Paid' | 'Unpaid' | 'Overdue';
  createdAt: string;
  dueDate: string;
}

export interface AuditActivity {
  id: string;
  type: 'RFQ' | 'QUOTATION' | 'APPROVAL' | 'PO' | 'INVOICE' | 'VENDOR' | 'AUTH';
  description: string;
  user: string;
  role: UserRole;
  date: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}
