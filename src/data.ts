/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vendor, RFQ, Quotation, ApprovalWorkflow, PurchaseOrder, Invoice, AuditActivity, UserRole, UserProfile, SystemNotification } from './types';

export const INITIAL_USER_PROFILES: UserProfile[] = [
  {
    id: 'user-admin',
    firstName: 'Alexander',
    lastName: 'Vance',
    email: 'alexander.vance@vendorbridge.com',
    phone: '+1 (555) 0192-384',
    country: 'United States',
    companyName: 'VendorBridge Enterprise',
    role: UserRole.ADMIN,
  },
  {
    id: 'user-proc',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.jenkins@vendorbridge.com',
    phone: '+1 (555) 0124-577',
    country: 'United States',
    companyName: 'VendorBridge Enterprise',
    role: UserRole.PROCUREMENT,
  },
  {
    id: 'user-mgr',
    firstName: 'Sophia',
    lastName: 'Rodriguez',
    email: 'sophia.rodriguez@vendorbridge.com',
    phone: '+1 (555) 0184-219',
    country: 'United States',
    companyName: 'VendorBridge Enterprise',
    role: UserRole.MANAGER,
  },
  {
    id: 'user-vendor-apex',
    firstName: 'Marcus',
    lastName: 'Kross',
    email: 'marcus@apexindustrial.com',
    phone: '+1 (555) 0147-920',
    country: 'Canada',
    companyName: 'Apex Industrial Solutions',
    gstNumber: 'GST840912838',
    role: UserRole.VENDOR,
  },
];

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'vendor-apex',
    name: 'Marcus Kross',
    companyName: 'Apex Industrial Solutions',
    gstNumber: 'GST840912838',
    email: 'sales@apexindustrial.com',
    phone: '+1 (555) 0147-920',
    address: '402 Progress Pkwy, Toronto, ON',
    category: 'Industrial Hardware',
    rating: 4.8,
    status: 'Active',
    completedOrdersCount: 28,
    averageDeliveryDays: 8,
  },
  {
    id: 'vendor-nexus',
    name: 'Eleanor Sterling',
    companyName: 'Nexus Global Logistics',
    gstNumber: 'GST918341938',
    email: 'bids@nexusglobal.com',
    phone: '+1 (555) 0192-411',
    address: '1108 Logistics Boulevard, Chicago, IL',
    category: 'Raw Materials',
    rating: 4.5,
    status: 'Active',
    completedOrdersCount: 19,
    averageDeliveryDays: 14,
  },
  {
    id: 'vendor-horizon',
    name: 'Kenji Takahashi',
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
  },
  {
    id: 'vendor-titan',
    name: 'Bjorn Ironside',
    companyName: 'Titan Metal Syndicate',
    gstNumber: 'GST739410193',
    email: 'supplies@titanmetal.se',
    phone: '+46 (8) 123-4567',
    address: 'Metal Factory block C, Gothenburg',
    category: 'Raw Materials',
    rating: 3.8,
    status: 'Active',
    completedOrdersCount: 12,
    averageDeliveryDays: 20,
  },
  {
    id: 'vendor-zenith',
    name: 'Dr. Clara DuPont',
    companyName: 'Zenith Chemical Group',
    gstNumber: 'GST284910243',
    email: 'info@zenithchemical.fr',
    phone: '+33 (1) 4567-8910',
    address: '92 Chemicals Avenue, Lyon',
    category: 'Chemical Engineering',
    rating: 4.0,
    status: 'Pending',
    completedOrdersCount: 4,
    averageDeliveryDays: 10,
  },
  {
    id: 'vendor-rogue',
    name: 'Silas Frost',
    companyName: 'Rogue Suppliers Inc',
    gstNumber: 'GST000000000',
    email: 'hidden@roguesupplies.com',
    phone: '+1 (555) 666-0199',
    address: 'Unknown Warehouse, Shadow District',
    category: 'Raw Materials',
    rating: 1.5,
    status: 'Blacklisted',
    completedOrdersCount: 1,
    averageDeliveryDays: 35,
  },
];

