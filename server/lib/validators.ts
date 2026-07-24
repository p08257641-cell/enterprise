import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

export const CreateEmployeeSchema = z.object({
  companyId: z.string().min(1),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  department: z.string().min(1),
  designation: z.string().min(1),
  salary: z.number().positive().max(10_000_000).optional(),
});

export const CreateInvoiceSchema = z.object({
  companyId: z.string().min(1),
  customerName: z.string().min(1).max(200),
  subtotal: z.number().positive(),
  tax: z.number().min(0).optional(),
  dueDate: z.string().optional(),
});

export const CreateTicketSchema = z.object({
  companyId: z.string().min(1),
  customerName: z.string().min(1).max(200),
  customerEmail: z.string().email().optional().or(z.literal('')),
  subject: z.string().min(1).max(500),
  description: z.string().min(1).max(10000).optional(),
  category: z.string().min(1).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
});

export const CreateLeadSchema = z.object({
  companyId: z.string().min(1),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  companyName: z.string().max(200).optional(),
  source: z.string().max(100).optional(),
  value: z.number().min(0).optional(),
});

export const CreateExpenseSchema = z.object({
  companyId: z.string().min(1),
  description: z.string().min(1).max(500),
  amount: z.number().positive().max(10_000_000),
  category: z.string().min(1),
  department: z.string().optional(),
  date: z.string().optional(),
});

export const CreateBillSchema = z.object({
  companyId: z.string().min(1),
  vendorName: z.string().min(1).max(200),
  subtotal: z.number().positive(),
  tax: z.number().min(0).optional(),
  dueDate: z.string().optional(),
});

export const JournalEntrySchema = z.object({
  companyId: z.string().min(1),
  description: z.string().min(1).max(500),
  lines: z.array(z.object({
    accountId: z.string().min(1),
    accountCode: z.string().optional(),
    accountName: z.string().optional(),
    debit: z.number().min(0),
    credit: z.number().min(0),
  })).min(2),
});

export function validate<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })),
      });
    }
    req.body = result.data;
    next();
  };
}
