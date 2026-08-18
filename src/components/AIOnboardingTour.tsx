/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface AIOnboardingTourProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onNavigateView: (view: string) => void;
}

interface TourStep {
  title: string;
  badge: string;
  icon: string;
  description: string;
  targetView?: string;
  keyFeatures: string[];
  proTip: string;
}

export const AIOnboardingTour: React.FC<AIOnboardingTourProps> = ({
  user,
  isOpen,
  onClose,
  onNavigateView,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const userRole = user.activeRole || user.role || 'Employee';
  const isExecutive = userRole.includes('Admin') || userRole.includes('CEO') || userRole.includes('Executive') || userRole.includes('Director') || userRole.includes('Owner');
  
  const getStepsForTrack = (): TourStep[] => {
    const isSales = userRole.includes('Sales') || userRole.includes('POS') || userRole.includes('Commerce');
    const isHR = userRole.includes('HR') || userRole.includes('People') || userRole.includes('Recruit');
    const isFinance = userRole.includes('Account') || userRole.includes('Finance') || userRole.includes('CFO') || userRole.includes('Audit') || userRole.includes('Billing');
    const isSupport = userRole.includes('Support') || userRole.includes('Help') || userRole.includes('Desk') || userRole.includes('Service');
    const isOperations = userRole.includes('Ops') || userRole.includes('Operation') || userRole.includes('Inventory') || userRole.includes('Warehouse');

    const commonIntro: TourStep = {
      title: `Welcome to Core360, ${user.name.split(' ')[0]}!`,
      badge: `${userRole} Onboarding`,
      icon: 'bi-stars text-indigo-600',
      description: `You are logged in as a ${userRole}. Core360 provides a clean, role-tailored workspace designed specifically for your daily tasks and workflow.`,
      keyFeatures: [
        `Personalized workspace for ${userRole} permissions`,
        'Built-in AI Assistant for instant guidance & tasks',
        'Real-time automated alerts and notification digest'
      ],
      proTip: 'You can restart this AI Onboarding Walkthrough anytime by clicking the Compass icon in the top header.'
    };

    const commonNav: TourStep = {
      title: 'Navigating Your Workspace',
      badge: 'System Basics',
      icon: 'bi-compass-fill text-indigo-600',
      description: 'Use the left sidebar to access your assigned modules. Click the 9-dots App Launcher button at the top right to access connected tools and integrations.',
      keyFeatures: [
        'Left Sidebar: Core business modules assigned to your role',
        'Top Header: Quick search, notifications, and app launcher',
        'Profile Pill: Switch active roles or manage preferences'
      ],
      proTip: 'Use the top Global Search bar to quickly locate files, records, or contacts.'
    };

    let trackSteps: TourStep[] = [];

    if (isExecutive) {
      trackSteps = [
        {
          title: 'Executive Control & Governance',
          badge: 'Executive Track',
          icon: 'bi-gear-wide-connected text-indigo-600',
          description: 'Full oversight across multi-branch operations, granular Role-Based Access Control (RBAC), and company security settings.',
          targetView: 'admin',
          keyFeatures: [
            'Granular Create, View, Edit, Delete permissions per role',
            'Company security & automated password reset dispatcher',
            'Integrations hub for WhatsApp, Shopify, Xero, and QuickBooks'
          ],
          proTip: 'Go to Admin > Settings to configure SMS and Email sender credentials for automated alerts.'
        }
      ];
    } else if (isSales) {
      trackSteps = [
        {
          title: 'Sales & Omnichannel Orders',
          badge: 'Commercial Track',
          icon: 'bi-cart-check-fill text-emerald-600',
          description: 'Manage sales orders, quotations, and online e-commerce channels in one place.',
          targetView: 'sales',
          keyFeatures: [
            'Create quotations and convert them to Sales Orders in 1 click',
            'Real-time inventory deduction across branches',
            'Automated order ingestion from Shopify & WooCommerce'
          ],
          proTip: 'Click "Quotations" in Sales to send professional PDF estimates straight to clients.'
        },
        {
          title: 'CRM Pipeline & Customer Leads',
          badge: 'Commercial Track',
          icon: 'bi-funnel-fill text-amber-600',
          description: 'Track sales deals through visual Kanban pipeline stages and automate customer follow-ups.',
          targetView: 'crm',
          keyFeatures: [
            'Drag-and-drop lead stage management',
            'Automated email notifications when leads are assigned to you',
            'WhatsApp Business API integration for sending receipts'
          ],
          proTip: 'Use the WhatsApp action button to send payment links directly to customer WhatsApp chats.'
        }
      ];
    } else if (isHR) {
      trackSteps = [
        {
          title: 'HR, Attendance & Staff Directory',
          badge: 'People Ops Track',
          icon: 'bi-people-fill text-blue-600',
          description: 'Manage employee profiles, track attendance, and process leave applications effortlessly.',
          targetView: 'hr',
          keyFeatures: [
            'Mobile & GPS-verified clock-in/out attendance',
            'Automated leave application approval chains',
            'Staff directory and performance OKR tracking'
          ],
          proTip: 'Employees can clock in from their mobile phones or desktop workspace in 1 click.'
        },
        {
          title: 'Statutory Payroll Engine',
          badge: 'People Ops Track',
          icon: 'bi-cash-stack text-emerald-600',
          description: 'Process compliant payroll with automatic tax scales, pensions, and digital payslips.',
          targetView: 'hr',
          keyFeatures: [
            'Automated PAYE Tax, SSNIT & Tier 1/2/3 pension calculations',
            'Instant encrypted digital payslips delivered via Email & SMS',
            'Direct posting of payroll journal entries into Accounting'
          ],
          proTip: 'Review employee overtime and attendance logs before locking monthly payroll.'
        }
      ];
    } else if (isFinance) {
      trackSteps = [
        {
          title: 'General Ledger & Financial Controls',
          badge: 'Finance Track',
          icon: 'bi-bank text-indigo-600',
          description: 'Complete double-entry accounting with real-time Trial Balance, P&L, and Balance Sheet generation.',
          targetView: 'accounting',
          keyFeatures: [
            'Multi-currency ledger reporting (GHS, USD, EUR, GBP, NGN)',
            'Automated bank reconciliation statement matching',
            'Fixed asset depreciation and cost center budgeting'
          ],
          proTip: 'Import CSV or OFX bank statements to reconcile bank transactions in minutes.'
        },
        {
          title: 'GRA E-VAT Digital Tax Invoicing',
          badge: 'Finance Track',
          icon: 'bi-receipt text-purple-600',
          description: 'Issue tax-compliant invoices fully aligned with regional digital VAT rules.',
          targetView: 'accounting',
          keyFeatures: [
            'Digital tax code calculation on sales invoices',
            'Automated tax return calculation and filing workflows',
            'AI OCR Document Scanner for paper bill expense extraction'
          ],
          proTip: 'Use the AI Document Scanner to upload vendor receipts and auto-fill expenses.'
        }
      ];
    } else if (isSupport) {
      trackSteps = [
        {
          title: 'Help Desk & Customer SLA Management',
          badge: 'Support Track',
          icon: 'bi-headset text-indigo-600',
          description: 'Manage incoming customer support tickets, track SLA response times, and resolve customer issues efficiently.',
          targetView: 'helpdesk',
          keyFeatures: [
            'Ticket queue prioritization & status tracking',
            'Automated assignment rules for support agents',
            'Integration with CRM leads & customer history'
          ],
          proTip: 'Use pre-built reply templates to respond to common customer inquiries in seconds.'
        }
      ];
    } else if (isOperations) {
      trackSteps = [
        {
          title: 'Inventory & Stock Management',
          badge: 'Operations Track',
          icon: 'bi-box-seam text-amber-600',
          description: 'Track multi-branch inventory levels, stock movements, purchase orders, and supplier receipts.',
          targetView: 'operations',
          keyFeatures: [
            'Real-time stock valuation & low-stock alerts',
            'Purchase order creation & goods received vouchers',
            'Barcode scanning and batch serial number tracking'
          ],
          proTip: 'Set up low-stock thresholds to receive automated alerts before running out of essential items.'
        }
      ];
    } else {
      // 👤 Standard Employee Role Track (Does NOT navigate to Admin)
      trackSteps = [
        {
          title: 'Employee Self-Service Portal',
          badge: 'Employee Track',
          icon: 'bi-person-badge-fill text-indigo-600',
          description: 'Welcome to your personal employee workspace! Here you can clock in, submit leave requests, check payslips, and manage your tasks.',
          targetView: 'hr',
          keyFeatures: [
            '1-Click Clock-In / Clock-Out for daily attendance',
            'Submit leave applications and track manager approval',
            'Access digital monthly payslips & view performance OKRs'
          ],
          proTip: 'Check your notification inbox at the top right to stay updated on leave approvals and team updates.'
        }
      ];
    }

    const commonOutro: TourStep = {
      title: 'You Are All Set!',
      badge: 'Walkthrough Complete',
      icon: 'bi-check-circle-fill text-emerald-500',
      description: `You have completed your Core360 AI Onboarding System Walkthrough for ${userRole}! You can now start using your workspace.`,
      keyFeatures: [
        'Explore your dashboard modules anytime from the sidebar',
        'Ask the AI Assistant questions whenever you get stuck',
        'Replay this tour anytime from the top header menu'
      ],
      proTip: 'Need help? Click the AI Assistant widget at any time for instant guidance!'
    };

    return [commonIntro, commonNav, ...trackSteps, commonOutro];
  };

  const steps = getStepsForTrack();

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const safeStepIndex = (currentStep >= 0 && currentStep < steps.length) ? currentStep : 0;
  const current = steps[safeStepIndex] || steps[0];

  if (!current) return null;

  const handleNext = () => {
    if (safeStepIndex < steps.length - 1) {
      setCurrentStep(safeStepIndex + 1);
    } else {
      // Tour finished - close modal cleanly without redirecting or changing active view
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
            title="Close Tour"
          >
            <i className="bi bi-x-lg text-sm"></i>
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full fs-2xs fw-bold bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 uppercase tracking-wider">
              {current.badge}
            </span>
            <span className="fs-xs text-slate-400">Step {currentStep + 1} of {steps.length}</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shadow-inner">
              <i className={`bi ${current.icon}`}></i>
            </div>
            <div>
              <h3 className="text-lg fw-bold text-white tracking-tight">{current.title}</h3>
              <p className="text-xs text-slate-300">Tailored AI Onboarding Guide for {userRole}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 flex">
          <div
            className="bg-indigo-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>

        {/* Step Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
          <p className="text-sm text-slate-600 leading-relaxed">
            {current.description}
          </p>

          {/* Key Features Bullet List */}
          {current.keyFeatures && current.keyFeatures.length > 0 && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
              <span className="fs-xs fw-bold text-slate-900 uppercase tracking-wider block">Key Capabilities:</span>
              <ul className="space-y-2">
                {current.keyFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <i className="bi bi-check-circle-fill text-emerald-500 text-sm shrink-0 mt-0.5"></i>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pro Tip Box */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3.5 flex items-start gap-3">
            <i className="bi bi-lightbulb-fill text-indigo-600 text-base shrink-0 mt-0.5"></i>
            <div>
              <span className="fs-xs fw-bold text-indigo-900 uppercase tracking-wider block">Pro Tip</span>
              <p className="text-xs text-indigo-800 mt-0.5">{current.proTip}</p>
            </div>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-xl text-xs fw-semibold transition-all cursor-pointer ${
              currentStep === 0
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            ← Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs fw-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-all cursor-pointer"
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl text-xs fw-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>{currentStep === steps.length - 1 ? 'Finish Tour 🎉' : 'Next Step →'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
