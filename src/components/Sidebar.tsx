/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  Building2, LayoutDashboard, Users2, ShieldCheck, 
  FileText, ArrowLeftRight, CheckSquare, FileCheck2, 
  Receipt, ScrollText, BarChart3, Settings, 
  ChevronLeft, ChevronRight, HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onNavigate }) => {
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    currentUser, 
    fastSwitchRole, 
    theme 
  } = useApp();

  // Helper to determine if current tab is active
  const isActive = (tab: string) => currentTab === tab;

  // Filter links dynamically based on role
  // Links items map: { id, label, icon, minRole }
  const allLinks = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.PROCUREMENT, UserRole.MANAGER, UserRole.VENDOR] },
    { id: 'vendors', label: 'Vendors Partner Desk', icon: Users2, roles: [UserRole.ADMIN, UserRole.PROCUREMENT, UserRole.MANAGER] },
    { id: 'rfqs', label: 'RFI / RFP RFQs', icon: FileCheck2, roles: [UserRole.ADMIN, UserRole.PROCUREMENT, UserRole.MANAGER, UserRole.VENDOR] },
    { id: 'comparison', label: 'Bid Comparison Board', icon: ArrowLeftRight, roles: [UserRole.ADMIN, UserRole.PROCUREMENT, UserRole.MANAGER] },
    { id: 'approvals', label: 'Executive Approvals', icon: CheckSquare, roles: [UserRole.ADMIN, UserRole.MANAGER] },
    { id: 'pos', label: 'Purchase Orders', icon: FileCheck2, roles: [UserRole.ADMIN, UserRole.PROCUREMENT, UserRole.VENDOR] },
    { id: 'invoices', label: 'Invoices Hub', icon: Receipt, roles: [UserRole.ADMIN, UserRole.PROCUREMENT, UserRole.VENDOR] },
    { id: 'reports', label: 'Reports & Spending', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.PROCUREMENT, UserRole.MANAGER] },
    { id: 'activities', label: 'Audit Timeline Logs', icon: ScrollText, roles: [UserRole.ADMIN, UserRole.PROCUREMENT, UserRole.MANAGER, UserRole.VENDOR] },
  ];

  const allowedLinks = allLinks.filter(link => link.roles.includes(currentUser.role));

  const roleColors: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'bg-red-500/10 text-red-500 border-red-500/30',
    [UserRole.MANAGER]: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    [UserRole.PROCUREMENT]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    [UserRole.VENDOR]: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  };

  return (
    <motion.div 
      animate={{ width: sidebarOpen ? 280 : 80 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className={`relative h-screen flex flex-col border-r shrink-0 select-none
        bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500 text-white shadow-md shadow-emerald-500/25">
            <Building2 className="w-5 h-5" />
          </div>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="text-sm font-bold tracking-tight font-display text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 dark:from-emerald-400 dark:to-teal-200">
                VendorBridge
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 dark:text-slate-550">
                Procurement ERP
              </span>
            </motion.div>
          )}
        </div>
        
        {/* Collapse Button */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-500"
          title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* User Org Badging */}
      {sidebarOpen && (
        <div className="mx-4 mt-4 p-3 rounded-lg border border-slate-200/80 bg-slate-500/5 transition-all dark:border-slate-800/80">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 font-bold mb-1">
            Current Entity / Sandbox
          </div>
          <div className="text-xs font-semibold truncate text-slate-800 dark:text-slate-100">
            {currentUser.companyName || 'VendorBridge Corp'}
          </div>
          <div className={`mt-2 flex items-center justify-center px-2 py-0.5 rounded-full text-[9px] font-mono border w-fit ${roleColors[currentUser.role]}`}>
            {currentUser.role} PERSPECTIVE
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {allowedLinks.map((link) => {
          const IconComp = link.icon;
          const active = isActive(link.id);
          
          return (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`w-full flex items-center py-2 px-3 rounded-lg transition-all duration-150 relative group font-sans
                ${active 
                  ? 'bg-emerald-500/10 text-emerald-505 font-bold' 
                  : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-200'}`}
              title={link.label}
            >
              {active && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r bg-emerald-500" />
              )}
              
              <IconComp className={`w-5 h-5 shrink-0 ${active ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-705 dark:group-hover:text-slate-200'}`} />
              
              {sidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-3 text-sm tracking-wide truncate"
                >
                  {link.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Access Dev Role Fast Switch Panel (Judges Convenience Feature) */}
      {sidebarOpen && (
        <div className="p-4 border-t border-slate-200 bg-slate-500/5 dark:border-slate-950">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500 font-bold mb-2 tracking-wider">
            ⚡ Quick Persona Fast Switch (For Hackathon Judges)
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            {Object.values(UserRole).map((role) => (
              <button
                key={role}
                onClick={() => fastSwitchRole(role)}
                className={`py-1 px-1.5 rounded text-left font-mono border transition-all truncate
                  ${currentUser.role === role 
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold scale-[1.02]' 
                    : 'border-slate-200 bg-slate-100 text-slate-650 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:text-slate-200 hover:scale-[1.01]'}`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-xs text-center text-slate-500 font-mono">
        {sidebarOpen ? (
          <span>VendorBridge v1.2.0 • 2026</span>
        ) : (
          <span>VB</span>
        )}
      </div>
    </motion.div>
  );
};
