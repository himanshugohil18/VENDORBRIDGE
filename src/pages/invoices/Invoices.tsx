/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice, UserRole } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { 
  Receipt, FileCheck, CircleDollarSign, Calendar, Eye, 
  Printer, Coins, Landmark, AlertCircle, TrendingUp
} from 'lucide-react';

export const Invoices: React.FC = () => {
  const { invoices, updateInvoiceStatus, currentUser, vendors } = useApp();
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'Paid':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-bold">Paid Settled</span>;
      case 'Unpaid':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase font-bold animate-pulse">Unpaid Due</span>;
      case 'Overdue':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 uppercase font-bold">Overdue Alert</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/20 uppercase font-bold">Draft</span>;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalOutstanding = invoices
    .filter(i => i.status === 'Unpaid' || i.status === 'Overdue')
    .reduce((sum, current) => sum + current.grandTotal, 0);

  const totalPaid = invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, current) => sum + current.grandTotal, 0);

  return (
    <div className="space-y-6">
      
      {/* HEADER ROW */}
      <div>
        <h2 className="text-xl font-bold font-display tracking-tight text-white">Invoices & Settlements</h2>
        <p className="text-xs text-slate-400 font-sans mt-0.5 font-sans">Verify vendor billings, taxes (18% GST), and reconcile accounts</p>
      </div>

      {/* QUICK INVOICE ACCOUNTING METRICS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 select-none font-sans print:hidden">
        <div className="p-4 rounded-xl border dark:bg-slate-900/40 dark:border-slate-850 light:bg-white light:border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Accounts Paid Settled</span>
            <div className="text-xl font-bold font-display mt-0.5 text-emerald-500">{formatCurrency(totalPaid)}</div>
            <div className="text-[9px] text-slate-400 mt-1 font-mono">Bank cleared ledger funds</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500">
            <Coins className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl border dark:bg-slate-900/40 dark:border-slate-850 light:bg-white light:border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-sans">Accounts Payable Outstanding</span>
            <div className="text-xl font-bold font-display mt-0.5 text-amber-500">{formatCurrency(totalOutstanding)}</div>
            <div className="text-[9px] text-slate-450 mt-1 font-mono">Simulated net liability</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500">
            <Landmark className="w-4 h-4" />
          </div>
        </div>

        <div className="p-4 rounded-xl border dark:bg-slate-900/40 dark:border-slate-850 light:bg-white light:border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">General GST liability</span>
            <div className="text-xl font-bold font-display mt-0.5 text-slate-350 dark:text-slate-200">
              {formatCurrency(Math.round((totalPaid + totalOutstanding) * 0.18))}
            </div>
            <div className="text-[9px] text-slate-400 mt-1 font-mono">Estimated standard 18% tax index</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-500/10 border border-slate-500/25 flex items-center justify-center text-slate-400">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* DETAILED CONTENT LIST */}
      {invoices.length === 0 ? (
        <div className="py-12 text-center border border-dashed dark:border-slate-800 rounded-xl">
          <Receipt className="w-10 h-10 text-slate-550 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">Invoices registry empty</h3>
          <p className="text-xs text-slate-400 mt-1">Accept sourcing proposals as a manager first to trigger automated order billings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-none font-sans print:grid-cols-1">
          
          {/* Left Side: Billings Listings */}
          <div className="lg:col-span-4 space-y-3.5 print:hidden">
            <div className="p-4 rounded-xl border dark:bg-slate-900/10 dark:border-slate-850 light:bg-slate-50 light:border-slate-200">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-3 font-display">
                SOCIETY BILLINGS LEDGERS
              </span>

              <div className="space-y-2.5">
                {invoices.map(inv => {
                  const isActive = activeInvoice?.id === inv.id;
                  
                  return (
                    <div
                      key={inv.id}
                      onClick={() => setActiveInvoice(inv)}
                      className={`p-4 rounded-lg border text-left cursor-pointer transition-all flex items-start justify-between gap-2.5
                        ${isActive 
                          ? 'border-emerald-500 dark:bg-emerald-950/[0.03] light:bg-emerald-50' 
                          : 'dark:border-slate-850 dark:bg-slate-900/20 light:border-slate-200 light:bg-white hover:bg-slate-500/5'}`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-black text-slate-200">{inv.invoiceNumber}</span>
                          {getStatusBadge(inv.status)}
                        </div>
                        <h4 className="text-xs font-bold font-display text-slate-350 truncate mt-1.5">{inv.vendorName}</h4>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">{inv.poNumber}</div>
                      </div>
                      
                      <div className="text-right font-mono text-xs font-bold text-slate-300 shrink-0">
                        {formatCurrency(inv.grandTotal)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Side: Document viewer Sheet */}
          <div className="lg:col-span-8 print:col-span-1 border dark:border-slate-850 light:border-slate-200 rounded-xl bg-slate-100/5 p-5">
            {!activeInvoice ? (
              <div className="py-24 text-center">
                <p className="text-xs text-slate-500 font-mono">Select any billing index block from the left panel to examine tax ledgers and audit records.</p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Simulated toolbar */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-850 print:hidden">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <AlertCircle className="w-4 h-4 text-emerald-500" />
                    <span>Settlement reconciliations desk</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Settlement adjust dropdown limited to ADMIN and PROCUREMENT */}
                    {[UserRole.ADMIN, UserRole.PROCUREMENT].includes(currentUser.role) ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-450 uppercase font-bold">SET STATUS:</span>
                        <select 
                          value={activeInvoice.status}
                          onChange={(e) => {
                            updateInvoiceStatus(activeInvoice.id, e.target.value as any);
                            setActiveInvoice({ ...activeInvoice, status: e.target.value as any });
                          }}
                          className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono font-bold text-emerald-400 focus:outline-none"
                        >
                          <option value="Paid">Paid</option>
                          <option value="Unpaid">Unpaid</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-450 uppercase font-bold">READ ONLY PERMISSIONS</span>
                    )}
                    
                    <button 
                      onClick={handlePrint}
                      className="p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded text-slate-350 hover:text-white transition-all text-[11px] font-bold flex items-center gap-1 shrink-0"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print billing</span>
                    </button>
                  </div>
                </div>

                {/* THE SIMULATED DIGITAL INVOICE SHEET */}
                <div id="printable-sheet" className="bg-white text-slate-900 p-8 rounded-xl border border-slate-200 shadow-xl font-sans text-xs">
                  
                  {/* Top Billing rows */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-slate-950 flex items-center justify-center text-white font-extrabold text-xs">VB</div>
                        <div>
                          <div className="text-xs font-extrabold text-slate-950 tracking-tight">VENDORBRIDGE CO.</div>
                          <div className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Procurement accounting division</div>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 mt-2.5 space-y-0.5 font-sans">
                        <p>102 Corporate Parkway Business Hub</p>
                        <p>New York City, NY 10022 USA</p>
                        <p>Liaison: invoicing-finance@vendorbridge.com</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">OFFICIAL BILLING RECORD</div>
                      <div className="text-lg font-black text-slate-950 mt-1">{activeInvoice.invoiceNumber}</div>
                      
                      <div className="text-[10px] space-y-0.5 text-slate-500 font-mono text-right mt-2.5">
                        <p>ASSOCIATED PO NO: {activeInvoice.poNumber}</p>
                        <p>LEDGER DISBURSEMENT ID: {activeInvoice.id.slice(0, 15)}</p>
                        <p>SETTLEMENT CODE: ERP-{activeInvoice.invoiceNumber.split('-')[1]}</p>
                      </div>
                    </div>
                  </div>

                  {/* Operational Liaisons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 border-b border-slate-100 pb-5">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">RECIPIENT ACCOUNTS DUE:</span>
                      <div className="font-bold text-slate-900 text-[11px] break-words">VendorBridge Global Procurement Corp</div>
                      <div className="text-slate-500 space-y-0.5 mt-1 font-sans text-xs select-text">
                        <p className="break-words">Central Accounts Payable center</p>
                        <p className="break-words">Central NY finance depot office</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">INVOICING SUPPLIER ORIGIN:</span>
                      <div className="font-bold text-slate-950 text-[11px] break-words">{activeInvoice.vendorName}</div>
                      <div className="text-slate-500 space-y-0.5 mt-1 font-sans text-xs select-text">
                        <p className="break-words">Affiliated Supplier Finance desk</p>
                        <p className="break-words">GSTIN tax registration ID: {vendors.find(v => v.id === activeInvoice.vendorId)?.gstNumber || 'GSTID000109'}</p>
                        <p className="break-words">Headquarters office: {vendors.find(v => v.id === activeInvoice.vendorId)?.address || 'Affiliated Suppliers'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Materials line listings */}
                  <div className="w-full overflow-x-auto">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">BILLING MATERIALS & SOW DETAILS</span>
                    
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
                          <th className="p-2 text-left font-bold">Direct Line Item Specs</th>
                          <th className="p-2 text-center font-bold">Quantity</th>
                          <th className="p-2 text-center font-bold">Measurable Unit</th>
                          <th className="p-2 text-right font-bold">Tax Unit price</th>
                          <th className="p-2 text-right font-bold">Gross lines subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 border-b border-slate-150 text-slate-700">
                        {activeInvoice.items.map((item, idx) => (
                          <tr key={idx} className="text-xs">
                            <td className="p-2 font-bold text-slate-800 break-words">{item.productName}</td>
                            <td className="p-2 text-center font-mono font-bold">{item.quantity}</td>
                            <td className="p-2 text-center">{item.unit || 'Units'}</td>
                            <td className="p-2 text-right font-mono">{formatCurrency(item.price)}</td>
                            <td className="p-2 text-right font-mono font-bold text-slate-900">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Total Calculations */}
                  <div className="mt-5 flex justify-end">
                    <div className="w-64 font-mono space-y-1 text-right text-xs">
                      <div className="flex justify-between pb-1 text-slate-500 border-b border-slate-100">
                        <span>Items subtotal:</span>
                        <span className="font-bold text-slate-800">{formatCurrency(activeInvoice.subtotal)}</span>
                      </div>
                      <div className="flex justify-between pb-1 text-slate-500 border-b border-slate-100">
                        <span>Standard 18% GST element:</span>
                        <span className="font-bold text-slate-800">{formatCurrency(activeInvoice.tax)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-slate-950 font-sans pt-1 border-t border-slate-200">
                        <span>Grand settled amount:</span>
                        <div className="flex flex-col">
                          <span className="text-emerald-700 text-sm font-black">{formatCurrency(activeInvoice.grandTotal)}</span>
                          <span className="text-[10px] font-mono font-bold text-slate-500 mt-0.5">{getStatusBadge(activeInvoice.status)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Settlement conditions */}
                  <div className="mt-8 pt-5 border-t border-slate-100 text-[9px] text-slate-400 font-sans leading-relaxed select-none break-words">
                    * Terms of settlement: All invoices require payment within 30 days of dispatch validation. Overdue invoices accrue simulated finance log penalties at 1.5% monthly compound. Settlement state toggles automatically notify the vendor database.
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
