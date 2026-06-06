/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Building2, Eye, EyeOff, ShieldAlert, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthScreens: React.FC = () => {
  const { login, register } = useApp();
  const [screen, setScreen] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('sarah.jenkins@vendorbridge.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.PROCUREMENT);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');

  // Password Reset State
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetSuccessStatus, setResetSuccessStatus] = useState(false);
  const [resetErrorMsg, setResetErrorMsg] = useState('');

  // Register State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountry, setRegCountry] = useState('United States');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regGstNumber, setRegGstNumber] = useState('');
  const [regRole, setRegRole] = useState<UserRole.PROCUREMENT | UserRole.VENDOR>(UserRole.VENDOR);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});
  const [regSuccess, setRegSuccess] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotErrors, setForgotErrors] = useState('');

  // Actions
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.includes('@') || loginEmail.length < 5) {
      setLoginError('Invalid corporate email address sequence structure.');
      return;
    }

    if (loginPassword.length < 5) {
      setLoginError('Access credentials require at least 5 secure characters.');
      return;
    }

    login(loginEmail, loginRole);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!regFirstName.trim()) errs.firstName = 'First Name is strictly required.';
    if (!regLastName.trim()) errs.lastName = 'Last Name is strictly required.';
    if (!regEmail.includes('@')) errs.email = 'Requires complete valid email address.';
    if (!regPhone.trim()) errs.phone = 'Requires functional phone callback number.';
    if (!regCompanyName.trim()) errs.companyName = 'Requires registered enterprise identity name.';
    if (regRole === UserRole.VENDOR && !regGstNumber.trim()) {
      errs.gstNumber = 'Tax / GST registration is mandatory for Vendor accounts.';
    }

    setRegErrors(errs);
    if (Object.keys(errs).length > 0) return;

    register({
      firstName: regFirstName,
      lastName: regLastName,
      email: regEmail,
      phone: regPhone,
      country: regCountry,
      companyName: regCompanyName,
      gstNumber: regGstNumber,
      role: regRole,
    });

    setRegSuccess(true);
    setTimeout(() => {
      // Auto login
      login(regEmail, regRole);
    }, 1500);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotErrors('');

    if (!forgotEmail.includes('@')) {
      setForgotErrors('Input correct enterprise email handle.');
      return;
    }

    setForgotSuccess(true);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-950 font-sans tracking-tight">
      
      {/* LEFT PANEL: Enterprise stats & visualizations */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 relative border-r border-slate-900 overflow-hidden">
        {/* Abstract vector glow loops */}
        <div className="absolute top-[20%] left-[-20%] w-[80%] h-[50%] rounded-full bg-emerald-500/10 blur-[130px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[40%] rounded-full bg-teal-500/10 blur-[100px]" />

        <div className="flex items-center gap-2 relative z-10 select-none">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-emerald-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-100 font-display">VendorBridge</div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Enterprise ERP Consoles</div>
          </div>
        </div>

        {/* Big high quality hook statement */}
        <div className="my-auto relative z-10 max-w-sm">
          <h1 className="text-3xl font-extrabold font-display leading-[1.15] text-white tracking-tight">
            Seamlessly Bridge Your <span className="text-emerald-400">Enterprise Procurement</span> Pipelines.
          </h1>
          <p className="mt-4 text-xs text-slate-400 leading-relaxed font-sans">
            Streamline RFQs, generate side-by-side bid comparisons instantly, manage rigorous internal workflows, and disburse secure Purchase Orders.
          </p>

          {/* Quick Metrics display */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-2xl font-bold font-display text-emerald-400">99.8%</div>
              <div className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">SLA FULFILLMENT RATIO</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="text-2xl font-bold font-display text-emerald-400">&lt; 3.0s</div>
              <div className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">BID RECOMMENDATION</div>
            </div>
          </div>
        </div>

        {/* Credentials / Sandbox footer */}
        <div className="text-[10px] font-mono text-slate-500 relative z-10 flex flex-col gap-1">
          <span>SECURED WITH SHA-256 ENCRYPTION</span>
          <span>© 2026 VendorBridge International Inc.</span>
        </div>
      </div>

      {/* RIGHT PANEL: Dynamic Auth Forms container */}
      <div className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            
            {/* --- 1. LOGIN SCREEN --- */}
            {screen === 'login' && (
              <motion.div 
                key="login-box"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400" />
                
                <h2 className="text-2xl font-bold font-display text-white">Sign In Console</h2>
                <p className="mt-1.5 text-xs text-slate-400 font-sans">Enter credentials to interface with ERP registries.</p>

                {loginError && (
                  <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form className="mt-6 space-y-4" onSubmit={handleLoginSubmit}>
                  {/* Persona Auto load selection helper */}
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1.5">Sandbox Persona Role</label>
                    <div className="grid grid-cols-4 gap-1 text-[10px]">
                      {[UserRole.ADMIN, UserRole.PROCUREMENT, UserRole.MANAGER, UserRole.VENDOR].map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            setLoginRole(role);
                            if (role === UserRole.ADMIN) setLoginEmail('alexander.vance@vendorbridge.com');
                            else if (role === UserRole.PROCUREMENT) setLoginEmail('sarah.jenkins@vendorbridge.com');
                            else if (role === UserRole.MANAGER) setLoginEmail('sophia.rodriguez@vendorbridge.com');
                            else if (role === UserRole.VENDOR) setLoginEmail('marcus@apexindustrial.com');
                          }}
                          className={`py-1.5 rounded font-mono border transition-all text-center uppercase
                            ${loginRole === role 
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-extrabold shadow-inner' 
                              : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300'}`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Corporate Email */}
                  <div>
                    <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1.5">Corporate Email</label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. sarah.jenkins@vendorbridge.com"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 font-sans"
                    />
                  </div>

                  {/* Password block */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Secure Pin Code / Password</label>
                      <button 
                        type="button" 
                        onClick={() => setScreen('forgot')}
                        className="text-[10px] font-semibold text-emerald-400 hover:underline hover:text-emerald-300"
                      >
                        Reset Credentials?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me and utilities */}
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500/40 focus:ring-offset-0 focus:outline-none"
                    />
                    <label htmlFor="remember-me" className="ml-2 text-xs text-slate-400 font-sans select-none cursor-pointer">
                      Remember device access token
                    </label>
                  </div>

                  {/* Submit code */}
                  <button 
                    type="submit"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 font-medium text-sm text-white rounded-lg shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 group transition-all"
                  >
                    <span>Authenticate Secure Session</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                {/* Switch to Register link */}
                <div className="mt-8 text-center text-xs text-slate-500 font-sans">
                  Don't have a workspace account?{' '}
                  <button 
                    onClick={() => setScreen('register')}
                    className="font-semibold text-emerald-400 hover:underline hover:text-emerald-300"
                  >
                    Register Organization
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- 2. REGISTER SCREEN --- */}
            {screen === 'register' && (
              <motion.div 
                key="register-box"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400" />
                
                <h2 className="text-2xl font-bold font-display text-white">Register Organization</h2>
                <p className="mt-1.5 text-xs text-slate-400 font-sans">Self-registration limited strictly to PROCUREMENT and VENDOR roles.</p>

                {regSuccess ? (
                  <div className="mt-6 py-8 text-center flex flex-col items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce mb-3" />
                    <h3 className="text-base font-bold text-slate-100">Profile Configured Successfully</h3>
                    <p className="text-xs text-slate-400 font-sans mt-1">Booting secure telemetry logs & redirecting...</p>
                  </div>
                ) : (
                  <form className="mt-6 space-y-4" onSubmit={handleRegisterSubmit}>
                    
                    {/* Role choice (RESTRICTED to procurement or vendor only) */}
                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1.5">Select Role Platform</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRegRole(UserRole.PROCUREMENT)}
                          className={`py-2 px-3 rounded border text-xs font-mono text-center uppercase transition-all
                            ${regRole === UserRole.PROCUREMENT 
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-extrabold' 
                              : 'border-slate-800 bg-slate-950 text-slate-500'}`}
                        >
                          PROCUREMENT OFFICER
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegRole(UserRole.VENDOR)}
                          className={`py-2 px-3 rounded border text-xs font-mono text-center uppercase transition-all
                            ${regRole === UserRole.VENDOR 
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-extrabold' 
                              : 'border-slate-800 bg-slate-950 text-slate-500'}`}
                        >
                          SUPPLIER / VENDOR
                        </button>
                      </div>
                    </div>

                    {/* Name blocks split */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1">First Name</label>
                        <input
                          type="text"
                          required
                          value={regFirstName}
                          onChange={(e) => setRegFirstName(e.target.value)}
                          placeholder="Elizabeth"
                          className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                        />
                        {regErrors.firstName && <span className="text-[10px] text-red-500 mt-0.5">{regErrors.firstName}</span>}
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1">Last Name</label>
                        <input
                          type="text"
                          required
                          value={regLastName}
                          onChange={(e) => setRegLastName(e.target.value)}
                          placeholder="Vane"
                          className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                        />
                        {regErrors.lastName && <span className="text-[10px] text-red-500 mt-0.5">{regErrors.lastName}</span>}
                      </div>
                    </div>

                    {/* Email and Phone */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1">Business Email</label>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => {
                            setRegEmail(e.target.value);
                            // Auto trigger company name if possible
                            if (e.target.value.includes('@') && !regCompanyName) {
                              const host = e.target.value.split('@')[1].split('.')[0];
                              setRegCompanyName(host.charAt(0).toUpperCase() + host.slice(1) + ' Corp');
                            }
                          }}
                          placeholder="bids@industrycorp.com"
                          className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                        />
                        {regErrors.email && <span className="text-[10px] text-red-500 mt-0.5">{regErrors.email}</span>}
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+1 (555) 0192-384"
                          className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                        />
                        {regErrors.phone && <span className="text-[10px] text-red-500 mt-0.5">{regErrors.phone}</span>}
                      </div>
                    </div>

                    {/* Corporate Name and GST Number */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1">Company Name</label>
                        <input
                          type="text"
                          required
                          value={regCompanyName}
                          onChange={(e) => setRegCompanyName(e.target.value)}
                          placeholder="Steelwork Solutions Ltd"
                          className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                        />
                        {regErrors.companyName && <span className="text-[10px] text-red-500 mt-0.5">{regErrors.companyName}</span>}
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1 font-sans">
                          {regRole === UserRole.VENDOR ? 'GST / TAX Registration *' : 'Tax Registration ID'}
                        </label>
                        <input
                          type="text"
                          required={regRole === UserRole.VENDOR}
                          value={regGstNumber}
                          onChange={(e) => setRegGstNumber(e.target.value)}
                          placeholder="GST981240182"
                          className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-xs focus:outline-none focus:border-emerald-500/40 focus:ring-1"
                        />
                        {regErrors.gstNumber && <span className="text-[10px] text-red-500 mt-0.5">{regErrors.gstNumber}</span>}
                      </div>
                    </div>

                    {/* Country choice */}
                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1">HQ Country</label>
                      <input
                        type="text"
                        required
                        value={regCountry}
                        onChange={(e) => setRegCountry(e.target.value)}
                        placeholder="United States"
                        className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 font-medium text-xs text-white rounded-lg shadow-lg flex items-center justify-center gap-1 mt-6"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Register & Create Sandbox Workspace</span>
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => setScreen('login')}
                      className="w-full text-center text-xs text-slate-400 hover:underline hover:text-emerald-300 font-sans mt-4"
                    >
                      Back to Sign In Dashboard
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* --- 3. FORGOT PASSWORD --- */}
            {screen === 'forgot' && (
              <motion.div 
                key="forgot-box"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400" />
                
                <h2 className="text-2xl font-bold font-display text-white">Reset Credentials</h2>
                <p className="mt-1.5 text-xs text-slate-400 font-sans">Enter your workspace corporate email address to receive simulation override credentials.</p>

                {forgotSuccess ? (
                  <div className="mt-6 py-6 text-center space-y-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce mb-1" />
                    <h3 className="text-base font-bold text-slate-100 font-display">Reset Link Dispatched</h3>
                    <p className="text-xs text-slate-400 font-sans max-w-xs mx-auto leading-relaxed">
                      We have simulated a secure credentials override link for <strong className="text-emerald-400">{forgotEmail}</strong>. Click below to instantly open the secure change panel.
                    </p>
                    <button 
                      onClick={() => {
                        setScreen('reset');
                        setForgotSuccess(false);
                      }}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 font-semibold text-xs text-white rounded-lg shadow-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Reset My Password Now</span>
                    </button>
                    <button 
                      onClick={() => {
                        setScreen('login');
                        setForgotSuccess(false);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-350 block mx-auto underline cursor-pointer"
                    >
                      Return to Sign In Console
                    </button>
                  </div>
                ) : (
                  <form className="mt-6 space-y-4" onSubmit={handleForgotSubmit}>
                    {forgotErrors && <span className="text-xs text-red-500 font-bold">{forgotErrors}</span>}
                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1">Corporate Email Account</label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="julia.roberts@vendorbridge.com"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 animate-none"
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 font-semibold text-xs text-white rounded-lg shadow-lg flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Simulate Dispatch Link</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setScreen('login')}
                      className="w-full text-center text-xs text-slate-400 hover:underline hover:text-emerald-300 font-sans mt-4"
                    >
                      Return to Console Sign In
                    </button>
                  </form>
                )}
              </motion.div>
            )}

            {/* --- 4. SECURE PASSWORD RESET --- */}
            {screen === 'reset' && (
              <motion.div 
                key="reset-box"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400" />
                
                <h2 className="text-2xl font-bold font-display text-white">Choose New Password</h2>
                <p className="mt-1.5 text-xs text-slate-400 font-sans">Set your new high-entropy corporate access credentials below.</p>

                {resetSuccessStatus ? (
                  <div className="mt-6 py-6 text-center space-y-4 w-full">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce mb-1" />
                    <h3 className="text-base font-bold text-slate-100 font-display">Password Changed Successfully!</h3>
                    <p className="text-xs text-slate-400 font-sans max-w-xs mx-auto leading-relaxed">
                      Your new credentials have been updated and are now live. You can now log into your suite instantly.
                    </p>
                    <button 
                      onClick={() => {
                        setScreen('login');
                        setResetSuccessStatus(false);
                        setResetNewPassword('');
                        setResetConfirmPassword('');
                        setResetErrorMsg('');
                      }}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 font-semibold text-xs text-white rounded-lg shadow-lg cursor-pointer transition-colors"
                    >
                      <span>Proceed to Sign In Console</span>
                    </button>
                  </div>
                ) : (
                  <form 
                    className="mt-6 space-y-4" 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setResetErrorMsg('');
                      
                      if (resetNewPassword.length < 6) {
                        setResetErrorMsg('Password must be at least 6 characters in length.');
                        return;
                      }

                      if (resetNewPassword !== resetConfirmPassword) {
                        setResetErrorMsg('Passwords do not match.');
                        return;
                      }

                      setResetSuccessStatus(true);
                    }}
                  >
                    {resetErrorMsg && (
                      <div className="p-2.5 rounded bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-bold">
                        {resetErrorMsg}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1">New Secure Password</label>
                      <input
                        type="password"
                        required
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={resetConfirmPassword}
                        onChange={(e) => setResetConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 font-semibold text-xs text-white rounded-lg shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Update Password Cryptography</span>
                    </button>

                    <button 
                      type="button"
                      onClick={() => setScreen('login')}
                      className="w-full text-center text-xs text-slate-400 hover:underline hover:text-emerald-300 font-sans mt-4"
                    >
                      Cancel and Return to Login
                    </button>
                  </form>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};
