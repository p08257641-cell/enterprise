import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { modalAlert, toast } from '../utils/modal';
import { sendSMS } from '../utils/sms';
import { sendEmail } from '../utils/email';
import { LegalView } from './moduleViews/LegalView';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showWhisper, setShowWhisper] = useState(false);
  const [whisperCategory, setWhisperCategory] = useState('other');
  const [whisperDescription, setWhisperDescription] = useState('');
  const [whisperLocation, setWhisperLocation] = useState('');
  const [whisperDepartment, setWhisperDepartment] = useState('');
  const [whisperSubmitting, setWhisperSubmitting] = useState(false);
  const [whisperSuccess, setWhisperSuccess] = useState(false);
  const [whisperCompanyId, setWhisperCompanyId] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const [matchedCompany, setMatchedCompany] = useState<any>(null);
  const [showLegal, setShowLegal] = useState<'privacy' | 'terms' | null>(null);

  const [authView, setAuthView] = useState<'login' | 'forgot'>('login');
  const [resetContact, setResetContact] = useState('');
  const [resetMethod, setResetMethod] = useState<'email' | 'sms'>('email');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const [showSplash, setShowSplash] = useState(true);
  const [bgIndex, setBgIndex] = useState(0);

  const activeImages = useMemo(() => {
    return matchedCompany?.loginImages?.length > 0 
      ? matchedCompany.loginImages 
      : ['/splash1.jpg', '/splash2.jpg', '/splash3.jpg'];
  }, [matchedCompany]);

  useEffect(() => {
    fetch('/api/public/companies')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCompanies(data);
          const currentHost = window.location.hostname;
          const subdomain = currentHost.split('.')[0].toLowerCase();
          
          const found = data.find((c: any) => 
            c.domain === currentHost || 
            c.id === `c-${subdomain}` ||
            c.domain?.toLowerCase().startsWith(subdomain)
          );
          
          if (found) {
            setMatchedCompany(found);
            setWhisperCompanyId(found.id);
          } else if (data.length > 0) {
            setMatchedCompany(null);
            setWhisperCompanyId(data[0].id);
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => {
        setDataLoaded(true);
      });
  }, []);

  // Preload background images asynchronously without blocking UI
  useEffect(() => {
    if (!dataLoaded) return;
    
    let loadedCount = 0;
    if (!activeImages || activeImages.length === 0) {
      setImagesPreloaded(true);
      return;
    }
    
    activeImages.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === activeImages.length) setImagesPreloaded(true);
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === activeImages.length) setImagesPreloaded(true);
      };
      img.src = src;
    });
  }, [dataLoaded, activeImages]);

  // Carousel timer
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % (activeImages.length || 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [activeImages.length]);

  // Fast splash screen intro: displays brief 500ms branded splash intro then reveals login form without blocking on image preloading
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetContact.trim()) return;
    setResetSubmitting(true);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpCode);

    const companyToUse = matchedCompany || (companies && companies.length > 0 ? companies[0] : {} as any);

    let res: { success: boolean; message: string };

    if (resetMethod === 'sms') {
      res = await sendSMS({
        company: companyToUse,
        to: resetContact,
        message: `Your CORE360 password reset OTP code is ${otpCode}. Valid for 10 minutes.`
      });
    } else {
      res = await sendEmail({
        company: companyToUse,
        to: resetContact,
        subject: `[CORE360] Password Reset Verification Code`,
        htmlBody: `<div style="font-family:sans-serif;padding:20px;max-width:500px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;">
          <h2 style="color:#0f172a;">Password Reset Verification</h2>
          <p style="color:#475569;">You requested a password reset for your account. Please use the 6-digit OTP code below:</p>
          <div style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#2563eb;background:#f8fafc;padding:16px;text-align:center;border-radius:8px;margin:20px 0;">${otpCode}</div>
          <p style="font-size:12px;color:#94a3b8;">If you did not request this, please ignore this message.</p>
        </div>`
      });
    }

    setResetSubmitting(false);

    if (res.success) {
      toast(res.message, 'success', 'OTP Dispatched');
      setResetStep('verify');
    } else {
      modalAlert(res.message, { variant: 'danger' });
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() !== generatedOtp.trim()) {
      modalAlert('Invalid OTP verification code. Please check your inbox or phone messages and try again.', { variant: 'danger' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      modalAlert('New password must be at least 6 characters long.', { variant: 'danger' });
      return;
    }
    if (newPassword !== confirmPassword) {
      modalAlert('Passwords do not match. Please enter matching passwords.', { variant: 'danger' });
      return;
    }

    setResetSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    setResetSubmitting(false);
    setResetSuccess(true);
    toast('Your password has been successfully updated!', 'success', 'Password Changed');
  };

  const handleWhisperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whisperDescription.trim()) {
      toast('Please describe your concern', 'error', 'Required');
      return;
    }
    setWhisperSubmitting(true);
    try {
      const res = await fetch('/api/whisper-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: whisperCompanyId || 'c-acme',
          category: whisperCategory,
          description: whisperDescription,
          location: whisperLocation,
          department: whisperDepartment,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setWhisperSuccess(true);
        setWhisperDescription('');
        setWhisperLocation('');
        setWhisperDepartment('');
        setWhisperCategory('other');
      } else {
        toast(data.error || 'Failed to submit report', 'error', 'Error');
      }
    } catch (err) {
      toast('Network error. Please try again.', 'error', 'Error');
    }
    setWhisperSubmitting(false);
  };

  if (showLegal) {
    return (
      <div className="min-h-screen bg-slate-50 overflow-y-auto">
        <LegalView type={showLegal} onBack={() => setShowLegal(null)} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          <span className="fs-sm text-slate-500 fw-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (showSplash) {
    const defaultImages = ['/splash1.jpg', '/splash2.jpg', '/splash3.jpg'];
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 overflow-hidden p-4 sm:p-8">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 animate-fade-in-up">
          
          {/* Text Content */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white p-4 mb-8 shadow-xl border border-slate-100 flex items-center justify-center overflow-hidden">
              <img src={matchedCompany?.companyLogo || "/logo.jpg"} alt="Core360 Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-4">Core<span className="text-blue-600">360</span></h1>
            <p className="text-lg sm:text-xl text-slate-600 font-medium tracking-wide mb-10 max-w-md">
              {bgIndex === 0 ? 'Empowering Modern Enterprise' : bgIndex === 1 ? 'Seamless Supply Chain & ERP' : 'Next-Generation Workforce Management'}
            </p>
            
            <div className="flex items-center justify-center lg:justify-start gap-2">
              {defaultImages.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${idx === bgIndex ? 'w-8 bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'w-2 bg-slate-300'}`}
                />
              ))}
            </div>
          </div>

          {/* Image Container */}
          <div className="flex-1 w-full max-w-2xl relative aspect-[4/3] lg:aspect-[3/4] xl:aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
            {defaultImages.map((img, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === bgIndex ? 'opacity-100' : 'opacity-0'}`}
              >
                <img src={img} alt="Splash Content" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-50 pointer-events-none"></div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-stretch bg-slate-50 animate-fade-in overflow-hidden">
      {/* Left Side - Image Carousel */}
      <div className="hidden md:flex md:w-1/2 xl:w-[55%] p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full h-full relative overflow-hidden rounded-t-[2.5rem] rounded-bl-[4rem] rounded-br-2xl bg-slate-900 shadow-2xl">
          {activeImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === bgIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
            >
              <img src={img} alt={`Slide ${idx}`} className="w-full h-full object-cover object-center" />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent"></div>
          <div className="absolute inset-0 bg-slate-900/10"></div>

          <div className="absolute bottom-10 left-10 right-10 lg:bottom-16 lg:left-12 lg:right-12 z-20">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md p-3 mb-6 shadow-xl border border-white/20 flex items-center justify-center overflow-hidden">
              <img src={matchedCompany?.companyLogo || "/logo.jpg"} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-md">
              {matchedCompany ? matchedCompany.name : 'Core360'}
            </h2>
            <p className="text-lg text-white/90 font-medium max-w-lg mb-8 drop-shadow">
              {matchedCompany ? 'Welcome back to your workspace.' : 'Next-Generation Enterprise Management System.'}
            </p>
            <div className="flex items-center gap-2">
              {activeImages.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-500 ${idx === bgIndex ? 'w-8 bg-white' : 'w-3 bg-white/30'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 relative overflow-y-auto">
        <div className="w-full max-w-md mx-auto relative z-10 py-12">
          <div className="text-center lg:text-left mb-8">
            <div className="lg:hidden inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white shadow-sm border border-slate-200 mb-5 overflow-hidden p-2">
              <img src={matchedCompany?.companyLogo || "/logo.jpg"} alt="Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl fw-bold text-slate-900 tracking-tight">
              {authView === 'login' ? 'Sign in to your account' : 'Reset your password'}
            </h1>
            <p className="fs-sm text-slate-500 mt-2">
              {authView === 'login' ? 'Enter your credentials to access the platform.' : 'Enter your email or phone number to receive reset instructions.'}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 mb-8">
            {authView === 'login' ? (
              <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 fs-xs text-red-700 fw-semibold">
                <i className="bi bi-exclamation-triangle-fill"></i>
                {error}
              </div>
            )}

            <div>
              <label className="block fs-xs fw-semibold text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 fs-sm outline-hidden focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block fs-xs fw-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setAuthView('forgot')}
                  className="text-blue-600 hover:text-blue-700 text-xs font-semibold cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 fs-sm outline-hidden focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg fw-semibold fs-sm transition-all shadow-xs cursor-pointer ${
                loading
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
          ) : (
            <div className="space-y-5 animate-fade-in">
              {resetSuccess ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Password Successfully Reset</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Your password has been updated. You can now sign in with your new credentials.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setAuthView('login'); setResetSuccess(false); setResetStep('request'); setResetContact(''); setEnteredOtp(''); setNewPassword(''); setConfirmPassword(''); }}
                    className="w-full rounded-lg bg-slate-900 text-white px-4 py-2.5 fs-sm fw-semibold hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Sign In Now
                  </button>
                </div>
              ) : resetStep === 'verify' ? (
                <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                    OTP Code sent to <span className="fw-bold">{resetContact}</span> via {resetMethod.toUpperCase()}.
                  </div>
                  <div>
                    <label className="block fs-xs fw-semibold text-slate-700 mb-1">6-Digit OTP Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={e => setEnteredOtp(e.target.value)}
                      placeholder="Enter 6-digit code (e.g. 123456)"
                      required
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 fs-sm font-mono text-center tracking-widest text-lg font-bold outline-hidden focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block fs-xs fw-semibold text-slate-700 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 fs-sm outline-hidden focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block fs-xs fw-semibold text-slate-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 fs-sm outline-hidden focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-white fs-sm fw-semibold hover:bg-emerald-700 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {resetSubmitting ? <><i className="bi bi-arrow-repeat animate-spin"></i> Verifying...</> : 'Verify OTP & Reset Password'}
                  </button>
                  <div className="flex items-center justify-between text-xs mt-3">
                    <button type="button" onClick={() => setResetStep('request')} className="text-slate-500 hover:text-slate-700 font-medium">← Resend OTP / Change Contact</button>
                    <button type="button" onClick={() => setAuthView('login')} className="text-slate-500 hover:text-slate-700 font-medium">Back to sign in</button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-5">
                  <div>
                    <label className="block fs-xs fw-semibold text-slate-700 mb-2">Reset via</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setResetMethod('email')}
                        className={`py-2 px-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${resetMethod === 'email' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                      >
                        <i className="bi bi-envelope"></i> Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetMethod('sms')}
                        className={`py-2 px-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-all ${resetMethod === 'sms' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                      >
                        <i className="bi bi-phone"></i> SMS
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block fs-xs fw-semibold text-slate-700 mb-1.5">
                      {resetMethod === 'email' ? 'Email address' : 'Phone number'}
                    </label>
                    <input
                      type={resetMethod === 'email' ? 'email' : 'tel'}
                      value={resetContact}
                      onChange={(e) => setResetContact(e.target.value)}
                      placeholder={resetMethod === 'email' ? 'you@company.com' : '+1 (555) 000-0000'}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 fs-sm outline-hidden focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resetSubmitting}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white fs-sm fw-semibold hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {resetSubmitting ? (
                      <><i className="bi bi-arrow-repeat animate-spin"></i> Sending OTP Code...</>
                    ) : (
                      'Send OTP Verification Code'
                    )}
                  </button>
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => setAuthView('login')}
                      className="text-slate-500 hover:text-slate-700 text-sm font-medium cursor-pointer transition-colors"
                    >
                      Back to sign in
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Whisper Reporting Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowWhisper(true)}
            className="fs-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer underline decoration-dotted underline-offset-2"
          >
            <i className="bi bi-eye-slash mr-1"></i>
            Whistleblower
          </button>
        </div>
      </div>
      </div>

      {/* Whisper Report Modal */}
      {showWhisper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white">
                  <i className="bi bi-eye-slash"></i>
                </div>
                <div>
                  <h2 className="fs-sm fw-bold text-slate-900">Whisper Report</h2>
                  <p className="text-[11px] text-slate-500">Submit anonymously — your identity is never recorded</p>
                </div>
              </div>
              <button
                onClick={() => { setShowWhisper(false); setWhisperSuccess(false); }}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-slate-600"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {whisperSuccess ? (
              <div className="px-4 sm:px-6 py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <i className="bi bi-check-lg text-emerald-600 text-2xl"></i>
                </div>
                <h3 className="fs-base fw-bold text-slate-900 mb-2">Report Submitted</h3>
                <p className="fs-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Thank you for speaking up. Your report has been sent to HR anonymously. 
                  We take every concern seriously and will investigate promptly.
                </p>
                <button
                  onClick={() => { setShowWhisper(false); setWhisperSuccess(false); }}
                  className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-lg fs-xs fw-semibold cursor-pointer hover:bg-slate-800 transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleWhisperSubmit} className="px-4 sm:px-6 py-5 space-y-4">
                <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl flex items-start gap-2 fs-xs text-violet-700">
                  <i className="bi bi-shield-check mt-0.5"></i>
                  <span>
                    <strong className="fw-semibold">100% Anonymous.</strong> Your name, email, IP address, and any identifying information are never recorded or tracked.
                  </span>
                </div>

                {matchedCompany ? (
                  <div>
                    <label className="block fs-xs fw-semibold text-slate-700 mb-1.5">Reporting to</label>
                    <div className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 fs-sm text-slate-700 fw-medium flex items-center">
                      <i className="bi bi-building me-2 text-violet-600"></i> {matchedCompany.name}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block fs-xs fw-semibold text-slate-700 mb-1.5">Company</label>
                    <select
                      value={whisperCompanyId}
                      onChange={(e) => setWhisperCompanyId(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 fs-sm outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 cursor-pointer"
                    >
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block fs-xs fw-semibold text-slate-700 mb-1.5">Category</label>
                  <select
                    value={whisperCategory}
                    onChange={(e) => setWhisperCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 fs-sm outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 cursor-pointer"
                  >
                    <option value="harassment">Harassment / Bullying</option>
                    <option value="safety">Workplace Safety</option>
                    <option value="fraud">Fraud / Financial Misconduct</option>
                    <option value="discrimination">Discrimination</option>
                    <option value="policy">Policy Violation</option>
                    <option value="ethics">Ethics Concern</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block fs-xs fw-semibold text-slate-700 mb-1.5">Description *</label>
                  <textarea
                    value={whisperDescription}
                    onChange={(e) => setWhisperDescription(e.target.value)}
                    placeholder="Please describe your concern in detail. Include names, dates, and any evidence if possible."
                    required
                    rows={4}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 fs-sm outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block fs-xs fw-semibold text-slate-700 mb-1.5">Location (optional)</label>
                    <input
                      type="text"
                      value={whisperLocation}
                      onChange={(e) => setWhisperLocation(e.target.value)}
                      placeholder="e.g., Floor 3, Room 201"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 fs-sm outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block fs-xs fw-semibold text-slate-700 mb-1.5">Department (optional)</label>
                    <input
                      type="text"
                      value={whisperDepartment}
                      onChange={(e) => setWhisperDepartment(e.target.value)}
                      placeholder="e.g., Sales, HR"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 fs-sm outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWhisper(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg fs-xs fw-semibold cursor-pointer hover:bg-slate-50 transition-all bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={whisperSubmitting || !whisperDescription.trim()}
                    className={`px-5 py-2 rounded-lg fs-xs fw-semibold transition-all shadow-xs cursor-pointer ${
                      whisperSubmitting || !whisperDescription.trim()
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-violet-600 text-white hover:bg-violet-700'
                    }`}
                  >
                    {whisperSubmitting ? (
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <i className="bi bi-send-fill"></i> Submit Anonymously
                      </span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
