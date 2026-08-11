import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  
  // Splash screen state
  const [showSplash, setShowSplash] = useState(true);
  const [bgIndex, setBgIndex] = useState(0);

  const splashImages = [
    '/splash1.jpg',
    '/splash2.jpg'
  ];

  useEffect(() => {
    // Alternate images every 3 seconds
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % splashImages.length);
    }, 3000);
    
    // Hide splash screen after 1.5 seconds
    const timeout = setTimeout(() => {
      setShowSplash(false);
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const result = await login(email, password);
    setBusy(false);
    if (result.error) setError(result.error);
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 overflow-hidden">
        {splashImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${bgIndex === idx ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={img} alt="Splash Background" className="w-full h-full object-cover" />
          </div>
        ))}
        
        <div className="relative z-10 flex flex-col items-center justify-center animate-fade-in-up">
          <div className="w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-md p-4 mb-8 shadow-2xl border border-white/20 flex items-center justify-center">
            <img src="/logo.jpg" alt="Core360 Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4 drop-shadow-lg">Core<span className="text-blue-400">360</span></h1>
          <p className="text-xl text-slate-300 font-medium tracking-wide mb-12 text-center max-w-md drop-shadow-md">
            {bgIndex === 0 ? 'Empowering Modern Enterprise' : 'Seamless Supply Chain & ERP'}
          </p>
          
          <div className="flex items-center gap-2">
            {splashImages.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-500 ${bgIndex === idx ? 'w-8 bg-blue-500' : 'w-2 bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-20 w-20 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-5 overflow-hidden p-2">
            <img src="/logo.jpg" alt="Core360 Logo" className="w-full h-full object-contain rounded-xl" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Core360</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {busy ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