export const INITIAL_RFQS: RFQ[] = [
  {
    id: 'rfq-001',
    title: 'High-grade Steel Alloys Procurement for Quarter 3',
    description: 'Procurement of structural steel components and carbon steel alloys to fulfill construction demands for the Phase 4 Green Power Plant Project.',
    category: 'Raw Materials',
    deadline: '2026-06-25T23:59:59Z',
    assignedVendors: ['vendor-apex', 'vendor-nexus', 'vendor-titan'],
    items: [
      {
        id: 'rfq-item-1',
        productName: 'Structural Steel Beams (HEB 300)',
        quantity: 100,
        unit: 'Tons',
        description: 'Standard S355J2 grade parallel flange structural steel beams',
        expectedPrice: 800,
      },
      {
        id: 'rfq-item-2',
        productName: 'High Carbon Steel Rods (Grade 60)',
        quantity: 250,
        unit: 'Tons',
        description: 'Grade 60 high tensile steel rods 12mm caliber',
        expectedPrice: 650,
      },
    ],
    status: 'Open',
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'rfq-002',
    title: 'Next-gen Server Rack Infrastructure for Central Data Center',
    description: 'Enterprise virtual hosting rack requirements containing dense performance servers, Cisco networking switches, and redundancy cooling fans.',
    category: 'IT Infrastructure',
    deadline: '2026-06-15T18:00:00Z',
    assignedVendors: ['vendor-horizon', 'vendor-apex'],
    items: [
      {
        id: 'rfq-item-3',
        productName: '42U Blade Server Racks (Standard)',
        quantity: 12,
        unit: 'Units',
        description: 'Smart network-connected enclosure racks with cooling integrated',
        expectedPrice: 4500,
      },
      {
        id: 'rfq-item-4',
        productName: 'Cisco Integrated Services Routers (Core v4)',
        quantity: 5,
        unit: 'Units',
        description: 'High throughput enterprise core routers with multi-mesh backup',
        expectedPrice: 1200,
      },
    ],
    status: 'Approved',
    createdAt: '2026-05-28T09:12:00Z',
  },
  {
    id: 'rfq-003',
    title: 'Chemical Catalyst Grade CX-9 for Refining Units',
    description: 'Bulk order for specialized high efficacy chemical reaction catalysts for oil refining and sulfur capturing processes.',
    category: 'Chemical Engineering',
    deadline: '2026-07-10T12:00:00Z',
    assignedVendors: ['vendor-zenith'],
    items: [
      {
        id: 'rfq-item-5',
        productName: 'CX-9 High Efficacy Liquid Catalyst',
        quantity: 50,
        unit: 'Barrels',
        description: 'Sealed pressurised 200L chemical grade barrels',
        expectedPrice: 300,
      },
    ],
    status: 'Draft',
    createdAt: '2026-06-04T15:30:00Z',
  },
  {
    id: 'rfq-004',
    title: 'Structural Component Castings - Turbine Phase',
    description: 'Custom molded precision casings required for aerodynamic wind turbines. Requires detailed compliance with environmental noise certifications.',
    category: 'Raw Materials',
    deadline: '2026-06-30T00:00:00Z',
    assignedVendors: ['vendor-apex', 'vendor-nexus', 'vendor-titan'],
    items: [
      {
        id: 'rfq-item-6',
        productName: 'Direct Drive Rotor Casting Alpha',
        quantity: 15,
        unit: 'Units',
        description: 'Forged steel turbine component casting weight class A',
        expectedPrice: 3500,
      }
    ],
    status: 'Open',
    createdAt: '2026-06-05T08:24:00Z',
  }
];

