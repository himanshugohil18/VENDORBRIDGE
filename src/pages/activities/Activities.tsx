/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  History, Shield, FileCheck, CircleDollarSign, Plus, CheckCircle, 
  Trash, Search, Filter, AlertCircle, RefreshCw
} from 'lucide-react';

export const Activities: React.FC = () => {
  const { activities } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'RFQ', 'QUOTATION', 'APPROVAL', 'PO', 'INVOICE', 'VENDOR', 'AUTH'];

  // Match event metrics
  const filteredLogs = (activities || []).slice().reverse().filter(log => {
    const matchesSearch = 
      (log.description || '').toLowerCase().includes(search.toLowerCase()) || 
      (log.user || '').toLowerCase().includes(search.toLowerCase()) || 
      (log.type || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || log.type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'AUTH':
        return <Shield className="w-4 h-4 text-sky-400" />;
      case 'RFQ':
      case 'VENDOR':
        return <Plus className="w-4 h-4 text-emerald-400" />;
      case 'APPROVAL':
        return <FileCheck className="w-4 h-4 text-amber-500" />;
      case 'QUOTATION':
      case 'PO':
      case 'INVOICE':
        return <CircleDollarSign className="w-4 h-4 text-indigo-400" />;
      default:
        return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryBadge = (type: string) => {
    switch (type) {
      case 'AUTH':
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-wider">Access Secured</span>;
      case 'RFQ':
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">RFQ Sourcing</span>;
      case 'QUOTATION':
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">Quotation Bid</span>;
      case 'APPROVAL':
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-500/10 text-amber-550 border border-amber-500/20 uppercase tracking-wider">Governance</span>;
      case 'PO':
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">Purchase Order</span>;
      case 'INVOICE':
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 uppercase tracking-wider">Settlement Invoice</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20 uppercase">System log</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER ROW */}
      <div>
        <h2 className="text-xl font-bold font-display tracking-tight text-white">System Sourcing Audit Trails</h2>
        <p className="text-xs text-slate-400 font-sans mt-0.5">Authoritative, non-repudiation ledger tracking all ERP state shifts and signatures</p>
      </div>

      {/* FILTER CONTROL PANEL */}
      <div className="p-4 rounded-xl border dark:bg-slate-900/40 dark:border-slate-850 light:bg-white light:border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 select-none">
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center font-sans">
          {/* Custom keyword Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actions, users, or targets..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border text-xs focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 light:bg-slate-50 light:border-slate-200"
            />
          </div>

          {/* Core categories selectors dropdown */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-450 shrink-0" />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none dark:bg-slate-910 dark:text-slate-100 dark:bg-slate-950 dark:border-slate-800"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          Showing <span className="font-bold text-slate-200">{filteredLogs.length}</span> audited ledger records
        </div>
      </div>

      {/* LEDGER CHRONICLE TIMELINE */}
      {filteredLogs.length === 0 ? (
        <div className="py-12 text-center border border-dashed rounded-xl dark:border-slate-850">
          <AlertCircle className="w-10 h-10 text-slate-550 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No matching logs located</h3>
          <p className="text-xs text-slate-400 font-sans mt-1">Refine keyword or category indicators.</p>
        </div>
      ) : (
        <div className="p-5 rounded-xl border dark:bg-slate-900/10 dark:border-slate-850 light:bg-white light:border-slate-200 shadow-sm relative select-none font-sans">
          
          <div className="absolute top-6 bottom-6 left-[25px] w-[1px] bg-slate-850/80 pointer-events-none" />

          <div className="space-y-6">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex gap-4 items-start relative group">
                
                {/* Visual Circle marker with Category Specific icon */}
                <div className="w-8 h-8 rounded-full border dark:border-slate-800 dark:bg-slate-950 light:border-slate-300 light:bg-white flex items-center justify-center shrink-0 z-10 shadow-sm ring-4 ring-slate-900/5 group-hover:border-emerald-500 transition-colors">
                  {getCategoryIcon(log.type)}
                </div>

                {/* Log Details sheet */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-200 dark:text-slate-100 font-display">{log.type} Order Log</span>
                      {getCategoryBadge(log.type)}
                    </div>
                    
                    {/* Timestamp signature */}
                    <span className="text-[10px] font-mono text-slate-450 shrink-0">
                      {new Date(log.date).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {log.description}
                  </p>

                  <div className="mt-1.5 flex items-center gap-1 font-mono text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>Authorized ERP identity:</span>
                    <span className="text-emerald-400">{log.user}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
