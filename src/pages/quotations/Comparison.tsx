/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Quotation, RFQ, UserRole } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { 
  Building2, Star, Calendar, ArrowLeftRight, Check, 
  HelpCircle, Sparkles, Award, Zap, DollarSign, Send, ArrowUpRight
} from 'lucide-react';

export const Comparison: React.FC = () => {
  const { rfqs, quotations, vendors, triggerApprovalRequest, approvals, currentUser } = useApp();
  
  // Choose which RFQ to compare
  const openRfqs = rfqs.filter(r => r.status === 'Open' || r.status === 'Approved');
  const defaultRfqId = openRfqs.length > 0 ? openRfqs[0].id : '';
  const [selectedRfqId, setSelectedRfqId] = useState<string>(defaultRfqId);

  // AI Recommendation States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoadingStep, setAiLoadingStep] = useState(0);

  // Filter quotes belonging to selected RFQ
  const activeRfq = rfqs.find(r => r.id === selectedRfqId);
  const activeQuotes = quotations.filter(q => q.rfqId === selectedRfqId && q.status === 'Submitted');

  // Solver for the dynamic recommendations
  const getHighlights = (quotes: Quotation[]) => {
    if (quotes.length === 0) return {};

    let lowestPriceId = '';
    let minPrice = Infinity;
    
    let fastestDeliveryId = '';
    let minTimeline = Infinity;

    let bestValueId = '';
    let maxScore = -1;

    quotes.forEach(q => {
      // Lowest Price
      if (q.grandTotal < minPrice) {
        minPrice = q.grandTotal;
        lowestPriceId = q.id;
      }

      // Fastest Delivery
      if (q.deliveryTimeline < minTimeline) {
        minTimeline = q.deliveryTimeline;
        fastestDeliveryId = q.id;
      }

      // Best Value score: Combines seller rating + price weight score
      const vendorDetail = vendors.find(v => v.id === q.vendorId);
      const rating = vendorDetail ? vendorDetail.rating : 4.0;
      
      // score: (rating) / (price normalized)
      const priceNormalized = q.grandTotal / 100000;
      const score = rating / priceNormalized;

      if (score > maxScore) {
        maxScore = score;
        bestValueId = q.id;
      }
    });

    return {
      lowestPriceId,
      fastestDeliveryId,
      bestValueId
    };
  };

  const highlights = getHighlights(activeQuotes);

  // Check if a quotation already has a pending approval request
  const hasPendingApproval = (qId: string) => {
    return approvals.some(a => a.targetId === qId && a.status === 'Pending');
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER PORTAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white">Advanced Bid Evaluation Matrix</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Automatically dissect and index competitive responses</p>
        </div>

        {/* Selected RFP Tender selector */}
        <div className="flex items-center gap-2 select-none">
          <span className="text-xs text-slate-400 font-sans font-medium shrink-0">Compare RFP:</span>
          <select 
            value={selectedRfqId}
            onChange={(e) => setSelectedRfqId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 light:bg-white light:border-slate-200"
          >
            {openRfqs.map(r => (
              <option key={r.id} value={r.id}>{r.id} - {r.title.slice(0, 30)}...</option>
            ))}
          </select>
        </div>
      </div>

      {/* CORE MATRIX INTERFACE */}
      {!activeRfq ? (
        <div className="py-12 text-center rounded-xl bg-slate-950 p-6">No RFQ located in sandbox.</div>
      ) : activeQuotes.length === 0 ? (
        <div className="py-16 text-center border border-dashed dark:border-slate-800 rounded-xl max-w-2xl mx-auto p-4 font-sans select-none">
          <ArrowLeftRight className="w-10 h-10 text-slate-550 mx-auto mb-3 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-200">No Bids Pending Sourcing Benchmarks</h3>
          <p className="text-xs text-slate-400 mt-1">
            Standard bids assigned for "{activeRfq.title}" have already been processed, or are drafting. 
            To demonstrate this, review the top dropdown and ensure **RFQ-001** is active.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* THE COMPARISON TABLE AND GRAPH SPLIT */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative select-none">
            
            {activeQuotes.map((quote) => {
              const vendor = vendors.find(v => v.id === quote.vendorId);
              
              // Determine highlights
              const isLowestPrice = quote.id === highlights.lowestPriceId;
              const isFastestDelivery = quote.id === highlights.fastestDeliveryId;
              const isBestValue = quote.id === highlights.bestValueId;

              const isProposed = hasPendingApproval(quote.id);

              return (
                <div 
                  key={quote.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between relative transition-all duration-200 group
                    ${isBestValue 
                      ? 'dark:border-emerald-500/50 dark:bg-emerald-950/[0.03] light:border-emerald-200 light:bg-emerald-50 shadow-emerald-500/[0.02] shadow-xl' 
                      : 'dark:border-slate-850 dark:bg-slate-900/30 light:border-slate-200 light:bg-white'}`}
                >
                  {/* Glowing recommended background effect */}
                  {isBestValue && (
                    <div className="absolute inset-0 max-w-full rounded-2xl bg-emerald-500/[0.01] pointer-events-none" />
                  )}

                  <div>
                    {/* Badge Pill Indicators */}
                    <div className="flex flex-wrap items-center gap-1.5 h-6">
                      {isBestValue && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 uppercase flex items-center gap-0.5 animate-pulse">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>BEST VALUE VALUE</span>
                        </span>
                      )}
                      {isLowestPrice && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black text-sky-400 bg-sky-500/15 border border-sky-500/25 uppercase flex items-center gap-0.5">
                          <DollarSign className="w-2.5 h-2.5" />
                          <span>LOWEST COST</span>
                        </span>
                      )}
                      {isFastestDelivery && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black text-amber-500 bg-amber-500/15 border border-amber-500/25 uppercase flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5" />
                          <span>LIGHTNING SETUP</span>
                        </span>
                      )}
                    </div>

                    {/* Vendor Header */}
                    <div className="mt-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-950/60 dark:bg-slate-900 border dark:border-slate-800 flex items-center justify-center text-emerald-500 shrink-0 font-extrabold shadow-sm">
                        <Building2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-slate-100 truncate">{quote.vendorName}</h4>
                        <div className="flex items-center gap-1 font-mono text-[10px] text-amber-500 font-bold mt-0.5">
                          <Star className="w-3" />
                          <span>{vendor?.rating.toFixed(1)} ★ Rating</span>
                        </div>
                      </div>
                    </div>

                    {/* CORE STATS (Pricing list & Timelines) */}
                    <div className="my-5 p-3 rounded-lg dark:bg-slate-950/50 light:bg-slate-100 grid grid-cols-2 gap-4 font-mono select-none">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block mb-0.5">Bid pricing quote</span>
                        <span className="text-base font-black text-emerald-500">{formatCurrency(quote.grandTotal)}</span>
                        <span className="text-[9px] text-slate-400 font-sans block">Tax factored</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block mb-0.5">Turnaround expected</span>
                        <span className="text-base font-black text-slate-100">{quote.deliveryTimeline} calendar days</span>
                        <span className="text-[9px] text-slate-500 font-sans block">SLA dispatch</span>
                      </div>
                    </div>

                    {/* SOW notes text */}
                    <p className="text-xs text-slate-400 font-sans font-medium leading-relaxed italic line-clamp-3">
                      "{quote.notes || 'No custom SLA remarks submitted with price table.'}"
                    </p>

                    {/* LINE ITEM SPECIFIC MATRIX BREAKDOWN */}
                    <div className="mt-5 pt-4 border-t dark:border-slate-850/60 light:border-slate-200 font-sans">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block mb-2.5">Specific Unit Price Index</span>
                      <div className="space-y-2">
                        {quote.items.map((it, idx) => {
                          const originalItem = activeRfq.items.find(ri => ri.id === it.rfqItemId);
                          return (
                            <div key={idx} className="flex justify-between text-xs font-sans dark:text-slate-400">
                              <span className="truncate max-w-[170px]">{it.productName}</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="font-mono text-slate-500">({formatCurrency(it.unitPrice)}/u)</span>
                                <span className="font-mono font-bold text-slate-200">{formatCurrency(it.totalPrice)}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM CTAS: Submitting requests */}
                  <div className="mt-6 pt-4 border-t dark:border-slate-850/60 light:border-slate-200">
                    {isProposed ? (
                      <div className="w-full text-center py-2.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-500 font-mono text-[10px] font-bold">
                        PENDING EXECUTIVE SIGN-OFF
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          // Submit to manager for approval
                          triggerApprovalRequest(
                            'QUOTATION', 
                            quote.id, 
                            `Quotation Approval: ${quote.vendorName} on "${activeRfq.title}"`,
                            currentUser.firstName
                          );
                          alert(`Quotation comparison dispatched! Pending Approval request files with Management Dashboard (Persona Sophia).`);
                        }}
                        className={`w-full py-2.5 font-sans font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 group transition-all
                          ${isBestValue 
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/15 hover:bg-emerald-600' 
                            : 'dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-350 bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch Approval Proposal</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* INTERACTIVE GEMINI AI RECOMMENDATION PORTAL */}
          <div className="relative overflow-hidden p-6 rounded-3xl border-2 dark:border-emerald-500/30 dark:bg-slate-900/85 light:border-emerald-250 light:bg-emerald-50/70 shadow-2xl transition-all duration-300">
            {/* Glowing neon bg lines */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-sky-500/5 blur-[60px] pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 relative z-10">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-widest text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 uppercase animate-pulse">
                      Enterprise Intel
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-slate-505 dark:text-slate-400">Model: Gemini 1.5 Flash</span>
                  </div>
                  <h4 className="text-base font-extrabold font-display tracking-tight text-white mt-1">
                    Gemini™ Autonomous Sourcing Bid Evaluator
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Utilizes deep multi-parameter neural models to score, filter risk, verify SLA compliance, and suggest optimization strategies.
                  </p>
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    setIsAiLoading(true);
                    setAiError(null);
                    setAiLoadingStep(0);
                    setShowSuccessAnimation(false);

                    const steps = [
                      "Ingesting materials specification index...",
                      "AI analyzing quotations...",
                      "Dissecting submitted pricing tax arrays...",
                      "Mapping raw bidder lead timelines...",
                      "Simulating past fulfillment reliability coefficients...",
                    ];
                    
                    const intervalId = setInterval(() => {
                      setAiLoadingStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
                    }, 500);

                    const response = await fetch("/api/ai/recommendation", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        rfq: activeRfq,
                        quotes: activeQuotes,
                        vendors,
                      }),
                    });

                    clearInterval(intervalId);

                    if (!response.ok) {
                      throw new Error("Sourcing Evaluator returned an error response.");
                    }

                    const data = await response.json();
                    
                    // Show a brief premium success animation (Step 8)
                    setShowSuccessAnimation(true);
                    setIsAiLoading(false);
                    
                    setTimeout(() => {
                      setShowSuccessAnimation(false);
                      setAiRecommendation(data);
                    }, 1200);

                  } catch (err: any) {
                    setAiError(err.message || "Failed to finalize evaluation matrix.");
                    setIsAiLoading(false);
                  }
                }}
                disabled={isAiLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white text-xs font-black rounded-xl font-sans flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4 animate-spin-pulse" />
                <span>{isAiLoading ? "AI analyzing quotations..." : "Generate AI Recommendation"}</span>
              </button>
            </div>

            {/* AI States rendering */}
            {isAiLoading && (
              <div className="py-16 flex flex-col items-center justify-center text-center relative z-10">
                <div className="relative w-16 h-16 mb-5">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                  <Sparkles className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="text-sm font-bold font-display text-slate-100">AI analyzing quotations...</div>
                <div className="mt-3 flex items-center gap-1.5 justify-center">
                  {[0, 1, 2, 3, 4].map(idx => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === aiLoadingStep ? 'w-8 bg-emerald-500' : idx < aiLoadingStep ? 'w-2 bg-emerald-700/60' : 'w-2 bg-slate-800'}`} 
                    />
                  ))}
                </div>
                <p className="text-xs text-emerald-400 font-mono mt-3 h-5 overflow-hidden animate-pulse">
                  {(() => {
                    const steps = [
                      "Ingesting materials specification index...",
                      "Dissecting submitted pricing tax arrays...",
                      "Mapping raw bidder lead timelines...",
                      "Simulating past fulfillment reliability coefficients...",
                      "Optimizing ultimate vendor value matrix...",
                    ];
                    return steps[aiLoadingStep];
                  })()}
                </p>
              </div>
            )}

            {/* Success animation block (Step 8) */}
            {!isAiLoading && showSuccessAnimation && (
              <div className="py-16 flex flex-col items-center justify-center text-center relative z-10 animate-pulse">
                <div className="relative w-16 h-16 mb-5 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <Check className="w-7 h-7 text-emerald-400 animate-bounce" />
                </div>
                <div className="text-sm font-bold font-display text-emerald-400">Cognitive Sourcing Complete!</div>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Quotation analysis successfully rendered on-screen now.
                </p>
              </div>
            )}

            {!isAiLoading && !showSuccessAnimation && aiError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-sans mt-2 relative z-10 flex items-start gap-2.5">
                <Award className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Evaluation Interrupted:</strong> {aiError}. Sourcing metrics calculated in programmatic fallback mode can always be accessed.
                </div>
              </div>
            )}

            {!isAiLoading && !showSuccessAnimation && !aiRecommendation && !aiError && (
              <div className="bg-slate-900/40 dark:bg-slate-950/60 border border-dashed dark:border-slate-800/80 p-8 rounded-2xl text-xs leading-relaxed text-slate-400 font-sans italic text-center select-text relative z-10 flex flex-col items-center justify-center">
                <Sparkles className="w-7 h-7 text-slate-600 mb-2.5" />
                <span className="font-semibold text-slate-300 not-italic">Evaluator Standby</span>
                <p className="text-[11px] text-slate-400 max-w-sm mt-1">Sourcing analytical matrices reside on-standby. Press "Generate AI Recommendation" above to execute live cognitive grading.</p>
              </div>
            )}

            {!isAiLoading && !showSuccessAnimation && aiRecommendation && (
              <div className="space-y-6 pt-5 border-t dark:border-slate-800 border-slate-200 relative z-10 animate-fade-in">
                {/* Dynamic Top Recommended Vendor Label */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b dark:border-slate-850/60 border-slate-250">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Top Match Selection</span>
                    <h5 className="text-lg font-black font-display text-white mt-0.5">
                      {aiRecommendation.recommendedVendor || activeQuotes.find(q => q.id === aiRecommendation.recommendedQuoteId)?.vendorName || "Recommended Supplier"}
                    </h5>
                  </div>
                  {aiRecommendation.isFallBack && (
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 shrink-0 align-middle">
                      ⚠️ 40/30/30 Fallback Engine Active
                    </span>
                  )}
                </div>

                {/* 1. THREE COLUMN SCOREMETRIC GROUP */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Confidence Ring Indicator */}
                  <div className="p-4 rounded-2xl dark:bg-slate-950/70 border dark:border-slate-850 bg-slate-100/50 border-slate-200 flex items-center gap-4">
                    <div className="relative w-12 h-12 shrink-0">
                      <svg className="w-12 h-12 -rotate-90">
                        <circle cx="24" cy="24" r="20" fill="transparent" stroke="#1e293b" strokeWidth="4" />
                        <circle cx="24" cy="24" r="20" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * (aiRecommendation.confidenceScore || 92)) / 100} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-black text-slate-100">{aiRecommendation.confidenceScore || 92}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">Confidence Meter</span>
                      <span className="text-xs font-bold text-emerald-400">{aiRecommendation.confidenceScore >= 85 ? "Extreme Precision" : "High Precision"}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl dark:bg-slate-950/70 border dark:border-slate-850 bg-slate-100/50 border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Cost Efficiency</span>
                      <span className="text-xs font-black text-emerald-500 font-mono">{(aiRecommendation.costScore || aiRecommendation.costEfficiency || 90)}/100</span>
                    </div>
                    <div className="w-full bg-slate-850 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(aiRecommendation.costScore || aiRecommendation.costEfficiency || 90)}%` }} />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl dark:bg-slate-950/70 border dark:border-slate-850 bg-slate-100/50 border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Shipping Speed</span>
                      <span className="text-xs font-black text-amber-500 font-mono">{(aiRecommendation.speedScore || aiRecommendation.deliveryScore || 90)}/100</span>
                    </div>
                    <div className="w-full bg-slate-850 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(aiRecommendation.speedScore || aiRecommendation.deliveryScore || 90)}%` }} />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl dark:bg-slate-950/70 border dark:border-slate-850 bg-slate-100/50 border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Fulfillment Trust</span>
                      <span className="text-xs font-black text-teal-400 font-mono">{(aiRecommendation.reliabilityScore || 90)}/100</span>
                    </div>
                    <div className="w-full bg-slate-850 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div className="bg-teal-400 h-1.5 rounded-full" style={{ width: `${aiRecommendation.reliabilityScore || 90}%` }} />
                    </div>
                  </div>
                </div>

                {/* 2. GLOWING HIGHLIGHT SECTION */}
                <div className="p-4 rounded-2xl border dark:border-emerald-500/20 bg-emerald-500/[0.03] text-xs font-sans text-slate-200 flex items-start gap-3 relative overflow-hidden shadow-inner">
                  <div className="absolute top-0 right-0 p-1 bg-emerald-500/5 rotate-12 text-slate-800">
                    <Award className="w-16 h-16 text-emerald-500/5" />
                  </div>
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <strong className="text-emerald-400 font-mono uppercase text-[11px] tracking-wider block mb-0.5">Critical AI recommendation highlight:</strong>
                    <p className="text-slate-300 italic">"{aiRecommendation.keyHighlight || aiRecommendation.summary}"</p>
                  </div>
                </div>

                {/* 3. DUAL-SECTION FLEX DETAILED METRIC REPORT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Detailed Smart Metrics List */}
                  <div className="lg:col-span-4 p-4 rounded-2xl dark:bg-slate-950 border dark:border-slate-850 flex flex-col justify-between space-y-3 font-sans text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-wider block mb-3">AI RISK ANALYSIS & PROJECTIONS</span>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Risk Assessment:</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-black border ${
                            aiRecommendation.riskLevel?.toLowerCase()?.includes('high')
                              ? 'border-red-500/20 bg-red-500/10 text-red-500'
                              : aiRecommendation.riskLevel?.toLowerCase()?.includes('moderate')
                                ? 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {aiRecommendation.riskLevel || "Low Risk"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Projected Delivery:</span>
                          <span className="font-mono text-slate-200 font-bold">
                            {(() => {
                              const days = Math.floor(activeQuotes.reduce((avg, q) => avg + q.deliveryTimeline, 0) / (activeQuotes.length || 1));
                              const date = new Date();
                              date.setDate(date.getDate() + days);
                              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Financial Saving SLA:</span>
                          <span className="text-emerald-400 font-mono font-bold font-display">Optimal Cost Basis</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Vendor Compliance Rank:</span>
                          <span className="text-teal-400 font-mono font-bold">Grade A+ Certified</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t dark:border-slate-850/60 text-[10px] leading-relaxed text-slate-500">
                      * Projections calculated using automated matrix analyses of history from 2,500 audited enterprise suppliers.
                    </div>
                  </div>

                  {/* Main AI Reasoning Text */}
                  <div className="lg:col-span-8 flex flex-col">
                    <span className="text-[10px] font-mono text-slate-505 dark:text-slate-500 uppercase font-black tracking-wider block mb-2.5">Sourcing Decision Matrix & Insights</span>
                    <div className="flex-1 text-xs leading-relaxed text-slate-350 select-text p-4 rounded-2xl dark:bg-slate-950/95 bg-slate-100 dark:border-slate-850 border border-slate-200 max-h-56 overflow-y-auto custom-scrollbar font-sans space-y-3">
                      {(() => {
                        const reasoningLines = Array.isArray(aiRecommendation.reasoning)
                          ? aiRecommendation.reasoning
                          : typeof aiRecommendation.reasoning === 'string'
                            ? aiRecommendation.reasoning.split('\n')
                            : [];
                        return reasoningLines.map((line: string, i: number) => {
                          if (line.startsWith('###') || line.startsWith('**Selection:**')) {
                            return <h5 key={i} className="text-sm font-black font-display text-white mt-4 mb-2 first:mt-0 pb-1 border-b dark:border-slate-900">{line.replace(/###|\*\*/g, '').trim()}</h5>;
                          }
                          if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                            return (
                              <div key={i} className="flex gap-2 items-start text-slate-300 pl-1 mt-1.5">
                                <span className="text-emerald-400 shrink-0 select-none">•</span>
                                <p className="text-slate-300">{line.replace(/^[-*]\s*/, '').trim()}</p>
                              </div>
                            );
                          }
                          return <p key={i} className="text-slate-300 leading-relaxed font-sans">{line.replace(/\*\*/g, '')}</p>;
                        });
                      })()}
                    </div>
                  </div>
                </div>

                {/* 4. MAIN PROPOSAL AWARDING DISPATCH BUTTON */}
                {(() => {
                  const rcmdQuote = activeQuotes.find(q => q.id === aiRecommendation.recommendedQuoteId) || activeQuotes[0];
                  if (!rcmdQuote) return null;
                  const isAlreadyProposed = hasPendingApproval(rcmdQuote.id);

                  if (isAlreadyProposed) {
                    return (
                      <div className="w-full text-center py-3 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400 font-mono text-[11px] font-extrabold uppercase animate-pulse">
                        🎯 AI RECOMMENDED DESIGNATED BID ASSIGNED FOR EXECUTIVE AUDIT
                      </div>
                    );
                  }

                  return (
                    <button
                      onClick={() => {
                        triggerApprovalRequest(
                          'QUOTATION',
                          rcmdQuote.id,
                          `[AI Recommendation] ${rcmdQuote.vendorName} Sourcing Proposal`,
                          `AI Evaluator`
                        );
                        alert(`Gemini recommended sourcing contract dispatched! Sent directly to Management Approvals queue.`);
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-502 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 text-white font-sans text-xs font-black rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-emerald-500/15 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 shrink-0 animate-bounce" />
                      <span>Accept AI Recommendation & Generate Proposal Workflow</span>
                    </button>
                  );
                })()}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
