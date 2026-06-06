import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp } from '../../context/AppContext';
import { 
  User, Mail, Phone, Globe, Building2, Save, X, Check, Sparkles, Sliders
} from 'lucide-react';

// Form validation schema using Zod
const profileSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must contain at least 2 characters.' }),
  lastName: z.string().min(2, { message: 'Last name must contain at least 2 characters.' }),
  email: z.string().email({ message: 'Must be a valid corporate email address.' }),
  phone: z.string().min(6, { message: 'Phone number sequence must look valid.' }),
  country: z.string().min(2, { message: 'Country name is too short.' }),
  companyName: z.string().min(2, { message: 'Enterprise name is required.' }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileSettingsProps {
  onCancel: () => void;
}

// Preset Premium Avatars 
const PREMIUM_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
];

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onCancel }) => {
  const { currentUser, updateProfile, theme, toggleTheme } = useApp();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Choose avatar state (stored in localstorage as well)
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return localStorage.getItem('vb-avatar') || PREMIUM_AVATARS[0];
  });

  // Set default values from current logged-in user profile
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '+1 (555) 4920-192',
      country: currentUser.country || 'United States',
      companyName: currentUser.companyName || 'VendorBridge Logistics',
    }
  });

  const onSubmit = (data: ProfileFormValues) => {
    // Update profile state in context
    updateProfile({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      country: data.country,
      companyName: data.companyName,
    });

    // Save avatar
    localStorage.setItem('vb-avatar', selectedAvatar);

    // Show beautiful premium toast feedback
    setToastMessage('Profile settings updated successfully!');
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-none font-sans relative">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500 text-slate-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-emerald-400" />
          </div>
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div>
        <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <span>User Profile Management</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Edit credentials, select preset avatars, and configure global theme vision</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: AVATAR & VISIBILITY CONFIG */}
        <div className="md:col-span-1 p-5 rounded-xl border dark:bg-slate-900/40 dark:border-slate-800 bg-white border-slate-200 shadow-sm space-y-6">
          
          {/* Avatar selector */}
          <div className="space-y-3 text-center md:text-left">
            <label className="block text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider">
              Profile Avatar Profile
            </label>
            <div className="relative w-24 h-24 mx-auto md:mx-0 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-850 shadow-md">
              <img 
                src={selectedAvatar} 
                alt="Representative Avatar" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex justify-center md:justify-start gap-2 mt-2">
              {PREMIUM_AVATARS.map((avUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(avUrl)}
                  className={`w-7 h-7 rounded-lg overflow-hidden border transition-all ${
                    selectedAvatar === avUrl 
                      ? 'border-emerald-500 scale-[1.08] ring-2 ring-emerald-500/20' 
                      : 'border-slate-250 hover:border-slate-400 dark:border-slate-800'
                  }`}
                >
                  <img src={avUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="" />
                </button>
              ))}
            </div>
          </div>

          <hr className="dark:border-slate-850 border-slate-100" />

          {/* Read only Role Indicator */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider text-xs block">
              Authorized Authority Role
            </span>
            <div className="p-2.5 rounded-lg border dark:border-slate-800/80 bg-slate-500/5 text-xs text-emerald-400 font-mono font-bold uppercase tracking-wide flex items-center justify-between">
              <span>{currentUser.role}</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* Personal Theme Select preference info */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider text-xs block font-bold">
              Theme Configuration
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full text-xs font-semibold py-2 px-3 border rounded-lg flex items-center justify-between dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-900 bg-slate-50 border-slate-200 hover:bg-slate-100 cursor-pointer"
            >
              <span>Current Preference:</span>
              <span className="text-emerald-400 uppercase font-mono font-bold">{theme}</span>
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: CORE DETAILS SHEET FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="md:col-span-2 p-6 rounded-xl border dark:bg-slate-900/40 dark:border-slate-800 bg-white border-slate-200 shadow-sm space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* First Name */}
            <div>
              <label className="block text-[10px] uppercase font-mono font-semibold text-slate-400 mb-1.5">First name / Given name</label>
              <div className="relative">
                <User className="absolute left-2.5 top-3 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  {...register('firstName')}
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg border text-xs focus:outline-none dark:bg-slate-950 dark:border-slate-800 bg-slate-50 border-slate-200 dark:text-slate-100"
                />
              </div>
              {errors.firstName && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.firstName.message}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-[10px] uppercase font-mono font-semibold text-slate-400 mb-1.5">Last name / Family name</label>
              <div className="relative">
                <User className="absolute left-2.5 top-3 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  {...register('lastName')}
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg border text-xs focus:outline-none dark:bg-slate-950 dark:border-slate-800 bg-slate-50 border-slate-200 dark:text-slate-100"
                />
              </div>
              {errors.lastName && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.lastName.message}</p>}
            </div>

            {/* Corporate Email */}
            <div>
              <label className="block text-[10px] uppercase font-mono font-semibold text-slate-400 mb-1.5">Corporate Email Address</label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-3 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="email" 
                  {...register('email')}
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg border text-xs focus:outline-none dark:bg-slate-950 dark:border-slate-800 bg-slate-50 border-slate-200 dark:text-slate-100"
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.email.message}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[10px] uppercase font-mono font-semibold text-slate-400 mb-1.5">Telephone direct callback</label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-3 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  {...register('phone')}
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg border text-xs focus:outline-none dark:bg-slate-950 dark:border-slate-800 bg-slate-50 border-slate-200 dark:text-slate-100"
                />
              </div>
              {errors.phone && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.phone.message}</p>}
            </div>

            {/* Country */}
            <div>
              <label className="block text-[10px] uppercase font-mono font-semibold text-slate-400 mb-1.5">Assigned Country HQ</label>
              <div className="relative">
                <Globe className="absolute left-2.5 top-3 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  {...register('country')}
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg border text-xs focus:outline-none dark:bg-slate-950 dark:border-slate-800 bg-slate-50 border-slate-200 dark:text-slate-100"
                />
              </div>
              {errors.country && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.country.message}</p>}
            </div>

            {/* Enterprise Domain */}
            <div>
              <label className="block text-[10px] uppercase font-mono font-semibold text-slate-400 mb-1.5">Assigned Corporate Sourcing Hub</label>
              <div className="relative">
                <Building2 className="absolute left-2.5 top-3 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  {...register('companyName')}
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg border text-xs focus:outline-none dark:bg-slate-950 dark:border-slate-800 bg-slate-50 border-slate-200 dark:text-slate-100"
                />
              </div>
              {errors.companyName && <p className="text-[10px] text-red-500 mt-1 font-bold">{errors.companyName.message}</p>}
            </div>

          </div>

          {/* ACTION BUTTONS GROUP */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t dark:border-slate-850 border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 bg-slate-500/10 hover:bg-slate-500/15 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Change</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
