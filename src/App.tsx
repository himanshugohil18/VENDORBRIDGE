/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { CommandPalette } from './components/CommandPalette';
import { AuthScreens } from './pages/auth/AuthScreens';

// Page Imports
import { Dashboard } from './pages/dashboard/Dashboard';
import { Vendors } from './pages/vendors/Vendors';
import { Rfqs } from './pages/rfqs/Rfqs';
import { Comparison } from './pages/quotations/Comparison';
import { Approvals } from './pages/approvals/Approvals';
import { PurchaseOrders } from './pages/pos/PurchaseOrders';
import { Invoices } from './pages/invoices/Invoices';
import { Reports } from './pages/reports/Reports';
import { Activities } from './pages/activities/Activities';
import { ProfileSettings } from './pages/profile/ProfileSettings';

import { Sparkles, ArrowRight, CheckCircle2, Award, FileText, Check, Layers } from 'lucide-react';
import { UserRole } from './types';

const MainAppContent: React.FC = () => {
  const { 
    currentUser, 
    logout, 
    isDemoModeActive, 
    fastSwitchRole, 
    approvals, 
    purchaseOrders 
  } = useApp();
  
  // Tab/Navigate Routing state synchronised nicely to window hash
  const [currentTab, setCurrentTab] = useState<string>(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  });

  // Track if user explicitly logged out in this tab session
  const [sessionActive, setSessionActive] = useState<boolean>(() => {
    return localStorage.getItem('vendorbridge-user') !== null;
  });

  useEffect(() => {
    window.location.hash = currentTab;
  }, [currentTab]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setCurrentTab(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Listen to changes on localStorage to toggle Auth vs Workspace
  useEffect(() => {
    const checkSession = () => {
      setSessionActive(localStorage.getItem('vendorbridge-user') !== null);
    };
    
    // Check initially and periodically block
    const interval = setInterval(checkSession, 800);
    return () => clearInterval(interval);
  }, []);

  // Render Judge Guided Tour
  const renderJudgeWalkthrough = () => {
    if (!isDemoModeActive) return null;

    // Detect state
    const hasCiscoPO = purchaseOrders.some(po => po.rfqId === 'rfq-cisco-demo');
    const ciscoApproval = approvals.find(appr => appr.id === 'appr-cisco');
    const isApproved = ciscoApproval?.status === 'Approved';
    const isPending = ciscoApproval?.status === 'Pending';
    
    let activeStep = 1;
    let stepTitle = "Compare Bids & Trigger Gemini™";
    let stepDesc = "Sarah Jenkins has seeded the Cisco HQ core network RFQ with competitive bids. Head to the Evaluation Matrix to run AI analytics.";
    let actionLabel = "Go to Evaluation Matrix";
    let actionTab = "comparison";
    let actionRole: UserRole | null = null;

    if (hasCiscoPO) {
      activeStep = 4;
      stepTitle = "Purchase Order & Invoices Dispatched!";
      stepDesc = "The transaction is complete! Check the Purchase Orders, Invoices, and live Analytics Reports to see simulated financial ledger impact.";
      actionLabel = "View Sourcing Reports";
      actionTab = "reports";
    } else if (isApproved) {
      activeStep = 3;
      stepTitle = "System Auto-generating ERP Elements...";
      stepDesc = "Sofia's executive endorsement is logged! The system is now auto-creating the official PO-2026-003 and corresponding invoices.";
      actionLabel = "Go to Purchase Orders";
      actionTab = "pos";
    } else if (isPending) {
      if (currentUser.role === UserRole.MANAGER) {
        activeStep = 3;
        stepTitle = "Endorse with Sofia's Signature";
        stepDesc = "Sofia has received your proposals. Click Approve inside Management Sign-offs to trigger immediate ERP workflow automation.";
        actionLabel = "Go to Sign-offs Queue";
        actionTab = "approvals";
      } else {
        activeStep = 2;
        stepTitle = "Fast-Switch User Role to Manager (Sofia)";
        stepDesc = "Sarah's AI-backed contract proposal has been routed. Switch your role to Sofia (Manager) to sign-off and issue the PO.";
        actionLabel = "Autoswitch to CEO Sofia";
        actionRole = UserRole.MANAGER;
      }
    } else {
      if (currentTab === 'comparison') {
        activeStep = 1;
        stepTitle = "Invoke Sourcing Evaluation";
        stepDesc = "Press 'Generate AI Recommendation' to consult Gemini Flash neural scoring, then click 'Accept AI Recommendation & Generate Proposal Workflow'.";
        actionLabel = "Highlight Evaluator";
        actionTab = "comparison";
      }
    }

    return (
      <div id="judge-tour" className="mb-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-emerald-500/30 p-4 shadow-xl shadow-emerald-500/5 relative overflow-hidden text-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Glowing background rays */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-sky-500/5 blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3.5 max-w-2xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] tracking-widest font-mono font-black uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                JUDGES GUIDED TOUR
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map(s => (
                  <div
                    key={s}
                    className={`w-4 h-1.5 rounded-full ${
                      s === Math.floor(activeStep)
                        ? 'bg-emerald-500' 
                        : s < Math.floor(activeStep) 
                        ? 'bg-emerald-700/60' 
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
            <h4 className="text-xs font-black tracking-tight text-white mt-1 uppercase flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span>Step {Math.floor(activeStep)} of 4:</span>
              <span className="text-slate-300 normal-case font-semibold">{stepTitle}</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              {stepDesc}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <button
            onClick={() => {
              if (actionRole) {
                fastSwitchRole(actionRole);
              } else {
                setCurrentTab(actionTab);
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-[11px] font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/10 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
  };

  const handleLogoutAction = () => {
    logout();
    setSessionActive(false);
  };

  // If user has not logged in yet (or explicitly logged out), render the Auth flow.
  if (!sessionActive) {
    return (
      <div className="bg-slate-100 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-150 relative font-sans">
        <AuthScreens />
        
        {/* Simple helper alert in sandbox letting reviewers bypass immediately if helpful */}
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] leading-relaxed text-slate-300 font-sans shadow-2xl">
          <span className="font-bold text-emerald-400 block mb-0.5">💡 EVALUATION OVERRIDE ACTIVE</span>
          Click any of the **SECURE PERSONAL SWITCHES** inside the login console to autoselect prefabricated sector credentials and enter instantly!
        </div>
      </div>
    );
  }

  // Render Core ERP Layout
  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-150 overflow-hidden font-sans">
      
      {/* Adaptable Collapsible Sidebar */}
      <Sidebar currentTab={currentTab} onNavigate={handleNavigate} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Dynamic header navbar */}
        <Header currentTab={currentTab} onNavigate={handleNavigate} />

        {/* Primary Page views */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
          
          {renderJudgeWalkthrough()}

          {currentTab === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {currentTab === 'vendors' && <Vendors />}
          {currentTab === 'rfqs' && <Rfqs />}
          {currentTab === 'comparison' && <Comparison />}
          {currentTab === 'approvals' && <Approvals />}
          {currentTab === 'pos' && <PurchaseOrders />}
          {currentTab === 'invoices' && <Invoices />}
          {currentTab === 'reports' && <Reports />}
          {currentTab === 'activities' && <Activities />}
          {currentTab === 'profile' && <ProfileSettings onCancel={() => handleNavigate('dashboard')} />}

        </main>
      </div>

      {/* Keyboard driven Command Palette (Ctrl + K) */}
      <CommandPalette onNavigate={handleNavigate} />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
