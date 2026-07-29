import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { modalAlert, toast } from '../utils/modal';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWhisper, setShowWhisper] = useState(false);
  const [whisperCategory, setWhisperCategory] = useState('other');
  const [whisperDescription, setWhisperDescription] = useState('');
  const [whisperLocation, setWhisperLocation] = useState('');
  const [whisperDepartment, setWhisperDepartment] = useState('');
  const [whisperSubmitting, setWhisperSubmitting] = useState(false);
  const [whisperSuccess, setWhisperSuccess] = useState(false);

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
          companyId: 'c-acme',
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-900 text-white fs-2xl mb-4 shadow-lg">
            ⚡
          </div>
          <h1 className="text-2xl fw-bold text-slate-900 tracking-tight">Enterprise ERP</h1>
          <p className="fs-sm text-slate-500 mt-1">Sign in to your account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-6 sm:p-8">
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
              <label className="block fs-xs fw-semibold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 fs-sm outline-hidden focus:border-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 transition-all"
              />
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

      {/* Whisper Report Modal */}
      {showWhisper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
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
                      <span className="flex items-center gap-2">
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
