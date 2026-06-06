/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PurchaseOrder } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { 
  FileCheck2, ShieldCheck, Printer, Download, MapPin, 
  Building2, Phone, Mail, Award, Landmark, AlertCircle, Eye
} from 'lucide-react';

export const PurchaseOrders: React.FC = () => {
  const { purchaseOrders, vendors } = useApp();
  const [activePO, setActivePO] = useState<PurchaseOrder | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'Approved':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-bold">Approved</span>;
      case 'Delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase font-bold">Fulfill Delivered</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase font-bold animate-pulse">Dispatched pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-xl font-bold font-display tracking-tight text-white">Purchase Orders Ledger</h2>
        <p className="text-xs text-slate-400 font-sans mt-0.5">Authoritative dispatch registry for procurement orders</p>
      </div>

      {purchaseOrders.length === 0 ? (
        <div className="py-16 text-center border border-dashed dark:border-slate-800 rounded-xl">
          <FileCheck2 className="w-10 h-10 text-slate-550 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No Orders Generated Yet</h3>
          <p className="text-xs text-slate-400 font-sans mt-1">Sourcing bids must first clear managerial approval workflows.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-none font-sans print:grid-cols-1">
          
          {/* Left Side: Purchase Orders List Grid */}
          <div className="lg:col-span-4 space-y-3.5 print:hidden">
            <div className="p-4 rounded-xl border dark:bg-slate-900/20 dark:border-slate-850 light:bg-slate-50 light:border-slate-200">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-3 font-display">
                DISPATCHED ORDERS INDEX
              </span>

              <div className="space-y-2.5">
                {purchaseOrders.map(po => {
                  const isActive = activePO?.id === po.id;
                  
                  return (
                    <div
                      key={po.id}
                      onClick={() => setActivePO(po)}
                      className={`p-4 rounded-lg border text-left cursor-pointer transition-all flex items-start justify-between gap-2.5
                        ${isActive 
                          ? 'border-emerald-500 dark:bg-emerald-950/[0.03] light:bg-emerald-50' 
                          : 'dark:border-slate-850 dark:bg-slate-900/20 light:border-slate-200 light:bg-white hover:bg-slate-500/5'}`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-black text-slate-200">{po.poNumber}</span>
                          {getStatusBadge(po.status)}
                        </div>
                        <h4 className="text-xs font-bold font-display text-slate-350 dark:text-slate-300 truncate mt-1.5">
                          {po.vendorName}
                        </h4>
                        <div className="text-[11px] text-slate-450 truncate mt-0.5">{po.rfqTitle}</div>
                      </div>
                      
                      <div className="text-right font-mono text-xs font-bold text-emerald-450 shrink-0">
                        {formatCurrency(po.totalAmount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side: PO Document Simulator Container */}
          <div className="lg:col-span-8 print:col-span-1 border dark:border-slate-850 light:border-slate-200 rounded-xl bg-slate-950/40 dark:bg-slate-900/10 p-5">
            {!activePO ? (
              <div className="py-24 text-center">
                <p className="text-xs text-slate-500 font-mono">Select any purchase order record block from the left panel to render high-contrast printable document sheet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Simulated Floating Tool bar */}
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 print:hidden">
                  <div className="flex items-center gap-2 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-slate-300 font-medium">Authoritative ERP Generated Document Signature</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handlePrint}
                      className="p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Document / PDF</span>
                    </button>
                  </div>
                </div>

                {/* THE SIMULATED DIGITAL DOCUMENT SHEET */}
                <div id="printable-sheet" className="bg-white text-slate-900 p-8 rounded-xl border border-slate-200 shadow-2xl font-sans text-xs">
                  
                  {/* Top Invoice Header row */}
                  <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                    <div>
                      {/* Logo Mock */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-slate-950 flex items-center justify-center text-white font-black text-sm">VB</div>
                        <div>
                          <div className="text-sm font-black font-display tracking-tight text-slate-950">VENDORBRIDGE ERP</div>
                          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Operations Division Sourcing</div>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 font-sans mt-3 space-y-0.5">
                        <p>102 Corporate Parkway Business Hub</p>
                        <p>New York City, NY 10022 USA</p>
                        <p>HQ Contact: sourcing@vendorbridge.com</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-black text-slate-950">OFFICIAL PURCHASE ORDER</div>
                      <div className="text-xl font-black font-display tracking-tight text-emerald-600 mt-1">{activePO.poNumber}</div>
                      
                      <div className="text-[10px] space-y-0.5 text-slate-500 font-mono text-right mt-3">
                        <p>ORDERED DATE: {new Date(activePO.createdAt).toLocaleString()}</p>
                        <p>SYSTEM RESOLVED CODE: vb-po-{activePO.id}</p>
                        <p>ERP INDEX STATUS: CLEAR SIGNATURE</p>
                      </div>
                    </div>
                  </div>

                  {/* Operational Liaisons address matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 border-b border-slate-100 pb-5">
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1.5">ISSUED ON BEHALF OF:</span>
                      <div className="font-bold text-slate-800 text-xs">VendorBridge Global Procurement Corp</div>
                      <div className="text-slate-500 space-y-0.5 mt-1 select-text">
                        <p>Attn: Chief Sourcing Liaison Specialist</p>
                        <p>GST Ledger registration code ID: GSTID0192384</p>
                        <p>New York Central Office, USA</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1.5">AWARDED SUPPLIER DESTINATION:</span>
                      <div className="font-bold text-slate-800 text-xs">{activePO.vendorName}</div>
                      <div className="text-slate-500 space-y-0.5 mt-1 select-text">
                        <p>Attn: Corporate Accounts representative</p>
                        <p>GST Ledger registry code: {vendors.find(v => v.id === activePO.vendorId)?.gstNumber || 'GSTID0009218'}</p>
                        <p>Physical Site: {vendors.find(v => v.id === activePO.vendorId)?.address || 'Affiliated Suppliers HQ'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Structured Materials Listing Grid */}
                  <div className="w-full overflow-x-auto">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-2">MATERIAL SPECIFICATION MATRIX BROCHURE</span>
                    
                    <table className="w-full border-collapse font-sans mt-2" style={{ tableLayout: 'fixed' }}>
                      <colgroup>
                        <col style={{ width: '45%' }} />
                        <col style={{ width: '12%' }} />
                        <col style={{ width: '13%' }} />
                        <col style={{ width: '15%' }} />
                        <col style={{ width: '15%' }} />
                      </colgroup>
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[9px] font-mono border-b border-slate-200">
                          <th className="p-2.5 text-left font-bold">Line Description Items</th>
                          <th className="p-2.5 text-center font-bold">Quantity</th>
                          <th className="p-2.5 text-center font-bold">Measurable Unit</th>
                          <th className="p-2.5 text-right font-bold">Direct Cost unit</th>
                          <th className="p-2.5 text-right font-bold">Consolidated net total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 border-b border-slate-200">
                        {activePO.items.map((item, idx) => (
                          <tr key={idx} className="text-slate-750">
                            <td className="p-2.5 font-bold text-slate-800 break-words">{item.productName}</td>
                            <td className="p-2.5 text-center font-mono font-bold">{item.quantity}</td>
                            <td className="p-2.5 text-center">{item.unit}</td>
                            <td className="p-2.5 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-slate-900">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Calculations breakdown list */}
                  <div className="mt-6 flex justify-end">
                    <div className="w-64 font-mono space-y-1.5 text-right">
                      <div className="flex justify-between pb-1 text-slate-500 border-b border-slate-100">
                        <span>Items subtotal:</span>
                        <span>{formatCurrency(activePO.subTotal)}</span>
                      </div>
                      <div className="flex justify-between pb-1 text-slate-500 border-b border-slate-100">
                        <span>Corporate standard Tax / GST:</span>
                        <span>{formatCurrency(activePO.tax)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-950 font-sans pt-1">
                        <span>Gross total amount:</span>
                        <span className="text-emerald-700 font-extrabold">{formatCurrency(activePO.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mock Legal disclaimer */}
                  <div className="mt-8 pt-6 border-t border-slate-100 text-[9px] text-slate-400 font-sans leading-relaxed select-none break-words">
                    * Terms and SLA commitments: This purchase order represents a legally binding commitment based on the mutual approval of quotation specifications and SLA criteria. SOW parameters must conform exactly to approved drawings and quality profiles. Late dispatches incur automated SLA penalties.
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
