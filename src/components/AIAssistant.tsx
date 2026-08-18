/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Company } from '../types';

interface AIAssistantProps {
  selectedCompany: Company;
  activeView: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ selectedCompany, activeView }) => {
  type TabType = 'chat' | 'forecasting' | 'screening' | 'ocr' | 'insights';
  const getInitialTab = (): TabType => {
    if (activeView === 'ai-insights') return 'insights';
    return 'chat';
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab());
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [activeView]);

  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { 
      sender: 'ai', 
      text: `Hello, I am the Gemini ERP Copilot. I have mapped the live data and configurations for **${selectedCompany.name}**.\n\nHow can I help you today? You can ask general questions, request financial forecasts, screen a candidate's resume, or perform smart OCR analysis.` 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Quick Action presets
  const chatPresets = [
    { label: "Draft Welcome Email", text: "Write an onboarding email template for a newly hired Sales Representative, highlighting company culture and tools." },
    { label: "Design CRM Rule", text: "Suggest a 5-step cross-module automation workflow linking inventory reorder events to accounting ledger adjustments." },
    { label: "Audit General Ledger", text: "Scan general ledger balances for anomalies, cash shortages, or high expenses relative to cash flow." }
  ];

  const forecastingPresets = [
    { label: "Forecast Next Quarter Sales", text: "Project Q3 revenues based on our active leads valuation, weighted by current conversion score trends." },
    { label: "Analyze Profit Margins", text: "Compare Operating Cash, Receivables, and Cost of Goods Sold to suggest pricing adjustments." }
  ];

  const screeningPresets = [
    { label: "Screen Senior Engineer", text: "RESUME SUBMISSION:\nCandidate: Michael Jordan\nSkills: React, Node, Express, PostgreSQL, Cloud Run, Docker, 8 Years XP.\nTarget Role: Senior Full-Stack Engineer" },
    { label: "Screen Accountant", text: "RESUME SUBMISSION:\nCandidate: Clara Oswald\nSkills: Certified CPA, QuickBooks, GAAP ledger reporting, payroll tax compliance, Excel.\nTarget Role: Chief Accountant" }
  ];

  const ocrPresets = [
    { label: "Analyze Industrial Invoice", text: "RAW DOCUMENT TEXT:\nInvoice #90812\nVendor: Siemens AG\nTax ID: DE1209381\nItems: 5x Siemens S7 PLC Units - $4,250.00\nSubtotal: $4,250.00 | VAT (19%): $807.50 | Total Due: $5,057.50" },
    { label: "Analyze Metal Supply Slip", text: "RAW PACKING SLIP:\nSupplier: Midwest Metals\nPO: 4002\nDelivered: Brass Fittings - 500 units\nTotal Balance: $1,750.00 COD" }
  ];

  const handleSend = async (customText?: string) => {
    const textToSend = customText || prompt;
    if (!textToSend.trim()) return;

    // Append user message
    const updatedHistory = [...chatHistory, { sender: 'user' as const, text: textToSend }];
    setChatHistory(updatedHistory);
    setPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          context: activeTab,
          selectedCompanyId: selectedCompany.id
        })
      });

      const data = await response.json();
      if (response.ok) {
        setChatHistory([...updatedHistory, { sender: 'ai', text: data.reply || "No reply generated." }]);
      } else {
        setChatHistory([...updatedHistory, { sender: 'ai', text: `⚠️ Error calling Gemini Co-pilot on host server: ${data.error}` }]);
      }
    } catch (err: any) {
      setChatHistory([...updatedHistory, { sender: 'ai', text: `⚠️ Error connecting to server: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleScanDB = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
    }, 2000);
  };

  // Mock ERP insights list
  const erpInsights = [
    {
      id: 1,
      category: "Finance Alert",
      desc: "Operating Cash is low relative to outstanding Accounts Payable. AP balance requires $150,000 within 30 days.",
      action: "Suggest prioritizing collections on overdue invoices or rescheduling upcoming non-critical POs.",
      severity: "high"
    },
    {
      id: 2,
      category: "Workflow Optimization",
      desc: "Work Orders completion rates are lagging by 12% on Assembly Line B compared to historical averages.",
      action: "Auto-trigger routing review: Suggest checking resource loading / employee allocation in Manufacturing.",
      severity: "medium"
    },
    {
      id: 3,
      category: "Asset Maintenance",
      desc: "Asset CNC Milling Machine (AST-001) has a hydraulic fluid task scheduled for 2026-07-20.",
      action: "Ensure engineering team is notified; parts are ready in stock cabinet C.",
      severity: "low"
    },
    {
      id: 4,
      category: "Inventory & Sourcing",
      desc: "NBR O-Ring Set has dropped below the minimum stock safety limit (current: 12, min threshold: 20).",
      action: "Suggested reorder quantity: 100 units from Industrial Tooling Co.",
      severity: "medium"
    }
  ];

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      {/* Copilot Navigation header */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch border-b border-slate-200 bg-white px-5 py-4 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <i className="bi bi-stars text-slate-950 animate-pulse fs-sm"></i>
          <div>
            <h2 className="fs-sm fw-semibold tracking-tight text-slate-900">Gemini Enterprise Co-Pilot</h2>
            <p className="fs-2xs text-slate-500 font-mono">Current Context: {selectedCompany.name}</p>
          </div>
        </div>

        {/* Modular AI Feature Tabs */}
        <div className="flex gap-1.5 overflow-x-auto self-center">
          <button
            onClick={() => { setActiveTab('chat'); setChatHistory([{ sender: 'ai', text: `ERP Chat mode active. Ask me anything about ${selectedCompany.name}'s databases or operations.` }]); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 fs-xs fw-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'chat' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <i className="bi bi-chat-left-text fs-xs"></i>
            General Chat
          </button>
          <button
            onClick={() => { setActiveTab('insights'); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 fs-xs fw-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'insights' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <i className="bi bi-lightbulb fs-xs"></i>
            AI Smart Insights
          </button>
          <button
            onClick={() => { setActiveTab('forecasting'); setChatHistory([{ sender: 'ai', text: "Predictive Forecasting active. Paste parameters or click preset below to forecast next quarter revenue cash flow structures." }]); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 fs-xs fw-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'forecasting' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <i className="bi bi-graph-up-arrow fs-xs"></i>
            Forecasting
          </button>
          <button
            onClick={() => { setActiveTab('screening'); setChatHistory([{ sender: 'ai', text: "Resume Screening module active. Paste raw resume text to calculate match-index with our departments and create exact target interview questions." }]); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 fs-xs fw-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'screening' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <i className="bi bi-file-earmark-check fs-xs"></i>
            Resume Screen
          </button>
          <button
            onClick={() => { setActiveTab('ocr'); setChatHistory([{ sender: 'ai', text: "Invoice OCR module active. Paste raw invoice printouts or receipts to parse totals, TAX, names, and cross-reference with general ledgers." }]); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 fs-xs fw-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'ocr' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <i className="bi bi-qr-code-scan fs-xs"></i>
            Invoice OCR
          </button>
        </div>
      </div>

      {/* CHAT DISPLAY / INSIGHTS CONTAINER */}
      {activeTab === 'insights' ? (
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <h3 className="fs-sm fw-bold text-slate-950">AI Smart Trend Insights</h3>
              <p className="fs-2xs text-slate-500">Live operational & anomaly detections scan for {selectedCompany.name}</p>
            </div>
            <button
              onClick={handleScanDB}
              disabled={scanning}
              className="bg-slate-950 hover:bg-slate-800 disabled:bg-slate-200 text-white fw-semibold fs-2xs px-3.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs"
            >
              {scanning ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin mr-1"></i>
                  Scanning Database...
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-repeat mr-1"></i>
                  Re-scan ERP Database
                </>
              )}
            </button>
          </div>

          {scanning ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-3">
              <i className="bi bi-cpu-fill fs-3xl text-slate-900 animate-spin"></i>
              <p className="fs-xs text-slate-500 fw-medium">Analyzing active ledgers, inventory reorders, work orders completion rates, and HR timesheets...</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {erpInsights.map(insight => (
                <div key={insight.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-3xs flex flex-col justify-between hover:shadow-xs transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`fs-3xs fw-bold px-2 py-0.5 rounded-full uppercase border ${
                        insight.severity === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        insight.severity === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {insight.category}
                      </span>
                      <span className="fs-3xs text-slate-400 font-mono fw-medium">Severity: {insight.severity}</span>
                    </div>
                    <p className="fs-xs fw-semibold text-slate-900 leading-snug">{insight.desc}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 -mx-5 -mb-5 p-4 rounded-b-xl">
                    <span className="fs-3xs fw-bold text-slate-400 uppercase block mb-1">Recommended Action</span>
                    <p className="fs-xs text-slate-600 leading-relaxed italic">{insight.action}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 space-y-4">
          {chatHistory.map((msg, index) => (
            <div 
              key={index} 
              className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-xl p-4 shadow-3xs fs-xs leading-relaxed font-sans ${
                msg.sender === 'user' 
                  ? 'bg-slate-950 text-white fw-medium rounded-tr-none' 
                  : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none whitespace-pre-wrap'
              }`}>
                <div className={`flex items-center gap-1 pb-1.5 mb-1.5 border-b fs-3xs uppercase tracking-wider fw-bold opacity-80 ${
                  msg.sender === 'user' ? 'border-white/10 text-slate-200' : 'border-slate-100 text-slate-400'
                }`}>
                  <span>{msg.sender === 'user' ? 'User Operator' : 'Gemini AI Assistant'}</span>
                </div>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start items-center gap-2 fs-xs text-slate-500 fw-medium animate-pulse">
              <i className="bi bi-arrow-repeat animate-spin text-slate-900 fs-sm"></i>
              Gemini is compiling live ERP database index and generating response...
            </div>
          )}
        </div>
      )}

      {/* QUICK PRESETS FOOTER PANEL */}
      {activeTab !== 'insights' && (
        <div className="border-t border-slate-200/80 p-3 bg-slate-50/50 flex items-center gap-2 overflow-x-auto">
          <span className="fs-2xs fw-bold text-slate-400 uppercase shrink-0">Presets:</span>
          {activeTab === 'chat' && chatPresets.map(preset => (
            <button
              key={preset.label}
              onClick={() => handleSend(preset.text)}
              className="fs-2xs bg-white border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg fw-semibold text-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-all"
            >
              ✨ {preset.label}
            </button>
          ))}
          {activeTab === 'forecasting' && forecastingPresets.map(preset => (
            <button
              key={preset.label}
              onClick={() => handleSend(preset.text)}
              className="fs-2xs bg-white border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg fw-semibold text-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-all"
            >
              📈 {preset.label}
            </button>
          ))}
          {activeTab === 'screening' && screeningPresets.map(preset => (
            <button
              key={preset.label}
              onClick={() => handleSend(preset.text)}
              className="fs-2xs bg-white border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg fw-semibold text-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-all"
            >
              👩‍💼 {preset.label}
            </button>
          ))}
          {activeTab === 'ocr' && ocrPresets.map(preset => (
            <button
              key={preset.label}
              onClick={() => handleSend(preset.text)}
              className="fs-2xs bg-white border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg fw-semibold text-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-all"
            >
              📄 {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* INPUT PANEL */}
      {activeTab !== 'insights' && (
        <div className="border-t border-slate-200/80 p-4 flex gap-3 bg-white">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask Gemini Co-pilot (e.g. ${
              activeTab === 'chat' ? 'Suggest billing automated workflows' :
              activeTab === 'forecasting' ? 'Evaluate cash runway for next year' :
              activeTab === 'screening' ? 'Match candidates for R&D departments' :
              'Extract items list from recent bill receipt'
            })`}
            className="flex-1 rounded-lg border border-slate-200 px-3.5 py-2.5 fs-xs outline-hidden focus:border-slate-950 focus:ring-1 focus:ring-slate-950 transition-all font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !prompt.trim()}
            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white fw-semibold fs-xs px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <i className="bi bi-send fs-xs"></i>
            Send
          </button>
        </div>
      )}
    </div>
  );
};
export default AIAssistant;
