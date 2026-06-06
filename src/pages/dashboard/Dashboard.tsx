/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { formatCurrency, formatAbbreviatedCurrency } from '../../utils/currency';
import { 
  TrendingUp, FileSignature, Users, Landmark, 
  Layers, Inbox, Clock, CheckSquare, ListPlus, 
  Award, Package, Receipt, ArrowUpRight, ChevronRight, CheckCircle2, AlertTriangle, Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, BarChart, Bar, Cell, PieChart, Pie, CartesianGrid 
} from 'recharts';

const DashboardOutlayTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800 p-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-3 ring-1 ring-emerald-500/10 max-w-[270px] text-left">
        <div className="flex items-center justify-between border-b dark:border-slate-850 pb-2 gap-4">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">{data.month} Ledger</span>
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
            {data.Trend}
          </span>
        </div>
        <div className="space-y-0.5">
          <span className="text-[9px] font-sans text-slate-500 uppercase font-black tracking-wider block">Total Expenditure</span>
          <span className="text-xl font-black font-mono text-white">{formatCurrency(data.Spend)}</span>
        </div>
        {data.Insight && (
          <div className="pt-2 border-t dark:border-slate-850">
            <span className="text-[9px] font-mono font-black text-emerald-400/95 block uppercase tracking-wider">AI Sourcing Insight</span>
            <p className="text-[10px] text-slate-300 font-sans italic leading-relaxed mt-1">
              "{data.Insight}"
            </p>
          </div>
        )}
      </div>
    );
  }
  return null;
};

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { 
    currentUser, vendors, rfqs, quotations, 
    approvals, purchaseOrders, invoices, activities 
  } = useApp();

  // 1. Gather dynamic intelligence from state
  const activeRfqsCount = rfqs.filter(r => r.status === 'Open').length;
  const pendingApprovalsCount = approvals.filter(a => a.status === 'Pending').length;
  const totalVendorsCount = vendors.filter(v => v.status === 'Active').length;
  
  // Total expenditures calculation
  const totalApprovedSpend = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
  const paidInvoiceTotal = invoices.filter(i => i.status === 'Paid').reduce((sum, inv) => sum + inv.grandTotal, 0);

  // 2. High fidelity analytical data (Reactive to state where appropriate!)
  const procurementCostTrend = [
    { month: 'Jan', Spend: 120000, Trend: '+14% Spend Growth', Insight: 'Strategic steel alloy buffer acquired at base rate.', TargetBids: 12 },
    { month: 'Feb', Spend: 165000, Trend: '+27% Spend Growth', Insight: 'Bulk instrumentation parts cleared via quick proposal.', TargetBids: 18 },
    { month: 'Mar', Spend: 145000, Trend: '-12% Budget Trimmed', Insight: 'Chemical supplier optimization yields immediate 12% discount.', TargetBids: 15 },
    { month: 'Apr', Spend: 210000, Trend: '+44% Spend Growth', Insight: 'Quarterly logistic route SLA commitment finalized.', TargetBids: 24 },
    { month: 'May', Spend: 312000, Trend: '+18% Volatility Alert', Insight: 'Turbine housing project milestone bulk order dispatched.', TargetBids: 38 },
    { month: 'Jun', Spend: totalApprovedSpend > 0 ? totalApprovedSpend : 275000, Trend: '-8% Optimized Flow', Insight: 'Consolidated AI dual-vendor distribution minimizes overhead.', TargetBids: rfqs.length * 6 },
  ];

  const spendCategories = [
    { name: 'Raw Materials', value: 320000, color: '#10b981' },
    { name: 'IT Infrastructure', value: 145000, color: '#06b6d4' },
    { name: 'Chemical Engineering', value: 95000, color: '#f59e0b' },
    { name: 'Logistics SLA', value: 64000, color: '#8b5cf6' },
  ];

  // Compact sparklines for premium KPI tiles
  const sparklineData1 = [{ v: 10 }, { v: 14 }, { v: 11 }, { v: 18 }, { v: 15 }, { v: 22 }, { v: Math.max(12, activeRfqsCount * 4) }];
  const sparklineData2 = [{ v: 5 }, { v: 8 }, { v: 4 }, { v: 11 }, { v: 7 }, { v: 10 }, { v: Math.max(9, pendingApprovalsCount * 5) }];
  const sparklineData3 = [{ v: 95.5 }, { v: 96.8 }, { v: 97.2 }, { v: 96.1 }, { v: 98.0 }, { v: 97.9 }, { v: 98.4 }];
  const sparklineData4 = [{ v: 120 }, { v: 165 }, { v: 145 }, { v: 210 }, { v: 312 }, { v: Math.round((totalApprovedSpend + 275000) / 1000) || 275 }];

  const vendorRatingsData = vendors.map(v => ({
    name: v.companyName,
    rating: v.rating,
    completed: v.completedOrdersCount,
  })).sort((a,b) => b.rating - a.rating).slice(0, 5);

  const getRoleGreeting = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'Root Admin Dashboard';
      case UserRole.MANAGER: return 'Executive Officer Workspace';
      case UserRole.PROCUREMENT: return 'Procurement Officer Dashboard';
      case UserRole.VENDOR: return 'Vendor Partner Dashboard';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER HERO BANNER */}
      <div className="relative rounded-2xl p-6 overflow-hidden border
        dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100
        light:bg-white light:border-slate-200 light:text-slate-800"
      >
        <div className="absolute top-[10%] right-[-10%] w-[35%] h-[90%] rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[90px]" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="text-2xl font-extrabold font-display leading-tight">
              Welcome Back, <span className="text-emerald-500">{currentUser.firstName}!</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-sans">
              <span>{getRoleGreeting(currentUser.role)}</span>
              <span>•</span>
              <span className="font-mono">Security Token Code: Active</span>
            </div>
          </div>
          
          {/* Action buttons list based on Role */}
          <div className="flex flex-wrap items-center gap-2">
            {[UserRole.ADMIN, UserRole.PROCUREMENT].includes(currentUser.role) && (
              <>
                <button 
                  onClick={() => onNavigate('rfqs')}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm font-sans flex items-center gap-1.5 transition-all hover:scale-[1.02]"
                >
                  <ListPlus className="w-4 h-4" />
                  <span>Draft RFP / RFQ</span>
                </button>
                <button 
                  onClick={() => onNavigate('vendors')}
                  className="px-4 py-2 bg-slate-500/10 hover:bg-slate-500/15 border dark:border-slate-800 light:border-slate-300 dark:text-slate-200 light:text-slate-700 text-xs font-semibold rounded-lg font-sans transition-all"
                >
                  Register Partner
                </button>
              </>
            )}

            {currentUser.role === UserRole.MANAGER && (
              <button 
                onClick={() => onNavigate('approvals')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm font-sans flex items-center gap-1.5 transition-all"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Review Pending Sign-offs</span>
              </button>
            )}

            {currentUser.role === UserRole.VENDOR && (
              <button 
                onClick={() => onNavigate('rfqs')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm font-sans flex items-center gap-1.5 transition-all"
              >
                <Inbox className="w-4 h-4" />
                <span>Quote Open RFQs</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC WORKSPACE SUMMARY STATS (KPI cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1 with Glowing Sourcing Rate */}
        <div className="relative overflow-hidden p-6 rounded-2xl border dark:border-slate-800/80 dark:bg-slate-900/50 light:bg-white light:border-slate-200/80 shadow-md group hover:border-[#10b981]/40 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Active Bidding RFQs</span>
              <div className="text-3xl font-black font-display tracking-tight text-white mt-1 group-hover:text-emerald-400 transition-colors">{activeRfqsCount}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Inbox className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          {/* Sparkline & Meta */}
          <div className="mt-4 pt-4 border-t dark:border-slate-850/50 light:border-slate-100 flex items-center justify-between gap-2">
            <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 font-mono shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>MoM High (+12%)</span>
            </div>
            <div className="h-6 w-20 opacity-80 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData1}>
                  <Area type="monotone" dataKey="v" stroke="#10b981" fill="#10b981" strokeWidth={1.5} fillOpacity={0.06} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* KPI 2 with Attention Badge */}
        <div className="relative overflow-hidden p-6 rounded-2xl border dark:border-slate-800/80 dark:bg-slate-900/50 light:bg-white light:border-slate-200/80 shadow-md group hover:border-[#f59e0b]/40 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-500/40 via-yellow-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Pending Sign-offs</span>
              <div className={`text-3xl font-black font-display tracking-tight mt-1 group-hover:text-amber-400 transition-colors ${pendingApprovalsCount > 0 ? 'text-amber-500' : 'text-slate-100'}`}>
                {pendingApprovalsCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileSignature className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          {/* Sparkline & Meta */}
          <div className="mt-4 pt-4 border-t dark:border-slate-850/50 light:border-slate-100 flex items-center justify-between gap-2">
            <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 font-sans shrink-0">
              <Clock className="w-3.5 h-3.5" />
              <span>Requires Authority Action</span>
            </div>
            <div className="h-6 w-20 opacity-80 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData2}>
                  <Area type="monotone" dataKey="v" stroke="#f59e0b" fill="#f59e0b" strokeWidth={1.5} fillOpacity={0.06} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* KPI 3: PROCUREMENT HEALTH SCORE */}
        <div className="relative overflow-hidden p-6 rounded-2xl border dark:border-slate-800/80 dark:bg-slate-900/50 light:bg-white light:border-slate-200/80 shadow-md group hover:border-[#06b6d4]/40 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500/40 via-teal-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Health Index</span>
              <div className="text-3xl font-black font-mono tracking-tight text-emerald-400 mt-1">98.4%</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/5 dark:bg-[#06b6d4]/10 border border-[#06b6d4]/20 flex items-center justify-center text-[#06b6d4]">
              <Award className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          {/* Sparkline & Meta */}
          <div className="mt-4 pt-4 border-t dark:border-slate-850/50 light:border-slate-100 flex items-center justify-between gap-2">
            <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 font-sans shrink-0">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              <span>Full SLA Adherence</span>
            </div>
            <div className="h-6 w-20 opacity-80 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData3}>
                  <Area type="monotone" dataKey="v" stroke="#06b6d4" fill="#06b6d4" strokeWidth={1.5} fillOpacity={0.06} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* KPI 4: COMMITTEE SPEND */}
        <div className="relative overflow-hidden p-6 rounded-2xl border dark:border-slate-800/80 dark:bg-slate-900/50 light:bg-white light:border-slate-200/80 shadow-md group hover:border-[#10b981]/40 transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">Commitment Spend</span>
              <div className="text-3xl font-black font-display tracking-tight text-emerald-500 mt-1">
                {formatCurrency(totalApprovedSpend + 275000)}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Landmark className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          {/* Sparkline & Meta */}
          <div className="mt-4 pt-4 border-t dark:border-slate-850/50 light:border-slate-100 flex items-center justify-between gap-2">
            <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 font-sans shrink-0">
              <span>Dynamic Outlay Tracking</span>
            </div>
            <div className="h-6 w-20 opacity-80 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData4}>
                  <Area type="monotone" dataKey="v" stroke="#10b981" fill="#10b981" strokeWidth={1.5} fillOpacity={0.06} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* NEW GLOWING AI RE-RANKING INSIGHTS BANNER WIDGET */}
      <div className="relative p-4 rounded-2xl border-2 border-emerald-500/20 bg-emerald-500/[0.02] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3.5 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-100 font-display tracking-tight">Enterprise Sourcing Inteligencia AI Active</div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5 max-w-2xl">
              Our advanced neural evaluators have completed mapping multi-bid records across active portals. Navigate to the <strong className="text-emerald-400 font-mono font-bold cursor-pointer hover:underline" onClick={() => onNavigate('comparison')}>Quotation board</strong> to run live grade estimations instantly.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('comparison')}
          className="px-3.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-400 text-[10px] font-mono font-bold rounded-lg shrink-0 flex items-center gap-1 transition-all"
        >
          <span>Examine Matrix Board</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* 3. CHARTS SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Procurement spend trend chart */}
        <div className="lg:col-span-8 p-5 rounded-2xl border dark:bg-slate-900/40 dark:border-slate-800/80 light:bg-white light:border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold font-display">Month-over-Month Capital Outlay</h3>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">Sourcing expenditures tracked in real-time (INR ₹)</p>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20">
              LIVE INDEX
            </span>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={procurementCostTrend} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGradPremium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                    <stop offset="45%" stopColor="#06b6d4" stopOpacity={0.08}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  {/* Glowing Filter Accent */}
                  <filter id="glowFilter" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#10b981" floodOpacity="0.25"/>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="month" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `₹${v/1000}k`} dx={-4} />
                <Tooltip content={<DashboardOutlayTooltip />} cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="Spend" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#spendGradPremium)" filter="url(#glowFilter)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Category wise spend breakdowns */}
        <div className="lg:col-span-4 p-5 rounded-2xl border dark:bg-slate-900/40 dark:border-slate-800/80 light:bg-white light:border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold font-display">Capital Allocation by Sector</h3>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Distribution across primary industry lines</p>
          </div>

          {/* Premium Donut Chart Visualizer */}
          <div className="my-4 flex items-center justify-center relative">
            <div className="w-44 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={66}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {spendCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800 p-2.5 rounded-lg shadow-xl text-[10px] font-sans ring-1 ring-emerald-500/10 text-white min-w-[140px] text-left">
                            <span className="font-bold text-slate-300 block">{data.name}</span>
                            <span className="font-mono text-emerald-400 font-bold block mt-0.5">${data.value.toLocaleString()}</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Donut Center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-wider font-black">Consolidated</span>
              <span className="text-lg font-black font-mono text-white mt-0.5">
                ${(spendCategories.reduce((sum, c) => sum + c.value, 0) / 1000).toFixed(0)}K
              </span>
            </div>
          </div>

          {/* Customized Stack Allocation Badges */}
          <div className="space-y-2 mt-2">
            {spendCategories.map((category) => {
              const totalAlloc = spendCategories.reduce((sum, c) => sum + c.value, 0);
              const percentage = Math.round((category.value / totalAlloc) * 100);
              return (
                <div key={category.name} className="flex items-center justify-between text-[11px] p-2 rounded-xl dark:bg-slate-950/30 border dark:border-slate-900/60 transition-transform hover:scale-[1.01]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="font-medium text-slate-350 dark:text-slate-300">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400">{formatAbbreviatedCurrency(category.value)}</span>
                    <span className="font-mono font-bold text-[#10b981] px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px]">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] font-mono text-slate-500 leading-relaxed pt-3 border-t dark:border-slate-800/40 text-center mt-3">
            * Mapped automatically from signed ledger bills.
          </div>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY TIMELINE & PENDING ACTIONS ACCORDION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Live Audit feed */}
        <div className="lg:col-span-7 p-5 rounded-2xl border dark:bg-slate-900/40 dark:border-slate-800/80 light:bg-white light:border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold font-display">Bespoke Audit Timeline</h3>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">Immutable logs backing contract decisions</p>
            </div>
            <button 
              onClick={() => onNavigate('activities')}
              className="text-xs text-emerald-500 hover:underline font-semibold font-sans flex items-center gap-0.5"
            >
              <span>Inspect Full Register</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4">
            {activities.slice(0, 4).map((act, i) => (
              <div key={act.id} className="relative pl-6 pb-2 last:pb-0 flex items-start gap-3">
                {/* Connector line */}
                {i < 3 && (
                  <div className="absolute left-2.5 top-6 bottom-[-16px] w-[2px] bg-slate-850 dark:bg-slate-900 light:bg-slate-200" />
                )}
                <div className="absolute left-1.5 top-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 font-sans truncate">{act.description}</span>
                    <span className="text-[9px] font-mono text-slate-400 shrink-0">{new Date(act.date).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-mono text-slate-450 uppercase">{act.user}</span>
                    <span className="text-[8px] font-mono bg-slate-900/65 text-slate-400 border border-slate-800 px-1.5 rounded uppercase">
                      {act.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Quick summary stats for current Persona and Tasks */}
        <div className="lg:col-span-5 p-5 rounded-2xl border dark:bg-slate-900/40 dark:border-slate-800/80 light:bg-white light:border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold font-display">Platform Action Directives</h3>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Action alerts matching your {currentUser.role} permissions</p>
          </div>

          <div className="space-y-3.5 my-4">
            {currentUser.role === UserRole.ADMIN && (
              <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.02] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Root Permissions Enforced</div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                    You have complete master credentials to append/edit vendor portfolios, examine RFI/RFP codes, and oversee general ERP accounting frameworks.
                  </div>
                </div>
              </div>
            )}

            {currentUser.role === UserRole.PROCUREMENT && (
              <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.02] flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">Verify Steel Alloy RFQ-001 Bids</div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                    All 3 assigned vendors have finished uploading quotes. Use the **Bid Comparison Board** to benchmark cost, turnaround, and SOW constraints.
                  </div>
                </div>
              </div>
            )}

            {currentUser.role === UserRole.MANAGER && (
              <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.02] flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-750 dark:text-amber-400">Decision Mandated: appr-002</div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                    RFQ-001 requires sign-off. Review and assign formal remarks inside the **Executive Approvals** tab to automatically generate the digital PO-*.
                  </div>
                </div>
              </div>
            )}

            {currentUser.role === UserRole.VENDOR && (
              <div className="p-3 rounded-lg border border-sky-500/20 bg-sky-500/[0.02] flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-750 dark:text-sky-400">Open Tender Assignment: RFQ-004</div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5 leading-relaxed">
                    Your firm has been assigned to **RFQ-004 Turbine Casings**. Submit your breakdown bid details immediately to capture contracts.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t dark:border-slate-800/60 light:border-slate-200 text-center">
            <span className="text-[10px] font-mono text-slate-500">
              Sandbox Console Sync: Active (Green Stream)
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
