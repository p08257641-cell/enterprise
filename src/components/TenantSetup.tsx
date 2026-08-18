/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Company } from '../types';

interface TenantSetupProps {
  onAddCompany: (company: {
    name: string;
    industry: string;
    currency: string;
    timezone: string;
    language: string;
    billingPlan: Company['billingPlan'];
  }) => void;
  onClose: () => void;
}

export const TenantSetup: React.FC<TenantSetupProps> = ({ onAddCompany, onClose }) => {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('Industrial Equipment');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('America/New_York');
  const [language, setLanguage] = useState('English');
  const [billingPlan, setBillingPlan] = useState<Company['billingPlan']>('Trial');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCompany({
      name,
      industry,
      currency,
      timezone,
      language,
      billingPlan
    });

    setStatusMessage("Tenant organization provisioned successfully! General ledger generated.");
    setName('');
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-slate-200/80 bg-white text-slate-600 p-6 shadow-2xl relative animate-fade-in">
        <h2 className="fs-sm fw-semibold text-slate-900 flex items-center gap-2 uppercase tracking-wide border-b border-slate-100 pb-3">
          <i className="bi bi-building text-slate-950 fs-sm"></i>
          Provision Multi-Tenant Organization (Company)
        </h2>

        <p className="fs-xs text-slate-500 mt-2 leading-relaxed">
          Platform-level tenant isolation container. Submitting this form allocates a dedicated database schema container, seeds a basic Operating Cash general ledger account, and provisions structural department blocks.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block fs-2xs fw-semibold uppercase tracking-wider text-slate-400">Corporate Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Stark Industries Ltd"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 fs-xs text-slate-900 outline-hidden focus:border-slate-950 focus:ring-1 focus:ring-slate-950 transition-all font-sans"
              required
            />
            {name && (
              <div className="mt-2 fs-xs text-slate-500 flex items-center gap-1.5">
                <i className="bi bi-globe text-slate-400"></i>
                Portal URL: <span className="fw-semibold text-slate-700">{name.toLowerCase().replace(/[^a-z0-9]/g, '')}.core360.site</span>
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block fs-2xs fw-semibold uppercase tracking-wider text-slate-400">Industry Sector</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 outline-hidden cursor-pointer focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
              >
                <option value="Industrial Equipment">Industrial Equipment</option>
                <option value="Biopharmaceuticals">Biopharmaceuticals</option>
                <option value="E-commerce & Retail">E-commerce & Retail</option>
                <option value="Automotive & Aerospace">Automotive & Aerospace</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>
            <div>
              <label className="block fs-2xs fw-semibold uppercase tracking-wider text-slate-400">Operating Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 outline-hidden cursor-pointer focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
              >
                <option value="USD">USD ($) - United States Dollar</option>
                <option value="EUR">EUR (€) - European Euro</option>
                <option value="GBP">GBP (£) - British Pound Sterling</option>
                <option value="JPY">JPY (¥) - Japanese Yen</option>
                <option value="AUD">AUD ($) - Australian Dollar</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block fs-2xs fw-semibold uppercase tracking-wider text-slate-400">Time Zone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 fs-xs text-slate-900 outline-hidden cursor-pointer focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
              >
                <option value="America/New_York">EST - America/New_York</option>
                <option value="Europe/Paris">CET - Europe/Paris</option>
                <option value="Europe/London">GMT - Europe/London</option>
                <option value="Asia/Tokyo">JST - Asia/Tokyo</option>
                <option value="Australia/Sydney">AEDT - Australia/Sydney</option>
              </select>
            </div>
            <div>
              <label className="block fs-2xs fw-semibold uppercase tracking-wider text-slate-400">Language</label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="English / German / French"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 fs-xs text-slate-900 outline-hidden focus:border-slate-950 focus:ring-1 focus:ring-slate-950 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block fs-2xs fw-semibold uppercase tracking-wider text-slate-400">Billing Plan / Subscription tier</label>
            <div className="mt-1.5 grid gap-2 sm:grid-cols-4 fs-xs fw-semibold">
              {(['Trial', 'Core', 'Premium', 'Enterprise'] as any[]).map(plan => (
                <button
                  type="button"
                  key={plan}
                  onClick={() => setBillingPlan(plan)}
                  className={`rounded-lg border py-2 px-1 transition-all text-center cursor-pointer ${
                    billingPlan === plan 
                      ? 'border-slate-950 bg-slate-950 text-white fw-semibold' 
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60 text-slate-500'
                  }`}
                >
                  {plan}
                </button>
              ))}
            </div>
          </div>

          {statusMessage && (
            <div className="fs-xs text-emerald-600 fw-semibold text-center py-1">
              {statusMessage}
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-100 hover:bg-slate-200/80 px-4 py-2 fs-xs fw-semibold text-slate-700 cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 hover:bg-slate-800 px-4 py-2 fs-xs fw-semibold text-white cursor-pointer transition-all flex items-center gap-1 shadow-xs"
            >
              <i className="bi bi-plus-lg fs-2xs"></i>
              Spawn Tenant Container
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