export const INITIAL_QUOTATIONS: Quotation[] = [
  // quotations on Steel Alloys RFQ-001
  {
    id: 'quote-nexus-001',
    rfqId: 'rfq-001',
    rfqTitle: 'High-grade Steel Alloys Procurement for Quarter 3',
    vendorId: 'vendor-nexus',
    vendorName: 'Nexus Global Logistics',
    deliveryTimeline: 14,
    notes: 'Premium structural carbon steel direct from Midwestern foundries. Standard shipping and insurance included. Standard GST returns applicable.',
    status: 'Submitted',
    submittedAt: '2026-06-03T11:42:00Z',
    items: [
      {
        id: 'q-item-1',
        rfqItemId: 'rfq-item-1',
        productName: 'Structural Steel Beams (HEB 300)',
        quantity: 100,
        unitPrice: 760, // under expected $800
        totalPrice: 76000,
      },
      {
        id: 'q-item-2',
        rfqItemId: 'rfq-item-2',
        productName: 'High Carbon Steel Rods (Grade 60)',
        quantity: 250,
        unitPrice: 630, // under expected $650
        totalPrice: 157500,
      }
    ],
    subtotal: 233500,
    tax: 42030, // 18% GST
    grandTotal: 275530,
  },
  {
    id: 'quote-titan-001',
    rfqId: 'rfq-001',
    rfqTitle: 'High-grade Steel Alloys Procurement for Quarter 3',
    vendorId: 'vendor-titan',
    vendorName: 'Titan Metal Syndicate',
    deliveryTimeline: 20, // slowest, lowest price
    notes: 'Direct shipping from Stockholm docks. Unbeatable pricing on Grade 60 tensile steel. Please expect 20 calendar days for custom metal processing.',
    status: 'Submitted',
    submittedAt: '2026-06-04T09:15:00Z',
    items: [
      {
        id: 'q-item-3',
        rfqItemId: 'rfq-item-1',
        productName: 'Structural Steel Beams (HEB 300)',
        quantity: 100,
        unitPrice: 790,
        totalPrice: 79000,
      },
      {
        id: 'q-item-4',
        rfqItemId: 'rfq-item-2',
        productName: 'High Carbon Steel Rods (Grade 60)',
        quantity: 250,
        unitPrice: 610, // lowest rod price!
        totalPrice: 152500,
      }
    ],
    subtotal: 231500,
    tax: 41670,
    grandTotal: 273170,
  },
  {
    id: 'quote-apex-001',
    rfqId: 'rfq-001',
    rfqTitle: 'High-grade Steel Alloys Procurement for Quarter 3',
    vendorId: 'vendor-apex',
    vendorName: 'Apex Industrial Solutions',
    deliveryTimeline: 8, // fastest, highest price
    notes: 'Expedited air and freight delivery guarantees fulfillment in 8 days. ISO-certified steel with comprehensive mechanical testing reports included.',
    status: 'Submitted',
    submittedAt: '2026-06-05T14:50:00Z',
    items: [
      {
        id: 'q-item-5',
        rfqItemId: 'rfq-item-1',
        productName: 'Structural Steel Beams (HEB 300)',
        quantity: 100,
        unitPrice: 820,
        totalPrice: 82000,
      },
      {
        id: 'q-item-6',
        rfqItemId: 'rfq-item-2',
        productName: 'High Carbon Steel Rods (Grade 60)',
        quantity: 250,
        unitPrice: 660,
        totalPrice: 165000,
      }
    ],
    subtotal: 247000,
    tax: 44460,
    grandTotal: 291460,
  },

  // quotations on Server Racks RFQ-002 (Accepted already)
  {
    id: 'quote-horizon-002',
    rfqId: 'rfq-002',
    rfqTitle: 'Next-gen Server Rack Infrastructure for Central Data Center',
    vendorId: 'vendor-horizon',
    vendorName: 'Horizon TechCorp',
    deliveryTimeline: 5,
    notes: 'Premium 42U Server racks bundled with high performance fans. Ready to deliver immediately from domestic warehouse.',
    status: 'Accepted',
    submittedAt: '2026-05-30T10:00:00Z',
    items: [
      {
        id: 'q-item-7',
        rfqItemId: 'rfq-item-3',
        productName: '42U Blade Server Racks (Standard)',
        quantity: 12,
        unitPrice: 4000,
        totalPrice: 48000,
      },
      {
        id: 'q-item-8',
        rfqItemId: 'rfq-item-4',
        productName: 'Cisco Integrated Services Routers (Core v4)',
        quantity: 5,
        unitPrice: 1200,
        totalPrice: 6000,
      }
    ],
    subtotal: 54000,
    tax: 9720,
    grandTotal: 63720,
  },
  {
    id: 'quote-apex-002',
    rfqId: 'rfq-002',
    rfqTitle: 'Next-gen Server Rack Infrastructure for Central Data Center',
    vendorId: 'vendor-apex',
    vendorName: 'Apex Industrial Solutions',
    deliveryTimeline: 10,
    notes: 'Standard data center cabinets.',
    status: 'Rejected',
    submittedAt: '2026-05-31T09:00:00Z',
    items: [
      {
        id: 'q-item-9',
        rfqItemId: 'rfq-item-3',
        productName: '42U Blade Server Racks (Standard)',
        quantity: 12,
        unitPrice: 4500,
        totalPrice: 54000,
      },
      {
        id: 'q-item-10',
        rfqItemId: 'rfq-item-4',
        productName: 'Cisco Integrated Services Routers (Core v4)',
        quantity: 5,
        unitPrice: 1400,
        totalPrice: 7000,
      }
    ],
    subtotal: 61000,
    tax: 10980,
    grandTotal: 71980,
  }
];

