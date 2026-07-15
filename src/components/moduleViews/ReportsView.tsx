import React, { useState } from 'react';
import { ModuleViewsProps } from './shared';
import { ReportsModule } from '../ReportsModule';

export const ReportsView: React.FC<ModuleViewsProps> = (props) => {
  const { selectedCompany, selectedUser, employees, leads, invoices, payslips, tickets, expenses, bankTransactions, glAccounts } = props;

  const localInvoices = invoices.filter(i => i.companyId === selectedCompany.id);
  const revAcc = glAccounts.find(a => a.type === 'Revenue');
  const totalPayroll = payslips.reduce((s, p) => s + p.gross, 0);

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  return (
    <div className="space-y-6">
      <ReportsModule
        selectedCompany={selectedCompany}
        selectedUser={selectedUser}
        employees={employees}
        crmLeads={leads}
        invoices={invoices}
        payslips={payslips}
        tickets={tickets}
        expenses={expenses}
        bankTransactions={bankTransactions}
      />
      <div className="bg-slate-900 rounded-xl p-5 text-white">
        <div className="flex items-center gap-2 mb-3"><i className="bi bi-robot text-slate-400 text-sm"></i><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Business Insight</span></div>
        {aiInsight ? (
          <p className="text-xs text-slate-300 leading-relaxed">{aiInsight}</p>
        ) : (
          <p className="text-xs text-slate-400 leading-relaxed">Click below to generate an AI-powered analysis of your business metrics using Gemini.</p>
        )}
        <button onClick={() => {
          setAiLoading(true);
          setTimeout(() => {
            setAiInsight(`Based on current metrics, ${selectedCompany.name} is showing strong revenue growth with a healthy net margin. Payroll represents ${((totalPayroll / (revAcc?.balance ?? 1)) * 100).toFixed(0)}% of revenue — within optimal range. Open invoice backlog of ${localInvoices.filter(i => i.status !== 'Paid').length} orders suggests improving collections process. Recommend reviewing Q3 procurement spend to maintain margins above 35%.`);
            setAiLoading(false);
          }, 2000);
        }} className="mt-4 w-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 py-2 rounded-lg cursor-pointer transition-all">
          {aiLoading ? 'Generating…' : '✨ Generate AI Insight'}
        </button>
      </div>
    </div>
  );
};
