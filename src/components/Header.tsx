/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon, Bell, Search, LogOut, Shield, ChevronRight, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigate }) => {
  const { 
    theme, 
    toggleTheme, 
    currentUser, 
    logout, 
    notifications, 
    markNotificationRead, 
    clearNotifications,
    setCommandPaletteOpen,
    isDemoModeActive,
    triggerJudgeDemoMode,
    resetToBaseline
  } = useApp();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  const getBreadcrumbTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Command Board';
      case 'vendors': return 'Vendor Registry';
      case 'rfqs': return 'Requests for Proposal (RFQs)';
      case 'comparison': return 'Bid Evaluation Matrix';
      case 'approvals': return 'Management Sign-offs';
      case 'pos': return 'Purchase Orders Registry';
      case 'invoices': return 'Invoices Ledgers';
      case 'reports': return 'Procurement Insights';
      case 'activities': return 'Audit Logs';
      default: return 'Overview';
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default: return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full flex items-center justify-between px-6 py-3 border-b select-none backdrop-blur-md
      bg-white/80 border-slate-200 text-slate-800 dark:bg-slate-950/80 dark:border-slate-800 dark:text-slate-100"
    >
      {/* Search & Breadcrumbs */}
      <div className="flex items-center gap-4">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-2 text-xs font-medium tracking-wide">
          <span className="text-slate-400">VendorBridge</span>
          <ChevronRight className="w-3" />
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider text-[11px] font-display">
            {getBreadcrumbTitle(currentTab)}
          </span>
        </div>

        {/* Global Search trigger styled nicely */}
        <button 
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg border text-left text-xs text-slate-400 transition-colors
            bg-slate-100/80 border-slate-200 hover:bg-slate-205 dark:bg-slate-900/60 dark:border-slate-800 dark:hover:bg-slate-900"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span>Quick Finder...</span>
          <kbd className="ml-6 px-1.5 py-0.5 rounded border text-[10px] font-mono bg-white border-slate-300 dark:bg-slate-880 dark:border-slate-700">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Header controls */}
      <div className="flex items-center gap-3">
        {/* JUDGE DEMO MODE BADGE/CONTROL */}
        <div className="flex items-center gap-1.5 mr-1">
          {!isDemoModeActive ? (
            <button
              onClick={() => {
                triggerJudgeDemoMode();
                onNavigate('dashboard');
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 via-orange-550 to-red-550 hover:from-amber-600 hover:to-red-650 text-white text-[10px] font-black tracking-wider uppercase rounded-lg shadow-md shadow-orange-500/10 flex items-center gap-1 transition-all hover:scale-[1.03] active:scale-[0.97] cursor-pointer animate-pulse border border-orange-400/20"
              title="Click to instantly seed pristine enterprise Cisco datasets for live judging showcase!"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
              </span>
              <span>⚡ JUDGE DEMO</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                ⚡ DEMO ACTIVE
              </span>
              <button
                onClick={() => {
                  resetToBaseline();
                  onNavigate('dashboard');
                }}
                className="text-[9px] font-mono leading-none font-bold text-slate-400 hover:text-red-400 border border-slate-705/30 hover:border-red-400/25 px-1 py-0.5 rounded transition-all cursor-pointer bg-slate-900/10 dark:bg-slate-900/40"
                title="Restore default sandbox state"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Sunrise/Sunset Theme Selector */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg border text-slate-505 hover:text-slate-800 dark:hover:text-slate-200 transition-all 
            bg-slate-100 border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:scale-[1.04]"
          title={theme === 'dark' ? 'Switch to Light Vision' : 'Switch to Dark Vision'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400 animate-spin-pulse" /> : <Moon className="w-4 h-4 text-emerald-700" />}
        </button>

        {/* Notifications Center */}
        <div className="relative">
          <button 
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
              setProfileDropdownOpen(false);
            }}
            className="p-2 rounded-lg border text-slate-450 hover:text-slate-800 dark:hover:text-slate-200 transition-all relative
              bg-slate-100 border-slate-200 dark:bg-slate-900 dark:border-slate-800 hover:scale-[1.04]"
            title="Notifications Center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-emerald-500 text-[10px] font-sans font-extrabold text-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border shadow-2xl overflow-hidden
              bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-slate-500/5 border-b border-slate-202 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 font-display uppercase tracking-wider">SYSTEM NOTIFICATIONS</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={clearNotifications}
                    className="text-[10px] font-mono text-emerald-500 hover:underline"
                  >
                    Mark All Read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 font-sans">
                    No active notifications.
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3 text-left transition-colors cursor-pointer flex items-start gap-2.5 
                        ${notif.read ? 'opacity-65 hover:opacity-100' : 'bg-emerald-500/[0.03] hover:bg-emerald-500/[0.08]'}`}
                    >
                      <div className="mt-0.5">{getNotifIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">{notif.title}</div>
                        <div className="text-[11px] text-slate-500 font-sans leading-relaxed">{notif.message}</div>
                        <div className="text-[9px] font-mono mt-1 text-slate-400">{new Date(notif.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profiles Dropdown */}
        <div className="relative">
          <button 
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setNotifDropdownOpen(false);
            }}
            className="flex items-center gap-2 p-1 rounded-lg border text-left ring-offset-background transition-all hover:scale-[1.01]
              bg-slate-100/80 border-slate-200 dark:bg-slate-900/80 dark:border-slate-800"
          >
            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold font-sans uppercase">
              {currentUser.firstName[0]}{currentUser.lastName[0]}
            </div>
            <div className="hidden sm:block text-xs mr-2">
              <div className="font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                {currentUser.firstName} {currentUser.lastName}
              </div>
              <div className="text-[10px] text-slate-400 tracking-wider flex items-center gap-1 font-mono uppercase">
                <Shield className="w-2.5 h-2.5" />
                {currentUser.role}
              </div>
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border shadow-2xl py-1 overflow-hidden
              bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
            >
              <div className="px-3 py-2 border-b border-slate-105 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-705 dark:text-slate-202">{currentUser.firstName} {currentUser.lastName}</div>
                <div className="text-[10px] text-slate-400 font-mono translate-y-0.5 truncate">{currentUser.email}</div>
              </div>
              
              <button 
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onNavigate('profile');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left text-slate-700 dark:text-slate-350 hover:bg-slate-500/5 cursor-pointer border-b dark:border-slate-800"
              >
                <User className="w-3.5 h-3.5 text-slate-450" />
                <span>Profile Settings</span>
              </button>

              <button 
                onClick={() => {
                  setProfileDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left text-red-500 hover:bg-slate-500/5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out Account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
