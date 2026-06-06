/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Search, FolderOpen, Shield, Clipboard, FileText, UserPlus, FileCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../utils/currency';

interface CommandPaletteProps {
  onNavigate: (tab: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onNavigate }) => {
  const { commandPaletteOpen, setCommandPaletteOpen, rfqs, vendors, purchaseOrders, invoices } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  // Filter items based on query
  const searchResults: {
    id: string;
    title: string;
    subtitle: string;
    type: 'rfq' | 'vendor' | 'po' | 'invoice' | 'action';
    action: () => void;
  }[] = [];

  // Actions search
  const actions = [
    { title: 'Go to Procurement Dashboard', subtitle: 'Global ERP analytics', type: 'action' as const, dest: 'dashboard' },
    { title: 'Register New Vendor Partner', subtitle: 'Configure vendor profile', type: 'action' as const, dest: 'vendors' },
    { title: 'Create Draft RFP / Request for Quotation', subtitle: 'Add multiple lines specifications', type: 'action' as const, dest: 'rfqs' },
    { title: 'Compare Vendor Bids', subtitle: 'Wow-factor side-by-side matrices', type: 'action' as const, dest: 'comparison' },
    { title: 'Pending Approval Workflows', subtitle: 'Sign-off and PO dispatch', type: 'action' as const, dest: 'approvals' },
    { title: 'Generate Reports and Logs', subtitle: 'Audit trial analytics', type: 'action' as const, dest: 'reports' },
  ];

  actions.forEach(act => {
    if (act.title.toLowerCase().includes(query.toLowerCase()) || act.subtitle.toLowerCase().includes(query.toLowerCase())) {
      searchResults.push({
        id: `act-${act.dest}`,
        title: act.title,
        subtitle: act.subtitle,
        type: 'action',
        action: () => {
          onNavigate(act.dest);
          setCommandPaletteOpen(false);
        }
      });
    }
  });

  // RFQ search
  rfqs.forEach(r => {
    if (r.title.toLowerCase().includes(query.toLowerCase()) || r.id.toLowerCase().includes(query.toLowerCase())) {
      searchResults.push({
        id: r.id,
        title: r.title,
        subtitle: `Status: ${r.status}  •  Category: ${r.category}`,
        type: 'rfq',
        action: () => {
          onNavigate('rfqs');
          setCommandPaletteOpen(false);
        }
      });
    }
  });

  // Vendors search
  vendors.forEach(v => {
    if (v.companyName.toLowerCase().includes(query.toLowerCase()) || v.name.toLowerCase().includes(query.toLowerCase())) {
      searchResults.push({
        id: v.id,
        title: v.companyName,
        subtitle: `Representative: ${v.name}  •   Category: ${v.category}  •  Rating: ${v.rating}★`,
        type: 'vendor',
        action: () => {
          onNavigate('vendors');
          setCommandPaletteOpen(false);
        }
      });
    }
  });

  // Purchase Order search
  purchaseOrders.forEach(po => {
    if (po.poNumber.toLowerCase().includes(query.toLowerCase()) || po.vendorName.toLowerCase().includes(query.toLowerCase())) {
      searchResults.push({
        id: po.id,
        title: po.poNumber,
        subtitle: `Vendor: ${po.vendorName} • Value: ${formatCurrency(po.totalAmount)} • Status: ${po.status}`,
        type: 'po',
        action: () => {
          onNavigate('pos');
          setCommandPaletteOpen(false);
        }
      });
    }
  });

  // Invoice search
  invoices.forEach(inv => {
    if (inv.invoiceNumber.toLowerCase().includes(query.toLowerCase()) || inv.vendorName.toLowerCase().includes(query.toLowerCase())) {
      searchResults.push({
        id: inv.id,
        title: inv.invoiceNumber,
        subtitle: `Vendor: ${inv.vendorName} • Due: ${formatCurrency(inv.grandTotal)} • Status: ${inv.status}`,
        type: 'invoice',
        action: () => {
          onNavigate('invoices');
          setCommandPaletteOpen(false);
        }
      });
    }
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'rfq': return <Clipboard className="w-4 h-4 text-emerald-500" />;
      case 'vendor': return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'po': return <FileCheck className="w-4 h-4 text-purple-500" />;
      case 'invoice': return <FileText className="w-4 h-4 text-amber-500" />;
      default: return <FolderOpen className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm">
      {/* Backdrop closer */}
      <div className="absolute inset-0" onClick={() => setCommandPaletteOpen(false)} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-xl overflow-hidden rounded-xl bg-slate-900 border border-slate-800 dark:bg-slate-900 dark:border-slate-800 light:bg-white light:border-slate-200 shadow-2xl"
      >
        <div className="flex items-center px-4 py-3 border-b dark:border-slate-800 light:border-slate-200">
          <Search className="w-5 h-5 mr-3 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type search terms or command action... (e.g. steel, server, comparison, invoice)"
            className="w-full bg-transparent text-sm font-sans focus:outline-none dark:text-slate-100 dark:placeholder-slate-500 light:text-slate-900 light:placeholder-slate-400"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-[10px] font-mono font-medium text-slate-400 shadow-sm">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto px-2 py-3 custom-scrollbar">
          {searchResults.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-500">
              No matching enterprise entities found. Try searching for "Steel", "Horizon", or "Dashboard".
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Matching ERP Records & Tools
              </div>
              {searchResults.slice(0, 10).map((result) => (
                <button
                  key={result.id}
                  onClick={result.action}
                  className="w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors group dark:hover:bg-slate-800/80 light:hover:bg-slate-100"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg dark:bg-slate-800 light:bg-slate-200 border dark:border-transparent light:border-slate-300 mr-3 group-hover:scale-105 transition-transform">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium font-sans truncate dark:text-slate-200 light:text-slate-800">
                      {result.title}
                    </div>
                    <div className="text-xs truncate dark:text-slate-400 light:text-slate-500 font-sans">
                      {result.subtitle}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t dark:border-slate-800 light:border-slate-200 bg-slate-950/40 text-[10px] font-mono text-slate-500">
          <span>Use <span className="text-emerald-500">↑↓</span> to select</span>
          <span>Press <span className="text-emerald-500">Enter</span> to execute</span>
        </div>
      </motion.div>
    </div>
  );
};
