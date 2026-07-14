/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Canonical catalog of billable modules keyed by the `activeModules` id used
// across the app. Prices mirror the per-module figures shown in the Super Admin
// Subscriptions showcase and are summed to compute a plan's monthly price.
export interface CatalogModule {
  id: string;       // value stored in Company.activeModules
  name: string;     // human-friendly label
  price: number;    // monthly price in the company's base currency
  suite: string;    // grouping label for the picker UI
}

export const MODULE_CATALOG: CatalogModule[] = [
  // People suite
  { id: 'Administration', name: 'Administration', price: 15, suite: 'People' },
  { id: 'HR', name: 'HR & Directory', price: 35, suite: 'People' },
  { id: 'Payroll', name: 'Payroll', price: 25, suite: 'People' },
  // Finance suite
  { id: 'Accounting', name: 'Accounting', price: 40, suite: 'Finance' },
  { id: 'CRM', name: 'CRM & Sales', price: 25, suite: 'Finance' },
  // Commerce suite
  { id: 'Inventory', name: 'Inventory & Operations', price: 30, suite: 'Commerce' },
  { id: 'POS', name: 'Point of Sale (POS)', price: 30, suite: 'Commerce' },
  { id: 'Procurement', name: 'Procurement', price: 20, suite: 'Commerce' },
  { id: 'Manufacturing', name: 'Manufacturing', price: 30, suite: 'Commerce' },
  { id: 'Project Management', name: 'Project Management', price: 30, suite: 'Commerce' },
  // Intelligence suite
  { id: 'AI Assistant', name: 'AI Assistant', price: 45, suite: 'Intelligence' },
  { id: 'Reports & Analytics', name: 'Reports & Analytics', price: 25, suite: 'Intelligence' },
  { id: 'Workflow & Automation', name: 'Workflow & Automation', price: 25, suite: 'Intelligence' },
  { id: 'Communication', name: 'Communication', price: 15, suite: 'Intelligence' },
  { id: 'Compliance', name: 'Compliance', price: 20, suite: 'Intelligence' },
  { id: 'Learning Management (LMS)', name: 'Learning Management (LMS)', price: 20, suite: 'Intelligence' },
  { id: 'Document Management', name: 'Document Management', price: 20, suite: 'Intelligence' },
  { id: 'Visitor Management', name: 'Visitor Management', price: 15, suite: 'Intelligence' },
  { id: 'Asset Management', name: 'Asset Management', price: 20, suite: 'Intelligence' },
  { id: 'Help Desk', name: 'Help Desk & Engagement', price: 20, suite: 'Intelligence' },
];

export const planPriceForModules = (moduleIds: string[]): number =>
  moduleIds.reduce((sum, id) => {
    const mod = MODULE_CATALOG.find(m => m.id === id);
    return sum + (mod ? mod.price : 0);
  }, 0);

export const deriveBillingPlan = (moduleCount: number): 'Trial' | 'Core' | 'Premium' | 'Enterprise' => {
  if (moduleCount <= 0) return 'Trial';
  if (moduleCount <= 3) return 'Core';
  if (moduleCount <= 8) return 'Premium';
  return 'Enterprise';
};
