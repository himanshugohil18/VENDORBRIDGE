/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RFQ, RFQItem, UserRole } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { 
  Plus, Calendar, PlusCircle, Trash, ClipboardList, 
  Send, Eye, SendHorizontal, AlertCircle, Sparkles, CheckCircle2, DollarSign
} from 'lucide-react';

export const Rfqs: React.FC = () => {
  const { 
    currentUser, rfqs, vendors, createRFQ, publishRFQ, 
    deleteRFQ, submitQuotation, quotations 
  } = useApp();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [vendorBidModalOpen, setVendorBidModalOpen] = useState<RFQ | null>(null);

  // Buyers RFQ Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Raw Materials');
  const [deadline, setDeadline] = useState('2026-06-30T17:00');
  const [assigned, setAssigned] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Multi-item dynamic lines states
  const [items, setItems] = useState<Omit<RFQItem, 'id'>[]>([
    { productName: '', quantity: 1, unit: 'Units', description: '', expectedPrice: 100 }
  ]);

  // Vendor Bid state inputs
  const [bidTimeline, setBidTimeline] = useState(10);
  const [bidNotes, setBidNotes] = useState('');
  const [bidPrices, setBidPrices] = useState<Record<string, number>>({});

  // Dynamic lines helpers
  const handleAddItemRow = () => {
    setItems(prev => [...prev, { productName: '', quantity: 1, unit: 'Units', description: '', expectedPrice: 100 }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleItemValueChange = (idx: number, field: keyof Omit<RFQItem, 'id'>, value: any) => {
    setItems(prev => prev.map((item, i) => {
      if (i === idx) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // RFQ Submission
  const handleCreateRFQSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!title.trim()) errs.title = 'Title is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (assigned.length === 0) errs.assigned = 'Please assign at least one supplier vendor.';

    // Check items
    const emptyItems = items.some(it => !it.productName.trim());
    if (emptyItems) errs.items = 'Item names cannot be left blank.';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Package and submit
    const formattedDeadline = new Date(deadline).toISOString();
    const compiledItems: RFQItem[] = items.map((it, i) => ({
      ...it,
      id: `item-${Date.now()}-${i}`
    }));

    const newlyCreated = createRFQ({
      title,
      description,
      category,
      deadline: formattedDeadline,
      assignedVendors: assigned,
      items: compiledItems,
    });

    // Auto publish option for quick demonstration
    publishRFQ(newlyCreated.id);

    setCreateModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Raw Materials');
    setDeadline('2026-06-30T17:00');
    setAssigned([]);
    setItems([{ productName: '', quantity: 1, unit: 'Units', description: '', expectedPrice: 100 }]);
    setErrors({});
  };

  // Vendor bid calculations
  const calculateVendorTotal = (rfq: RFQ) => {
    const subtotal = rfq.items.reduce((sum, item) => {
      const price = bidPrices[item.id] || 0;
      return sum + (item.quantity * price);
    }, 0);
    const tax = Math.round(subtotal * 0.18);
    return { subtotal, tax, grandTotal: subtotal + tax };
  };

  const handleVendorBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorBidModalOpen) return;

    // We assume the vendor bidding is Apex (if role VENDOR is active) or assign based on profile
    const activeVendorId = currentUser.role === UserRole.VENDOR 
      ? (vendors.find(v => v.email === currentUser.email)?.id || 'vendor-apex')
      : 'vendor-apex';

    submitQuotation(
      vendorBidModalOpen.id,
      activeVendorId,
      bidTimeline,
      bidNotes,
      bidPrices
    );

    setVendorBidModalOpen(null);
    setBidNotes('');
    setBidPrices({});
  };

  const rfqStatusStyles = {
    Draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    Open: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse',
    Closed: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    Approved: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    Rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  // Determine what RFQs to show based on Role
  const isVendor = currentUser.role === UserRole.VENDOR;
  const activeVendorId = isVendor 
    ? (vendors.find(v => v.email === currentUser.email)?.id || 'vendor-apex')
    : '';

  const displayedRfqs = isVendor
    ? rfqs.filter(r => r.status === 'Open' && r.assignedVendors.includes(activeVendorId))
    : rfqs;

  return (
    <div className="space-y-6">
      
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white">Requests for Quotation (RFQs)</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Sourcing and competitive bidding operations desk</p>
        </div>

        {!isVendor && (
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg font-sans flex items-center justify-center gap-1.5 transition-all w-fit shadow-md shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Multi-item RFQ</span>
          </button>
        )}
      </div>

      {/* CORE DISPLAY SUMMARY BAR FOR VENDORS */}
      {isVendor && (
        <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-500/[0.03] text-xs leading-relaxed dark:text-slate-350 select-none">
          <span className="font-extrabold uppercase font-mono text-sky-400 block mb-1">📋 SUPPLIER CONTRACT PORTAL</span>
          Each open RFQ assigned to your organization below contains structured technical briefs. Input your optimal pricing breakdown worksheet and expected SOW delivery timeline. Revised pricing sheets replace prior entries.
        </div>
      )}

      {/* LIST OF RFQS */}
      {displayedRfqs.length === 0 ? (
        <div className="py-16 text-center border border-dashed dark:border-slate-800 rounded-2xl">
          <ClipboardList className="w-10 h-10 text-slate-550 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-200">No Active RFQs Listed</h3>
          <p className="text-xs text-slate-400 font-sans mt-1">There are no open requests assigned to your corporate profile at this stage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 select-none">
          {displayedRfqs.map((rfq) => {
            const assignedSuppliers = vendors.filter(v => rfq.assignedVendors.includes(v.id));
            const bidResponses = quotations.filter(q => q.rfqId === rfq.id);
            
            return (
              <div 
                key={rfq.id}
                className="p-5 rounded-xl border dark:bg-slate-900/30 dark:border-slate-850 light:bg-white light:border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-700 dark:hover:border-slate-800 transition-colors group relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-500">{rfq.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${rfqStatusStyles[rfq.status]} font-bold uppercase`}>
                      {rfq.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-200 dark:text-slate-100 font-display mt-2.5 truncate">{rfq.title}</h3>
                  <p className="text-xs text-slate-400 font-sans mt-1.5 leading-relaxed line-clamp-2">{rfq.description}</p>

                  <div className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Closes: {new Date(rfq.deadline).toLocaleDateString()}</span>
                  </div>

                  {/* Pricing Items lists */}
                  <div className="mt-4 pt-3.5 border-t dark:border-slate-850/60 light:border-slate-200">
                    <div className="text-[10px] font-mono font-bold uppercase text-slate-500 mb-2">Item Specifications:</div>
                    <div className="space-y-1.5">
                      {rfq.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs dark:text-slate-300">
                          <span className="font-medium truncate max-w-[200px]">{it.productName}</span>
                          <span className="text-[11px] font-mono text-slate-450 shrink-0">{it.quantity} {it.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* BOTTOM ROW: Dynamic based on role */}
                <div className="mt-6 pt-4 border-t dark:border-slate-850/60 light:border-slate-200 flex items-center justify-between text-[11px]">
                  <div>
                    {!isVendor ? (
                      <span className="text-slate-450 font-mono">Bids Ingested: <span className="font-bold text-emerald-400">{bidResponses.length}</span></span>
                    ) : (
                      <span className="text-emerald-500 font-medium font-sans">Assigned Opportunity</span>
                    )}
                  </div>

                  {isVendor && rfq.status === 'Open' && (
                    <button 
                      onClick={() => {
                        // Prefill current values if quotation exists
                        const existingBid = quotientsForRfq(rfq.id, activeVendorId);
                        if (existingBid) {
                          setBidTimeline(existingBid.deliveryTimeline);
                          setBidNotes(existingBid.notes);
                          const prices: Record<string, number> = {};
                          existingBid.items.forEach(it => {
                            prices[it.rfqItemId] = it.unitPrice;
                          });
                          setBidPrices(prices);
                        } else {
                          const initialPrices: Record<string, number> = {};
                          rfq.items.forEach(it => {
                            initialPrices[it.id] = it.expectedPrice;
                          });
                          setBidPrices(initialPrices);
                        }
                        setVendorBidModalOpen(rfq);
                      }}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-semibold font-sans flex items-center gap-1 transition-all"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>{quotientsForRfq(rfq.id, activeVendorId) ? 'Revise Pricing Plan' : 'Submit Bid Sheet'}</span>
                    </button>
                  )}

                  {!isVendor && (
                    <div className="flex items-center gap-1">
                      {rfq.status === 'Draft' && (
                        <button 
                          onClick={() => publishRFQ(rfq.id)}
                          className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded text-[10px] font-mono transition-all font-bold"
                        >
                          PUBLISH TENDER
                        </button>
                      )}
                      <button 
                        onClick={() => deleteRFQ(rfq.id)}
                        className="p-1 rounded hover:bg-red-500/10 text-red-500"
                        title="Delete RFQ"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Helper finder */}


      {/* --- BUYER / PROCUREMENT CREATE RFQ MODAL --- */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative font-sans">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500" />
            
            <div className="p-5 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Initialize New Multi-Item RFP Proposal</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Define material requirements, assign vetted firms, and set rigid timelines.</p>
            </div>

            <form onSubmit={handleCreateRFQSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1">RFP Tender Title</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Forged Turbine Casting Casts Phase 3"
                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  {errors.title && <span className="text-[10px] text-red-500">{errors.title}</span>}
                </div>
                
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1">Functional SOW description</label>
                  <textarea 
                    required
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe material dimensions, mechanical alloy ratings, testing profiles, and delivery constraints..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  {errors.description && <span className="text-[10px] text-red-500">{errors.description}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1">Sourcing Sector Core</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="IT Infrastructure">IT Infrastructure</option>
                    <option value="Industrial Hardware">Industrial Hardware</option>
                    <option value="Chemical Engineering">Chemical Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1">SLA Submission Deadline</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 text-slate-450"
                  />
                </div>
              </div>

              {/* DYNAMIC LINE ITEM MAKER */}
              <div className="pt-3.5 border-t dark:border-slate-800/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-extrabold uppercase text-emerald-400 tracking-wider">Line Item Specifications List</span>
                  <button 
                    type="button" 
                    onClick={handleAddItemRow}
                    className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add material row</span>
                  </button>
                </div>

                {errors.items && <div className="text-[10px] text-red-500 mb-2">{errors.items}</div>}

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="p-3 rounded bg-slate-950 border border-slate-850 flex flex-col gap-3 relative">
                      {items.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveItemRow(idx)}
                          className="absolute right-2 top-2 p-1.5 text-red-500 hover:bg-slate-900 rounded"
                          title="Remove row"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-12 sm:col-span-6">
                          <label className="block text-[9px] uppercase font-mono text-slate-500 mb-0.5">Product / Material name</label>
                          <input 
                            type="text" 
                            required
                            value={item.productName}
                            onChange={(e) => handleItemValueChange(idx, 'productName', e.target.value)}
                            placeholder="e.g. S355 Structural Rods"
                            className="w-full px-2 py-1.5 rounded border border-slate-800 bg-slate-900 text-slate-100 text-xs"
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-2">
                          <label className="block text-[9px] uppercase font-mono text-slate-500 mb-0.5">Qty</label>
                          <input 
                            type="number" 
                            required
                            min={1}
                            value={item.quantity}
                            onChange={(e) => handleItemValueChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1.5 rounded border border-slate-800 bg-slate-900 text-slate-100 text-xs text-center"
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-2">
                          <label className="block text-[9px] uppercase font-mono text-slate-500 mb-0.5">Unit</label>
                          <input 
                            type="text" 
                            required
                            value={item.unit}
                            onChange={(e) => handleItemValueChange(idx, 'unit', e.target.value)}
                            placeholder="Tons"
                            className="w-full px-2 py-1.5 rounded border border-slate-800 bg-slate-900 text-slate-100 text-xs text-center"
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-2">
                          <label className="block text-[9px] uppercase font-mono text-slate-500 mb-0.5">Expected Price (₹)</label>
                          <input 
                            type="number" 
                            required
                            min={1}
                            value={item.expectedPrice}
                            onChange={(e) => handleItemValueChange(idx, 'expectedPrice', parseInt(e.target.value) || 100)}
                            className="w-full px-2 py-1.5 rounded border border-slate-800 bg-slate-900 text-slate-100 text-xs text-center"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* VENDOR ASSIGNMENTS CHECKBOXES */}
              <div className="pt-3.5 border-t dark:border-slate-800/60 font-sans">
                <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-2">Assign Vetted Supplires *</label>
                {errors.assigned && <span className="text-[10px] text-red-500 block mb-2">{errors.assigned}</span>}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {vendors.filter(v => v.status === 'Active').map(vendor => (
                    <label 
                      key={vendor.id}
                      className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 cursor-pointer transition-all
                        ${assigned.includes(vendor.id) 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold' 
                          : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-350'}`}
                    >
                      <input 
                        type="checkbox"
                        checked={assigned.includes(vendor.id)}
                        onChange={() => {
                          if (assigned.includes(vendor.id)) {
                            setAssigned(prev => prev.filter(id => id !== vendor.id));
                          } else {
                            setAssigned(prev => [...prev, vendor.id]);
                          }
                        }}
                        className="sr-only"
                      />
                      <span>{vendor.companyName} ({vendor.rating.toFixed(1)}★)</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button 
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 hover:bg-slate-800 text-slate-450 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute & Publish Active Tender</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VENDOR ASSIGNED BID/QUOTATION SHEET MODAL --- */}
      {vendorBidModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative font-sans">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-sky-500" />
            
            <div className="p-5 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Interactive Sourcing pricing proposal</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Submit unit prices, notes, and commitments for RFQ: <span className="text-sky-400 font-bold">"{vendorBidModalOpen.title}"</span></p>
            </div>

            <form onSubmit={handleVendorBidSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              {/* Material prices lists */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Materials bidding pricing sheet:</span>
                
                {vendorBidModalOpen.items.map((it) => (
                  <div key={it.id} className="p-3 bg-slate-950 border border-slate-850 rounded-lg flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">{it.productName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Assigned Target Quantity: {it.quantity} {it.unit}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-500">Unit Cost:</span>
                      <div className="relative w-24">
                        <span className="text-[11px] font-mono text-slate-450 absolute left-2 top-2">₹</span>
                        <input 
                          type="number"
                          required
                          min={1}
                          value={bidPrices[it.id] !== undefined ? bidPrices[it.id] : it.expectedPrice}
                          onChange={(e) => {
                            setBidPrices({
                              ...bidPrices,
                              [it.id]: parseInt(e.target.value) || 0
                            });
                          }}
                          className="w-full pl-5 pr-2 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-emerald-400 font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes and delivery columns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-mono font-bold text-slate-400 mb-1.5">SLA delivery (Calendar days)</label>
                  <input 
                    type="number"
                    required
                    min={1}
                    value={bidTimeline}
                    onChange={(e) => setBidTimeline(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs font-mono font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono font-bold text-slate-400 mb-1.5 font-sans">Corporate proposal notes / SOW conditions</label>
                <textarea 
                  rows={2}
                  value={bidNotes}
                  onChange={(e) => setBidNotes(e.target.value)}
                  placeholder="Insert material validation specs, shipping terms, insurance compliance..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs focus:outline-none"
                />
              </div>

              {/* LIVE PRICING CALC MATRIX OVERVIEW */}
              {(() => {
                const calcs = calculateVendorTotal(vendorBidModalOpen);
                return (
                  <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-850/80 font-mono text-[11px] space-y-1.5 text-slate-400">
                    <span className="font-bold text-[9px] uppercase text-emerald-400 block mb-2 font-display tracking-wider">Estimated ERP Bid Summary (18% standard GST)</span>
                    <div className="flex justify-between">
                      <span>Proposals Subtotal:</span>
                      <span className="font-bold text-slate-200">{formatCurrency(calcs.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated standard GST Code:</span>
                      <span>{formatCurrency(calcs.tax)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold font-sans text-emerald-400 pt-2 border-t border-slate-850">
                      <span>Total gross bid amount:</span>
                      <span className="font-mono">{formatCurrency(calcs.grandTotal)}</span>
                    </div>
                  </div>
                );
              })()}

              {/* FOOTER ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button 
                  type="button"
                  onClick={() => setVendorBidModalOpen(null)}
                  className="px-4 py-2 hover:bg-slate-800 text-slate-450 rounded-lg text-xs"
                >
                  Discard Bid
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <SendHorizontal className="w-3.5 h-3.5" />
                  <span>Transmit Official Quote</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );

  // Helper helper
  function quotientsForRfq(rfqId: string, vendId: string) {
    return quotations.find(q => q.rfqId === rfqId && q.vendorId === vendId);
  }
};
