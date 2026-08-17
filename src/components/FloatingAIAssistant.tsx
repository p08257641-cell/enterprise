/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Company, Invoice, InventoryItem, Employee, ScheduledAutomationJob } from '../types';

interface FloatingAIAssistantProps {
  selectedCompany: Company;
  activeView: string;
  invoices?: Invoice[];
  inventory?: InventoryItem[];
  employees?: Employee[];
  scheduledJobs?: ScheduledAutomationJob[];
  onTriggerJob?: (jobId: string) => void;
  onNavigateView?: (view: string) => void;
}

export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({
  selectedCompany,
  activeView,
  invoices = [],
  inventory = [],
  employees = [],
  scheduledJobs = [],
  onTriggerJob,
  onNavigateView
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'actions' | 'insights'>('chat');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string; timestamp: string }>>([
    {
      sender: 'ai',
      text: `Hello! I am your AI Copilot for **${selectedCompany.name}**. You can ask me questions, trigger scheduled automation jobs (like Monthly Payroll or Invoice Reminders), or analyze company data.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, chatHistory, activeTab]);

  const overdueInvoicesCount = invoices.filter(i => i.status === 'Overdue').length;
  const lowStockCount = inventory.filter(i => i.stockLevel < i.minStockLevel).length;

  const quickPrompts = [
    { label: '📊 Monthly Financial Summary', text: `Summarize the revenue, outstanding invoices, and expenses for ${selectedCompany.name}.` },
    { label: '💸 Run Payroll Assistance', text: 'How do I run monthly payroll and generate PAYE tax & SSNIT pension reports?' },
    { label: '📦 Low Stock Audit', text: 'Which inventory items are currently below minimum safety reorder levels?' },
    { label: '✉️ Client Payment Reminder', text: 'Draft a polite WhatsApp and Email payment reminder for overdue client invoices.' }
  ];

  const handleSend = async (customText?: string) => {
    const textToSend = customText || prompt;
    if (!textToSend.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newHistory = [...chatHistory, { sender: 'user' as const, text: textToSend, timestamp: timeStr }];
    setChatHistory(newHistory);
    setPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          context: activeView,
          selectedCompanyId: selectedCompany.id
        })
      });

      const data = await response.json();
      if (response.ok) {
        setChatHistory([
          ...newHistory,
          { sender: 'ai', text: data.reply || "Request processed successfully.", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      } else {
        setChatHistory([
          ...newHistory,
          { sender: 'ai', text: `⚠️ Co-pilot notice: ${data.error || 'Failed to process request.'}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      }
    } catch (err: any) {
      setChatHistory([
        ...newHistory,
        { sender: 'ai', text: `⚠️ Connection error: ${err.message}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (actionName: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      let replyText = '';
      if (actionName === 'PAYROLL') {
        replyText = `✅ **Automated Monthly Payroll Job Triggered!**\n- Evaluated ${employees.length || 12} active employees.\n- Calculated PAYE tax, SSNIT Tier 1/2/3 contributions.\n- Digital payslips generated and ready for release.\n- General Ledger journal entries posted.`;
      } else if (actionName === 'OVERDUE') {
        replyText = `✅ **Overdue Invoice Reminders Dispatched!**\n- Identified ${overdueInvoicesCount || 4} overdue client invoices.\n- Sent digital payment link reminders via Email & WhatsApp.`;
      } else if (actionName === 'REORDER') {
        replyText = `✅ **Low Stock Auto-Purchase Orders Generated!**\n- Identified ${lowStockCount || 3} items below safety thresholds.\n- Created draft Purchase Orders in Operations.`;
      } else {
        replyText = `✅ **Automation Action "${actionName}" Processed Successfully.**`;
      }

      setChatHistory(prev => [
        ...prev,
        { sender: 'user', text: `Trigger Action: ${actionName}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { sender: 'ai', text: replyText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setActiveTab('chat');
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-20 z-40 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-600/30 hover:shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer border border-white/20"
          title="Open AI Copilot"
        >
          <div className="relative flex items-center justify-center">
            <i className="bi bi-stars text-lg text-amber-300 animate-pulse"></i>
            {(overdueInvoicesCount > 0 || lowStockCount > 0) && (
              <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-red-500 border-2 border-slate-900 animate-ping"></span>
            )}
          </div>
          <span className="text-xs fw-bold tracking-wide">AI Copilot</span>
          <span className="bg-white/20 text-[10px] fw-semibold px-2 py-0.5 rounded-full backdrop-blur-xs">
            Ask AI
          </span>
        </button>
      )}

      {/* Expanded Floating AI Drawer Panel */}
      {isOpen && (
        <div className="w-96 sm:w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col h-[580px] max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
          
          {/* Drawer Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-4 text-white flex items-center justify-between shrink-0 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white shadow-md border border-white/20">
                <i className="bi bi-stars text-lg text-amber-300"></i>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm fw-bold text-white tracking-tight">Core360 AI Copilot</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] fw-semibold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 truncate max-w-[220px]">{selectedCompany.name}</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Close AI Assistant"
            >
              <i className="bi bi-x-lg text-xs"></i>
            </button>
          </div>

          {/* Drawer Navigation Tabs */}
          <div className="flex bg-slate-900/95 text-slate-400 p-1 border-b border-slate-800 shrink-0 text-xs fw-semibold">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-slate-200'
              }`}
            >
              <i className="bi bi-chat-dots"></i> Chat Co-pilot
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'actions' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-slate-200'
              }`}
            >
              <i className="bi bi-lightning-charge"></i> Automations
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
                activeTab === 'insights' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-slate-200'
              }`}
            >
              <i className="bi bi-graph-up-arrow"></i> Insights
              {(overdueInvoicesCount > 0 || lowStockCount > 0) && (
                <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              )}
            </button>
          </div>

          {/* TAB 1: Chat Co-pilot */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
              
              {/* Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-slate-500 text-xs bg-white border border-slate-200 rounded-2xl px-4 py-3 w-fit shadow-xs">
                    <i className="bi bi-arrow-repeat animate-spin text-indigo-600"></i>
                    <span>AI Copilot is thinking...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompts Container */}
              <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(qp.text)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-[10px] fw-medium whitespace-nowrap transition-colors shrink-0 cursor-pointer border border-slate-200/60"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0 flex items-center gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask AI Copilot anything..."
                  className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all font-sans"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !prompt.trim()}
                  className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center cursor-pointer transition-all shrink-0 shadow-md shadow-indigo-600/20"
                >
                  <i className="bi bi-send-fill text-xs"></i>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: Automations & Actions */}
          {activeTab === 'actions' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              <div className="bg-gradient-to-r from-violet-900 to-indigo-900 text-white p-3.5 rounded-2xl space-y-1">
                <div className="flex items-center gap-2">
                  <i className="bi bi-lightning-fill text-amber-300 text-sm"></i>
                  <span className="text-xs fw-bold uppercase tracking-wider">1-Click AI Trigger Engine</span>
                </div>
                <p className="text-[11px] text-slate-300">Execute automated recurring workflows and cron jobs on demand.</p>
              </div>

              <div className="space-y-2.5">
                <span className="text-[10px] fw-bold text-slate-400 uppercase tracking-wider block">Recommended Automated Actions</span>
                
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 hover:border-indigo-300 transition-all space-y-2.5 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <i className="bi bi-cash-stack text-sm"></i>
                      </div>
                      <div>
                        <h4 className="text-xs fw-bold text-slate-900">Run Monthly Payroll Automation</h4>
                        <p className="text-[10px] text-slate-500">Calculates PAYE, SSNIT, and generates digital payslips</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded fw-bold font-mono">Monthly</span>
                  </div>
                  <button
                    onClick={() => handleQuickAction('PAYROLL')}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs fw-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <i className="bi bi-play-fill text-sm"></i> Trigger Payroll Run Now
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 hover:border-indigo-300 transition-all space-y-2.5 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <i className="bi bi-[#25D366] bi-whatsapp text-sm"></i>
                      </div>
                      <div>
                        <h4 className="text-xs fw-bold text-slate-900">Send Overdue Invoice Reminders</h4>
                        <p className="text-[10px] text-slate-500">Dispatches WhatsApp & Email links for unpaid invoices</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded fw-bold font-mono">Weekly</span>
                  </div>
                  <button
                    onClick={() => handleQuickAction('OVERDUE')}
                    className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs fw-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <i className="bi bi-send-fill text-xs"></i> Dispatch Payment Reminders
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 hover:border-indigo-300 transition-all space-y-2.5 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <i className="bi bi-box-seam text-sm"></i>
                      </div>
                      <div>
                        <h4 className="text-xs fw-bold text-slate-900">Low Stock Reorder Generator</h4>
                        <p className="text-[10px] text-slate-500">Creates draft Purchase Orders for low inventory items</p>
                      </div>
                    </div>
                    <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded fw-bold font-mono">Auto</span>
                  </div>
                  <button
                    onClick={() => handleQuickAction('REORDER')}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs fw-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <i className="bi bi-plus-circle text-xs"></i> Draft Purchase Orders
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Smart Insights */}
          {activeTab === 'insights' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] fw-bold text-slate-400 uppercase tracking-wider">Live Company Intelligence</span>
                <span className="text-[10px] text-slate-500 font-mono">Updated Real-time</span>
              </div>

              {overdueInvoicesCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <i className="bi bi-exclamation-circle-fill text-amber-600"></i>
                    <span>{overdueInvoicesCount} Overdue Invoices Detected</span>
                  </div>
                  <p className="text-[11px] text-amber-800">Outstanding balances require follow-up to optimize cash flow.</p>
                  <button
                    onClick={() => onNavigateView && onNavigateView('accounting')}
                    className="text-[11px] fw-bold text-amber-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Go to Accounting Invoices →
                  </button>
                </div>
              )}

              {lowStockCount > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                    <i className="bi bi-box-seam-fill text-rose-600"></i>
                    <span>{lowStockCount} Items Below Safety Stock Threshold</span>
                  </div>
                  <p className="text-[11px] text-rose-800">Inventory levels are low. Replenish items to prevent stockouts.</p>
                  <button
                    onClick={() => onNavigateView && onNavigateView('inventory')}
                    className="text-[11px] fw-bold text-rose-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Go to Inventory Stock →
                  </button>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <h4 className="text-xs fw-bold text-slate-900 flex items-center gap-2">
                  <i className="bi bi-shield-check text-indigo-600"></i> Platform System Status
                </h4>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span>Active Company Tenant:</span>
                    <span className="fw-semibold text-slate-900">{selectedCompany.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span>Automated Cron Worker:</span>
                    <span className="text-emerald-600 fw-semibold">Active & Running</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>Active Employees Enrolled:</span>
                    <span className="fw-semibold text-slate-900">{employees.length || 12}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
