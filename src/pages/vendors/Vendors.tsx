/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vendor } from '../../types';
import { jsPDF } from 'jspdf';
import { 
  Plus, Edit3, Trash2, Search, Filter, 
  MapPin, Star, Phone, Mail, Award, AlertOctagon, Check, UserPlus, Download, FileText
} from 'lucide-react';

export const Vendors: React.FC = () => {
  const { vendors, addVendor, updateVendor, deleteVendor } = useApp();
  
  // States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState<Vendor | null>(null);

  // Form states for creating/editing
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formGST, setFormGST] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCategory, setFormCategory] = useState('Raw Materials');
  const [formStatus, setFormStatus] = useState<'Active' | 'Pending' | 'Blacklisted'>('Active');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const categories = ['All', 'Raw Materials', 'IT Infrastructure', 'Industrial Hardware', 'Chemical Engineering'];

  // Search/Filters parsing
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.companyName.toLowerCase().includes(search.toLowerCase()) || 
                          v.name.toLowerCase().includes(search.toLowerCase()) || 
                          v.email.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || v.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const resetForm = () => {
    setFormName('');
    setFormCompany('');
    setFormGST('');
    setFormEmail('');
    setFormPhone('');
    setFormAddress('');
    setFormCategory('Raw Materials');
    setFormStatus('Active');
    setFormErrors({});
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formName.trim()) errors.name = 'Representative name is required.';
    if (!formCompany.trim()) errors.companyName = 'Company / Enterprise name is required.';
    if (!formEmail.includes('@')) errors.email = 'Valid corporate contact email required.';
    if (!formPhone.trim()) errors.phone = 'Direct telephone callback is required.';
    if (formGST.length < 5) errors.gstNumber = 'Valid GSTIN identity sequence is required.';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    addVendor({
      name: formName,
      companyName: formCompany,
      gstNumber: formGST,
      email: formEmail,
      phone: formPhone,
      address: formAddress,
      category: formCategory,
      status: formStatus,
    });

    setCreateModalOpen(false);
    resetForm();
  };

  const handleEditOpen = (v: Vendor) => {
    setEditModalOpen(v);
    setFormName(v.name);
    setFormCompany(v.companyName);
    setFormGST(v.gstNumber);
    setFormEmail(v.email);
    setFormPhone(v.phone);
    setFormAddress(v.address);
    setFormCategory(v.category);
    setFormStatus(v.status);
    setFormErrors({});
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalOpen) return;
    const errors: Record<string, string> = {};

    if (!formName.trim()) errors.name = 'Representative name is required.';
    if (!formCompany.trim()) errors.companyName = 'Company name is required.';
    if (!formEmail.includes('@')) errors.email = 'Valid email required.';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    updateVendor({
      ...editModalOpen,
      name: formName,
      companyName: formCompany,
      gstNumber: formGST,
      email: formEmail,
      phone: formPhone,
      address: formAddress,
      category: formCategory,
      status: formStatus,
    });

    setEditModalOpen(null);
    resetForm();
  };

  const getStatusBadge = (status: 'Active' | 'Pending' | 'Blacklisted') => {
    switch (status) {
      case 'Active':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-bold">Active</span>;
      case 'Pending':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-amber-500/10 text-amber-550 border border-amber-500/20 uppercase font-bold">Pending Review</span>;
      case 'Blacklisted':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 uppercase font-bold">Blacklisted</span>;
    }
  };

  const handleExportVendorsPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Header block
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("VendorBridge Supplier Network", 14, 20);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("Certified Enterprise Directory and SLA Compliance Registry", 14, 25);
      doc.text(`Generated: ${new Date().toUTCString()}`, 14, 29);
      
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(14, 32, 196, 32);

      // Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(`Active Network Summary (${filteredVendors.length} Registered Suppliers)`, 14, 40);

      // Table Header row for PDF
      doc.setFillColor(241, 245, 249);
      doc.rect(14, 44, 182, 7, "F");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Company Name", 16, 49);
      doc.text("Representative", 70, 49);
      doc.text("Category", 110, 49);
      doc.text("GST Number", 145, 49);
      doc.text("Status", 175, 49);

      let y = 56;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      filteredVendors.forEach((vendor) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
          
          doc.setFillColor(241, 245, 249);
          doc.rect(14, y, 182, 7, "F");
          doc.setFont("helvetica", "bold");
          doc.text("Company Name", 16, y + 5);
          doc.text("Representative", 70, y + 5);
          doc.text("Category", 110, y + 5);
          doc.text("GST Number", 145, y + 5);
          doc.text("Status", 175, y + 5);
          y += 12;
          doc.setFont("helvetica", "normal");
        }

        doc.setTextColor(15, 23, 42);
        doc.text(vendor.companyName, 16, y);
        doc.setTextColor(100, 116, 139);
        doc.text(vendor.name, 70, y);
        doc.text(vendor.category, 110, y);
        doc.text(vendor.gstNumber || 'N/A', 145, y);
        
        if (vendor.status === 'Active') {
          doc.setTextColor(16, 185, 129); // emerald
        } else if (vendor.status === 'Pending') {
          doc.setTextColor(245, 158, 11); // amber
        } else {
          doc.setTextColor(239, 68, 68); // red
        }
        doc.text(vendor.status, 175, y);

        // draw sub phone/email under representative
        doc.setFont("helvetica", "oblique");
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(`${vendor.email}  |  ${vendor.phone}`, 70, y + 3.5);

        doc.setDrawColor(241, 245, 249);
        doc.line(14, y + 6, 196, y + 6);

        y += 11;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
      });

      // Footing note
      doc.setFont("helvetica", "italic");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("CONFIDENTIAL • VendorBridge Authorized Sourcing Registry. All corporate liaisons listed have validated non-disclosure certificates.", 14, 285);

      doc.save("vendorbridge_certified_vendors_2026.pdf");
    } catch (err: any) {
      console.error(err);
      alert("Error compiling Vendor PDF: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white">Consolidated Vendor Directory</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Pre-screen and manage certified supplier profiles</p>
        </div>
        
        <div className="flex items-center gap-2 select-none font-sans">
          <button 
            onClick={handleExportVendorsPDF}
            className="px-3 py-2 bg-slate-500/10 hover:bg-slate-500/15 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Directory PDF</span>
          </button>
          
          <button 
            onClick={() => {
              resetForm();
              setCreateModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg font-sans flex items-center justify-center gap-1.5 transition-all w-fit shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Supplier Hub</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="p-4 rounded-xl border dark:bg-slate-900/40 dark:border-slate-800 light:bg-white light:border-slate-200 select-none flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
          {/* Custom Search field */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter company, email, representative..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border text-xs focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 light:bg-slate-50 light:border-slate-200 light:text-slate-800"
            />
          </div>

          {/* Category Dropdown Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-450 shrink-0" />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 light:bg-slate-50 light:border-slate-200"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        {/* Status choices horizontal segment */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-450">SLA Status:</span>
          <div className="flex rounded-md border dark:bg-slate-950 dark:border-slate-800 light:bg-slate-50 light:border-slate-200 overflow-hidden">
            {['All', 'Active', 'Pending', 'Blacklisted'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-[11px] font-medium transition-colors
                  ${statusFilter === status 
                    ? 'bg-emerald-500/10 text-emerald-500 font-bold' 
                    : 'text-slate-400 hover:text-slate-250 hover:bg-slate-500/5'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CORE DISPLAY: THE VENDOR LIST TABLE */}
      {filteredVendors.length === 0 ? (
        <div className="py-16 text-center border border-dashed dark:border-slate-800 light:border-slate-300 rounded-2xl">
          <AlertOctagon className="w-10 h-10 text-slate-550 mx-auto mb-3 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-200">No Affiliated Suppliers Located</h3>
          <p className="text-xs text-slate-400 font-sans mt-1">Adjust search metrics or add a new vendor profile.</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Responsive Table UI */}
          <div className="overflow-x-auto rounded-xl border dark:border-slate-800/80 light:border-slate-200 bg-slate-500/5 shadow-md">
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead className="bg-slate-500/5 text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b dark:border-slate-800 light:border-slate-250">
                <tr>
                  <th className="p-4">Enterprise / Representative Name</th>
                  <th className="p-4">Compliance Status</th>
                  <th className="p-4">Category Business Line</th>
                  <th className="p-4">GST Number</th>
                  <th className="p-4">Client Interface Rating</th>
                  <th className="p-4">Fulfilled orders</th>
                  <th className="p-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-850 light:divide-slate-200">
                {filteredVendors.map((vendor) => (
                  <tr 
                    key={vendor.id}
                    className="hover:bg-slate-500/[0.02] dark:text-slate-200 light:text-slate-800 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-sm">{vendor.companyName}</div>
                      <div className="text-[11px] text-slate-400 font-normal mt-0.5">{vendor.name} • {vendor.email}</div>
                    </td>
                    <td className="p-4">{getStatusBadge(vendor.status)}</td>
                    <td className="p-4 font-medium dark:text-slate-350">{vendor.category}</td>
                    <td className="p-4 font-mono text-[11px] text-slate-400">{vendor.gstNumber}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{vendor.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-400 font-medium">{vendor.completedOrdersCount} orders</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleEditOpen(vendor)}
                          className="p-1.5 rounded hover:bg-emerald-500/10 text-emerald-500 hover:text-emerald-400 transition-colors"
                          title="Edit corporate profile"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Confirm permanent removal of supplier portfolio for "${vendor.companyName}"?`)) {
                              deleteVendor(vendor.id);
                            }
                          }}
                          className="p-1.5 rounded hover:bg-red-500/10 text-red-500 hover:text-red-400 transition-colors"
                          title="Delete supplier record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Insights Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredVendors.slice(0, 3).map(v => (
              <div 
                key={`bento-${v.id}`}
                className="p-4 rounded-xl border dark:bg-slate-900/20 dark:border-slate-800 light:bg-white light:border-slate-200 shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-transform"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[9px] font-mono uppercase bg-slate-500/5 border px-1.5 py-0.5 rounded dark:text-slate-400">{v.category}</span>
                    {getStatusBadge(v.status)}
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 mt-2.5">{v.companyName}</h4>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">Primary liaison: {v.name}</p>
                </div>

                <div className="mt-4 pt-3 border-t dark:border-slate-850 light:border-slate-250 flex items-center justify-between text-[11px]">
                  <span className="text-slate-450 font-mono">Rating SLA score:</span>
                  <div className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{v.rating.toFixed(1)} ★ ({v.averageDeliveryDays}d avg)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* --- ADD VENDOR MODAL --- */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500" />
            
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Register Corporate Supplier Profile</h3>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">Ensure alignment with statutory corporate registration records.</p>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono font-semibold text-slate-400 mb-1">Company legal name</label>
                  <input 
                    type="text" 
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="Horizon Metals Inc"
                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  {formErrors.companyName && <span className="text-[10px] text-red-500">{formErrors.companyName}</span>}
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase font-mono font-semibold text-slate-400 mb-1">Tax Registration / GSTIN</label>
                  <input 
                    type="text" 
                    required
                    value={formGST}
                    onChange={(e) => setFormGST(e.target.value)}
                    placeholder="GSTIN981240182"
                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  {formErrors.gstNumber && <span className="text-[10px] text-red-500">{formErrors.gstNumber}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono font-semibold text-slate-400 mb-1">Primary Liaison Name</label>
                  <input 
                    type="text" 
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Kenji Takahashi"
                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  {formErrors.name && <span className="text-[10px] text-red-500">{formErrors.name}</span>}
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono font-semibold text-slate-400 mb-1">Corporate Field Category</label>
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="IT Infrastructure">IT Infrastructure</option>
                    <option value="Industrial Hardware">Industrial Hardware</option>
                    <option value="Chemical Engineering">Chemical Engineering</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono font-semibold text-slate-400 mb-1">Corporate Contact Email</label>
                  <input 
                    type="email" 
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="bids@horizontech.jp"
                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  {formErrors.email && <span className="text-[10px] text-red-500">{formErrors.email}</span>}
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono font-semibold text-slate-400 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+81 (3) 5555"
                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  {formErrors.phone && <span className="text-[10px] text-red-500">{formErrors.phone}</span>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono font-semibold text-slate-400 mb-1">Office Address Location</label>
                <input 
                  type="text" 
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Minato City, Tokyo, Japan"
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button 
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 hover:bg-slate-800 text-slate-450 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                >
                  Register Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT VENDOR MODAL --- */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative font-sans">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500" />
            
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Adjust Supplier Configuration</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Update profiles or set compliance constraints.</p>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Company name</label>
                  <input 
                    type="text" 
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Compliance Status</label>
                  <select 
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-150 text-xs focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Representative Liaison</label>
                  <input 
                    type="text" 
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Corporate Field</label>
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs focus:outline-none"
                  >
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="IT Infrastructure">IT Infrastructure</option>
                    <option value="Industrial Hardware">Industrial Hardware</option>
                    <option value="Chemical Engineering">Chemical Engineering</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Liaison Contact Email</label>
                  <input 
                    type="email" 
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button 
                  type="button"
                  onClick={() => setEditModalOpen(null)}
                  className="px-4 py-2 hover:bg-slate-800 text-slate-450 rounded-lg text-xs"
                >
                  Discard Changes
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                >
                  Save Supplier Metrics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
