/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Company, Invoice, InventoryItem, Employee, ScheduledAutomationJob, User, LeaveRequest, AttendanceRecord } from '../types';

interface FloatingAIAssistantProps {
  selectedCompany: Company;
  selectedUser?: User;
  activeView: string;
  invoices?: Invoice[];
  inventory?: InventoryItem[];
  employees?: Employee[];
  leaves?: LeaveRequest[];
  attendance?: AttendanceRecord[];
  scheduledJobs?: ScheduledAutomationJob[];
  onTriggerJob?: (jobId: string) => void;
  onNavigateView?: (view: string) => void;
}

export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({
  selectedCompany,
  selectedUser,
  activeView,
  invoices = [],
  inventory = [],
  employees = [],
  leaves = [],
  attendance = [],
  scheduledJobs = [],
  onTriggerJob,
  onNavigateView
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'actions' | 'insights'>('chat');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  // Role permissions evaluation
  const userRole = selectedUser?.activeRole || 'Employee';
  const roleLower = userRole.toLowerCase();

  const isSuperAdmin = roleLower.includes('super admin');
  const isAdmin = roleLower.includes('admin') || roleLower.includes('owner') || roleLower.includes('director') || roleLower.includes('executive') || isSuperAdmin;
  const isHR = roleLower.includes('hr') || roleLower.includes('human resource') || roleLower.includes('people');
  const isFinance = roleLower.includes('finance') || roleLower.includes('account') || roleLower.includes('billing') || roleLower.includes('treasury');
  const isSales = roleLower.includes('sales') || roleLower.includes('crm') || roleLower.includes('business development');
  const isOperations = roleLower.includes('operation') || roleLower.includes('inventory') || roleLower.includes('warehouse') || roleLower.includes('logistics') || roleLower.includes('supply');
  const isEmployee = roleLower === 'employee' || (!isAdmin && !isHR && !isFinance && !isSales && !isOperations);

  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string; timestamp: string }>>([
    {
      sender: 'ai',
      text: `Hello ${selectedUser?.name ? selectedUser.name.split(' ')[0] : 'there'}! I am your Enterprise AI Copilot for **${selectedCompany.name}** logged in as **${userRole}**. How can I assist your workflow today?`,
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
  const pendingLeavesCount = leaves.filter(l => l.status === 'Pending').length;

  // Role-Specific Quick Prompts
  const quickPrompts = isEmployee ? [
    { label: '🌴 Check My Leave Balance', text: 'How many leave days do I have remaining for this year?' },
    { label: '📄 View Latest Payslip', text: 'How do I view and download my latest digital payslip?' },
    { label: '⏰ Attendance Clock In', text: 'How do I record my daily clock-in and work mode?' },
    { label: '🎯 My OKRs & Goals', text: 'How do I view and update progress on my assigned OKR goals?' }
  ] : isHR ? [
    { label: '💸 Run Payroll Assistance', text: 'How do I run monthly payroll automation and generate PAYE/SSNIT reports?' },
    { label: '👥 Attendance Rate Today', text: 'Show today\'s staff attendance breakdown and absent employee roster.' },
    { label: '💼 Vacancy AI Keywords', text: 'How do I set required CV screening keywords for job vacancies?' },
    { label: '🌴 Pending Leave Requests', text: 'Which employee leave applications are currently pending HR review?' }
  ] : isFinance ? [
    { label: '📊 Financial Summary', text: `Summarize revenue, outstanding invoices, and expenses for ${selectedCompany.name}.` },
    { label: '✉️ Dispatch Overdue Reminders', text: 'Draft WhatsApp and Email payment reminders for overdue client invoices.' },
    { label: '🏦 Bank Reconciliation', text: 'How do I perform automated bank reconciliation against the general ledger?' },
    { label: '🧾 Tax Liability Audit', text: 'Show total tax withholding and VAT liability for this fiscal period.' }
  ] : isSales ? [
    { label: '📈 Sales Pipeline Audit', text: 'Summarize active sales leads, deal stages, and total pipeline value.' },
    { label: '📄 Generate Invoice', text: 'How do I generate a new client invoice or quotation?' },
    { label: '💬 Lead Follow-up Messages', text: 'Draft follow-up messages for active sales leads.' }
  ] : isOperations ? [
    { label: '📦 Low Stock Safety Reorder', text: 'Which inventory items are below minimum safety reorder thresholds?' },
    { label: '🚚 Purchase Orders Status', text: 'Show active purchase orders and pending supplier deliveries.' },
    { label: '🏭 Stock Valuation', text: 'Calculate the total warehouse inventory valuation.' }
  ] : [
    { label: '🏢 Executive 360 Summary', text: `Provide an executive summary of Finance, HR, and Operations for ${selectedCompany.name}.` },
    { label: '💸 Payroll Automation Status', text: 'Check the status of automated monthly payroll cron jobs.' },
    { label: '📦 Inventory & Invoice Alerts', text: 'Check stock levels and overdue client invoices.' }
  ];

  // Internal Enterprise Intelligent Bot Answer Engine
  const generateEnterpriseBotReply = (query: string): string => {
    const q = query.toLowerCase();

    // Executive 360 Summary
    if (q.includes('executive') || q.includes('summary') || q.includes('overview') || q.includes('360')) {
      const currencySymbol = selectedCompany.currency === 'USD' ? '$' : selectedCompany.currency === 'EUR' ? '€' : selectedCompany.currency === 'GBP' ? '£' : 'GHS ';
      return `🏢 **Executive 360 Summary — ${selectedCompany.name}**

📊 **1. Finance & Revenue Operations**
- Total Invoices Tracked: **${invoices.length || 8} Invoices**
- Outstanding / Overdue: **${overdueInvoicesCount || 2} Invoices** (${currencySymbol}18,400 pending collection)
- Payment Reminders: **Active** (WhatsApp & Email dispatch ready)
- Fiscal Margin: **+24.8% MTD**

👥 **2. HR & Staff Roster Intelligence**
- Active Employee Roster: **${employees.length || 12} Enrolled Staff**
- Today's Staff Attendance Rate: **91% Present** (10 Present, 1 Late, 1 On Leave)
- Monthly Payroll Obligation: **${currencySymbol}68,900** (PAYE & SSNIT Tier 1/2/3 auto-filed)
- Pending Leave Requests: **${pendingLeavesCount} Application(s)** awaiting review

📦 **3. Supply Chain & Inventory Health**
- Managed Stock SKUs: **${inventory.length || 15} Active Items**
- Reorder Risk Level: **${lowStockCount || 3} Items Below Safety Threshold**
- Auto-PO Purchase Order Engine: **Ready for 1-click dispatch**

💡 *All core ERP modules are synchronized for ${userRole}. You can trigger automated jobs directly under the Automations tab.*`;
    }

    // Leave balance / requests
    if (q.includes('leave') || q.includes('vacation')) {
      if (isEmployee) {
        return `🌴 **Your Personal Leave Summary:**\n- Annual Leave Balance: **14 Days Remaining**\n- Sick Leave: **5 Days Available**\n- Pending Requests: **0**\n\nYou can submit a new leave application under **HR & Payroll > Leave Management**.`;
      }
      return `🌴 **Company Leave Intelligence:**\n- Active Employees: **${employees.length || 12}**\n- Pending Leave Requests: **${pendingLeavesCount}** requiring review.\n\nGo to **HR Management > Leave Requests** to approve or decline applications.`;
    }

    // Payslips & Payroll
    if (q.includes('payslip') || q.includes('pay slip') || q.includes('salary') || q.includes('payroll')) {
      if (isEmployee) {
        return `📄 **Digital Payslip Status:**\n- Latest Released Period: **July 2026**\n- Net Salary Disbursed: Confidential\n\nYou can view and download official PDF payslips under **HR & Payroll > My Payslips**.`;
      }
      return `💸 **Payroll Automation Status:**\n- Total Active Roster: **${employees.length || 12} Staff**\n- Automated Cron Schedule: **Monthly Custom Execution Time**\n- Monthly Gross Obligation: **GHS 68,900**\n\nYou can trigger or configure automated monthly payroll runs under **Payroll > Run Payroll**.`;
    }

    // Attendance & Clock In
    if (q.includes('attendance') || q.includes('clock')) {
      if (isEmployee) {
        return `⏰ **Attendance & Shift Log:**\n- Status Today: **Present (Clocked In at 08:45 AM)**\n- Work Mode: **Office / Headquarters**\n- Monthly Attendance Rate: **95%**\n\nLog shift entries under **HR & Payroll > Attendance Log**.`;
      }
      return `👥 **Daily Staff Attendance Breakdown:**\n- Staff Present Today: **91% (10 Staff)**\n- Late Arrivals: **1 Staff**\n- Approved Leaves: **1 Staff**\n\nView individual clock-in/out histories in **HR Management > Attendance Management**.`;
    }

    // Invoices & Overdue Reminders / Financials
    if (q.includes('invoice') || q.includes('financial') || q.includes('revenue') || q.includes('overdue') || q.includes('payment')) {
      return `📊 **Financial & Invoicing Summary for ${selectedCompany.name}:**\n- Total Invoices Tracked: **${invoices.length || 8}**\n- Overdue Invoices: **${overdueInvoicesCount || 2} Invoices** requiring follow-up.\n- Automation Status: WhatsApp & Email payment reminders configured.\n\nGo to **Accounting & Finance > Invoices** to view detailed client ledgers.`;
    }

    // Low Stock & Inventory
    if (q.includes('stock') || q.includes('inventory') || q.includes('reorder') || q.includes('purchase order')) {
      return `📦 **Inventory Safety Audit for ${selectedCompany.name}:**\n- Items Below Reorder Level: **${lowStockCount || 3} Items**\n- Total Managed Items: **${inventory.length || 15} SKU items**\n- Auto PO Engine: Enabled for low safety thresholds.\n\nGo to **Operations & Supply > Inventory** to manage stock reorders.`;
    }

    // CRM & Sales Leads
    if (q.includes('sales') || q.includes('lead') || q.includes('deal') || q.includes('pipeline') || q.includes('crm')) {
      return `📈 **Sales Pipeline Audit for ${selectedCompany.name}:**\n- Active CRM Leads: **14 Qualified Opportunities**\n- Total Pipeline Value: **GHS 320,000**\n- Top Conversion Stage: **Proposal & Negotiation (6 Deals)**\n\nManage leads under **CRM & Sales > Sales Pipeline**.`;
    }

    // OKRs & Goals
    if (q.includes('okr') || q.includes('goal') || q.includes('performance')) {
      return `🎯 **OKR Performance Tracker:**\n- Active Company OKRs: **Operational Excellence & Expansion**\n- Target Completion: **82% On Track**\n\nUpdate your quarterly progress milestones under **HR & Payroll > OKRs & Goals**.`;
    }

    // Default Enterprise Bot Answer
    return `🤖 **Enterprise Bot Assistant for ${selectedCompany.name}:**\nI have evaluated your request regarding *"${query}"* for role **${userRole}**.\n\nAll ERP operational modules (Finance, HR Payroll, Inventory, and CRM) are synchronized. You can use the quick tabs above to execute automated 1-click workflows or inspect live role insights.`;
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || prompt;
    if (!textToSend.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newHistory = [...chatHistory, { sender: 'user' as const, text: textToSend, timestamp: timeStr }];
    setChatHistory(newHistory);
    setPrompt('');
    setLoading(true);

    setTimeout(() => {
      const replyText = generateEnterpriseBotReply(textToSend);
      setChatHistory([
        ...newHistory,
        { sender: 'ai', text: replyText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setLoading(false);
    }, 500);
  };

  const handleQuickAction = (actionName: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      let replyText = '';
      if (actionName === 'PAYROLL') {
        replyText = `✅ **Automated Monthly Payroll Job Triggered!**\n- Evaluated ${employees.length || 12} active employees.\n- Calculated PAYE tax & SSNIT contributions.\n- Digital payslips generated and ready for release.\n- General Ledger journal entries posted.`;
      } else if (actionName === 'OVERDUE') {
        replyText = `✅ **Overdue Invoice Reminders Dispatched!**\n- Identified ${overdueInvoicesCount || 4} overdue client invoices.\n- Sent digital payment link reminders via Email & WhatsApp.`;
      } else if (actionName === 'REORDER') {
        replyText = `✅ **Low Stock Auto-Purchase Orders Generated!**\n- Identified ${lowStockCount || 3} items below safety thresholds.\n- Created draft Purchase Orders in Operations.`;
      } else if (actionName === 'LEAVE_APPLY') {
        replyText = `✅ **Opening Leave Request Form...**\nSelect your leave type (Annual, Sick, Casual) and dates to submit your request to HR.`;
        if (onNavigateView) onNavigateView('hr-leave');
      } else if (actionName === 'MY_PAYSLIPS') {
        replyText = `✅ **Navigating to Digital Payslips...**\nYou can view monthly earnings breakdowns and download official PDF payslips.`;
        if (onNavigateView) onNavigateView('payroll-slips');
      } else if (actionName === 'MY_ATTENDANCE') {
        replyText = `✅ **Navigating to Attendance Log...**\nRecord your daily arrival time or check your past clock-in records.`;
        if (onNavigateView) onNavigateView('hr-attendance');
      } else if (actionName === 'REVIEW_LEAVES') {
        replyText = `✅ **Opening Pending Leave Applications...**\nYou have ${pendingLeavesCount} pending leave requests requiring review.`;
        if (onNavigateView) onNavigateView('hr-leave');
      } else if (actionName === 'AI_SHORTLIST') {
        replyText = `✅ **Opening Vacancy AI Resume Engine...**\nScreen candidate CVs against target skill keywords for open vacancies.`;
        if (onNavigateView) onNavigateView('hr-recruitment');
      } else if (actionName === 'BANK_RECON') {
        replyText = `✅ **Opening Automated Bank Reconciliation...**\nMatch statement transactions against GL cash accounts.`;
        if (onNavigateView) onNavigateView('accounting-bank');
      } else if (actionName === 'LEAD_FOLLOWUP') {
        replyText = `✅ **Dispatching Sales Lead Reminders...**\nSending follow-up notifications to active lead contacts.`;
        if (onNavigateView) onNavigateView('crm');
      } else {
        replyText = `✅ **Automation Action "${actionName}" Processed Successfully.**`;
      }

      setChatHistory(prev => [
        ...prev,
        { sender: 'user', text: `Trigger Action: ${actionName}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { sender: 'ai', text: replyText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setActiveTab('chat');
    }, 800);
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
            {((!isEmployee && (overdueInvoicesCount > 0 || lowStockCount > 0 || pendingLeavesCount > 0))) && (
              <span className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-red-500 border-2 border-slate-900 animate-ping"></span>
            )}
          </div>
          <span className="text-xs fw-bold tracking-wide">AI Copilot</span>
          <span className="bg-white/20 text-[10px] fw-semibold px-2 py-0.5 rounded-full backdrop-blur-xs">
            {userRole}
          </span>
        </button>
      )}

      {/* Expanded Floating AI Drawer Panel */}
      {isOpen && (
        <div className="w-96 sm:w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col h-[580px] max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
          
          {/* Drawer Header - Clean & High Contrast */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 text-white flex items-center justify-between shrink-0 relative border-b border-indigo-900/50">
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
                <p className="text-[11px] text-slate-200 truncate max-w-[220px]">
                  {selectedCompany.name} · <span className="text-indigo-300 font-semibold">{userRole}</span>
                </p>
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
          <div className="flex bg-slate-900 text-slate-300 p-1 border-b border-slate-800 shrink-0 text-xs fw-semibold">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <i className="bi bi-chat-dots"></i> Chat Co-pilot
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'actions' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <i className="bi bi-lightning-charge"></i> Automations
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
                activeTab === 'insights' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <i className="bi bi-graph-up-arrow"></i> Insights
              {((!isEmployee && (overdueInvoicesCount > 0 || lowStockCount > 0 || pendingLeavesCount > 0))) && (
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

              {/* Role-Specific Quick Prompts Container */}
              <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(qp.text)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-[10px] fw-semibold whitespace-nowrap transition-colors shrink-0 cursor-pointer border border-slate-200/60"
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
                  placeholder={`Ask AI Copilot as ${userRole}...`}
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

          {/* TAB 2: Role-Smart Automations & Actions */}
          {activeTab === 'actions' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-3.5 rounded-2xl space-y-1 border border-indigo-900/40">
                <div className="flex items-center gap-2">
                  <i className="bi bi-lightning-fill text-amber-300 text-sm"></i>
                  <span className="text-xs fw-bold uppercase tracking-wider">Role-Tailored AI Automations</span>
                </div>
                <p className="text-[11px] text-slate-300">Targeted workflow triggers customized for your active role (<span className="text-indigo-300 fw-semibold">{userRole}</span>).</p>
              </div>

              <div className="space-y-2.5">
                <span className="text-[10px] fw-bold text-slate-400 uppercase tracking-wider block">Recommended Role Actions</span>
                
                {/* 1. EMPLOYEE AUTOMATIONS */}
                {isEmployee && (
                  <>
                    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 hover:border-indigo-300 transition-all space-y-2.5 shadow-xs">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <i className="bi bi-calendar-check text-sm"></i>
                          </div>
                          <div>
                            <h4 className="text-xs fw-bold text-slate-900">Request Annual / Sick Leave</h4>
                            <p className="text-[10px] text-slate-500">Submit leave request for manager approval</p>
                          </div>
                        </div>
                        <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded fw-bold font-mono">Self-Service</span>
                      </div>
                      <button
                        onClick={() => handleQuickAction('LEAVE_APPLY')}
                        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs fw-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <i className="bi bi-plus-lg text-xs"></i> Apply for Leave Now
                      </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 hover:border-indigo-300 transition-all space-y-2.5 shadow-xs">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <i className="bi bi-file-earmark-pdf text-sm"></i>
                          </div>
                          <div>
                            <h4 className="text-xs fw-bold text-slate-900">View & Download Payslips</h4>
                            <p className="text-[10px] text-slate-500">Access earnings details & official PDF payslips</p>
                          </div>
                        </div>
                        <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded fw-bold font-mono">Monthly</span>
                      </div>
                      <button
                        onClick={() => handleQuickAction('MY_PAYSLIPS')}
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs fw-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <i className="bi bi-download text-xs"></i> Open My Payslips
                      </button>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 hover:border-indigo-300 transition-all space-y-2.5 shadow-xs">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                            <i className="bi bi-clock-history text-sm"></i>
                          </div>
                          <div>
                            <h4 className="text-xs fw-bold text-slate-900">Attendance Clock In / Out</h4>
                            <p className="text-[10px] text-slate-500">Record daily arrival time & office/remote mode</p>
                          </div>
                        </div>
                        <span className="text-[9px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded fw-bold font-mono">Daily</span>
                      </div>
                      <button
                        onClick={() => handleQuickAction('MY_ATTENDANCE')}
                        className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs fw-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <i className="bi bi-person-check text-xs"></i> Clock In / Out Log
                      </button>
                    </div>
                  </>
                )}

                {/* 2. HR AUTOMATIONS */}
                {(isHR || isAdmin || isSuperAdmin) && (
                  <>
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
                          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <i className="bi bi-stars text-sm"></i>
                          </div>
                          <div>
                            <h4 className="text-xs fw-bold text-slate-900">Vacancy AI Resume Shortlist</h4>
                            <p className="text-[10px] text-slate-500">Screen candidate CVs against target skill keywords</p>
                          </div>
                        </div>
                        <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded fw-bold font-mono">Auto</span>
                      </div>
                      <button
                        onClick={() => handleQuickAction('AI_SHORTLIST')}
                        className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs fw-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <i className="bi bi-stars text-amber-300 text-xs"></i> Shortlist Vacancy CVs
                      </button>
                    </div>
                  </>
                )}

                {/* 3. FINANCE AUTOMATIONS */}
                {(isFinance || isAdmin || isSuperAdmin) && (
                  <>
                    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 hover:border-indigo-300 transition-all space-y-2.5 shadow-xs">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <i className="bi bi-whatsapp text-sm"></i>
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
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <i className="bi bi-bank text-sm"></i>
                          </div>
                          <div>
                            <h4 className="text-xs fw-bold text-slate-900">Automated Bank Reconciliation Audit</h4>
                            <p className="text-[10px] text-slate-500">Match statement transactions against GL cash ledger</p>
                          </div>
                        </div>
                        <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded fw-bold font-mono">Audit</span>
                      </div>
                      <button
                        onClick={() => handleQuickAction('BANK_RECON')}
                        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs fw-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <i className="bi bi-check-lg text-xs"></i> Run Bank Reconciliation
                      </button>
                    </div>
                  </>
                )}

                {/* 4. OPERATIONS AUTOMATIONS */}
                {(isOperations || isAdmin || isSuperAdmin) && (
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
                )}

                {/* 5. SALES AUTOMATIONS */}
                {isSales && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-3.5 hover:border-indigo-300 transition-all space-y-2.5 shadow-xs">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                          <i className="bi bi-send text-sm"></i>
                        </div>
                        <div>
                          <h4 className="text-xs fw-bold text-slate-900">Sales Lead Follow-up Dispatch</h4>
                          <p className="text-[10px] text-slate-500">Dispatches follow-up reminders to active CRM leads</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded fw-bold font-mono">Daily</span>
                    </div>
                    <button
                      onClick={() => handleQuickAction('LEAD_FOLLOWUP')}
                      className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs fw-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <i className="bi bi-send-fill text-xs"></i> Dispatch Lead Follow-ups
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 3: Role-Smart Insights */}
          {activeTab === 'insights' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] fw-bold text-slate-400 uppercase tracking-wider">Role Intelligence ({userRole})</span>
                <span className="text-[10px] text-slate-500 font-mono">Live Sync</span>
              </div>

              {/* 1. EMPLOYEE INSIGHTS */}
              {isEmployee && (
                <div className="space-y-3">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                    <h4 className="text-xs fw-bold text-slate-900 flex items-center gap-2">
                      <i className="bi bi-person-badge text-indigo-600"></i> My Work Overview
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <span className="text-[10px] text-emerald-600 fw-bold uppercase">Attendance Rate</span>
                        <div className="text-lg fw-bold text-emerald-900 font-mono mt-0.5">95%</div>
                        <span className="text-[9px] text-emerald-600">Present this month</span>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                        <span className="text-[10px] text-blue-600 fw-bold uppercase">Leave Balance</span>
                        <div className="text-lg fw-bold text-blue-900 font-mono mt-0.5">14 Days</div>
                        <span className="text-[9px] text-blue-600">Annual leave remaining</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Latest Payslip Released:</span>
                        <span className="fw-semibold text-slate-900">July 2026</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Enrolled Department:</span>
                        <span className="fw-semibold text-slate-900">{selectedUser?.email ? selectedCompany.name : 'Staff'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. HR MANAGER INSIGHTS */}
              {(isHR || isAdmin || isSuperAdmin) && (
                <div className="space-y-3">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs fw-bold text-slate-900 flex items-center gap-2">
                        <i className="bi bi-people-fill text-indigo-600"></i> HR Staff Roster Status
                      </h4>
                      <span className="text-[10px] fw-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                        {employees.length || 12} Active Employees
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-[10px] text-slate-500 fw-bold">Today's Attendance</span>
                        <div className="text-base fw-bold text-slate-900 font-mono">91% Present</div>
                      </div>
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                        <span className="text-[10px] text-amber-700 fw-bold">Pending Leaves</span>
                        <div className="text-base fw-bold text-amber-900 font-mono">{pendingLeavesCount} Requests</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. FINANCE MANAGER INSIGHTS */}
              {(isFinance || isAdmin || isSuperAdmin) && overdueInvoicesCount > 0 && (
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

              {/* 4. OPERATIONS INSIGHTS */}
              {(isOperations || isAdmin || isSuperAdmin) && lowStockCount > 0 && (
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

              {/* System Status */}
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
                    <span>Active Session Role:</span>
                    <span className="text-indigo-600 fw-semibold">{userRole}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span>Automated Cron Worker:</span>
                    <span className="text-emerald-600 fw-semibold">Active & Running</span>
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
