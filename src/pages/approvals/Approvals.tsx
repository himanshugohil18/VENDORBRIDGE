/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApprovalWorkflow, UserRole } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { 
  CheckSquare, ShieldAlert, Clock, CheckCircle2, 
  XCircle, MessageSquare, ChevronRight, CornerDownRight, 
  Calendar, UserCheck, Activity, Award
} from 'lucide-react';

export const Approvals: React.FC = () => {
  const { approvals, processApproval, currentUser, quotations, rfqs } = useApp();
  const [selectedApproval, setSelectedApproval] = useState<ApprovalWorkflow | null>(null);
  const [remarks, setRemarks] = useState('');

  const isManager = currentUser.role === UserRole.MANAGER || currentUser.role === UserRole.ADMIN;

  const getStatusBadge = (status: ApprovalWorkflow['status']) => {
    switch (status as string) {
      case 'Pending':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase font-bold animate-pulse">Pending Review</span>;
      case 'Approved':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-bold">Approved</span>;
      case 'Approved (Level 1 Passed)':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase font-bold animate-pulse">L1 Cleared</span>;
      case 'Rejected':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 uppercase font-bold">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/20 uppercase font-bold">Under Review</span>;
    }
  };

  const handleProcessAction = (status: 'Approved' | 'Rejected') => {
    if (!selectedApproval) return;
    if (!remarks.trim()) {
      alert('Remarks or operational checklist signature are mandatory.');
      return;
    }

    processApproval(
      selectedApproval.id,
      status,
      remarks,
      `${currentUser.firstName} ${currentUser.lastName}`
    );

    setSelectedApproval(null);
    setRemarks('');
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div>
        <h2 className="text-xl font-bold font-display tracking-tight text-white">Administrative Sign-Off Desk</h2>
        <p className="text-xs text-slate-400 font-sans mt-0.5">Approve, reject, and verify active sourcing operations</p>
      </div>

      {/* CORE WORKFLOW WRAPPER DISPLAY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-none font-sans">
        
        {/* Left Side: Pending/Past Approvals List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-4 rounded-xl border dark:bg-slate-900/10 dark:border-slate-850 light:bg-slate-50 light:border-slate-200">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-450 block mb-3 leading-relaxed">
              PLATFORM WORKFLOW CONTRACTS
            </span>

            {approvals.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-sans">No approval flows recorded.</div>
            ) : (
              <div className="space-y-3">
                {approvals.map((appr) => {
                  const isActiveSelection = selectedApproval?.id === appr.id;
                  
                  return (
                    <div 
                      key={appr.id}
                      onClick={() => {
                        setSelectedApproval(appr);
                        setRemarks(appr.managerRemarks || '');
                      }}
                      className={`p-4 rounded-lg border text-left cursor-pointer transition-all flex items-start gap-3.5 group
                        ${isActiveSelection 
                          ? 'border-emerald-500 dark:bg-emerald-950/[0.02] light:bg-emerald-50' 
                          : 'dark:border-slate-850 dark:bg-slate-900/25 dark:hover:bg-slate-900 light:border-slate-200 light:bg-white light:hover:bg-slate-100'}`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {appr.status === 'Approved' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : appr.status === 'Rejected' ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5 text-xs">
                          <span className="font-mono text-[9px] text-slate-500 dark:text-slate-400 font-extrabold">{appr.id}</span>
                          {getStatusBadge(appr.status)}
                        </div>
                        <h4 className="text-sm font-bold text-slate-200 dark:text-slate-100 mt-2 font-display group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors truncate">
                          {appr.title}
                        </h4>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between font-sans leading-relaxed">
                          <span>Requester: {appr.requesterName}</span>
                          <span className="font-mono text-[10px] text-slate-450">{new Date(appr.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed interactive checklist card */}
        <div className="lg:col-span-6">
          {!selectedApproval ? (
            <div className="p-8 text-center border border-dashed dark:border-slate-800 rounded-xl py-16">
              <CheckSquare className="w-10 h-10 text-slate-550 mx-auto mb-3 animate-pulse" />
              <h3 className="text-sm font-semibold text-slate-200">No Target Active Workflow Chosen</h3>
              <p className="text-xs text-slate-400 mt-1">Select any approval folder block from the left panel to examine records.</p>
            </div>
          ) : (
            <div className="p-5 rounded-xl border dark:bg-slate-900/30 dark:border-slate-850 light:bg-white light:border-slate-250 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b dark:border-slate-850 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-500">{selectedApproval.id}</span>
                    <h3 className="text-sm font-bold text-slate-100 font-display mt-0.5">{selectedApproval.title}</h3>
                  </div>
                  {getStatusBadge(selectedApproval.status)}
                </div>

                {/* Sub-item Specifications */}
                {(() => {
                  if (selectedApproval.targetType === 'QUOTATION') {
                    const quote = quotations.find(q => q.id === selectedApproval.targetId);
                    if (!quote) return null;
                    return (
                      <div className="my-4 p-3.5 rounded bg-slate-950 font-mono text-xs text-slate-400 space-y-2">
                        <span className="font-bold text-[9px] uppercase text-emerald-450 block font-display tracking-wider">Detailed Bid Submittals:</span>
                        <div className="flex justify-between">
                          <span>Supplier:</span>
                          <span className="font-bold text-slate-200">{quote.vendorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>SLA Turnaround Timeline:</span>
                          <span className="font-bold text-slate-100">{quote.deliveryTimeline} Days</span>
                        </div>
                        <div className="flex justify-between text-emerald-400 border-t border-slate-900 pt-2 font-bold mb-2">
                          <span>Direct Gross Total:</span>
                          <span>{formatCurrency(quote.grandTotal)}</span>
                        </div>

                        {/* Breakdown */}
                        <div className="space-y-1 pt-2 border-t border-slate-900/50">
                          {quote.items.map((it, i) => (
                            <div key={i} className="flex justify-between text-[11px] font-sans">
                              <span className="truncate max-w-[170px]">{it.productName}</span>
                              <span className="font-mono text-slate-350">{formatCurrency(it.totalPrice)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* STEPS TIMELINE */}
                <div className="mt-5 space-y-3 font-sans">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Audit Sign-off Chronology</span>
                  
                  {selectedApproval.timeline.map((step, idx) => (
                    <div key={idx} className="flex gap-3 text-xs leading-relaxed">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10 mt-1.5" />
                        {idx < selectedApproval.timeline.length - 1 && (
                          <div className="w-[1.5px] flex-1 bg-slate-800 my-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="font-semibold text-slate-200 flex justify-between items-center text-[11px]">
                          <span>{step.status}</span>
                          <span className="text-[9px] font-mono text-slate-450">{new Date(step.date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium italic">"{step.remark}"</div>
                        <div className="text-[9px] font-mono text-slate-500 mt-0.5">Author: {step.user}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS FOR MANAGER */}
              <div className="mt-6 pt-4 border-t dark:border-slate-850/60 light:border-slate-200">
                {selectedApproval.status === 'Pending' || (selectedApproval.status as string) === 'Approved (Level 1 Passed)' ? (
                  (selectedApproval.status as string) === 'Approved (Level 1 Passed)' && currentUser.role !== UserRole.ADMIN ? (
                    <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/[0.03] text-xs text-purple-400 font-sans flex items-start gap-2.5">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <strong>Level 1 Clearance Cleared:</strong> Signed off successfully by manager. Dual Stage requires a final Level 2 approval signature from an <strong>ADMINISTRATOR</strong> profile. Switch personas at the bottom of the sidebar to sign off.
                      </div>
                    </div>
                  ) : isManager ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold text-slate-450 mb-1.5">
                          {(selectedApproval.status as string) === 'Approved (Level 1 Passed)' ? "Level 2 Admin Sourcing checklist Remarks *" : "Manager Sourcing Checklist Remarks *"}
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder="Assign remarks, compliance clearances, budget codes, terms approvals..."
                          className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          onClick={() => handleProcessAction('Rejected')}
                          className="py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg text-xs font-semibold font-sans flex items-center justify-center gap-1.5 transition-all text-ellipsis overflow-hidden whitespace-nowrap"
                        >
                          <XCircle className="w-4 h-4 shrink-0" />
                          <span>Disapprove Contract</span>
                        </button>
                        <button
                          onClick={() => handleProcessAction('Approved')}
                          className="py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold font-sans flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/15 transition-all text-ellipsis overflow-hidden whitespace-nowrap"
                        >
                          <UserCheck className="w-4 h-4 shrink-0" />
                          <span>{(selectedApproval.status as string) === 'Approved (Level 1 Passed)' ? "Authorize Level 2 & PO" : "Authorize Level 1 Signoff"}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border border-red-500/10 bg-red-500/[0.02] text-xs text-red-400 font-sans flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Viewing with basic credentials. You must use the quick selector role switches below to swap to **MANAGER** or **ADMIN** profile to sign contracts.</span>
                    </div>
                  )
                ) : (
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg text-center font-mono text-[10px] font-bold text-emerald-400">
                    RESOLVED CONTRACT SECURE SIGNATURE STATE RECORDED
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};
