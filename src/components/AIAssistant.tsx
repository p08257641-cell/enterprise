/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Company } from '../types';

interface AIAssistantProps {
  selectedCompany: Company;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ selectedCompany }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'forecasting' | 'screening' | 'ocr'>('chat');
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { 
      sender: 'ai', 
      text: `Hello, I am the Gemini ERP Copilot. I have mapped the live data and configurations for **${selectedCompany.name}**.\n\nHow can I help you today? You can ask general questions, request financial forecasts, screen a candidate's resume, or perform smart OCR analysis.` 
    }
  ]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      {/* Copilot Navigation header */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch border-b border-slate-200 bg-white px-5 py-4 gap-3">
        <div className="flex items-center gap-2">
          <i className="bi bi-stars text-slate-950 animate-pulse text-sm"></i>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">Gemini Enterprise Co-Pilot</h2>
            <p className="text-[10px] text-slate-500 font-mono">Current Context: {selectedCompany.name}</p>
          </div>
        </div>

        {/* Modular AI Feature Tabs */}
        <div className="flex gap-1.5 overflow-x-auto self-center">
          <button
            onClick={() => { setActiveTab('chat'); setChatHistory([{ sender: 'ai', text: `ERP Chat mode active. Ask me anything about ${selectedCompany.name}'s databases or operations.` }]); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'chat' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <i className="bi bi-question-circle text-xs"></i>
            General Chat
          </button>
          <button
            onClick={() => { setActiveTab('forecasting'); setChatHistory([{ sender: 'ai', text: "Predictive Forecasting active. Paste parameters or click preset below to forecast next quarter revenue cash flow structures." }]); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'forecasting' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <i className="bi bi-graph-up-arrow text-xs"></i>
            Forecasting
          </button>
          <button
            onClick={() => { setActiveTab('screening'); setChatHistory([{ sender: 'ai', text: "Resume Screening module active. Paste raw resume text to calculate match-index with our departments and create exact target interview questions." }]); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'screening' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <i className="bi bi-file-earmark-check text-xs"></i>
            Resume Screen
          </button>
          <button
            onClick={() => { setActiveTab('ocr'); setChatHistory([{ sender: 'ai', text: "Invoice OCR module active. Paste raw invoice printouts or receipts to parse totals, TAX, names, and cross-reference with general ledgers." }]); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'ocr' ? 'bg-slate-950 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <i className="bi bi-qr-code-scan text-xs"></i>
            Invoice OCR
          </button>
        </div>
      </div>

      {/* CHAT DISPLAY CONTAINER */}
      <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 space-y-4">
        {chatHistory.map((msg, index) => (
          <div 
            key={index} 
            className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-xl p-4 shadow-3xs text-xs leading-relaxed font-sans ${
              msg.sender === 'user' 
                ? 'bg-slate-950 text-white font-medium rounded-tr-none' 
                : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none whitespace-pre-wrap'
            }`}>
              <div className={`flex items-center gap-1 pb-1.5 mb-1.5 border-b text-[9px] uppercase tracking-wider font-bold opacity-80 ${
                msg.sender === 'user' ? 'border-white/10 text-slate-200' : 'border-slate-100 text-slate-400'
              }`}>
                <span>{msg.sender === 'user' ? 'User Operator' : 'Gemini AI Assistant'}</span>
              </div>
              <p className="leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start items-center gap-2 text-xs text-slate-500 font-medium animate-pulse">
            <i className="bi bi-arrow-repeat animate-spin text-slate-900 text-sm"></i>
            Gemini is compiling live ERP database index and generating response...
          </div>
        )}
      </div>

      {/* QUICK PRESETS FOOTER PANEL */}
      <div className="border-t border-slate-200/80 p-3 bg-slate-50/50 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Presets:</span>
        {activeTab === 'chat' && chatPresets.map(preset => (
          <button
            key={preset.label}
            onClick={() => handleSend(preset.text)}
            className="text-[10px] bg-white border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg font-semibold text-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-all"
          >
            ✨ {preset.label}
          </button>
        ))}
        {activeTab === 'forecasting' && forecastingPresets.map(preset => (
          <button
            key={preset.label}
            onClick={() => handleSend(preset.text)}
            className="text-[10px] bg-white border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg font-semibold text-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-all"
          >
            📈 {preset.label}
          </button>
        ))}
        {activeTab === 'screening' && screeningPresets.map(preset => (
          <button
            key={preset.label}
            onClick={() => handleSend(preset.text)}
            className="text-[10px] bg-white border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg font-semibold text-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-all"
          >
            👩‍💼 {preset.label}
          </button>
        ))}
        {activeTab === 'ocr' && ocrPresets.map(preset => (
          <button
            key={preset.label}
            onClick={() => handleSend(preset.text)}
            className="text-[10px] bg-white border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg font-semibold text-slate-700 whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-all"
          >
            📄 {preset.label}
          </button>
        ))}
      </div>

      {/* INPUT PANEL */}
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
          className="flex-1 rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs outline-hidden focus:border-slate-950 focus:ring-1 focus:ring-slate-950 transition-all font-sans"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !prompt.trim()}
          className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <i className="bi bi-send text-xs"></i>
          Send
        </button>
      </div>
    </div>
  );
};