export const INITIAL_APPROVALS: ApprovalWorkflow[] = [
  {
    id: 'appr-001',
    targetType: 'QUOTATION',
    targetId: 'quote-horizon-002',
    title: 'Quotation Approval: Horizon TechCorp for DC Server Racks',
    requesterName: 'Sarah Jenkins',
    status: 'Approved',
    managerRemarks: 'Pricing is significantly discounted below our expected budget ($54k vs $60k allocation) with an incredibly fast delivery of 5 days. Highly recommend proceeding immediately.',
    updatedBy: 'Sophia Rodriguez',
    updatedAt: '2026-06-01T14:30:00Z',
    timeline: [
      {
        status: 'QUOTATION RECEIVED',
        remark: 'System auto-ingestion from vendor-portal',
        user: 'Horizon Automation',
        date: '2026-05-30T10:00:00Z',
      },
      {
        status: 'UNDER REVIEW',
        remark: 'Comparison generated. Technically compliant specifications checked.',
        user: 'Sarah Jenkins (Procurement)',
        date: '2026-05-31T15:20:00Z',
      },
      {
        status: 'APPROVED',
        remark: 'Approved. Great discount and lightning setup speed.',
        user: 'Sophia Rodriguez (Manager)',
        date: '2026-06-01T14:30:00Z',
      }
    ]
  },
  {
    id: 'appr-002',
    targetType: 'RFQ',
    targetId: 'rfq-001',
    title: 'Steel Alloy Bid Selection Approval Request',
    requesterName: 'Sarah Jenkins',
    status: 'Pending',
    updatedAt: '2026-06-05T16:00:00Z',
    timeline: [
      {
        status: 'BIDS COMPLETED',
        remark: 'All 3 assigned vendors submitted active quotations.',
        user: 'System Bot',
        date: '2026-06-05T14:50:00Z',
      },
      {
        status: 'PENDING EXECUTIVE SIGN-OFF',
        remark: 'Requesting review of side-by-side comparison. Nexus offers best rating value; Titan has absolute lowest cost.',
        user: 'Sarah Jenkins (Procurement)',
        date: '2026-06-05T16:00:00Z',
      }
    ]
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-001',
    poNumber: 'PO-2026-001',
    rfqId: 'rfq-002',
    rfqTitle: 'Next-gen Server Rack Infrastructure for Central Data Center',
    quotationId: 'quote-horizon-002',
    vendorId: 'vendor-horizon',
    vendorName: 'Horizon TechCorp',
    items: [
      {
        productName: '42U Blade Server Racks (Standard)',
        quantity: 12,
        unit: 'Units',
        unitPrice: 4000,
        total: 48000,
      },
      {
        productName: 'Cisco Integrated Services Routers (Core v4)',
        quantity: 5,
        unit: 'Units',
        unitPrice: 1200,
        total: 6000,
      }
    ],
    subTotal: 54000,
    tax: 9720,
    totalAmount: 63720,
    status: 'Approved',
    createdAt: '2026-06-02T09:00:00Z',
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2026-001',
    poNumber: 'PO-2026-001',
    rfqId: 'rfq-002',
    rfqTitle: 'Next-gen Server Rack Infrastructure for Central Data Center',
    quotationId: 'quote-horizon-002',
    vendorId: 'vendor-horizon',
    vendorName: 'Horizon TechCorp',
    items: [
      {
        productName: '42U Blade Server Racks (Standard)',
        quantity: 12,
        unit: 'Units',
        price: 4000,
        total: 48000,
      },
      {
        productName: 'Cisco Integrated Services Routers (Core v4)',
        quantity: 5,
        unit: 'Units',
        price: 1200,
        total: 6000,
      }
    ],
    subtotal: 54000,
    tax: 9720,
    grandTotal: 63720,
    status: 'Paid',
    createdAt: '2026-06-03T14:00:00Z',
    dueDate: '2026-07-03T14:00:00Z',
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2026-002',
    poNumber: 'PO-2026-033',
    rfqId: 'rfq-099',
    rfqTitle: 'Raw Cement Ingredients - Batch B',
    quotationId: 'quote-nexus-099',
    vendorId: 'vendor-nexus',
    vendorName: 'Nexus Global Logistics',
    items: [
      {
        productName: 'Heavy Silica Portland Cement grade V',
        quantity: 300,
        unit: 'Bags',
        price: 45,
        total: 13500,
      }
    ],
    subtotal: 13500,
    tax: 2430,
    grandTotal: 15930,
    status: 'Unpaid',
    createdAt: '2026-05-20T10:00:00Z',
    dueDate: '2026-06-20T10:00:00Z',
  }
];

