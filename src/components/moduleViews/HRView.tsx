import React, { useState, useEffect } from 'react';
import { ModuleViewsProps, PageHeader, StatCard, Badge, Th, TableHead, EmptyRow, PrimaryBtn, SecBtn, Label, Input, Select } from './shared';
import { getEmployeeByUserId, getUserNameById, getEmployeeNameById } from '../../utils/employeeResolver';
import { MODULE_CATALOG, planPriceForModules } from '../../data/moduleCatalog';
import { HRModule } from '../HRModule';

export const HRView: React.FC<ModuleViewsProps> = (props) => {
  const { activeView, selectedCompany, applicants, selectedUser, employees, departments, branches, leads, crmActivities, crmTasks, crmEmails, glAccounts, invoices, inventory, tickets, auditLogs, apiKeys, leaves, attendance, okrs, payslips, journalEntries, expenses, fiscalPeriods, openingBalances, onAddEmployee, onAddLead, onMoveLead, onAssignLead, onAddComment, onAddInvoice, onPayInvoice, onAdjustStock, onAddTicket, onInviteUser, onGenerateAPIKey, onAddExpense, onApproveLeave, onRejectLeave, onAddLeave, onClockIn, onClockOut, onLogCrmActivity, onCreateCrmTask, onUpdateCrmTask, onSendCrmEmail,   onAddOKR, onUpdateOKRProgress, onRunPayroll, onAddGLAccount, onUpdateGLAccount, onDeleteGLAccount, onCreateJournalEntry, onPostJournalEntry, onApproveJournalEntry, onVoidJournalEntry, onApproveExpense, onCloseFiscalPeriod, onSetOpeningBalance, bills, billPayments, customerPayments, bankAccounts, bankTransactions, bankReconciliations, fixedAssets, depreciationEntries, budgets, costCenters, currencyRates, onCreateBill, onApproveBill, onPayBill, onReceiveCustomerPayment, onCreateBankAccount, onReconcileBank, onCreateFixedAsset, onDisposeAsset, onRunDepreciation, onCreateBudget, onApproveBudget, onCreateCostCenter, onUpdateCurrencyRate, taxCodes, taxReturns, intercompanyTxns, consolidationRules, complianceChecks, auditSnapshots, policyDocuments, filingDeadlines, onCreateTaxReturn, onFileTaxReturn, onCreateIntercompanyTxn, onApproveIntercompanyTxn, onEliminateIntercompanyTxn, onCreateConsolidationRule, onResolveComplianceCheck, onAcknowledgePolicy, onFileDeadline, tenants, onAssignPlan, onAddDepartment, onUpdateDepartment, onDeleteDepartment, onboardings, onAddOnboarding, onUpdateOnboarding, onDeleteOnboarding, onUpdateEmployee, onNavigateView, exitRequests, onSubmitExitRequest, onApproveExitRequest, onRejectExitRequest, onUpdateCompanySettings } = props;

  return (
    <HRModule
      activeView={activeView}
      selectedCompany={selectedCompany}
      selectedUser={selectedUser}
      users={props.users || []}
      employees={employees}
      applicants={applicants || []}
      
      
      departments={departments}
      branches={branches}
      leaves={leaves}
      attendance={attendance}
      okrs={okrs}
      onAddEmployee={onAddEmployee}
      onApproveLeave={onApproveLeave}
      onRejectLeave={onRejectLeave}
      onAddLeave={onAddLeave}
      onClockIn={onClockIn}
      onClockOut={onClockOut}
      onAddOKR={onAddOKR}
      onUpdateOKRProgress={onUpdateOKRProgress}
      onAddDepartment={onAddDepartment}
      onUpdateDepartment={onUpdateDepartment}
      onDeleteDepartment={onDeleteDepartment}
      onboardings={onboardings}
      onAddOnboarding={onAddOnboarding}
      onUpdateOnboarding={onUpdateOnboarding}
      onDeleteOnboarding={onDeleteOnboarding}
      onUpdateEmployee={onUpdateEmployee}
      onNavigateView={onNavigateView}
      exitRequests={exitRequests}
      onSubmitExitRequest={onSubmitExitRequest}
      onApproveExitRequest={onApproveExitRequest}
      onRejectExitRequest={onRejectExitRequest}
      onUpdateCompanySettings={onUpdateCompanySettings}
      payrollTaxConfig={props.payrollTaxConfig}
      bankAccountUpdates={props.bankAccountUpdates}
      onRequestBankAccountUpdate={props.onRequestBankAccountUpdate}
      onApproveBankAccountUpdate={props.onApproveBankAccountUpdate}
      onRejectBankAccountUpdate={props.onRejectBankAccountUpdate}
      onInviteUser={onInviteUser}
      customRoles={props.customRoles}
    />
  );
};