export const INITIAL_ACTIVITIES: AuditActivity[] = [
  {
    id: 'act-1',
    type: 'RFQ',
    description: 'RFQ-004 "Structural Component Castings" drafted and published to Apex, Nexus, and Titan.',
    user: 'Sarah Jenkins',
    role: UserRole.PROCUREMENT,
    date: '2026-06-05T08:24:00Z',
  },
  {
    id: 'act-2',
    type: 'QUOTATION',
    description: 'Active quotation bid quote-apex-001 submitted ($247,000 subtotal, fast-track delivery).',
    user: 'Marcus Kross',
    role: UserRole.VENDOR,
    date: '2026-06-05T14:50:00Z',
  },
  {
    id: 'act-3',
    type: 'APPROVAL',
    description: 'Steel Alliance comparison sheets posted for Executive Sign-off.',
    user: 'Sarah Jenkins',
    role: UserRole.PROCUREMENT,
    date: '2026-06-05T16:00:00Z',
  },
  {
    id: 'act-4',
    type: 'PO',
    description: 'Purchase Order PO-2026-001 auto-generated and finalized for Horizon TechCorp.',
    user: 'Sarah Jenkins',
    role: UserRole.PROCUREMENT,
    date: '2026-06-02T09:00:00Z',
  },
  {
    id: 'act-5',
    type: 'APPROVAL',
    description: 'Approval appr-001 confirmed for Horizon Techcorp server specifications.',
    user: 'Sophia Rodriguez',
    role: UserRole.MANAGER,
    date: '2026-06-01T14:30:00Z',
  },
  {
    id: 'act-6',
    type: 'INVOICE',
    description: 'Invoice INV-2026-001 updated to PAID as per bank clearance receipt state.',
    user: 'Alexander Vance',
    role: UserRole.ADMIN,
    date: '2026-06-03T14:00:00Z',
  },
  {
    id: 'act-7',
    type: 'AUTH',
    description: 'Vendor Representative Marcus Kross successfully logged in from Toronto, Canada.',
    user: 'Marcus Kross',
    role: UserRole.VENDOR,
    date: '2026-06-06T03:55:00Z',
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    title: 'New Bid Received',
    message: 'Apex Industrial Solutions has submitted a competitive bid for RFQ-001 Steel Alloys.',
    type: 'success',
    read: false,
    createdAt: '2026-06-05T14:52:00Z',
  },
  {
    id: 'notif-2',
    title: 'Approval Signature Required',
    message: 'Sarah Jenkins requested immediate sign-off on RFQ-001 "Steel Alloy Procurement".',
    type: 'warning',
    read: false,
    createdAt: '2026-06-05T16:05:00Z',
  },
  {
    id: 'notif-3',
    title: 'PO Acceptance',
    message: 'Horizon TechCorp has formally signed and accepted Purchase Order PO-2026-001.',
    type: 'info',
    read: true,
    createdAt: '2026-06-02T11:15:00Z',
  }
];
